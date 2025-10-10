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

    // Build WHERE clause
    let whereConditions = [];
    let params: any[] = [];
    
    if (search) {
      whereConditions.push(`(email ILIKE $${params.length + 1} OR name ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }
    
    if (plan) {
      whereConditions.push(`plan = $${params.length + 1}`);
      params.push(plan);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM app_user
      ${whereClause}
    `;
    
    const [{ total }] = await sql.unsafe(countQuery, params) as any[];

    // Get users with pagination
    const usersQuery = `
      SELECT *
      FROM admin_user_overview
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    const users = await sql.unsafe(usersQuery, [...params, limit, offset]) as any[];

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

