const fs = require('fs');
const path = require('path');
// Quick hack to parse the aggregated data without ts-node
const content = fs.readFileSync(path.join(__dirname, 'src/data/aggregated.ts'), 'utf8');

const regex = /\[\s*'Glucose máu',\s*'([^']*)',\s*'([^']*)'\s*\]/g;
let match;
const values = [];
while ((match = regex.exec(content)) !== null) {
  values.push(match[1]);
}
console.log("Found glucose values:", values);
console.log("Count:", values.length);

const allRecords = content.split('  },');
console.log("Total records:", allRecords.length);

// Try to find how many records have Glucose máu
let count = 0;
for (let i = 0; i < allRecords.length; i++) {
  if (allRecords[i].includes('Glucose máu')) {
    count++;
    console.log(`Record ${i+1} has Glucose: ${allRecords[i].match(/'Glucose máu',\s*'([^']*)'/)?.[1]}`);
  } else {
    console.log(`Record ${i+1} DOES NOT have Glucose`);
  }
}
