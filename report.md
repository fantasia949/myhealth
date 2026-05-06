**The Issue:**
`src/layout/Chart2.tsx` line 12 contains `interface ChartProps` which is directly used by `Chart2.tsx` and exported implicitly or expected to be in a `.types.ts` file. This violates the established repository pattern where components with complex props must have their shared types placed in a sibling `.types.ts` file, leading to potential structural confusion and duplicated definitions if imported elsewhere.

**The Discovery Signal:**
Scan A (Misplaced Shared Types): A `grep` scan revealed that multiple components including `src/layout/Chart2.tsx` define local `interface`s rather than storing them in `<ComponentName>.types.ts`. Specifically, `interface ChartProps` was declared at the top of `Chart2.tsx`.

**The Fix:**
I extracted `interface ChartProps` from `src/layout/Chart2.tsx` into a newly created sibling file, `src/layout/Chart2.types.ts`. I then exported the interface and added an import statement for it in `src/layout/Chart2.tsx` (`import { ChartProps } from './Chart2.types'`).

**The Benefit:**
This structural improvement perfectly aligns `Chart2` with the established repository pattern, reducing confusion for future agents working with the codebase. It isolates type definitions from implementation, keeping component files cleaner, ensuring safer and easier type reuse without risking circular dependency issues, and maintaining `tsc` type safety.
