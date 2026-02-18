new_content = """                            <select
                              id="corr-alpha"
                              value={alpha}
                              onChange={(e) => setAlpha(Number(e.target.value))}
                              className="w-24 px-2 py-1 bg-dark-bg border border-gray-600 rounded text-xs focus:border-blue-500 outline-none transition-colors text-white"
                            >
                              <option value={0.05}>0.05</option>
                              <option value={0.01}>0.01</option>
                              <option value={0.005}>0.005</option>
                              <option value={0.001}>0.001</option>
                            </select>"""

with open("src/layout/correlation.tsx", "r") as f:
    content = f.read()

start_marker = '<input \n                              id="corr-alpha"'
end_marker = '/>'

# Find the start index
start_idx = content.find('id="corr-alpha"')
if start_idx == -1:
    print("Could not find input element")
    exit(1)

# Backtrack to find the opening <input
open_tag_idx = content.rfind('<input', 0, start_idx)

# Find the closing />
close_tag_idx = content.find('/>', start_idx) + 2

if open_tag_idx != -1 and close_tag_idx != -1:
    updated_content = content[:open_tag_idx] + new_content + content[close_tag_idx:]
    with open("src/layout/correlation.tsx", "w") as f:
        f.write(updated_content)
    print("Successfully replaced input with select")
else:
    print("Could not locate the full input tag range")
