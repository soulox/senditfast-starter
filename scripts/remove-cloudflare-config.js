const fs = require('fs');
const path = require('path');

// Find all route.ts files
function findRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findRouteFiles(filePath, fileList);
    } else if (file === 'route.ts' || file === 'page.tsx') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Remove Cloudflare-specific exports
function removeCloudflareConfig(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Remove runtime exports
  if (content.includes("export const runtime = 'edge';") || 
      content.includes("export const runtime = 'nodejs';")) {
    content = content.replace(/export const runtime = '(edge|nodejs)';\n/g, '');
    modified = true;
  }
  
  // Remove dynamic exports
  if (content.includes("export const dynamic = 'force-dynamic';")) {
    content = content.replace(/export const dynamic = 'force-dynamic';\n/g, '');
    modified = true;
  }
  
  // Clean up extra blank lines
  content = content.replace(/\n\n\n+/g, '\n\n');
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Cleaned: ${filePath}`);
    return true;
  }
  
  return false;
}

// Main execution
console.log('🧹 Removing Cloudflare-specific configurations...\n');

const appDir = path.join(__dirname, '..', 'app');
const routeFiles = findRouteFiles(appDir);

let cleaned = 0;
routeFiles.forEach(file => {
  if (removeCloudflareConfig(file)) {
    cleaned++;
  }
});

console.log(`\n✅ Cleaned ${cleaned} files`);
console.log('\n📝 These configurations were Cloudflare-specific and are not needed for Ubuntu deployment.');
console.log('Your app will work better without them on a standard Node.js server!\n');

