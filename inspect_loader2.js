const fs = require('fs');
const content = fs.readFileSync('src/processors/pre/convertUnit.ts', 'utf8');

console.log("convertUnit.ts content summary");
console.log(content.match(/newExtra\.originValues = .*/g));
