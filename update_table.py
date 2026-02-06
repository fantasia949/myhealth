import re

file_path = 'src/layout/table.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# 1. Update columns definition for 'labels'
labels_replacement = r'''...labels.map((label, index) =>
    columnHelper.accessor(label as any, {
      header: getKeyFromTime(label),
      meta: {
        isRecord: true,
        isLatest: index === labels.length - 1,
        title: label,
        className: (() => {
          const dist = labels.length - 1 - index;
          if (dist === 0) return "";
          if (dist === 1) return "hidden sm:table-cell";
          if (dist === 2) return "hidden md:table-cell";
          return "hidden lg:table-cell";
        })(),'''

content = content.replace(
    '...labels.map((label, index) =>\n    columnHelper.accessor(label as any, {\n      header: getKeyFromTime(label),\n      meta: {\n        isRecord: true,\n        isLatest: index === labels.length - 1,\n        title: label,',
    labels_replacement
)

# 2. Update placeholder column
content = content.replace(
    'meta: {\n      placehoder: true,\n    },',
    'meta: {\n      placehoder: true,\n      className: "hidden lg:table-cell",\n    },'
)

# 3. Update range column
content = content.replace(
    'meta: {\n      ref: true,\n      align: "center",\n    },',
    'meta: {\n      ref: true,\n      align: "center",\n      className: "hidden md:table-cell",\n    },'
)

# 4. Update unit column
content = content.replace(
    'columnHelper.accessor("unit" as any, {\n    header: "Unit",\n    meta: {\n      ref: true,\n    },',
    'columnHelper.accessor("unit" as any, {\n    header: "Unit",\n    meta: {\n      ref: true,\n      className: "hidden sm:table-cell",\n    },'
)

content = content.replace(
    'columnHelper.accessor("origUnit" as any, {\n    header: "Orig Unit",\n    meta: {\n      ref: true,\n    },',
    'columnHelper.accessor("origUnit" as any, {\n    header: "Orig Unit",\n    meta: {\n      ref: true,\n      className: "hidden lg:table-cell",\n    },'
)

# 5. Update thead rendering
content = content.replace(
    '"sticky-left bg-dark-table-header": header.id === "name",\n                      "w-1/4": (header.column.columnDef.meta as any)?.placehoder,\n                    })}',
    '"sticky-left bg-dark-table-header": header.id === "name",\n                      "w-1/4": (header.column.columnDef.meta as any)?.placehoder,\n                    }, (header.column.columnDef.meta as any)?.className)}'
)

# 6. Update tfoot rendering
content = content.replace(
    '"sticky-left bg-dark-table-row": header.id === "name",\n                      "w-1/4": (header.column.columnDef.meta as any)?.placehoder,\n                    })}',
    '"sticky-left bg-dark-table-row": header.id === "name",\n                      "w-1/4": (header.column.columnDef.meta as any)?.placehoder,\n                    }, (header.column.columnDef.meta as any)?.className)}'
)

# 7. Update tbody Data Columns
tbody_values_replacement = '''className={cn("p-2 border border-gray-700 text-right cursor-pointer relative", {
                                "v-bad": extra.isNotOptimal(value),
                                "is-latest": index === array.length - 1,
                                "hidden sm:table-cell": array.length - 1 - index === 1,
                                "hidden md:table-cell": array.length - 1 - index === 2,
                                "hidden lg:table-cell": array.length - 1 - index > 2,
                              })}'''

content = content.replace(
    'className={cn("p-2 border border-gray-700 text-right cursor-pointer relative", {\n                                "v-bad": extra.isNotOptimal(value),\n                                "is-latest": index === array.length - 1,\n                              })}',
    tbody_values_replacement
)

# 8. Update tbody Average Column
content = content.replace(
    '<td className="p-2 border border-gray-700">\n                        {averageCountValue',
    '<td className="p-2 border border-gray-700 hidden lg:table-cell">\n                        {averageCountValue'
)

# 9. Update tbody Range Column
content = content.replace(
    '<td className="p-2 border border-gray-700 whitespace-nowrap text-center">\n                        {extra.range as any}\n                      </td>',
    '<td className="p-2 border border-gray-700 whitespace-nowrap text-center hidden md:table-cell">\n                        {extra.range as any}\n                      </td>'
)

# 10. Update tbody Unit Column
content = content.replace(
    '<td className="p-2 border border-gray-700">{unit as any}</td>',
    '<td className="p-2 border border-gray-700 hidden sm:table-cell">{unit as any}</td>'
)

# 11. Update tbody OrigUnit Column
content = content.replace(
    '<td className="p-2 border border-gray-700">{extra.originUnit}</td>',
    '<td className="p-2 border border-gray-700 hidden lg:table-cell">{extra.originUnit}</td>'
)

with open(file_path, 'w') as f:
    f.write(content)
