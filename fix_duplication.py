import re

file_path = 'src/layout/table.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# Fix duplicated className block in labels.map
# We'll look for the pattern where the block repeats
pattern = r'(className: \(\(\) => \{[^}]+\}\)\(\),)\s+className: \(\(\) => \{[^}]+\}\)\(\),'
# Replace with single occurrence
content = re.sub(pattern, r'\1', content, flags=re.DOTALL)

with open(file_path, 'w') as f:
    f.write(content)
