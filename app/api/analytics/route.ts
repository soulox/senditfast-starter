import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@lib/get-user';
import { sql } from '@lib/db';

export const runtime = 'edge';


export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const userId = (user as any).id;
    const userPlan = (user as any).plan || 'FREE';

    // Only allow Business plan users to access analytics
    if (userPlan !== 'BUSINESS') {
      return NextResponse.json(
        { success: false, error: 'Analytics is only available on the Business plan' },
        { status: 403 }
      );
    }

    // Get total transfers
    const [totalTransfersResult] = await sql`
      SELECT COUNT(*)::int as count
      FROM transfer
      WHERE owner_id = ${userId}
    ` as any[];
    const totalTransfers = totalTransfersResult.count;

    // Get total files
    const [totalFilesResult] = await sql`
      SELECT COUNT(*)::int as count
      FROM file_object fo
      JOIN transfer t ON fo.transfer_id = t.id
      WHERE t.owner_id = ${userId}
    ` as any[];
    const totalFiles = totalFilesResult.count;

    // Get total size
    const [totalSizeResult] = await sql`
      SELECT COALESCE(SUM(total_size_bytes), 0)::bigint as total
      FROM transfer
      WHERE owner_id = ${userId}
    ` as any[];
    const totalSize = parseInt(totalSizeResult.total);

    // Get active transfers
    const [activeTransfersResult] = await sql`
      SELECT COUNT(*)::int as count
      FROM transfer
      WHERE owner_id = ${userId}
      AND status = 'ACTIVE'
      AND expires_at > NOW()
    ` as any[];
    const activeTransfers = activeTransfersResult.count;

    // Get expired transfers
    const [expiredTransfersResult] = await sql`
      SELECT COUNT(*)::int as count
      FROM transfer
      WHERE owner_id = ${userId}
      AND (status = 'EXPIRED' OR expires_at <= NOW())
    ` as any[];
    const expiredTransfers = expiredTransfersResult.count;

    // Get downloads this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [downloadsThisMonthResult] = await sql`
      SELECT COUNT(*)::int as count
      FROM transfer_event te
      JOIN transfer t ON te.transfer_id = t.id
      WHERE t.owner_id = ${userId}
      AND te.type = 'DOWNLOAD'
      AND te.created_at >= ${startOfMonth.toISOString()}
    ` as any[];
    const downloadsThisMonth = downloadsThisMonthResult.count;

    // Get transfers by month (last 6 months)
    const transfersByMonth = await sql`
      SELECT 
        TO_CHAR(created_at, 'Mon YYYY') as month,
        COUNT(*)::int as count
      FROM transfer
      WHERE owner_id = ${userId}
      AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) DESC
      LIMIT 6
    ` as any[];

    // Get top files by downloads
    const topFiles = await sql`
      SELECT 
        fo.name,
        COUNT(te.id)::int as downloads
      FROM file_object fo
      JOIN transfer t ON fo.transfer_id = t.id
      LEFT JOIN transfer_event te ON t.id = te.transfer_id AND te.type = 'DOWNLOAD'
      WHERE t.owner_id = ${userId}
      GROUP BY fo.id, fo.name
      HAVING COUNT(te.id) > 0
      ORDER BY downloads DESC
      LIMIT 10
    ` as any[];

    // Get recent activity
    const recentActivity = await sql`
      SELECT 
        te.type,
        te.created_at,
        te.meta
      FROM transfer_event te
      JOIN transfer t ON te.transfer_id = t.id
      WHERE t.owner_id = ${userId}
      ORDER BY te.created_at DESC
      LIMIT 20
    ` as any[];

    const analyticsData = {
      totalTransfers,
      totalFiles,
      totalSize,
      activeTransfers,
      expiredTransfers,
      downloadsThisMonth,
      transfersByMonth: transfersByMonth.map((row: any) => ({
        month: row.month,
        count: row.count
      })),
      topFiles: topFiles.map((row: any) => ({
        name: row.name,
        downloads: row.downloads
      })),
      recentActivity: recentActivity.map((row: any) => ({
        type: row.type,
        created_at: row.created_at,
        meta: row.meta
      }))
    };

    return NextResponse.json({ success: true, data: analyticsData });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
