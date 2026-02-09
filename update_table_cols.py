import re

file_path = 'src/layout/table.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# Logic to update
# dist === 1: hidden sm
# dist === 2: hidden md
# New Logic:
# dist <= 2: hidden sm
# dist <= 4: hidden md

# Pattern for labels.map
# className: (() => {
#   const dist = labels.length - 1 - index;
#   if (dist === 0) return "";
#   if (dist === 1) return "hidden sm:table-cell";
#   if (dist === 2) return "hidden md:table-cell";
#   return "hidden lg:table-cell";
# })(),

new_labels_block = '''className: (() => {
          const dist = labels.length - 1 - index;
          if (dist === 0) return "";
          if (dist <= 2) return "hidden sm:table-cell";
          if (dist <= 4) return "hidden md:table-cell";
          return "hidden lg:table-cell";
        })(),'''

# Regex to match the block (it's slightly fuzzy because of newlines)
# I will use a very specific match based on what I wrote last time.
old_labels_block_pattern = r'className: \(\(\) => \{\s+const dist = labels\.length - 1 - index;\s+if \(dist === 0\) return "";\s+if \(dist === 1\) return "hidden sm:table-cell";\s+if \(dist === 2\) return "hidden md:table-cell";\s+return "hidden lg:table-cell";\s+\}\)\(\),'

content = re.sub(old_labels_block_pattern, new_labels_block, content)

# Now update tbody logic
# "hidden sm:table-cell": array.length - 1 - index === 1,
# "hidden md:table-cell": array.length - 1 - index === 2,
# "hidden lg:table-cell": array.length - 1 - index > 2,

# New logic:
# "hidden sm:table-cell": array.length - 1 - index <= 2 && array.length - 1 - index > 0,
# "hidden md:table-cell": array.length - 1 - index <= 4 && array.length - 1 - index > 2,
# "hidden lg:table-cell": array.length - 1 - index > 4,

new_tbody_block = '''className={cn("p-2 border border-gray-700 text-right cursor-pointer relative", {
                                "v-bad": extra.isNotOptimal(value),
                                "is-latest": index === array.length - 1,
                                "hidden sm:table-cell": array.length - 1 - index <= 2 && array.length - 1 - index > 0,
                                "hidden md:table-cell": array.length - 1 - index <= 4 && array.length - 1 - index > 2,
                                "hidden lg:table-cell": array.length - 1 - index > 4,
                              })}'''

old_tbody_pattern = r'className=\{cn\("p-2 border border-gray-700 text-right cursor-pointer relative", \{\s+"v-bad": extra\.isNotOptimal\(value\),\s+"is-latest": index === array\.length - 1,\s+"hidden sm:table-cell": array\.length - 1 - index === 1,\s+"hidden md:table-cell": array\.length - 1 - index === 2,\s+"hidden lg:table-cell": array\.length - 1 - index > 2,\s+\}\)\}'

content = re.sub(old_tbody_pattern, new_tbody_block, content)

with open(file_path, 'w') as f:
    f.write(content)
