import re

file_path = 'src/layout/table.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# Logic to update
# dist <= 1: Visible (Mobile+)
# dist === 2: Hidden SM
# dist <= 4 (and > 2): Hidden MD
# dist > 4: Hidden LG

# Current Labels Logic:
# if (dist === 0) return "";
# if (dist <= 2) return "hidden sm:table-cell";
# if (dist <= 4) return "hidden md:table-cell";
# if (dist > 4) return "hidden lg:table-cell";

# New Labels Logic:
# if (dist <= 1) return "";
# if (dist === 2) return "hidden sm:table-cell";
# if (dist <= 4) return "hidden md:table-cell";
# if (dist > 4) return "hidden lg:table-cell";

content = content.replace(
    'if (dist === 0) return "";',
    'if (dist <= 1) return "";'
)

# And replace the sm one
content = content.replace(
    'if (dist <= 2) return "hidden sm:table-cell";',
    'if (dist === 2) return "hidden sm:table-cell";'
)

# Current Tbody Logic:
# "hidden sm:table-cell": array.length - 1 - index <= 2 && array.length - 1 - index > 0,
# "hidden md:table-cell": array.length - 1 - index <= 4 && array.length - 1 - index > 2,
# "hidden lg:table-cell": array.length - 1 - index > 4,

# New Tbody Logic:
# Mobile: dist <= 1 (Latest + Latest-1).
# SM: dist === 2 (Latest-2).
# MD: dist 3, 4.

# "hidden sm:table-cell": array.length - 1 - index === 2,
# "hidden md:table-cell": array.length - 1 - index <= 4 && array.length - 1 - index > 2, (Unchanged)
# "hidden lg:table-cell": array.length - 1 - index > 4, (Unchanged)

# I need to match the EXACT string because of formatting.
# "hidden sm:table-cell": array.length - 1 - index <= 2 && array.length - 1 - index > 0,

content = content.replace(
    '"hidden sm:table-cell": array.length - 1 - index <= 2 && array.length - 1 - index > 0,',
    '"hidden sm:table-cell": array.length - 1 - index === 2,'
)

with open(file_path, 'w') as f:
    f.write(content)
