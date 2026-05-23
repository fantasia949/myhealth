## 2025-03-09 - Avoid functional array method chains in hot loops

**Learning:** Chained array methods (`.filter().map()`, `.filter().some()`, etc.) create unnecessary intermediate arrays and closures, which cause significant garbage collection overhead in hot paths (like candidate filtering in large datasets or inside component memos).
**Action:** Replace these chains with standard `for` loops that push valid items into pre-allocated or shared arrays.
## 2026-05-23 - Pre-allocate TypedArrays across loops\n**Learning:** Repeatedly instantiating temporary  inside nested loops or React  iterations causes enormous garbage collection churn, even when arrays are small.  should be traversed without function closures using  instead of .\n**Action:** Hoist TypedArray allocations to the highest viable scope before the loop, and reuse the memory buffer inside the loop via  to pass zero-copy, right-sized views to subsequent operations.
## 2025-05-23 - Pre-allocate TypedArrays across loops
**Learning:** Repeatedly instantiating temporary `Float64Array` inside nested loops or React `useMemo` iterations causes enormous garbage collection churn, even when arrays are small. `Map.prototype.entries()` should be traversed without function closures using `for (const [k, v] of map.entries())` instead of `.forEach()`.
**Action:** Hoist TypedArray allocations to the highest viable scope before the loop, and reuse the memory buffer inside the loop via `.subarray(0, count)` to pass zero-copy, right-sized views to subsequent operations.
