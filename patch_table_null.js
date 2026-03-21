const fs = require('fs');
let content = fs.readFileSync('src/layout/Table.tsx', 'utf8');

const target = `{showOrigColumns &&
            extra.hasOrigin &&
            visibleOriginValues?.map((value: any, index: number) => (
              <td key={index} className="p-2 border border-gray-700">
                {value}
              </td>
            ))}`;

const replacement = `{showOrigColumns &&
            extra.hasOrigin &&
            visibleOriginValues?.map((value: any, index: number) => (
              <td key={index} className="p-2 border border-gray-700">
                {value !== null && value !== undefined ? value : ''}
              </td>
            ))}`;

content = content.replace(target, replacement);

fs.writeFileSync('src/layout/Table.tsx', content);
