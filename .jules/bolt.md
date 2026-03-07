## 2024-05-19 - Pearson Correlation Performance

**Learning:** `@stdlib/stats-pcorrtest` is highly expensive for tight loops due to heavy argument parsing and validation. Implementing the Pearson correlation computation and T-statistic P-Value derivation (using an approximation of the `beta` cumulative distribution) inline results in a >5x overall speedup without touching package.json. Clamping the correlation coefficient to `[-1, 1]` is absolutely crucial before doing `Math.sqrt(1 - r * r)` or it will evaluate to NaN for perfectly correlated sequences due to floating point inaccuracies.
**Action:** When performing statistical analysis inside nested loops with React rendering (like Pearson comparisons), consider pulling exact implementations into native JS over generic external routines.

## 2025-02-09 - Reversing Data Structures to Avoid Hot Loop array.includes()
**Learning:** In nested iterations (e.g., correlating M rows against N items where each item has variable arrays of length S), performing an `array.includes()` inside the innermost loop destroys performance.
**Action:** Always consider reversing the relationship before iterating. Instead of querying "does this array have X?", spend a linear pass (O(M*S)) to construct vectors for all X items upfront into a Map, enabling O(1) lookups or completely eliminating the inner lookup loop during processing.

## 2025-02-19 - Pearson Correlation Bottleneck
**Learning:** Using `Array.push()` inside a nested O(M*N) loop for pairwise deletion in Pearson correlation is slow due to memory allocations and intermediate arrays.
**Action:** Replace `Array.push()` with pre-allocated `Float64Array` typed arrays that can be reused across iterations using `.subarray()`. This avoids garbage collection overhead and reduces correlation time by ~30%.
## 2025-05-18 - Pearson Correlation Bottleneck ILP
**Learning:** The inline Pearson correlation calculation inside a hot loop is bounded by long data dependency chains where the accumulator waits for the previous addition/multiplication before starting the next. Due to the commutative property of addition, the loop can be unrolled with parallel accumulators to allow Instruction-Level Parallelism (ILP).
**Action:** Unroll hot accumulation loops (e.g., 4x or 2x) by introducing multiple partial accumulators and summing them at the end. This allows the CPU to execute multiple math operations concurrently, which in this case gave a 30-40% speedup without extra memory allocation overhead.

## 2025-06-12 - Spearman Correlation with Binary Vectors
**Learning:** Using the generic `rankData` function (which requires an $O(N \log N)$ sort) on strictly binary vectors (e.g. boolean presence of supplements) is highly inefficient. Because binary variables only contain 0s and 1s, their relative ranks can be calculated in a single $O(N)$ pass by counting the frequencies of the elements and assigning the average rank.
**Action:** When performing non-parametric correlation tests involving binary or categorical variables with a very small set of distinct values, replace generic ranking functions with a frequency-counting rank assignment to skip memory allocations and avoid $O(N \log N)$ sorting inside hot loops.
