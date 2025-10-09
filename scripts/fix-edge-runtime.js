const fs = require('fs');
const path = require('path');

// Routes that MUST use Node.js runtime (because they need crypto or other Node.js modules)
const nodeJsRoutes = [
  'app/api/auth/[...nextauth]/route.ts',        // NextAuth requires Node.js
  'app/api/auth/forgot-password/route.ts',      // Uses crypto
  'app/api/auth/reset-password/route.ts',       // Might use crypto
  'app/api/auth/reset-password/validate/route.ts',
  'app/api/auth/register/route.ts',             // Uses bcrypt
  'app/api/api-keys/create/route.ts',           // Uses crypto
  'app/api/authorizenet/webhook/route.ts',      // Uses crypto for signatures
];

function updateRuntime(filePath, runtime) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Replace existing runtime export
  if (content.includes("export const runtime = 'edge'")) {
    content = content.replace(
      "export const runtime = 'edge';",
      `export const runtime = '${runtime}';`
    );
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✓ Changed to ${runtime}: ${filePath}`);
  } else if (content.includes("export const runtime")) {
    console.log(`⚠️  Already has runtime (not edge): ${filePath}`);
  } else {
    console.log(`⚠️  No runtime export found: ${filePath}`);
  }
}

console.log('🔧 Fixing Edge Runtime configuration for Node.js dependencies...\n');

nodeJsRoutes.forEach(route => {
  updateRuntime(route, 'nodejs');
});

console.log('\n✅ Done! Auth and crypto-dependent routes now use Node.js runtime.');
console.log('\n📝 Next steps:');
console.log('   1. git add .');
console.log('   2. git commit -m "Fix runtime: use nodejs for crypto-dependent routes"');
console.log('   3. git push origin main');

