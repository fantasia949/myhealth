## 2025-05-18 - [Optimization Pattern] Hoisting Filter Logic
**Learning:** Jotai atoms like `visibleDataAtom` often run filtering logic. Ensure invariant transformations (like splitting a filter string) happen *before* the loop (O(1)) rather than inside it (O(N)).
**Action:** Review all `array.filter` and `array.map` blocks in atoms for hoisting opportunities.
