## 2024-05-19 - Pearson Correlation Performance

**Learning:** `@stdlib/stats-pcorrtest` is highly expensive for tight loops due to heavy argument parsing and validation. Implementing the Pearson correlation computation and T-statistic P-Value derivation (using an approximation of the `beta` cumulative distribution) inline results in a >5x overall speedup without touching package.json. Clamping the correlation coefficient to `[-1, 1]` is absolutely crucial before doing `Math.sqrt(1 - r * r)` or it will evaluate to NaN for perfectly correlated sequences due to floating point inaccuracies.
**Action:** When performing statistical analysis inside nested loops with React rendering (like Pearson comparisons), consider pulling exact implementations into native JS over generic external routines.

## 2025-02-09 - Reversing Data Structures to Avoid Hot Loop array.includes()
**Learning:** In nested iterations (e.g., correlating M rows against N items where each item has variable arrays of length S), performing an `array.includes()` inside the innermost loop destroys performance.
**Action:** Always consider reversing the relationship before iterating. Instead of querying "does this array have X?", spend a linear pass (O(M*S)) to construct vectors for all X items upfront into a Map, enabling O(1) lookups or completely eliminating the inner lookup loop during processing.
