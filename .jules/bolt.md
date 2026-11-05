

## 2026-11-01 - Avoid Manufacturing Work When Codebase is Clean
**Learning:** Sometimes, a prompt will provide a list of "Discovery Scans" outlining potential issues, but an actual inspection of the source code reveals that these issues do not exist or have already been resolved (e.g., `LineChart` tooltips already include units, `Chart2` is already using a single `ReactECharts` component instead of double rendering with `Scatter`, `Chart` does not have the stale `useEffect` issue). Trying to fix something that is not broken violates the "No manufactured work" constraint.
**Action:** Always thoroughly read and verify the actual contents of the target files against the reported issues before making any code modifications. If the issues are absent, document this in the PR and proceed to other valid parts of the task (like generating proposals).
