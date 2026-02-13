import re

file_path = 'src/layout/table.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# Replace p-2 in tfoot th
# We need to find the specific th in tfoot.
# The content is around:
# <tfoot>
# ...
# <th
# ...
# className={cn("p-2 border ...
#
# We can just target the className string that contains "sticky-left bg-dark-table-row".

# The pattern is:
# className={cn("p-2 border border-gray-700 text-center relative", {

old_class = 'className={cn("p-2 border border-gray-700 text-center relative", {'
new_class = 'className={cn("border border-gray-700 text-center relative p-0 h-full", {'

if old_class in content:
    content = content.replace(old_class, new_class)
else:
    print("Could not find the exact className string to replace.")
    # Fallback: maybe just replace "p-2 " with "p-0 " inside that specific block?
    # Or maybe just add "p-0" conditionally?
    # Let's try to be smarter.
    # The th has a key={header.id}.
    pass

with open(file_path, 'w') as f:
    f.write(content)
