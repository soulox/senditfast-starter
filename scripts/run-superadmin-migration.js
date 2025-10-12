/**
 * Run Super Admin Migration
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  console.log('🔄 Running super admin migration...\n');

  try {
    const sqlContent = fs.readFileSync('infra/sql/add-super-admin.sql', 'utf8');
    
    // Split by semicolon but keep them together for complex statements
    const statements = sqlContent
      .split(/;\s*(?=\n|$)/)
      .filter(s => s.trim() && !s.trim().startsWith('--'))
      .map(s => s.trim());

    let successCount = 0;
    let skipCount = 0;

    for (const statement of statements) {
      if (!statement) continue;
      
      try {
        await sql([statement]);
        console.log('✓ Executed statement');
        successCount++;
      } catch (error) {
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate') ||
            error.code === '42P07' || // relation already exists
            error.code === '42701') { // column already exists
          console.log('⚠ Skipped (already exists)');
          skipCount++;
        } else {
          console.error('❌ Error:', error.message);
          throw error;
        }
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   ${successCount} statements executed`);
    console.log(`   ${skipCount} statements skipped`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

