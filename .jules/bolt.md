## 2024-05-22 - [Jotai Atom Filtering Optimization]
**Learning:** Hoisting invariant calculations (like `string.split` and `toLowerCase`) outside of `filter` loops in Jotai atoms yields significant performance gains (~2.6x speedup). This is especially critical for atoms that derive state from large datasets on every keystroke.
**Action:** Always inspect `filter` and `map` callbacks in atoms for invariant calculations that can be moved to the parent scope.
## 2024-05-22 - [Playwright Table Verification]
**Learning:** When verifying table filtering with Playwright on a table using `@tanstack/react-table` with grouping enabled, the first visible row might be a group header (tr > td) rather than a data row (tr > th).
**Action:** Use robust locators like `tr:has(th)` to target data rows specifically, or handle group expansion if asserting on data visibility.
## 2025-05-27 - Filter Loop Optimization\n**Learning:** `visibleDataAtom` contained redundant `string.split` and array creation inside the filter loop. Hoisting this calculation provided a ~3x speedup in a synthetic benchmark.\n**Action:** Always check `filter` callbacks for invariant calculations that can be hoisted, especially in Jotai derived atoms that run frequently.
## 2025-05-18 - [Optimization Pattern] Hoisting Filter Logic
**Learning:** Jotai atoms like `visibleDataAtom` often run filtering logic. Ensure invariant transformations (like splitting a filter string) happen *before* the loop (O(1)) rather than inside it (O(N)).
**Action:** Review all `array.filter` and `array.map` blocks in atoms for hoisting opportunities.
