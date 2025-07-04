const fs = require('fs');
const path = require('path');

// Función para encontrar y reemplazar caracteres Unicode problemáticos
function cleanUnicodeChars(content) {
  return content
    .replace(/'/g, "'")  // Left single quotation mark
    .replace(/'/g, "'")  // Right single quotation mark  
    .replace(/"/g, '"')  // Left double quotation mark
    .replace(/"/g, '"')  // Right double quotation mark
    .replace(/–/g, '-')  // En dash
    .replace(/—/g, '-')  // Em dash
    .replace(/…/g, '...') // Horizontal ellipsis
    .replace(/'/g, "'")  // Another variant
    .replace(/"/g, '"')  // Another variant
    .replace(/&gt;/g, '>') // HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&');
}

// Función recursiva para procesar archivos
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      processDirectory(fullPath);
    } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts'))) {
      console.log(`Procesando: ${fullPath}`);
      
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const cleanedContent = cleanUnicodeChars(content);
        
        if (content !== cleanedContent) {
          fs.writeFileSync(fullPath, cleanedContent, 'utf8');
          console.log(`✓ Limpiado: ${fullPath}`);
        }
      } catch (error) {
        console.error(`Error procesando ${fullPath}:`, error.message);
      }
    }
  }
}

// Iniciar el proceso
console.log('Iniciando limpieza de caracteres Unicode problemáticos...');
processDirectory('./client/src');
console.log('Limpieza completada.');