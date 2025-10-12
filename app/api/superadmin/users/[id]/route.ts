import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin, hasPermission, logAdminAction } from '@lib/superadmin-auth';
import { sql } from '@lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireSuperAdmin();
  if (admin instanceof NextResponse) {
    return admin;
  }

  if (!hasPermission(admin, 'VIEW_USERS')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const [user] = await sql`
      SELECT 
        u.id, u.email, u.name, u.plan, u.role, u.created_at,
        COUNT(DISTINCT t.id) as total_transfers,
        COALESCE(SUM(t.total_size_bytes), 0) as total_size_transferred
      FROM app_user u
      LEFT JOIN transfer t ON u.id = t.owner_id
      WHERE u.id = ${params.id}
      GROUP BY u.id, u.email, u.name, u.plan, u.role, u.created_at
    ` as any[];

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's recent transfers
    const transfers = await sql`
      SELECT id, slug, expires_at, status, total_size_bytes, created_at
      FROM transfer
      WHERE owner_id = ${params.id}
      ORDER BY created_at DESC
      LIMIT 10
    ` as any[];

    // Get user's monthly usage
    let usage: any[] = [];
    try {
      usage = await sql`
        SELECT month, transfers_count, total_size_bytes, total_downloads
        FROM user_usage_stats
        WHERE user_id = ${params.id}
        ORDER BY month DESC
        LIMIT 12
      ` as any[];
    } catch (_) {
      usage = [];
    }

    return NextResponse.json({
      success: true,
      user,
      transfers,
      usage,
    });
  } catch (error: any) {
    console.error('[SuperAdmin] User detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireSuperAdmin();
  if (admin instanceof NextResponse) {
    return admin;
  }

  if (!hasPermission(admin, 'EDIT_USERS')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { plan, role, name, email, is_blocked } = body;

    // Fetch target user role to protect SUPER_ADMIN accounts from blocking
    const [target] = await sql`
      SELECT role FROM app_user WHERE id = ${params.id}
    ` as any[];

    if (target?.role === 'SUPER_ADMIN' && typeof is_blocked === 'boolean') {
      return NextResponse.json({ error: 'Cannot block a superadmin user' }, { status: 400 });
    }

    // Build update query dynamically
    let updates: string[] = [];
    let values: any[] = [];
    let paramIndex = 1;

    if (plan !== undefined) {
      updates.push(`plan = $${paramIndex++}`);
      values.push(plan);
    }

    if (role !== undefined && admin.role === 'SUPER_ADMIN') {
      // Only SUPER_ADMIN can change roles
      updates.push(`role = $${paramIndex++}`);
      values.push(role);
    }

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }

    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }

    if (typeof is_blocked === 'boolean') {
      updates.push(`is_blocked = $${paramIndex++}`);
      values.push(is_blocked);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(params.id);

    // Perform update using a parameterized dynamic statement fallback
    const fields = updates.join(', ');
    const [updatedUser] = await sql`
      UPDATE app_user
      SET ${sql.raw(fields)}
      WHERE id = ${params.id}
      RETURNING id, email, name, plan, role, is_blocked
    ` as any[];

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Log admin action
    await logAdminAction(
      admin.id,
      'UPDATE_USER',
      params.id,
      { changes: body },
      request
    );

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('[SuperAdmin] User update error:', error);
    return NextResponse.json(
      { error: 'Failed to update user', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireSuperAdmin();
  if (admin instanceof NextResponse) {
    return admin;
  }

  if (!hasPermission(admin, 'DELETE_USERS')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    // Prevent self-deletion
    if (admin.id === params.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Get user info before deletion
    const [user] = await sql`
      SELECT email, name, role FROM app_user WHERE id = ${params.id}
    ` as any[];

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Cannot delete a superadmin user' }, { status: 400 });
    }

    // Delete user (CASCADE will handle related records)
    await sql`
      DELETE FROM app_user WHERE id = ${params.id}
    `;

    // Log admin action
    await logAdminAction(
      admin.id,
      'DELETE_USER',
      params.id,
      { user: { email: user.email, name: user.name } },
      request
    );

    return NextResponse.json({
      success: true,
      message: `User ${user.email} deleted successfully`,
    });
  } catch (error: any) {
    console.error('[SuperAdmin] User deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user', details: error.message },
      { status: 500 }
    );
  }
}

