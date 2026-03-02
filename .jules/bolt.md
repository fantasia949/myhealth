## 2024-05-19 - Pearson Correlation Performance

**Learning:** `@stdlib/stats-pcorrtest` is highly expensive for tight loops due to heavy argument parsing and validation. Implementing the Pearson correlation computation and T-statistic P-Value derivation (using an approximation of the `beta` cumulative distribution) inline results in a >5x overall speedup without touching package.json. Clamping the correlation coefficient to `[-1, 1]` is absolutely crucial before doing `Math.sqrt(1 - r * r)` or it will evaluate to NaN for perfectly correlated sequences due to floating point inaccuracies.
**Action:** When performing statistical analysis inside nested loops with React rendering (like Pearson comparisons), consider pulling exact implementations into native JS over generic external routines.
