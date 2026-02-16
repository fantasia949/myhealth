## 2024-05-23 - Missing Test Infrastructure
**Learning:** The project lacks standard `test` scripts and Playwright browsers are not installed in the environment, making E2E verification difficult without setup overhead.
**Action:** When working on this repo, assume tests need environment setup (installing browsers) or rely on `tsc` and manual verification for logic-only changes.
## 2024-05-22 - [Jotai Atom Filtering Optimization]
**Learning:** Hoisting invariant calculations (like `string.split` and `toLowerCase`) outside of `filter` loops in Jotai atoms yields significant performance gains (~2.6x speedup). This is especially critical for atoms that derive state from large datasets on every keystroke.
**Action:** Always inspect `filter` and `map` callbacks in atoms for invariant calculations that can be moved to the parent scope.
## 2024-05-22 - [Playwright Table Verification]
**Learning:** When verifying table filtering with Playwright on a table using `@tanstack/react-table` with grouping enabled, the first visible row might be a group header (tr > td) rather than a data row (tr > th).
**Action:** Use robust locators like `tr:has(th)` to target data rows specifically, or handle group expansion if asserting on data visibility.
## 2025-05-27 - Filter Loop Optimization
**Learning:** `visibleDataAtom` contained redundant `string.split` and array creation inside the filter loop. Hoisting this calculation provided a ~3x speedup in a synthetic benchmark.
**Action:** Always check `filter` callbacks for invariant calculations that can be hoisted, especially in Jotai derived atoms that run frequently.
## 2025-05-18 - [Optimization Pattern] Hoisting Filter Logic
**Learning:** Jotai atoms like `visibleDataAtom` often run filtering logic. Ensure invariant transformations (like splitting a filter string) happen *before* the loop (O(1)) rather than inside it (O(N)).
**Action:** Review all `array.filter` and `array.map` blocks in atoms for hoisting opportunities.
## 2025-05-27 - [Sort Optimization]
**Learning:** `Array.sort` with a complex comparator (involving `filter` and `includes`) is a significant bottleneck (O(N log N * T)). Pre-calculating sort keys (O(N)) reduces comparator cost to O(1), yielding massive speedups (~14x in benchmarks).
**Action:** Always inspect `sort` comparators for expensive operations and hoist them into a pre-calculation step.
## 2025-05-27 - [Table Render Optimization]
**Learning:** Moving derived data calculation (like `substring` and regex for tags) from `flatMap` in render loop to data processing step reduces render time significantly (~47%). Also, replacing `localeCompare` with standard operators for ASCII keys boosts sort performance.
**Action:** Pre-calculate display properties during data loading/processing instead of inside React render loops or hooks.
## 2025-05-27 - [React.memo Invalidation]
**Learning:** `React.memo` on list items (like `DataCell` in `src/layout/table.tsx`) is ineffective if the parent component passes an inline arrow function (e.g., `onCellClick={() => ...}`) as a prop, as this creates a new function reference on every render.
**Action:** Pass stable handlers (via `useCallback`) and primitive values to memoized components to ensure referential equality and prevent unnecessary re-renders.
## 2025-05-27 - [Render Loop Optimization: Slice vs Filter]
**Learning:** In React render loops, using `Array.prototype.filter` with index logic to extract a range (e.g., last N items) allocates a new array and iterates all elements (O(N)). Replacing this with `Array.prototype.slice(-N)` (O(k)) is significantly faster and cleaner.
**Action:** Inspect `map` and `filter` chains in render methods. If `filter` is only used for range extraction or slicing, replace it with `slice`.

## 2025-05-27 - [Render Loop Slicing Optimization]
**Learning:** Slicing arrays (e.g., `values.slice(-N)`) inside a React render loop (specifically inside `map`) creates new array references on every render, defeating `React.memo` on child components and adding O(N) complexity.
**Action:** Move slicing logic to `useMemo` or data processing steps to ensure referential stability and O(1) access in the render loop.
