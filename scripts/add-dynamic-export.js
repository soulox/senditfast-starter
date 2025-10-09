const fs = require('fs');
const path = require('path');

// Find all route.ts files with nodejs runtime
function findNodejsRoutes(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findNodejsRoutes(filePath, fileList);
    } else if (file === 'route.ts') {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes("export const runtime = 'nodejs'")) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

// Add dynamic export if not present
function addDynamicExport(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already has dynamic export
  if (content.includes("export const dynamic")) {
    console.log(`✓ Skipped (already has dynamic): ${filePath}`);
    return;
  }
  
  // Add dynamic export right after runtime export
  content = content.replace(
    /export const runtime = 'nodejs';/,
    "export const runtime = 'nodejs';\nexport const dynamic = 'force-dynamic';"
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Added dynamic export to: ${filePath}`);
}

// Main execution
console.log('🔧 Adding dynamic export to all Node.js runtime routes...\n');

const apiDir = path.join(__dirname, '..', 'app', 'api');
const routeFiles = findNodejsRoutes(apiDir);

console.log(`Found ${routeFiles.length} Node.js runtime routes:\n`);

routeFiles.forEach(file => {
  addDynamicExport(file);
});

console.log('\n✅ Done! All Node.js runtime routes now have force-dynamic export.');

