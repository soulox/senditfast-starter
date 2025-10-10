import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/superadmin-auth';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  // Verify super admin access
  const admin = await requireSuperAdmin();
  if (admin instanceof NextResponse) {
    return admin;
  }

  try {
    // Get dashboard statistics
    const [stats] = await sql`
      SELECT * FROM admin_dashboard_stats
    ` as any[];

    // Get recent user signups (last 30 days by day)
    const signupTrend = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE plan = 'FREE') as free,
        COUNT(*) FILTER (WHERE plan = 'PRO') as pro,
        COUNT(*) FILTER (WHERE plan = 'BUSINESS') as business
      FROM app_user
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    ` as any[];

    // Get plan distribution
    const planDistribution = await sql`
      SELECT 
        plan,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER ()), 2) as percentage
      FROM app_user
      GROUP BY plan
      ORDER BY count DESC
    ` as any[];

    // Get transfer statistics
    const [transferStats] = await sql`
      SELECT 
        COUNT(*) as total_transfers,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as transfers_30d,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as transfers_7d,
        COUNT(*) FILTER (WHERE status = 'ACTIVE') as active_transfers,
        COUNT(*) FILTER (WHERE status = 'EXPIRED') as expired_transfers,
        COALESCE(SUM(total_size_bytes), 0) as total_bytes_transferred,
        COALESCE(AVG(total_size_bytes), 0) as avg_transfer_size
      FROM transfer
    ` as any[];

    // Get storage usage by plan
    const storageByPlan = await sql`
      SELECT 
        plan,
        COUNT(*) as users,
        COALESCE(SUM(storage_used_bytes), 0) as total_storage,
        COALESCE(AVG(storage_used_bytes), 0) as avg_storage
      FROM app_user
      GROUP BY plan
      ORDER BY total_storage DESC
    ` as any[];

    // Get top users by storage
    const topUsers = await sql`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.plan,
        u.storage_used_bytes,
        COUNT(t.id) as transfer_count,
        MAX(t.created_at) as last_transfer_at
      FROM app_user u
      LEFT JOIN transfer t ON u.id = t.owner_id
      WHERE u.storage_used_bytes > 0
      GROUP BY u.id, u.email, u.name, u.plan, u.storage_used_bytes
      ORDER BY u.storage_used_bytes DESC
      LIMIT 10
    ` as any[];

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        signupTrend,
        planDistribution,
        transfers: transferStats,
        storageByPlan,
        topUsers,
      },
    });
  } catch (error: any) {
    console.error('[SuperAdmin] Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics', details: error.message },
      { status: 500 }
    );
  }
}

