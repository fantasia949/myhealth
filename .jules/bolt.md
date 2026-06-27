## 2026-05-24 - TypedArray Subarray Zero-Copy Views

**Learning:** Instantiating TypedArrays inside rapid loops (like windowing chunks in `BiomarkerCorrelationBumpChart.tsx`) causes significant GC churn. Reusing a single pre-allocated TypedArray (sized to the maximum possible required length) and passing `.subarray(0, windowCount)` creates a zero-copy memory view, completely eliminating allocation overhead while maintaining mathematical accuracy boundaries.
**Action:** When chunking or windowing data arrays in hot math paths, pre-allocate one parent TypedArray and use `.subarray()` to define safe memory views instead of re-instantiating arrays.

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

## YYYY-MM-DD - Performance Anti-Pattern (V8 Engine)

**Learning:** Do not replace native `Array.prototype.map()` calls with `for` loops and pre-allocated standard arrays (e.g., `Array(len)`) in React render cycles. Pre-allocating standard arrays creates 'holey' (sparse) arrays, which de-optimize operations in modern V8 engines and are often slower than using `.map()` or initializing an empty array and using `.push()`.
**Action:** Reserve pre-allocation optimization strategies strictly for TypedArrays. Avoid converting native `.map()` to loops where holey arrays are created.

## 2024-05-18 - TypedArray Buffer Sizing Bug in Nested Loops

**Learning:** When hoisting TypedArray allocations (like `Float64Array` and `Int32Array`) out of N-squared rendering loops, you cannot assume all datasets share the exact same length by just checking `data[0].length`. If a subsequent array is longer than the hoisted buffer, JS will silently ignore out-of-bounds writes, leading to data truncation and broken charts.
**Action:** Always safely pre-calculate the true maximum length across _all_ datasets you intend to process before allocating shared or hoisted TypedArrays. Use `.subarray(0, actualLength)` when slicing into the buffer inside the loop.
**Learning:** When hoisting TypedArray allocations (like `Float64Array` and `Int32Array`) out of N-squared rendering loops, you cannot assume all datasets share the exact same length by just checking `data[0].length`. If a subsequent array is longer than the hoisted buffer, JS will silently ignore out-of-bounds writes, leading to data truncation and broken charts.
**Action:** Always safely pre-calculate the true maximum length across _all_ datasets you intend to process before allocating shared or hoisted TypedArrays. Use `.subarray(0, actualLength)` when slicing into the buffer inside the loop.

## 2026-05-25 - Avoid TypedArray allocations inside React loops

**Learning:** Allocating TypedArrays like `new Float64Array(N)` and populating them element-by-element inside rendering loops or `useMemo` blocks creates significant garbage collection overhead, especially when multiplied by the number of iterations (e.g. data windows).
**Action:** Pre-extract valid data points into a single master `Float64Array` outside the inner loops. Inside the loops, use `.subarray(startIndex, endIndex)` to generate zero-copy views. This achieves an order-of-magnitude speedup and zero memory churn.

## 2025-05-24 - V8 Array Pre-allocation for Generic Types

**Learning:** Pre-allocating `Array(N)` for generic object arrays creates 'holey' (sparse) arrays in V8, which deoptimizes array operations. However, replacing `arr.map()` with a standard for-loop and pushing to an empty array `[]` is still faster and avoids closure overhead.
**Action:** When replacing `.map()` in React render cycles for non-numeric types, use `const result = []; for(...) result.push(item)` instead of `const result = Array(N)`.

## YYYY-MM-DD - Refactoring Constaints: UI Side Effects

