const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'my-react-app', 'src');

if (!fs.existsSync(baseDir)) {
  console.error("❌ Error: Run this script from the main project root folder where 'my-react-app' lives.");
  process.exit(1);
}

const fileMap = {};

// 1. Map out the exact filenames from your hard drive
function mapFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      mapFiles(fullPath);
    } else {
      const ext = path.extname(file);
      if (['.jsx', '.js', '.css', '.svg', '.png'].includes(ext)) {
        const nameWithoutExt = path.basename(file, ext);
        fileMap[nameWithoutExt.toLowerCase()] = file;
        fileMap[nameWithoutExt.toLowerCase() + '_noext'] = nameWithoutExt;
      }
    }
  }
}

console.log("🔍 Scanning real file structures...");
mapFiles(baseDir);

// 2. Scan code files and repair import strings automatically
function repairImports(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      repairImports(fullPath);
    } else if (['.jsx', '.js'].includes(path.extname(file))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let isModified = false;

      content = content.replace(/(from\s+['"]|import\s+['"])([^'"]+)(['"])/g, (match, p1, p2, p3) => {
        const pathParts = p2.split('/');
        const lastPart = pathParts[pathParts.length - 1];
        const hasExtension = lastPart.includes('.');
        const cleanLastPart = hasExtension ? lastPart.substring(0, lastPart.lastIndexOf('.')) : lastPart;
        
        const lookUpKey = cleanLastPart.toLowerCase() + '_noext';
        if (fileMap[lookUpKey]) {
          const exactCasingName = fileMap[lookUpKey];
          const exactCasingWithExt = fileMap[cleanLastPart.toLowerCase()];
          
          const currentTarget = hasExtension ? lastPart : cleanLastPart;
          const correctTarget = hasExtension ? exactCasingWithExt : exactCasingName;

          if (currentTarget !== correctTarget) {
            pathParts[pathParts.length - 1] = correctTarget;
            const fixedPath = pathParts.join('/');
            isModified = true;
            console.log(`✨ Fixed path in [${path.basename(fullPath)}]: "${p2}" ➡️ "${fixedPath}"`);
            return `${p1}${fixedPath}${p3}`;
          }
        }
        return match;
      });

      if (isModified) {
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

console.log("🛠️ Syncing import statement paths...");
repairImports(baseDir);
console.log("🎉 Complete! All text imports are fully aligned with your real files.");