import re

file_path = 'src/layout/table.tsx'

with open(file_path, 'r') as f:
    lines = f.readlines()

new_lines = []
skip_next = False
for i, line in enumerate(lines):
    # Check if this line is aria-label and the previous one (or recent one) was also aria-label
    # But here they are separated by onChange and checked.
    # Pattern:
    # aria-label={...}
    # ...
    # aria-label={...}

    # Specific fix for the known block
    if 'aria-label={`Select ${name}`}' in line:
        # Check if we already have this in the last few lines for the same input
        # It's simpler to just match the exact block via replace
        pass

content = "".join(lines)
# The block is:
#                           aria-label={`Select ${name}`}
#                           onChange={() => onSelect(name)}
#                           checked={selected.includes(name)}
#                           aria-label={`Select ${name}`}

pattern = r'(aria-label={`Select \${name}`}\s+onChange=\{\(\) => onSelect\(name\)}\s+checked=\{selected\.includes\(name\)}\s+)aria-label={`Select \${name}`}'
replacement = r'\1'

content = re.sub(pattern, replacement, content)

with open(file_path, 'w') as f:
    f.write(content)
