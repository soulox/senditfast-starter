import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin, logAdminAction } from '@lib/superadmin-auth';
import { sql } from '@lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  const admin = await requireSuperAdmin();
  if (admin instanceof NextResponse) return admin;

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword || String(newPassword).length < 8) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const [row] = await sql`select password_hash from app_user where id = ${admin.id} limit 1` as any[];
    if (!row?.password_hash) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const ok = await bcrypt.compare(currentPassword, row.password_hash || '');
    if (!ok) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await sql`update app_user set password_hash = ${newHash} where id = ${admin.id}`;

    await logAdminAction(admin.id, 'CHANGE_PASSWORD', admin.id, null, request);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to change password', details: error.message }, { status: 500 });
  }
}


