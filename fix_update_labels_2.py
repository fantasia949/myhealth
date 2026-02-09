import re

file_path = 'src/layout/table.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# Let's find what is ACTUALLY there.
# I will use re.findall to see the logic.
labels_logic = re.findall(r'className: \(\(\) => \{[^}]+\}\)\(\),', content)
print("Found labels logic:", labels_logic)

tbody_logic = re.findall(r'"hidden sm:table-cell": [^,]+,', content)
print("Found tbody logic:", tbody_logic)

# Replace Logic
# 1. Labels
# if (dist === 1) return "hidden sm:table-cell";
# if (dist === 2) return "hidden md:table-cell";
# return "hidden lg:table-cell";

content = content.replace('if (dist === 1) return "hidden sm:table-cell";', 'if (dist <= 2 && dist > 0) return "hidden sm:table-cell";')
content = content.replace('if (dist === 2) return "hidden md:table-cell";', 'if (dist <= 4 && dist > 2) return "hidden md:table-cell";')
content = content.replace('return "hidden lg:table-cell";', 'if (dist > 4) return "hidden lg:table-cell";')

# 2. Tbody
# "hidden sm:table-cell": array.length - 1 - index === 1,
# "hidden md:table-cell": array.length - 1 - index === 2,
# "hidden lg:table-cell": array.length - 1 - index > 2,

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
