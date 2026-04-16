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

## 2025-04-10 - Utilize dataMapAtom to prevent redundant Map allocations in chart components

**Learning:** Generating the same data lookup map across multiple chart components on every render cycle using `new Map()` introduces redundant object allocation and closure creation, specifically inside heavy `useMemo` hooks. This increases garbage collection pressure, particularly when handling large biomarker arrays or responding rapidly to UI state changes (like filter text debouncing or axis selections). A pre-existing Jotai derived atom (`dataMapAtom`) correctly handles this operation dynamically once.
**Action:** Use global derived atoms (e.g., `useAtomValue(dataMapAtom)`) for shared lookups rather than duplicating local mapping overhead (`new Map()`) inside individual component logic.

## 2025-07-28 - Optimize array lookups with direct indexing

**Learning:** In `src/layout/Chart.tsx`, using `Array.find()` inside a loop over an array of equal length (`keys` and `valueList`) to correlate corresponding objects creates an unnecessary `O(N^2)` operation. Since `valueList` is directly mapped from `keys` index-for-index, the arrays are guaranteed to be parallel.
**Action:** Replace `Array.find((entry) => entry.fieldName === key)` with direct array indexing `valueList[i]` when operating on parallel arrays inside a `useMemo` block to drop time complexity from `O(N^2)` to `O(N)`.

## 2024-03-05 - Focus optimizations on render loops, not startup scripts

**Learning:** Replacing `.reduce()` and `.forEach()` with classic `for` loops on small static dictionaries that run only once during module bootstrap (like `taggedDic`) is a theoretical micro-optimization with zero measurable impact. However, applying the same optimization to chained `.map()` allocations inside a React component's `useMemo` block (like `yAxis` or `series` generation in `Chart.tsx`) significantly reduces garbage collection pressure and layout thrashing during frequent UI re-renders.
**Action:** Avoid micro-optimizations on static or one-time initialization paths. Instead, aggressively target hot loops within React render cycles or heavy statistical derivations where the operation executes frequently or across large data sets.

## 2024-03-24 - Feature: Frequency Info in Correlation Table

**Learning:** Added a count representing the frequency of supplement intake during valid biomarker observation periods alongside the calculated P-value and RHO values to provide additional insight into the correlation reliability. Playwright test `verify_correlation_table.spec.ts` was updated to verify the addition of the "Freq" column.
**Action:** When altering tables, also verify the header length alignment if iterating through table cells, update empty states `colSpan`, and remember to update any Copy to clipboard text formatting functionality to include the new column.

## 2024-03-24 - UX: Supplement Frequency in Popover

**Learning:** Added overall frequency to the SupplementsPopover to indicate how often each supplement is taken across all tracked records, making it easier to spot regular vs infrequent supplements directly from the table cell popover.
**Action:** Pre-calculate counts across the full dataset once using a `Map` within `useMemo` based on `noteValues` rather than calculating redundantly. For small string formatting additions, place them inside discrete `<span>` elements with informative `title` attributes.

## 2026-04-13 - Gist Viewer Modal

**Learning:** Added a feature to load remote Github Gists using standard `fetch` call and dynamically load/render the fetched markdown in a HeadlessUI Dialog.
**Action:** Reused the Markdown renderer component for displaying textual Gist data and formatted the timestamps accurately for improved user experience.

## 2025-07-28 - Optimize initial page load via React.lazy code-splitting

**Learning:** The application imported heavy visual components (like DarkVeil and modals) synchronously in `App.tsx`, which increased the initial JavaScript bundle size. Attempting to replace idiomatic array methods with `for` loops in components without clear performance metrics is often an unmeasurable micro-optimization.
**Action:** Focus on macro-optimizations like asset loading first. To speed up initial page render, use `React.lazy()` and `<React.Suspense fallback={null}>` to code-split secondary UI layers and modals out of the main bundle.

## 2025-07-28 - Avoid ECharts dual-render conflicts

**Learning:** Combining a raw `<ReactECharts>` component with a third-party wrapper (like `@echarts-readymade/scatter` or `@echarts-readymade/line`) inside the same `<ChartProvider>` container can inadvertently instantiate two conflicting, overlapping ECharts canvas instances for the same dataset. This introduces hidden performance overhead and visual collision bugs.
**Action:** When a raw `ReactECharts` configuration object inherently contains all necessary series and datasets (e.g., standard scatter plotting plus `ecStat:regression` transforms), completely remove any supplementary third-party wrapper components, their layout context providers, and associated DOM refs or manual `setOption` overrides to ensure a single, clean render cycle.

## 2026-05-18 - Stable array references for memoized child components

**Learning:** Inline array allocations like `data.filter(...)` inside the render function of a parent component (e.g. `App.tsx`) create a new array reference on every re-render. If this component re-renders frequently—such as responding to an active `searchText` state from user keystrokes—these inline allocations invalidate the `React.memo` prop checks for heavy child components (like `RadarChart`), causing them to re-render synchronously and block the main thread, resulting in severe typing lag.
**Action:** Always pre-filter data intended for heavy memoized components inside a dedicated `React.useMemo` block, using a single-pass `for` loop to avoid closure overhead. This ensures the array reference remains stable during unrelated state updates, preserving the performance of `React.memo` and preventing input blocking.