**Learning:** When applying performance optimizations (like fixing 'holey' array allocations) in ECharts layout components, it is critical to strictly preserve the exact object structures. I accidentally added `symbolSize` and `itemStyle` to the scatter chart dataset as a side effect while modifying the loop. This can cause reference errors (if styling objects aren't imported) or visual regressions.
**Action:** When refactoring loop bodies or object creations for performance, do not introduce new properties or styling configurations that were not in the original code unless explicitly instructed.

## 2025-05-24 - V8 Array Slicing & Spreading in Hot Paths

**Learning:** Chained array slicing and spreading operations like `[...arr.slice(0, 10), ...arr.slice(-10)]` create multiple intermediate array allocations that must be immediately garbage collected. In component rendering paths, this causes unnecessary memory churn.
**Action:** Replace spreading and slicing combinations with a single pre-allocated array (or `.push()` into a dense array) and a `for` loop that uses conditional logic to jump indices, gathering only the required elements in one pass.

## 2026-06-07 - Refactoring 'holey' array allocations

**Learning:** Found several instances where standard JS generic arrays were initialized via `Array<Type>(len)` within `useMemo` hooks (e.g. `src/layout/Table.tsx`, `src/layout/ScatterChart.tsx`). This pre-allocation causes V8 to treat them as 'holey' (sparse) arrays, dropping performance compared to using sequential push operations into dense arrays `[]`.
**Action:** When replacing array iterations with standard `for` loops in hot render cycles, always initialize standard JS arrays densely (`const arr = []`) and add elements using `.push(val)` or sequential direct assignment (`arr[i] = val` only when strictly sequential without gaps). Reserve pre-allocated sizing exclusively for TypedArrays.

## 2025-05-18 - Avoid Holey Arrays in React Loops

**Learning:** Initializing arrays with `Array<Type>(length)` creates sparse (holey) arrays, which de-optimize iterations (like `for`, `map`, etc.) in the V8 engine due to missing memory slots. React render loops containing array manipulation suffer performance degradation.
**Action:** When working with objects or mixed types in hot loops, do not pre-allocate using `Array(length)`. Instead, initialize an empty dense array (`[]`) and use `.push()`. Only use pre-allocated specific types like TypedArrays (`Float64Array`, `Int32Array`) for strictly numeric operations.

## 2026-06-07 - Refactoring 'holey' array allocations\n**Learning:** Found several instances where standard JS generic arrays were initialized via `Array<Type>(len)` within `useMemo` hooks (e.g. `src/layout/SystemClustering.tsx`, `src/layout/BoxplotChart.tsx`, `src/layout/BiomarkerCorrelationBumpChart.tsx`). This pre-allocation causes V8 to treat them as 'holey' (sparse) arrays, dropping performance compared to using sequential push operations into dense arrays `[]`.\n**Action:** When replacing array iterations with standard `for` loops in hot render cycles, always initialize standard JS arrays densely (`const arr = []`) and add elements using `.push(val)` or sequential direct assignment. Reserve pre-allocated sizing exclusively for TypedArrays.

## 2026-06-19 - Single-pass Set generation

**Learning:** Chained operations like `new Set(array.map(x => x.prop))` create unnecessary intermediate arrays which must be immediately garbage collected. In hot render paths, this memory churn degrades performance.
**Action:** Replace chained `.map()` and `new Set()` with a single-pass `for` loop that instantiates a `Set` and populates it via `.add()`. Use `Array.from()` to convert it back if necessary. This avoids intermediate array allocations.

## 2026-06-21 - Avoiding Array mapping and filtering before Map creation

**Learning:** When attempting to find intersections or map items from an array of strings against an array of complex tuples, creating intermediate arrays via `.filter()` and `.map()` followed by instantiating a `new Map()` or `new Set()` introduces massive overhead. If the array of targets is tiny (e.g. length 2) relative to the source array (length N), it is faster to skip object/closure creation entirely and use a direct `O(K*N)` nested `for` loop. V8 optimizes dense nested loops far better than it handles intermediate array and object allocations.
**Action:** When filtering a large dataset for a tiny, strictly bounded number of elements (like 2 selected items), avoid `.filter()`, `Set`, and `Map`. Use a direct nested loop to locate and push the items.

## 2026-06-23 - Replaced unshift in hot loop with push and reverse

**Learning:** Using `Array.prototype.unshift()` inside a loop causes V8 to shift all existing elements on every insertion, making it an O(N^2) operation. This scales poorly in data processing pipelines.
**Action:** Always prefer `.push()` followed by `.reverse()` or building the array backwards by index rather than using `.unshift()` inside a loop.

## 2026-06-25 - Avoid `Array.from({ length })` in hot loops

**Learning:** Allocating `Array.from({ length: len })` inside hot nested loops creates unnecessary array iteration and closure function calls for every element allocation. Instead, utilizing `new Array(len).fill(undefined as any)` is significantly faster since it avoids iteration at allocation time, while the `.fill()` ensures the array is dense for V8.
**Action:** Replace `Array.from({ length })` with `new Array(len).fill(undefined as any)` when pre-allocating dense standard arrays inside hot loops.

## 2024-05-18 - Top K Extraction vs Full Sorts
**Learning:** Avoid using `[...arr].sort(...).slice(0, K)` when K is small and the array is large (e.g. thousands of correlations). The full sort is an O(N log N) operation, and the object spread creates unnecessary garbage collection overhead.
**Action:** Replace full sorts with a single-pass `for` loop that maintains a small sorted array of the top K items. This keeps complexity to O(N * K) and avoids intermediate array allocations.
## 2024-05-18 - Replacing Object.keys().map() with standard for-loop
**Learning:** Using chained array methods (like `.map().sort().slice()`) on large or frequently recreated arrays inside `useMemo` hooks allocates a lot of memory, creating intermediate "holey" arrays that V8 has to manage. This causes noticeable garbage collection overhead on the main thread, leading to UI hitching.
**Action:** Replace `[...arr].sort().slice(0, K)` with an `O(N)` manual insertion loop tracking only the top `K` items, significantly reducing CPU cycles and avoiding array closure/allocation entirely.
## 2024-05-19 - Pre-allocate variables outside of loops
**Learning:** Pre-parsing invariant properties into a flat array outside of nested nested `O(N * M)` operations significantly reduces conditional branching overhead, preventing repetitive evaluations.
**Action:** Lift invariant conditions outside of loops.
