import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin, hasPermission } from '@lib/superadmin-auth';
import { sql } from '@lib/db';

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

    // Exclude superadmin accounts globally
    const excludeRoles = ['SUPER_ADMIN'];

    // Get total count with filters
    let countResult;
    if (search && plan) {
      const searchPattern = `%${search}%`;
      countResult = await sql`
        SELECT COUNT(*) as total
        FROM app_user
        WHERE role <> 'SUPER_ADMIN' AND (email ILIKE ${searchPattern} OR name ILIKE ${searchPattern})
          AND plan = ${plan}
      `;
    } else if (search) {
      const searchPattern = `%${search}%`;
      countResult = await sql`
        SELECT COUNT(*) as total
        FROM app_user
        WHERE role <> 'SUPER_ADMIN' AND (email ILIKE ${searchPattern} OR name ILIKE ${searchPattern})
      `;
    } else if (plan) {
      countResult = await sql`
        SELECT COUNT(*) as total
        FROM app_user
        WHERE role <> 'SUPER_ADMIN' AND plan = ${plan}
      `;
    } else {
      countResult = await sql`
        SELECT COUNT(*) as total
        FROM app_user
        WHERE role <> 'SUPER_ADMIN'
      `;
    }
    
    const total = countResult[0]?.total || 0;

    // Get users with pagination - use simpler query from app_user table directly
    let users;
    if (search && plan) {
      const searchPattern = `%${search}%`;
      users = await sql`
        SELECT 
          u.id, u.email, u.name, u.plan, u.role, u.created_at,
          COUNT(DISTINCT t.id) as total_transfers,
          COALESCE(SUM(t.total_size_bytes), 0) as total_size_transferred,
          COALESCE(SUM(t.total_size_bytes), 0) as storage_used_bytes
        FROM app_user u
        LEFT JOIN transfer t ON u.id = t.owner_id
        WHERE u.role <> 'SUPER_ADMIN' AND (u.email ILIKE ${searchPattern} OR u.name ILIKE ${searchPattern})
          AND u.plan = ${plan}
        GROUP BY u.id, u.email, u.name, u.plan, u.role, u.created_at
        ORDER BY u.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (search) {
      const searchPattern = `%${search}%`;
      users = await sql`
        SELECT 
          u.id, u.email, u.name, u.plan, u.role, u.created_at,
          COUNT(DISTINCT t.id) as total_transfers,
          COALESCE(SUM(t.total_size_bytes), 0) as total_size_transferred,
          COALESCE(SUM(t.total_size_bytes), 0) as storage_used_bytes
        FROM app_user u
        LEFT JOIN transfer t ON u.id = t.owner_id
        WHERE u.role <> 'SUPER_ADMIN' AND (u.email ILIKE ${searchPattern} OR u.name ILIKE ${searchPattern})
        GROUP BY u.id, u.email, u.name, u.plan, u.role, u.created_at
        ORDER BY u.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (plan) {
      users = await sql`
        SELECT 
          u.id, u.email, u.name, u.plan, u.role, u.created_at,
          COUNT(DISTINCT t.id) as total_transfers,
          COALESCE(SUM(t.total_size_bytes), 0) as total_size_transferred,
          COALESCE(SUM(t.total_size_bytes), 0) as storage_used_bytes
        FROM app_user u
        LEFT JOIN transfer t ON u.id = t.owner_id
        WHERE u.role <> 'SUPER_ADMIN' AND u.plan = ${plan}
        GROUP BY u.id, u.email, u.name, u.plan, u.role, u.created_at
        ORDER BY u.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      users = await sql`
        SELECT 
          u.id, u.email, u.name, u.plan, u.role, u.created_at,
          COUNT(DISTINCT t.id) as total_transfers,
          COALESCE(SUM(t.total_size_bytes), 0) as total_size_transferred,
          COALESCE(SUM(t.total_size_bytes), 0) as storage_used_bytes
        FROM app_user u
        LEFT JOIN transfer t ON u.id = t.owner_id
        WHERE u.role <> 'SUPER_ADMIN'
        GROUP BY u.id, u.email, u.name, u.plan, u.role, u.created_at
        ORDER BY u.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total: parseInt(total),
        totalPages: Math.ceil(parseInt(total) / limit),
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

