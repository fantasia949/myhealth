#!/bin/bash
sed -i '' 's/rankedDataMapAtom,/rankedDataMapAtom,\n  nonInferredDataAtom,/' ./src/layout/Nav.tsx
