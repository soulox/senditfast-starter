import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@lib/get-user';
import { sql } from '@lib/db';
import { deleteFile } from '@lib/b2';


export async function DELETE(req: NextRequest) {
  try {
    const user = await requireUser();
    const userId = (user as any).id;

    console.log(`[Privacy] Starting account deletion for user ${userId}`);

    // Get all files to delete from B2
    const files = await sql`
      SELECT f.b2_key
      FROM file_object f
      JOIN transfer t ON t.id = f.transfer_id
      WHERE t.owner_id = ${userId}
    ` as any[];

    // Delete files from B2
    console.log(`[Privacy] Deleting ${files.length} files from B2`);
    for (const file of files) {
      try {
        await deleteFile(file.b2_key);
      } catch (error) {
        console.error(`[Privacy] Failed to delete B2 file ${file.b2_key}:`, error);
        // Continue with deletion even if B2 deletion fails
      }
    }

    // Delete all user data (cascading deletes will handle related records)
    // Order matters due to foreign key constraints
    
    // 1. Delete team members (references user)
    await sql`DELETE FROM team_member WHERE owner_id = ${userId}`;
    
    // 2. Delete API keys (references user)
    await sql`DELETE FROM api_key WHERE user_id = ${userId}`;
    
    // 3. Delete custom branding (references user)
    await sql`DELETE FROM custom_branding WHERE user_id = ${userId}`;
    
    // 4. Delete audit logs (references user)
    await sql`DELETE FROM audit_log WHERE user_id = ${userId}`;
    
    // 5. Delete transfers (cascades to file_object, recipient, transfer_event)
    await sql`DELETE FROM transfer WHERE owner_id = ${userId}`;
    
    // 6. Finally, delete the user account
    await sql`DELETE FROM app_user WHERE id = ${userId}`;

    console.log(`[Privacy] Account ${userId} deleted successfully`);

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error: any) {
    console.error('[Privacy] Delete account error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
