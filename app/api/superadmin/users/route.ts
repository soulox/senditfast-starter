import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin, hasPermission } from '@/lib/superadmin-auth';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  // Verify super admin access
  const admin = await requireSuperAdmin();
  if (admin instanceof NextResponse) {
    return admin;
  }

  if (!hasPermission(admin, 'VIEW_USERS')) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const plan = searchParams.get('plan') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const offset = (page - 1) * limit;

    // Sanitize sortBy to prevent SQL injection
    const validSortColumns = ['created_at', 'email', 'name', 'plan'];
    const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Query with filtering
    let total: number;
    let users: any[];

    if (search && plan) {
      // Both search and plan filter
      const searchPattern = `%${search}%`;
      const [{ count }] = await sql`
        SELECT COUNT(*)::int as count
        FROM app_user
        WHERE (email ILIKE ${searchPattern} OR name ILIKE ${searchPattern})
          AND plan = ${plan}
      ` as any[];
      total = count;

      if (safeSortBy === 'created_at' && safeSortOrder === 'DESC') {
        users = await sql`
          SELECT * FROM admin_user_overview
          WHERE (email ILIKE ${searchPattern} OR name ILIKE ${searchPattern})
            AND plan = ${plan}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        ` as any[];
      } else if (safeSortBy === 'email' && safeSortOrder === 'ASC') {
        users = await sql`
          SELECT * FROM admin_user_overview
          WHERE (email ILIKE ${searchPattern} OR name ILIKE ${searchPattern})
            AND plan = ${plan}
          ORDER BY email ASC
          LIMIT ${limit} OFFSET ${offset}
        ` as any[];
      } else {
        // Default for other combinations
        users = await sql`
          SELECT * FROM admin_user_overview
          WHERE (email ILIKE ${searchPattern} OR name ILIKE ${searchPattern})
            AND plan = ${plan}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        ` as any[];
      }
    } else if (search) {
      // Search only
      const searchPattern = `%${search}%`;
      const [{ count }] = await sql`
        SELECT COUNT(*)::int as count
        FROM app_user
        WHERE email ILIKE ${searchPattern} OR name ILIKE ${searchPattern}
      ` as any[];
      total = count;

      users = await sql`
        SELECT * FROM admin_user_overview
        WHERE email ILIKE ${searchPattern} OR name ILIKE ${searchPattern}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      ` as any[];
    } else if (plan) {
      // Plan filter only
      const [{ count }] = await sql`
        SELECT COUNT(*)::int as count
        FROM app_user
        WHERE plan = ${plan}
      ` as any[];
      total = count;

      users = await sql`
        SELECT * FROM admin_user_overview
        WHERE plan = ${plan}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      ` as any[];
    } else {
      // No filters
      const [{ count }] = await sql`
        SELECT COUNT(*)::int as count
        FROM app_user
      ` as any[];
      total = count;

      users = await sql`
        SELECT * FROM admin_user_overview
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      ` as any[];
    }

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('[SuperAdmin] Users list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    );
  }
}

