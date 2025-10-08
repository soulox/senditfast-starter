import { neon } from '@neondatabase/serverless';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL not found in .env.local');
  console.error('Please create .env.local and add your Neon database URL');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

// Get schema file from command line or use default
const schemaFile = process.argv[2] || 'infra/sql/schema.sql';
const schemaPath = path.join(process.cwd(), schemaFile);

if (!fs.existsSync(schemaPath)) {
  console.error(`Error: Schema file not found: ${schemaPath}`);
  process.exit(1);
}

console.log(`📄 Loading schema from: ${schemaFile}\n`);
const schema = fs.readFileSync(schemaPath, 'utf8');

(async () => {
  // Split schema into individual statements
  // Remove comments first, then split by semicolon
  const cleanedSchema = schema
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n');
  
  const statements = cleanedSchema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`Executing ${statements.length} SQL statements...\n`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    try {
      // Show what we're executing
      const preview = statement.substring(0, 50).replace(/\s+/g, ' ');
      console.log(`[${i + 1}/${statements.length}] ${preview}...`);
      
      await sql(statement);
      console.log(`  ✓ Success`);
    } catch (error) {
      console.error(`\n❌ Failed at statement ${i + 1}:`);
      console.error(`Statement: ${statement.substring(0, 200)}...`);
      console.error(`Error:`, error.message);
      throw error;
    }
  }

  console.log('\n✅ Schema applied successfully!');
})().catch((e) => {
  console.error('\n❌ Migration failed');
  process.exit(1);
});
