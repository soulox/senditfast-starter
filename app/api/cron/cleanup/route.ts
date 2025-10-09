import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredTransfers } from '@lib/cleanup';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // Prevent static generation


/**
 * Serverless cron job endpoint for cleaning up expired transfers
 * 
 * This endpoint can be called by:
 * - Vercel Cron Jobs: https://vercel.com/docs/cron-jobs
 * - GitHub Actions
 * - External cron services (cron-job.org, etc.)
 * - Cloudflare Workers Cron Triggers
 * 
 * Usage:
 * - Manual trigger: POST /api/cron/cleanup
 * - With auth header: POST /api/cron/cleanup (optional auth check)
 */
export async function POST(req: NextRequest) {
  try {
    // Optional: Add authentication for production
    const authHeader = req.headers.get('authorization');
    const expectedAuth = process.env.CRON_SECRET;
    
    if (expectedAuth && authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[CRON] Starting automatic cleanup...');
    
    const result = await cleanupExpiredTransfers();
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      result: {
        processed: result.processed,
        deleted: result.deleted,
        errors: result.errors
      }
    };

    console.log('[CRON] Cleanup completed:', response);
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('[CRON] Cleanup failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Also support GET for health checks
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'cleanup',
    timestamp: new Date().toISOString()
  });
}
