#!/usr/bin/env node

/**
 * Cron job script for cleaning up expired transfers
 * 
 * Usage:
 * - Run manually: node scripts/cleanup-cron.js
 * - Add to crontab: 0 /6 * * * cd /path/to/project && node scripts/cleanup-cron.js
 * - Run every 6 hours: 0 /6 * * * cd /path/to/project && node scripts/cleanup-cron.js
 */

require('dotenv').config({ path: '.env.local' });

async function runCleanup() {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.BASE_URL || 'https://senditfast.net';
  
  console.log(`[CRON] Starting cleanup at ${new Date().toISOString()}`);
  console.log(`[CRON] Using base URL: ${baseUrl}`);

  try {
    // Try to make a request to the cleanup endpoint
    console.log('[CRON] Attempting to call cleanup API...');
    
    const response = await fetch(`${baseUrl}/api/admin/cleanup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add a timeout
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('[CRON] ✅ Cleanup completed successfully');
      console.log(`[CRON] Processed: ${result.result.processed} transfers`);
      console.log(`[CRON] Deleted: ${result.result.deleted} files`);
      
      if (result.result.errors.length > 0) {
        console.log(`[CRON] ⚠️  ${result.result.errors.length} errors occurred:`);
        result.result.errors.forEach((error, i) => {
          console.log(`[CRON]   ${i + 1}. ${error}`);
        });
      }
    } else {
      throw new Error(result.error || 'Unknown error');
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('[CRON] ❌ Cleanup timed out after 30 seconds');
    } else if (error.code === 'ECONNREFUSED' || error.message.includes('404')) {
      console.error('[CRON] ❌ Server not running or endpoint not found');
      console.error('[CRON] 💡 Make sure the development server is running: pnpm dev');
      console.error('[CRON] 💡 Or deploy to production and use the production URL');
    } else {
      console.error('[CRON] ❌ Cleanup failed:', error.message);
    }
    process.exit(1);
  }
}

// Run cleanup if this script is executed directly
if (require.main === module) {
  runCleanup().then(() => {
    console.log('[CRON] Script completed');
    process.exit(0);
  }).catch((error) => {
    console.error('[CRON] Script failed:', error);
    process.exit(1);
  });
}

module.exports = { runCleanup };
