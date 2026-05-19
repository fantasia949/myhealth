## 2025-03-09 - Avoid functional array method chains in hot loops
**Learning:** Chained array methods (`.filter().map()`, `.filter().some()`, etc.) create unnecessary intermediate arrays and closures, which cause significant garbage collection overhead in hot paths (like candidate filtering in large datasets or inside component memos).
**Action:** Replace these chains with standard `for` loops that push valid items into pre-allocated or shared arrays.
