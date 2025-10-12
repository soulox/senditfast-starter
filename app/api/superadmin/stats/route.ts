export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@lib/superadmin-auth';
import { sql } from '@lib/db';

export async function GET(request: NextRequest) {
  // Verify super admin access
  const admin = await requireSuperAdmin();
  if (admin instanceof NextResponse) {
    return admin;
  }

  try {
    // Get dashboard statistics (compute storage from transfers)
    const [stats] = await sql`
      WITH total_storage AS (
        SELECT COALESCE(SUM(t.total_size_bytes), 0) AS bytes
        FROM transfer t
      )
      SELECT 
        (SELECT COUNT(*) FROM app_user WHERE role <> 'SUPER_ADMIN') as total_users,
        (SELECT COUNT(*) FROM app_user WHERE role <> 'SUPER_ADMIN' AND plan = 'FREE') as free_users,
        (SELECT COUNT(*) FROM app_user WHERE role <> 'SUPER_ADMIN' AND plan = 'PRO') as pro_users,
        (SELECT COUNT(*) FROM app_user WHERE role <> 'SUPER_ADMIN' AND plan = 'BUSINESS') as business_users,
        (SELECT COUNT(*) FROM app_user WHERE role <> 'SUPER_ADMIN' AND created_at >= NOW() - INTERVAL '30 days') as new_users_30d,
        (SELECT COUNT(*) FROM app_user WHERE role <> 'SUPER_ADMIN' AND created_at >= NOW() - INTERVAL '7 days') as new_users_7d,
        0 as active_users_30d,
        0 as active_users_7d,
        (SELECT bytes FROM total_storage) as total_storage_used
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
        COALESCE(SUM(total_size_bytes), 0) as total_bytes_transferred,
        COALESCE(AVG(total_size_bytes), 0) as avg_transfer_size
      FROM transfer
    ` as any[];

    // Get storage usage by plan (sum transfer sizes per user)
    const storageByPlan = await sql`
      WITH user_storage AS (
        SELECT 
          u.id,
          u.plan,
          COALESCE(SUM(t.total_size_bytes), 0) AS storage_bytes
        FROM app_user u
        LEFT JOIN transfer t ON t.owner_id = u.id
        GROUP BY u.id, u.plan
      )
      SELECT 
        plan,
        COUNT(*) as users,
        COALESCE(SUM(storage_bytes), 0) as total_storage,
        COALESCE(AVG(storage_bytes), 0) as avg_storage
      FROM user_storage
      GROUP BY plan
      ORDER BY total_storage DESC
    ` as any[];

    // Get top users by storage (sum transfer sizes)
    const topUsers = await sql`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.plan,
        COALESCE(SUM(t.total_size_bytes), 0) as storage_used_bytes,
        COUNT(DISTINCT t.id) as transfer_count,
        MAX(t.created_at) as last_transfer_at
      FROM app_user u
      LEFT JOIN transfer t ON u.id = t.owner_id
      WHERE u.role <> 'SUPER_ADMIN'
      GROUP BY u.id, u.email, u.name, u.plan
      ORDER BY storage_used_bytes DESC
      LIMIT 10
    ` as any[];

    // Per-user storage (computed from transfers) - breakdown
    const storageByUser = await sql`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.plan,
        COALESCE(SUM(t.total_size_bytes), 0) as storage_bytes,
        COUNT(DISTINCT t.id) as transfers_count
      FROM app_user u
      LEFT JOIN transfer t ON t.owner_id = u.id
      WHERE u.role <> 'SUPER_ADMIN'
      GROUP BY u.id, u.email, u.name, u.plan
      ORDER BY storage_bytes DESC
      LIMIT 50
    ` as any[];

    // Per-user transfers count - breakdown
    const transfersByUser = await sql`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.plan,
        COUNT(t.id) as transfers_count,
        COALESCE(SUM(t.total_size_bytes), 0) as total_bytes
      FROM app_user u
      LEFT JOIN transfer t ON t.owner_id = u.id
      WHERE u.role <> 'SUPER_ADMIN'
      GROUP BY u.id, u.email, u.name, u.plan
      ORDER BY transfers_count DESC
      LIMIT 50
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
        storageByUser,
        transfersByUser,
      },
    }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } });
  } catch (error: any) {
    console.error('[SuperAdmin] Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics', details: error.message },
      { status: 500 }
    );
  }
}

