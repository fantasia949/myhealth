**The Issue:**
In `src/layout/Chart2.tsx`, the static `echartsOptions.yAxis` configuration contains a secondary, hidden Y-axis (`show: false`) alongside the primary axis.

**Discovery Signal:**
Scan 7 (Visual Consistency & Cleanliness) / Memory Constraint - Verified that all major bugs listed in Scans 1-6 have already been fixed in `origin/main` (e.g. `ref.current` is removed, tooltip regression expression is fixed, null mappings are present). The remaining issue is a redundant configuration object.

**The Fix:**
Removed the dead, secondary `yAxis` object from `echartsOptions` in `Chart2.tsx`. Since both the scatter dataset and the regression line share the same unit and scale (`yAxisIndex: 0`), the second axis was completely unused and merely added unnecessary mapping iterations in the `useMemo` loop.

**The Benefit:**
Cleans up the file structure, removes dead configuration code, and adheres strictly to the "exactly ONE improvement" constraint without introducing risky behavioral regressions.
