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

*(Note: Due to the `context7` 404 failure, ECharts 6 APIs could not be externally verified. To strictly comply with the rule "If an API cannot be confirmed, do not propose it", I am restricting my proposals exclusively to the `line` and `scatter` chart types, which are already confirmed to exist and function correctly in the codebase.)*

---

**Proposal 1 of 2: In-Range Density Scatter Overlay**

**ECharts type:** `scatter`

**Codebase citation:**
`extra.optimality[]` boolean array pre-computed by `src/processors/post/range.ts` (index-aligned with `values[]`), and `nonInferredDataAtom` from `src/atom/dataAtom.ts`.

**Which existing data it uses:**
Reads the `extra.optimality[]` array from each `BioMarker` entry returned by `nonInferredDataAtom`.

**What it reveals that current charts don't:**
By mapping the standard scatter chart points such that `opacity` or `symbolSize` is reduced for points where `extra.optimality[i]` is `false` (in-range) and highlighted for points where it is `true` (out-of-range), users can instantly visually isolate anomalous test results amidst a sea of normal data, without needing to check the tooltip or table for every point.

**Where it would live:**
As an enhanced toggle mode within the existing `src/layout/ScatterChart.tsx`.

**Trigger / entry point:**
A new "Highlight Anomalies" toggle button above the `ScatterChart` UI.

**Implementation complexity:** Low
Requires only mapping a dynamic `itemStyle.opacity` property inside the existing `chartData` generation loop based on the `bioMarker[3].optimality` array.

**ECharts 6 API confirmed via context7:** unavailable (relying on `scatter` series already verified in source code).

---

**Proposal 2 of 2: Strict-Range Overlay Line Chart**

**ECharts type:** `line`

**Codebase citation:**
The `strictRange` override definition in `src/processors/post/range.ts`.

**Which existing data it uses:**
It uses the same `BioMarker[1]` time-series data but utilizes the `strictRange` definitions from `src/processors/post/range.ts` to dynamically generate a dual-band visual overlay.

**What it reveals that current charts don't:**
Currently, `LineChart.tsx` highlights the standard optimal band using `markArea`. For biomarkers with both standard and `strictRange` definitions (like `Glucose`, `Uric`, `CRP-hs`), rendering a nested, darker `markArea` for the strict optimal band allows the user to see exactly how close their values are to the absolute ideal targets versus just the standard clinical acceptable range.

**Where it would live:**
`src/layout/LineChart.tsx`

**Trigger / entry point:**
It auto-renders for any biomarker that possesses a defined `strictRange` in the data model.

**Implementation complexity:** Medium
Requires exporting the `strictRange` map or injecting it as a new `BioMarker` property, then updating `LineChart.tsx` to push a secondary `markArea` block if a strict range exists.

**ECharts 6 API confirmed via context7:** unavailable (relying on `line` series and `markArea` already verified in source code).

---

Recommended implementation order: Proposal 1 first (highest insight, lowest effort), then 2.
