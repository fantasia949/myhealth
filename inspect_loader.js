const fs = require('fs');
const content = fs.readFileSync('src/processors/loader.ts', 'utf8');
console.log(content.includes('originValues'));
