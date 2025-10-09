const fs = require('fs');
const path = require('path');

// Routes that MUST use Node.js runtime (because they use NextAuth or crypto)
// NextAuth v4 does NOT support Edge Runtime, so ALL authenticated routes must use nodejs
const nodeJsRoutes = [
  // Auth routes
  'app/api/auth/[...nextauth]/route.ts',
  'app/api/auth/forgot-password/route.ts',
  'app/api/auth/reset-password/route.ts',
  'app/api/auth/reset-password/validate/route.ts',
  'app/api/auth/register/route.ts',
  'app/api/auth/dev-login/route.ts',
  
  // Admin routes (use requireUser)
  'app/api/admin/change-plan/route.ts',
  'app/api/admin/cleanup/route.ts',
  
  // Analytics (uses requireUser)
  'app/api/analytics/route.ts',
  
  // API Keys (use requireUser + crypto)
  'app/api/api-keys/route.ts',
  'app/api/api-keys/create/route.ts',
  'app/api/api-keys/[id]/route.ts',
  
  // Payment routes (use requireUser + authorizenet with crypto)
  'app/api/stripe/checkout/route.ts',
  'app/api/authorizenet/process-payment/route.ts',
  'app/api/authorizenet/webhook/route.ts',
  
  // Branding (uses requireUser)
  'app/api/branding/route.ts',
  
  // Privacy (uses requireUser)
  'app/api/privacy/export/route.ts',
  'app/api/privacy/delete-account/route.ts',
  
  // Security/2FA (uses requireUser)
  'app/api/security/2fa/status/route.ts',
  'app/api/security/2fa/setup/route.ts',
  'app/api/security/2fa/verify/route.ts',
  'app/api/security/2fa/disable/route.ts',
  
  // Team (uses requireUser)
  'app/api/team/route.ts',
  'app/api/team/invite/route.ts',
  'app/api/team/[id]/route.ts',
  
  // Transfers (uses requireUser)
  'app/api/transfers/route.ts',
  'app/api/transfers/create/route.ts',
  'app/api/transfers/[id]/notify/route.ts',
  'app/api/transfers/[id]/delete/route.ts',
  
  // Upload (uses requireUser)
  'app/api/upload/parts/route.ts',
  'app/api/upload/create/route.ts',
  'app/api/upload/complete/route.ts',
  
  // Cron (uses B2 which requires DOMParser)
  'app/api/cron/cleanup/route.ts',
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

