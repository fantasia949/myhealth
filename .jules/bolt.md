## 2025-07-28 - Bottlenecks from Chained Arrays in Hot Loops

**Learning:** Chaining `Array.from().map().some()` within data preparation functions creates a massive performance penalty during iteration loops (like periods x recipes) due to repeated object allocations, redundant closures, and garbage collection overhead.
**Action:** Replace `Array.from()` chaining in inner loops with explicitly sized `new Array(size)` blocks and classic `for` loops to maximize V8 JIT performance and avoid closure/garbage collection delays.

## 2025-03-04 - Optimize object mapping paths when initializing arrays

**Learning:** In derived state atoms (e.g., `dataAtom.ts`), replacing generic chaining of array methods (like `data.forEach()` and `item[1].map()`) with a standard `for` loop mapping data into a pre-allocated `Float64Array` significantly reduces object allocation and garbage collection overhead. Since derived state runs often and statistical functions downstream strongly benefit from TypedArrays, performing this optimization upstream provides a noticeable speedup (~40%).
**Action:** When initializing arrays that are fed into mathematical and statistical processing inside performance-critical paths (e.g. inside `useMemo` or Jotai derived atoms), directly allocate a TypedArray (`Float64Array` or `Int8Array`) using its maximum required length instead of using `Array.prototype.map()`.

## 2025-03-05 - Avoid repetitive array allocations in component hot paths

**Learning:** Utilizing functions like `Object.values(notes)` directly inside component `useMemo` blocks creates unnecessary garbage collection overhead when the component depends on derived inputs and is frequently triggered (like UI settings changes), since it spins up a new object allocation every single time regardless of whether the `notes` actually changed.
**Action:** Extract generic array allocations or object iteration mappings (like `Object.values()`) out of component `useMemo` blocks and into dedicated Jotai derived atoms (e.g. `noteValuesAtom`). This leverages state caching, ensuring the expensive array generation only occurs when the source data (`notes`) strictly changes.

## 2025-03-04 - Eliminate garbage collection overhead by hoisting invariants

**Learning:** React component memoization (`useMemo`) is often not enough for heavy statistical operations (like P-value / Correlation mapping across datasets). Object literals inside hot loops (e.g., passing `{ alpha: 0.05 }` to a statistical test) or repeatedly allocating math coefficients inside pure functions will flood the engine with short-lived objects. This triggers garbage collection spikes that block the main thread.
**Action:** Always hoist configuration objects (`options`) to the top of loops/closures or to module scope. For mathematical function constants, extract them directly to module-scoped `const` arrays instead of allocating them dynamically within the function call.

## 2025-07-28 - ECharts data transformation: Replace chained Array methods with single-pass loops
**Learning:** Extracting multiple series from a multi-dimensional array for chart rendering (like mapping keys to entries, reducing to pairs, and filtering out nulls) via chained `.map().reduce().filter()` creates severe object allocation and closure overhead on every re-render (e.g. `useMemo` in ReactECharts components like Scatter charts).
**Action:** Replace `Array.map().reduce().filter()` combinations with a traditional `for` loop that iterates over a fixed length (like the data labels length) and performs all extraction, matching, and null-checking in a single pass before pushing only the valid points into a final array.

## 2025-07-28 - Prevent array mapping and spreading stack overflows

**Learning:** Calculating `Math.min(...mappedScatterData.map(...))` inside React `useMemo` blocks is extremely inefficient and dangerous. First, `map` creates a completely new intermediate array on every render. Second, spreading (`...`) a large mapped array into `Math.min` or `Math.max` evaluates arguments on the call stack, which can crash the application with a "Maximum call stack size exceeded" error if the data array grows too large.
**Action:** Replace `Math.min(...array.map(...))` combinations with a single-pass `for` loop that iterates over the dataset once and evaluates min/max boundary variables simultaneously. This avoids the `O(N)` memory allocation of `.map()`, avoids the secondary iteration of `Math.min()`, and protects against stack overflow crashes.

## 2025-07-28 - Render loop garbage collection: Single pass map reduction
**Learning:** Chaining `.filter().flatMap().sort()` inside a component's `useMemo` block creates unnecessary garbage collection overhead and repeated object allocations, specifically impacting the frontend user experience as `visibleDataAtom` constantly updates (e.g. fast typing in the search bar). This forces the engine to spin up intermediate arrays per keystroke.
**Action:** Replace generic chained methods with a classic single-pass `for` loop. When possible, initialize an array `const result = []`, conditionally build the object inside the loop and push directly to `result`, followed by a final `.sort()` call. This significantly reduces array instantiation and prevents rapid garbage collection spikes during high-frequency renders.
## 2024-03-24 - Jotai Derived Atom Closure Overhead
**Learning:** During rapid user input (like search filtering), derived Jotai atoms (e.g. `visibleDataAtom`) recalculate frequently. Utilizing array prototype methods like `.filter()` and `.some()` inside these atoms causes measurable garbage collection and callback execution overhead due to repeated closure creations per row, leading to typing lag on large datasets.
**Action:** Always replace chained/nested array methods (`.map`, `.filter`, `.some`) with traditional `for` loops inside frequently updating Jotai derived atoms to ensure zero-allocation recalculation.

## 2025-07-28 - ECharts mapping allocations in hot paths
**Learning:** Extracting data elements or objects via `.map()` directly inside component render cycles (like preparing configurations for ReactECharts elements such as LineChart, Chart, or Table columns) causes closure allocations and new intermediate arrays on every interaction or parent state change, contributing to rendering jitter.
**Action:** When iterating over a fixed length like `keys` or `labels` for ECharts data initialization, replace `Array.prototype.map` with an explicit `new Array(size)` pre-allocation combined with a classic `for` loop to eliminate functional closure overhead, and wrap it tightly in a `useMemo` where appropriate.
