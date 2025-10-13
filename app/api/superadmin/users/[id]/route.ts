import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin, hasPermission, logAdminAction } from '@/lib/superadmin-auth';
import { sql } from '@/lib/db';

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
      SELECT * FROM admin_user_overview WHERE id = ${params.id}
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
    const usage = await sql`
      SELECT month, transfers_count, total_size_bytes, total_downloads
      FROM user_usage_stats
      WHERE user_id = ${params.id}
      ORDER BY month DESC
      LIMIT 12
    ` as any[];

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
    const { plan, role, name, email } = body;

    // Build update object
    const updates: any = {};
    
    if (plan !== undefined) {
      updates.plan = plan;
    }

    if (role !== undefined && admin.role === 'SUPER_ADMIN') {
      // Only SUPER_ADMIN can change roles
      updates.role = role;
    }

    if (name !== undefined) {
      updates.name = name;
    }

    if (email !== undefined) {
      updates.email = email;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Execute update - use COALESCE to only update provided fields
    const [updatedUser] = await sql`
      UPDATE app_user 
      SET 
        plan = COALESCE(${updates.plan || null}, plan),
        role = COALESCE(${updates.role || null}, role),
        name = COALESCE(${updates.name || null}, name),
        email = COALESCE(${updates.email || null}, email)
      WHERE id = ${params.id}
      RETURNING id, email, name, plan, role
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
      SELECT email, name FROM app_user WHERE id = ${params.id}
    ` as any[];

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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

