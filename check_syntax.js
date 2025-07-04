const fs = require('fs');
const path = require('path');

function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Check for common syntax issues
    if (content.includes('undefined undefined') || 
        content.includes('null null') ||
        content.includes(';;') ||
        content.includes('}}') ||
        content.match(/[{}]\s*[{}]/)) {
      console.log(`Potential syntax issue in: ${filePath}`);
    }
  } catch (e) {
    console.log(`Error reading ${filePath}: ${e.message}`);
  }
}

// Check main files
const files = [
  'client/src/App.tsx',
  'client/src/main.tsx',
  'client/src/pages/WhatsApp.tsx',
  'client/src/components/whatsapp/qr-component.tsx',
  'client/src/index.css'
];

files.forEach(checkFile);
