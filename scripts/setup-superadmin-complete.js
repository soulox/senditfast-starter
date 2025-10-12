/**
 * Complete Super Admin Setup
 * Adds role column and creates superadmin user
 */

const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function setupSuperAdmin() {
  console.log('🚀 Starting Super Admin Setup...\n');

  // Super admin credentials
  const email = 'admin@senditfast.net';
  const password = 'SuperAdmin123!';
  const name = 'Super Admin';

  try {
    // Step 1: Add role column if it doesn't exist
    console.log('📝 Step 1: Adding role column...');
    try {
      await sql`
        ALTER TABLE app_user 
        ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'USER'
      `;
      console.log('✅ Role column added');
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('⚠️  Role column already exists');
      } else {
        throw e;
      }
    }

    // Step 2: Add role constraint
    console.log('\n📝 Step 2: Adding role constraint...');
    try {
      await sql`ALTER TABLE app_user DROP CONSTRAINT IF EXISTS app_user_role_check`;
      await sql`
        ALTER TABLE app_user
        ADD CONSTRAINT app_user_role_check 
        CHECK (role IN ('USER', 'ADMIN', 'SUPER_ADMIN'))
      `;
      console.log('✅ Role constraint added');
    } catch (e) {
      console.log('⚠️  Constraint setup skipped:', e.message.substring(0, 50));
    }

    // Step 3: Check if user exists
    console.log('\n📝 Step 3: Checking for existing user...');
    const [existing] = await sql`
      SELECT id, email, role FROM app_user WHERE email = ${email}
    `;

    if (existing) {
      console.log(`⚠️  User ${email} already exists`);
      
      // Update to SUPER_ADMIN if not already
      if (existing.role !== 'SUPER_ADMIN') {
        await sql`
          UPDATE app_user 
          SET role = 'SUPER_ADMIN'
          WHERE email = ${email}
        `;
        console.log(`✅ Updated ${email} to SUPER_ADMIN role`);
      } else {
        console.log(`✅ ${email} is already a SUPER_ADMIN`);
      }
      
      console.log(`\n🔐 Login Credentials:`);
      console.log(`   📧 Email: ${email}`);
      console.log(`   🔑 Password: ${password}`);
      console.log(`\n✨ Sign in at: http://admin.localhost:3001/auth/signin`);
      return;
    }

    // Step 4: Create super admin user
    console.log('\n📝 Step 4: Creating super admin user...');
    const passwordHash = await bcrypt.hash(password, 10);
    
    const [user] = await sql`
      INSERT INTO app_user (email, password_hash, name, plan, role)
      VALUES (${email}, ${passwordHash}, ${name}, 'FREE', 'SUPER_ADMIN')
      RETURNING id, email, name, plan, role, created_at
    `;

    console.log('\n✅ Super admin user created successfully!');
    console.log('\n📋 User Details:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Plan: ${user.plan}`);
    console.log(`\n🔐 Login Credentials:`);
    console.log(`   📧 Email: ${email}`);
    console.log(`   🔑 Password: ${password}`);
    console.log(`\n✨ Sign in at: http://admin.localhost:3001/auth/signin`);
    console.log(`\n🎯 After sign in, you'll be redirected to: http://admin.localhost:3001/superadmin`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the script
setupSuperAdmin()
  .then(() => {
    console.log('\n✅ Setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });

