## 2026-05-24 - TypedArray Subarray Zero-Copy Views

**Learning:** Instantiating TypedArrays inside rapid loops (like windowing chunks in `BiomarkerCorrelationBumpChart.tsx`) causes significant GC churn. Reusing a single pre-allocated TypedArray (sized to the maximum possible required length) and passing `.subarray(0, windowCount)` creates a zero-copy memory view, completely eliminating allocation overhead while maintaining mathematical accuracy boundaries.
**Action:** When chunking or windowing data arrays in hot math paths, pre-allocate one parent TypedArray and use `.subarray()` to define safe memory views instead of re-instantiating arrays.

## 2025-05-24 - V8 Array Pre-allocation for Generic Types

**Learning:** Pre-allocating `Array(N)` for generic object arrays creates 'holey' (sparse) arrays in V8, which deoptimizes array operations. However, replacing `arr.map()` with a standard for-loop and pushing to an empty array `[]` is still faster and avoids closure overhead.
**Action:** When replacing `.map()` in React render cycles for non-numeric types, use `const result = []; for(...) result.push(item)` instead of `const result = Array(N)`. Reserve pre-allocated sizing exclusively for TypedArrays.

## 2026-06-21 - Avoiding Array mapping and filtering before Map creation

**Learning:** When attempting to find intersections or map items from an array of strings against an array of complex tuples, creating intermediate arrays via `.filter()` and `.map()` followed by instantiating a `new Map()` or `new Set()` introduces massive overhead. If the array of targets is tiny (e.g. length 2) relative to the source array (length N), it is faster to skip object/closure creation entirely and use a direct `O(K*N)` nested `for` loop. V8 optimizes dense nested loops far better than it handles intermediate array and object allocations.
**Action:** When filtering a large dataset for a tiny, strictly bounded number of elements (like 2 selected items), avoid `.filter()`, `Set`, and `Map`. Use a direct nested loop to locate and push the items.

## 2024-05-18 - TypedArray Buffer Sizing Bug in Nested Loops

**Learning:** When hoisting TypedArray allocations (like `Float64Array` and `Int32Array`) out of N-squared rendering loops, you cannot assume all datasets share the exact same length by just checking `data[0].length`. If a subsequent array is longer than the hoisted buffer, JS will silently ignore out-of-bounds writes, leading to data truncation and broken charts.
**Action:** Always safely pre-calculate the true maximum length across _all_ datasets you intend to process before allocating shared or hoisted TypedArrays. Use `.subarray(0, actualLength)` when slicing into the buffer inside the loop.

## YYYY-MM-DD - Refactoring Constaints: UI Side Effects

**Learning:** When applying performance optimizations (like fixing 'holey' array allocations) in ECharts layout components, it is critical to strictly preserve the exact object structures. Accidental addition of properties like `symbolSize` and `itemStyle` to a scatter chart dataset as a side effect while modifying a loop causes reference errors or visual regressions.
**Action:** When refactoring loop bodies or object creations for performance, do not introduce new properties or styling configurations that were not in the original code unless explicitly instructed.

## 2026-06-23 - Replaced unshift in hot loop with push and reverse

**Learning:** Using `Array.prototype.unshift()` inside a loop causes V8 to shift all existing elements on every insertion, making it an O(N^2) operation. This scales poorly in data processing pipelines.
**Action:** Always prefer `.push()` followed by `.reverse()` or building the array backwards by index rather than using `.unshift()` inside a loop.

## 2024-05-18 - Top K Extraction vs Full Sorts

**Learning:** Avoid using `[...arr].sort(...).slice(0, K)` when K is small and the array is large (e.g. thousands of correlations). The full sort is an O(N log N) operation, and the object spread creates unnecessary garbage collection overhead.
**Action:** Replace full sorts with a single-pass `for` loop that maintains a small sorted array of the top K items. This keeps complexity to O(N * K) and avoids intermediate array allocations.

## 2024-05-18 - Avoid O(N) Array.find() inside useMemo blocks and render cycles

**Learning:** React component files often make use of `Array.find()`, `Array.some()`, and other higher-order array methods directly within the component scope or inside `useMemo` hooks. Although this seems trivial, `Array.find()` has an O(N) complexity and creates closure allocations every time it's called. In React, avoiding these function calls where possible and using a standard O(N) `for` loop avoids additional garbage collection overhead.
**Action:** When working on performance optimization, if I see `Array.find()` inside `useMemo` or directly in the render cycle, I can optimize it by using a standard `for` loop.

## 2023-11-20 - Chart Component Optimizations

**Learning:** Extracting string templates and variables that are not explicitly captured in closures (like regression expressions from dynamic scopes) should rely on `params.value` references injected by ECharts, instead of out-of-scope lexicals.
**Action:** When overriding tooltips for ECharts statistical transforms, read the formula directly from `params.value` (e.g., `params.value[2]` for linear regression).

## 2026-06-29 - Inline Array Mapping Defeats React.memo()

**Learning:** Passing an inline array map (e.g., `correlations={arr.map(...)}`) directly as a prop to a child component wrapped in `React.memo()` completely defeats the memoization. The inline operation creates a new array reference on every parent render cycle, forcing the child (like a heavy ECharts component) to re-render needlessly.
**Action:** Extract the inline array mapping into a `useMemo` block (and convert to a dense `for` loop for extra speed) to ensure referential equality is preserved across parent render cycles.

## 2024-05-18 - Hoisting Invariant Configuration Objects inside Hot Loops

**Learning:** Instantiating configuration objects (like `{ alpha: 0.05, alternative: 'two-sided' }`) inside hot, nested loops—such as those traversing arrays and calculating correlation over chunked windows—generates unnecessary garbage collection overhead and memory allocations. Even though these objects are tiny, the cumulative performance penalty in high-iteration scenarios (like calculating correlations per component re-render) is measurable.
**Action:** When calling statistical or mathematical functions inside nested iterations, explicitly identify invariant arguments (like statistical significance thresholds or formatting objects) and hoist them outside the loop. Use `as const` typing in TypeScript to ensure the type matches the expected literal parameter bounds.

## 2026-07-21 - Avoid Array.from().sort() with Set to Array conversions

**Learning:** When creating a unique array from a `Set`, using `Array.from(set).sort()` or `[...set].sort()` introduces intermediate iterator allocations and potentially creates holey arrays. Since this often happens in data formatting pipelines or React `useMemo` blocks, it adds unnecessary garbage collection overhead.
**Action:** Replace `Array.from(set).sort()` with a pre-allocated dense array `const arr = new Array(set.size)` and explicitly push elements via a `for (const s of set)` loop to optimize memory layout for V8 before calling `.sort()`.

## 2024-05-18 - Hoisting min/max array aggregations outside of O(N) mapping loops

**Learning:** Performing a full-array traversal to calculate min/max within another array map loop causes O(N^2) complexity.
**Action:** When deriving percentiles or normalized values, calculate the min and max values of the source array *once* before mapping over its elements.

## 2026-10-18 - [Array.filter/forEach/map Overhead in useMemo]

**Learning:** Chained array methods like `.filter`, `.map`, and `.forEach` inside `useMemo` or other hot render paths create a bottleneck due to closure creation, temporary array allocations, and garbage collection overhead in this React codebase, especially for large datasets or frequent renders.
**Action:** Replace these higher-order array methods with standard `for` loops and push valid elements into dense arrays (`const arr = []`) to eliminate overhead and improve performance.
