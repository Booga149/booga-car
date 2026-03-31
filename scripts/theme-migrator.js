const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Update specific light theme variables globally for all white/dark properties 
      content = content.replace(/color:\s*'(white|#fff|#ffffff)'/gi, "color: 'var(--text-primary)'");
      content = content.replace(/color:\s*"(white|#fff|#ffffff)"/gi, "color: 'var(--text-primary)'");
      
      content = content.replace(/color:\s*'#(ccc|ddd|eee|888)'/gi, "color: 'var(--text-secondary)'");

      // Backgrounds with white opacity (glass effects) convert to dark opacity for contrast on white
      content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.05\)/g, "rgba(0,0,0,0.03)");
      content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.1\)/g, "rgba(0,0,0,0.06)");
      content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.02\)/g, "rgba(0,0,0,0.02)");
      content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.03\)/g, "rgba(0,0,0,0.02)");
      content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.2\)/g, "rgba(0,0,0,0.1)");
      
      // We will leave background: rgba(0,0,0,X) mostly alone, although we might need to verify them later.
      
      // Revert colors for elements explicitly using var(--primary) or Buttons 
      // Button backgrounds that are exactly primary need white text.
      // This regex looks for background: 'var(--primary)' followed by color: 'var(--text-primary)'
      content = content.replace(/background:\s*'var\(--primary\)'([^}]+?)color:\s*'var\(--text-primary\)'/g, "background: 'var(--primary)'$1color: 'white'");
      content = content.replace(/color:\s*'var\(--text-primary\)'([^}]+?)background:\s*'var\(--primary\)'/g, "color: 'white'$1background: 'var(--primary)'");

      // Save changes
      fs.writeFileSync(fullPath, content);
      console.log(`Updated ${fullPath}`);
    }
  }
}

// Ensure execution directory is correct
const targetDir = path.join(__dirname, '..', 'src');
console.log(`Processing React components in ${targetDir}`);
processDir(targetDir);
console.log("Migration complete.");
