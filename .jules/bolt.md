## 2025-05-27 - Filter Loop Optimization\n**Learning:** `visibleDataAtom` contained redundant `string.split` and array creation inside the filter loop. Hoisting this calculation provided a ~3x speedup in a synthetic benchmark.\n**Action:** Always check `filter` callbacks for invariant calculations that can be hoisted, especially in Jotai derived atoms that run frequently.
## 2025-05-18 - [Optimization Pattern] Hoisting Filter Logic
**Learning:** Jotai atoms like `visibleDataAtom` often run filtering logic. Ensure invariant transformations (like splitting a filter string) happen *before* the loop (O(1)) rather than inside it (O(N)).
**Action:** Review all `array.filter` and `array.map` blocks in atoms for hoisting opportunities.
