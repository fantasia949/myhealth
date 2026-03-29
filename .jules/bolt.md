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
