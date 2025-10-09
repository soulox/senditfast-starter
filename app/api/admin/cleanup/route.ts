import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredTransfers, getCleanupStats } from '@lib/cleanup';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth';


/**
 * GET /api/admin/cleanup - Get cleanup statistics
 */
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated (basic auth check)
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getCleanupStats();
    
    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        totalSizeMB: Math.round(stats.totalSizeBytes / (1024 * 1024) * 100) / 100
      }
    });

  } catch (error) {
    console.error('Cleanup stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get cleanup stats' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/cleanup - Trigger cleanup of expired transfers
 */
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated (basic auth check)
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await cleanupExpiredTransfers();
    
    return NextResponse.json({
      success: true,
      result: {
        ...result,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup expired transfers' },
      { status: 500 }
    );
  }
}
