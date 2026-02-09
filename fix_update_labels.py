import re

file_path = 'src/layout/table.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# I used a very specific regex for labels block. If it didn't match (because of spacing), it failed.
# Let's try to match it more robustly.

pattern = r'className: \(\(\) => \{\s+const dist = labels\.length - 1 - index;\s+if \(dist === 0\) return "";\s+if \(dist === 1\) return "hidden sm:table-cell";\s+if \(dist === 2\) return "hidden md:table-cell";\s+return "hidden lg:table-cell";\s+\}\)\(\),'
replacement = r'''className: (() => {
          const dist = labels.length - 1 - index;
          if (dist === 0) return "";
          if (dist <= 2) return "hidden sm:table-cell";
          if (dist <= 4) return "hidden md:table-cell";
          return "hidden lg:table-cell";
        })(),'''

# Check if pattern exists
if re.search(pattern, content):
    print("Labels Pattern found")
    content = re.sub(pattern, replacement, content)
else:
    print("Labels Pattern NOT found")
    # Try simpler replacement based on specific lines
    content = content.replace(
        'if (dist === 1) return "hidden sm:table-cell";',
        'if (dist <= 2) return "hidden sm:table-cell";'
    )
    content = content.replace(
        'if (dist === 2) return "hidden md:table-cell";',
        'if (dist <= 4) return "hidden md:table-cell";'
    )

# Now check tbody pattern
# "hidden sm:table-cell": array.length - 1 - index === 1,
# "hidden md:table-cell": array.length - 1 - index === 2,
# "hidden lg:table-cell": array.length - 1 - index > 2,

tbody_pattern = r'"hidden sm:table-cell": array\.length - 1 - index === 1,\s+"hidden md:table-cell": array\.length - 1 - index === 2,\s+"hidden lg:table-cell": array\.length - 1 - index > 2,'
tbody_replacement = r'''"hidden sm:table-cell": array.length - 1 - index <= 2 && array.length - 1 - index > 0,
                                "hidden md:table-cell": array.length - 1 - index <= 4 && array.length - 1 - index > 2,
                                "hidden lg:table-cell": array.length - 1 - index > 4,'''

if re.search(tbody_pattern, content):
    print("Tbody Pattern found")
    content = re.sub(tbody_pattern, tbody_replacement, content)
else:
    print("Tbody Pattern NOT found")
    # Try manual string replacement for lines
    content = content.replace(
        '"hidden sm:table-cell": array.length - 1 - index === 1,',
        '"hidden sm:table-cell": array.length - 1 - index <= 2 && array.length - 1 - index > 0,'
    )
    content = content.replace(
        '"hidden md:table-cell": array.length - 1 - index === 2,',
        '"hidden md:table-cell": array.length - 1 - index <= 4 && array.length - 1 - index > 2,'
    )
    content = content.replace(
        '"hidden lg:table-cell": array.length - 1 - index > 2,',
        '"hidden lg:table-cell": array.length - 1 - index > 4,'
    )

with open(file_path, 'w') as f:
    f.write(content)
