const fs = require('fs');

// Nav.tsx
let navContent = fs.readFileSync('src/layout/Nav.tsx', 'utf8');
navContent = navContent.replace(
  `    filterTag,
    showOrigColumns,
    showRecords,`,
  `    filterTag,
    showRecords,`
);
fs.writeFileSync('src/layout/Nav.tsx', navContent);

// Nav.types.ts
let navTypesContent = fs.readFileSync('src/layout/Nav.types.ts', 'utf8');
navTypesContent = navTypesContent.replace(
  `  filterTag: string | null
  showOrigColumns: boolean
  showRecords: number`,
  `  filterTag: string | null
  showRecords: number`
);
fs.writeFileSync('src/layout/Nav.types.ts', navTypesContent);

// App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(
  `      filterTag,
      showOrigColumns,
      showRecords,`,
  `      filterTag,
      showRecords,`
);
appContent = appContent.replace(
  `      filterTag,
      showOrigColumns,
      selected,`,
  `      filterTag,
      selected,`
);
fs.writeFileSync('src/App.tsx', appContent);
