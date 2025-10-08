import { sql } from './db';

// Use mock B2 if MOCK_B2=true in env
const useMock = process.env.MOCK_B2 === 'true';
const { deleteFiles } = useMock
  ? require('./b2-mock')
  : require('./b2');

/**
 * Clean up expired transfers by deleting files from B2 and updating database
 */
export async function cleanupExpiredTransfers(): Promise<{
  processed: number;
  deleted: number;
  errors: string[];
}> {
  console.log('[CLEANUP] Starting expired transfers cleanup...');
  
  const errors: string[] = [];
  let processed = 0;
  let deleted = 0;

  try {
    // Find all expired transfers that are still ACTIVE
    const expiredTransfers = await sql`
      select id, slug, total_size_bytes
      from transfer
      where status = 'ACTIVE'
        and expires_at <= now()
      order by expires_at asc
      limit 100
    ` as any[];

    console.log(`[CLEANUP] Found ${expiredTransfers.length} expired transfers`);

    for (const transfer of expiredTransfers) {
      try {
        processed++;
        
        // Get all file B2 keys for this transfer
        const files = await sql`
          select b2_key, name
          from file_object
          where transfer_id = ${transfer.id}
        ` as any[];

        console.log(`[CLEANUP] Transfer ${transfer.slug}: Found ${files.length} files to delete`);

        // Delete files from B2
        if (files.length > 0) {
          const b2Keys = files.map((f: any) => f.b2_key);
          
          try {
            await deleteFiles(b2Keys);
            console.log(`[CLEANUP] ✅ Deleted ${b2Keys.length} files from B2 for transfer ${transfer.slug}`);
            deleted += files.length;
          } catch (error) {
            console.error(`[CLEANUP] ❌ Failed to delete files from B2 for transfer ${transfer.slug}:`, error);
            errors.push(`Transfer ${transfer.slug}: B2 deletion failed - ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        // Mark transfer as EXPIRED in database
        await sql`
          update transfer
          set status = 'EXPIRED',
              updated_at = now()
          where id = ${transfer.id}
        `;

        console.log(`[CLEANUP] ✅ Marked transfer ${transfer.slug} as EXPIRED`);

      } catch (error) {
        console.error(`[CLEANUP] ❌ Error processing transfer ${transfer.id}:`, error);
        errors.push(`Transfer ${transfer.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log(`[CLEANUP] Completed: ${processed} processed, ${deleted} files deleted, ${errors.length} errors`);

  } catch (error) {
    console.error('[CLEANUP] ❌ Fatal error during cleanup:', error);
    errors.push(`Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    processed,
    deleted,
    errors
  };
}

/**
 * Get cleanup statistics
 */
export async function getCleanupStats(): Promise<{
  expiredCount: number;
  totalSizeBytes: number;
  oldestExpired: string | null;
}> {
  const [stats] = await sql`
    select 
      count(*) as expired_count,
      coalesce(sum(total_size_bytes), 0) as total_size_bytes,
      min(expires_at) as oldest_expired
    from transfer
    where status = 'ACTIVE'
      and expires_at <= now()
  ` as any[];

  return {
    expiredCount: parseInt(stats.expired_count) || 0,
    totalSizeBytes: parseInt(stats.total_size_bytes) || 0,
    oldestExpired: stats.oldest_expired
  };
}
