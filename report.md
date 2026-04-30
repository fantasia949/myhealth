## Part 1 — Implementation Report

**The Issue:**
`src/layout/ScatterChart.tsx` (lines 22-45). The `ScatterChart` component used `tooltip.trigger: 'item'`. While technically valid for a scatter series, this meant the user could only see the value of a single biomarker at a time by hovering exactly over its data point. Despite the chart sharing a common X-axis (time), cross-series comparison at a specific timestamp was impossible without moving the mouse to find the corresponding point on another series.

**Discovery Signal:**
Scan 2 (Tooltip Quality & Completeness) & Scan 3 (Multi-Axis Legibility) combined with explicit UX review instructions: "`ScatterChart.tsx` tooltip `trigger: 'item'` — with multiple Y-axes this is correct for scatter, but cross-series comparison is not possible. Evaluate whether this is a UX gap worth addressing."

**context7 Reference:**
The `context7` tool failed to resolve the project ("404 Not Found" for both 'apache echarts' and 'echarts-stat'). Thus, I relied on APIs (`tooltip.trigger: 'axis'`) that are already known, verified, and used safely elsewhere in the codebase (e.g. `src/layout/LineChart.tsx` and `src/layout/Chart.tsx`).

**The Fix:**
Changed `tooltip.trigger` to `'axis'` in `src/layout/ScatterChart.tsx`.
Updated the `tooltip.formatter` function to:

1. Accept the array of parameters passed by ECharts when using axis trigger.
2. Extract the timestamp from the first item.
3. Loop through all active series at that timestamp and append their name, value, and unit to the tooltip string.
4. Include null/NaN guards for each value within the loop.

**The Benefit:**
Users can now hover anywhere on a specific vertical timestamp line in the `ScatterChart` and instantly see a consolidated tooltip showing the values of all plotted biomarkers for that date, greatly enhancing cross-series comparison.

**TypeScript result:**
`npx tsc --noEmit` output: 0 errors.

---

## Part 2 — Visualization Proposals

_(Note: The `context7` tool failed with a 404 error, meaning ECharts 6 APIs could not be externally verified. To strictly comply with the constraint "If an API cannot be confirmed, do not propose it", and because the existing standard charts (`line` and `scatter`) are already highly optimized and clean, I am not proposing any new manufactured visualization ideas.)_

**Conclusion:** All charts are currently clean and fully utilize the safe, verified ECharts features for the existing data model. No strong, verified visualization proposals exist at this time.
