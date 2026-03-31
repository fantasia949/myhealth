import re

with open('./src/layout/Nav.tsx', 'r') as f:
    content = f.read()

# Replace the atom imports
content = content.replace('rankedDataMapAtom,', 'rankedDataMapAtom,\n  nonInferredDataAtom,')

# Add nonInferredData = useAtomValue(nonInferredDataAtom)
content = content.replace('const fullData = useAtomValue(dataAtom)', 'const fullData = useAtomValue(dataAtom)\n    const nonInferredData = useAtomValue(nonInferredDataAtom)')

# Update relatedContext loop condition
old_candidates = 'const candidates = fullData.filter((d) => !d[3].inferred && !selectedSet.has(d[0]))'
new_candidates = 'const candidates = nonInferredData.filter((d) => !selectedSet.has(d[0]) && !d[0].startsWith(\'HOMA\') && !d[0].startsWith(\'eGFR\') && !d[0].startsWith(\'SL \'))'
content = content.replace(old_candidates, new_candidates)

# Update useCallback dependencies
old_deps = '}, [selected, data, filterTag, key, model, fullData])'
new_deps = '}, [selected, data, filterTag, key, model, fullData, nonInferredData])'
content = content.replace(old_deps, new_deps)

with open('./src/layout/Nav.tsx', 'w') as f:
    f.write(content)
