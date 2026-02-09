import re

file_path = 'src/layout/table.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# Check Labels Logic
# if (dist <= 1) return "";
# if (dist === 2) return "hidden sm:table-cell";
# if (dist <= 4) return "hidden md:table-cell";
# if (dist > 4) return "hidden lg:table-cell";

if 'if (dist <= 1) return "";' in content:
    print("Labels Mobile logic updated.")
else:
    print("Labels Mobile logic NOT updated.")

if 'if (dist === 2) return "hidden sm:table-cell";' in content:
    print("Labels SM logic updated.")
else:
    print("Labels SM logic NOT updated.")

# Check Tbody Logic
if '"hidden sm:table-cell": array.length - 1 - index === 2,' in content:
    print("Tbody Mobile logic updated.")
else:
    print("Tbody Mobile logic NOT updated.")
