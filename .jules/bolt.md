## 2025-07-28 - Bottlenecks from Chained Arrays in Hot Loops
**Learning:** Chaining `Array.from().map().some()` within data preparation functions creates a massive performance penalty during iteration loops (like periods x recipes) due to repeated object allocations, redundant closures, and garbage collection overhead.
**Action:** Replace `Array.from()` chaining in inner loops with explicitly sized `new Array(size)` blocks and classic `for` loops to maximize V8 JIT performance and avoid closure/garbage collection delays.
