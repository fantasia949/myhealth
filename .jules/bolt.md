## 2025-03-09 - Avoid functional array method chains in hot loops

**Learning:** Chained array methods (`.filter().map()`, `.filter().some()`, etc.) create unnecessary intermediate arrays and closures, which cause significant garbage collection overhead in hot paths (like candidate filtering in large datasets or inside component memos).
**Action:** Replace these chains with standard `for` loops that push valid items into pre-allocated or shared arrays.

## 2026-05-23 - Pre-allocate TypedArrays across loops\n**Learning:** Repeatedly instantiating temporary inside nested loops or React iterations causes enormous garbage collection churn, even when arrays are small. should be traversed without function closures using instead of .\n**Action:** Hoist TypedArray allocations to the highest viable scope before the loop, and reuse the memory buffer inside the loop via to pass zero-copy, right-sized views to subsequent operations.

## 2025-05-23 - Pre-allocate TypedArrays across loops

**Learning:** Repeatedly instantiating temporary `Float64Array` inside nested loops or React `useMemo` iterations causes enormous garbage collection churn, even when arrays are small. `Map.prototype.entries()` should be traversed without function closures using `for (const [k, v] of map.entries())` instead of `.forEach()`.
**Action:** Hoist TypedArray allocations to the highest viable scope before the loop, and reuse the memory buffer inside the loop via `.subarray(0, count)` to pass zero-copy, right-sized views to subsequent operations.

## 2024-05-24 - Pre-allocate Arrays when replacing array.map()

**Learning:** Replaced array.map() with traditional for-loops, saving closure allocation and function call overheads per item.
**Action:** Replace `recipes.map(...)` with `for (let i = 0; i < recipes.length; i++)` and preallocate output arrays where lengths are known statically.

## 2024-05-18 - TypedArray Buffer Sizing Bug in Nested Loops
**Learning:** When hoisting TypedArray allocations (like `Float64Array` and `Int32Array`) out of N-squared rendering loops, you cannot assume all datasets share the exact same length by just checking `data[0].length`. If a subsequent array is longer than the hoisted buffer, JS will silently ignore out-of-bounds writes, leading to data truncation and broken charts.
**Action:** Always safely pre-calculate the true maximum length across *all* datasets you intend to process before allocating shared or hoisted TypedArrays. Use `.subarray(0, actualLength)` when slicing into the buffer inside the loop.
