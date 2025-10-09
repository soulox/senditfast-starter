const fs = require('fs');
const path = require('path');

// Find all route.ts files in app/api directory
function findRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findRouteFiles(filePath, fileList);
    } else if (file === 'route.ts') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Add edge runtime export if not present
function addEdgeRuntime(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already has runtime export
  if (content.includes("export const runtime")) {
    console.log(`✓ Skipped (already has runtime): ${filePath}`);
    return;
  }
  
  // Add edge runtime export at the top, after imports
  const lines = content.split('\n');
  let insertIndex = 0;
  
  // Find the last import statement
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ') || lines[i].trim().startsWith('from ')) {
      insertIndex = i + 1;
    }
  }
  
  // Insert edge runtime export
  lines.splice(insertIndex, 0, '', 'export const runtime = \'edge\';', '');
  
  const newContent = lines.join('\n');
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`✓ Added edge runtime to: ${filePath}`);
}

// Add edge runtime to share/[slug]/page.tsx as well
function addEdgeRuntimeToPage(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes("export const runtime")) {
    console.log(`✓ Skipped (already has runtime): ${filePath}`);
    return;
  }
  
  // Add after 'use client' if present
  if (content.includes("'use client'")) {
    content = content.replace(
      "'use client';",
      "'use client';\n\nexport const runtime = 'edge';"
    );
  } else {
    // Add at the top after imports
    const lines = content.split('\n');
    let insertIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ') || lines[i].trim().startsWith('from ')) {
        insertIndex = i + 1;
      }
    }
    
    lines.splice(insertIndex, 0, '', 'export const runtime = \'edge\';', '');
    content = lines.join('\n');
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Added edge runtime to: ${filePath}`);
}

// Main execution
console.log('🔧 Adding Edge Runtime configuration to all API routes...\n');

const apiDir = path.join(__dirname, '..', 'app', 'api');
const routeFiles = findRouteFiles(apiDir);

console.log(`Found ${routeFiles.length} API route files:\n`);

routeFiles.forEach(file => {
  addEdgeRuntime(file);
});

// Also add to share/[slug]/page.tsx
const sharePage = path.join(__dirname, '..', 'app', 'share', '[slug]', 'page.tsx');
console.log('\n🔧 Adding Edge Runtime to share page...\n');
addEdgeRuntimeToPage(sharePage);

console.log('\n✅ Done! All routes are now configured for Edge Runtime.');
console.log('\n📝 Next steps:');
console.log('   1. Review the changes');
console.log('   2. git add .');
console.log('   3. git commit -m "Add Edge Runtime configuration for Cloudflare Pages"');
console.log('   4. git push origin main');

