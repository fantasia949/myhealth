import re

file_path = 'src/layout/table.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# Logic is ALREADY there?
# Found labels logic: ['className: (() => {\n          const dist = labels.length - 1 - index;\n          if (dist === 0) return "";\n          if (dist <= 2) return "hidden sm:table-cell";\n          if (dist <= 4) return "hidden md:table-cell";\n          return "hidden lg:table-cell";\n        })(),']
# Found tbody logic: ['"hidden sm:table-cell": array.length - 1 - index <= 2 && array.length - 1 - index > 0,']

# Wait, the tbody logic seems incomplete in the previous script output.
# It only found ONE "hidden sm:table-cell".
# Let's check what the file actually has.

print("Current tbody content:")
lines = content.splitlines()
for i, line in enumerate(lines):
    if "hidden sm:table-cell" in line:
        print(f"Line {i}: {line}")
    if "hidden md:table-cell" in line:
        print(f"Line {i}: {line}")
    if "hidden lg:table-cell" in line:
        print(f"Line {i}: {line}")

# If it is already updated, I might have updated it in the first attempt but the grep/regex failed to confirm?
# The first attempt output was empty string, which usually means success for python scripts.
# The second attempt failed because patterns didn't match (because they were already replaced!).

# So let's verify if the logic is correct.
# Labels: if (dist <= 2) return "hidden sm:table-cell"; -> Correct.
# Tbody: "hidden sm:table-cell": array.length - 1 - index <= 2 && array.length - 1 - index > 0, -> Correct.

# Wait, `array.length - 1 - index` is exactly `dist`.
# So logic is consistent.
