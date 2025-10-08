/**
 * Generate self-signed SSL certificates for local HTTPS development
 * 
 * This script creates SSL certificates in the .ssl directory
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const sslDir = path.join(__dirname, '..', '.ssl');

// Create .ssl directory if it doesn't exist
if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir, { recursive: true });
  console.log('✅ Created .ssl directory');
}

const certPath = path.join(sslDir, 'localhost.crt');
const keyPath = path.join(sslDir, 'localhost.key');

// Check if certificates already exist
if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  console.log('✅ SSL certificates already exist');
  console.log('   Certificate:', certPath);
  console.log('   Key:', keyPath);
  process.exit(0);
}

console.log('🔐 Generating self-signed SSL certificates...');

try {
  // Generate self-signed certificate using OpenSSL
  // This works on Windows if OpenSSL is installed, or we can use a Node.js alternative
  
  // Try using OpenSSL first
  try {
    execSync(
      `openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj "/CN=localhost" ` +
      `-keyout "${keyPath}" -out "${certPath}" -days 365`,
      { stdio: 'inherit' }
    );
    console.log('✅ SSL certificates generated successfully using OpenSSL');
  } catch (opensslError) {
    // If OpenSSL is not available, use Node.js crypto (requires additional package)
    console.log('⚠️  OpenSSL not found. Using alternative method...');
    
    // Install selfsigned package if not present
    try {
      require('selfsigned');
    } catch {
      console.log('📦 Installing selfsigned package...');
      execSync('npm install --save-dev selfsigned', { stdio: 'inherit' });
    }
    
    const selfsigned = require('selfsigned');
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    const pems = selfsigned.generate(attrs, { 
      days: 365,
      keySize: 2048,
      algorithm: 'sha256'
    });
    
    fs.writeFileSync(keyPath, pems.private);
    fs.writeFileSync(certPath, pems.cert);
    console.log('✅ SSL certificates generated successfully using Node.js');
  }

  console.log('\n📁 Certificate files created:');
  console.log('   Certificate:', certPath);
  console.log('   Key:', keyPath);
  console.log('\n⚠️  Note: These are self-signed certificates for development only.');
  console.log('   Your browser will show a security warning - this is normal.');
  console.log('   Click "Advanced" and "Proceed to localhost" to continue.');
  
} catch (error) {
  console.error('❌ Failed to generate SSL certificates:', error.message);
  console.log('\n💡 Manual steps:');
  console.log('   1. Install OpenSSL: https://slproweb.com/products/Win32OpenSSL.html');
  console.log('   2. Or use mkcert: https://github.com/FiloSottile/mkcert');
  console.log('   3. Run this script again');
  process.exit(1);
}
