const fs = require('fs');
let content = fs.readFileSync('src/processors/pre/convertUnit.ts', 'utf8');

const target = `  const newExtra = extra || {}
  newExtra.hasOrigin = mappedResult.some((entry) => entry[2] !== undefined)
  newExtra.originValues = mappedResult.map((entry) => entry[2])`;

const replacement = `  const newExtra = extra || {}
  newExtra.hasOrigin = mappedResult.some((entry) => entry[2] !== undefined)
  newExtra.originValues = mappedResult.map((entry) => entry[2] ?? null)`;

content = content.replace(target, replacement);
fs.writeFileSync('src/processors/pre/convertUnit.ts', content);
