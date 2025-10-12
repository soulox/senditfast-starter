/**
 * Create Super Admin User
 * 
 * This script creates a super admin user for testing
 */

const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function createSuperAdmin() {
  console.log('🔐 Creating Super Admin User...\n');

  // Super admin credentials
  const email = 'admin@senditfast.net';
  const password = 'SuperAdmin123!';
  const name = 'Super Admin';

  try {
    // Check if user already exists
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
      
      console.log(`\n📧 Email: ${email}`);
      console.log(`🔑 Password: ${password}`);
      console.log(`\n✨ You can sign in at: http://admin.localhost:3001/auth/signin`);
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('✅ Password hashed');

    // Create super admin user
    const [user] = await sql`
      INSERT INTO app_user (email, password_hash, name, plan, role)
      VALUES (${email}, ${passwordHash}, ${name}, 'FREE', 'SUPER_ADMIN')
      RETURNING id, email, name, plan, role, created_at
    `;

    console.log('✅ Super admin user created successfully!\n');
    console.log('📋 User Details:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Plan: ${user.plan}`);
    console.log(`\n🔐 Credentials:`);
    console.log(`   📧 Email: ${email}`);
    console.log(`   🔑 Password: ${password}`);
    console.log(`\n✨ Sign in at: http://admin.localhost:3001/auth/signin`);
    console.log(`\n🎯 After sign in, you'll be redirected to: http://admin.localhost:3001/superadmin`);

  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    process.exit(1);
  }
}

// Run the script
createSuperAdmin()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

