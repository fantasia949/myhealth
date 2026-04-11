## Part 1 — Implementation Report

**The Issue:**
`src/layout/ScatterChart.tsx`, lines 31-33. The ECharts tooltip formatter was converting `null` and `undefined` values into a hyphen (`"-"`) and then blindly interpolating it into an HTML string with a unit. This resulted in empty points rendering as `"- mg/dL"`, which is misleading and visually confusing.

**Discovery Signal:**
Scan 1 — Null Value Handling & Scan 2 — Tooltip Quality. Tooltips showing `"-"` or rendering improperly with units instead of correctly suppressing the display for null biomarker entries on the scatter chart.

**context7 Reference:**
`series[].tooltip.formatter` — ECharts 5.6 docs.

**The Fix:**
Updated the `formatter` function to explicitly check if `params.value[1]` is empty, `null`, `undefined`, `"-"`, `"NaN"`, or structurally `NaN` (via `Number.isNaN`). If true, it returns `""` immediately, gracefully suppressing the entire tooltip element for missing coordinates rather than creating an artificial display value.

**The Benefit:**
Tooltips now correctly suppress entirely when hovering over gaps in the time-series where null values exist in the `ScatterChart.tsx`, avoiding rendering literal garbage strings like `"- mg/dL"`.

---

## Part 2 — Visualization Proposals

These 3 visualization ideas use existing metadata to surface new insights without requiring new dependencies or processing logic.

**Proposal 1 of 3: Value Distribution Histogram**

**ECharts type:** `ecStat:histogram`

**Which existing data it uses:**
Uses the `values` array already extracted from a specific `BioMarker` entry in `src/atom/dataAtom.ts` (or mapped within the chart components).

**What it reveals that current charts don't:**
Shows the frequency distribution of a single high-variance biomarker over time (e.g. Glucose or Cholesterol). It reveals whether a users values are normally distributed or heavily skewed in one direction, rather than just plotting them linearly over time.

**Where it would live:**
New `src/layout/HistogramChart.tsx`.

**Trigger / entry point:**
Could be added as a toggle button ("Time" vs "Distribution") inside the expanded row view of `Table.tsx` where the `LineChart` currently resides.

**Implementation complexity:** Low
The `ecStat:histogram` transform handles all binning logic internally. It just requires wiring the existing 1D array of `values` (excluding nulls) into an ECharts dataset.

**ECharts 5.6.0 API confirmed via context7:** yes (transform config `type: "ecStat:histogram"`)

---

**Proposal 2 of 3: Optimal Ratio Pie Chart**

**ECharts type:** `pie`

**Which existing data it uses:**
Uses the `extra.optimality[]` boolean array computed in `src/processors/post/range.ts` evaluated at the most recent time index (or specific data point).

**What it reveals that current charts don't:**
Provides an instant aggregate score ("7 out of 9 optimal") for a specific tag group (like "2-Metabolic"). It shows the user's overall systemic health snapshot without requiring them to scroll down and count individual rows.

**Where it would live:**
New `src/layout/SummaryPie.tsx`.

**Trigger / entry point:**
Auto-rendered at the top of the `Table.tsx` component whenever a specific tag is active in the `tagAtom` state.

**Implementation complexity:** Low
We just need to sum `true` vs `false` inside the `optimality` arrays for all biomarkers in the current tag filter and pass two static data points to a standard ECharts pie series.

**ECharts 5.6.0 API confirmed via context7:** yes (`series[].type = 'pie'`)

---

**Proposal 3 of 3: Deviation MarkLine Overlay**

**ECharts type:** `markLine`

**Which existing data it uses:**
Uses the `extra.range` string (already parsed into `min` / `max` within `src/layout/LineChart.tsx`).

**What it reveals that current charts don't:**
The current `LineChart` uses a `markArea` to shade the optimal range. However, for biomarkers with strict single-sided limits (e.g., `range: "<= 5"`), a `markLine` clearly delineates the hard boundary limit across the graph. This reveals exactly where lines cross the threshold of risk visually without needing to hover.

**Where it would live:**
Appended to the existing `series[0]` options inside `src/layout/LineChart.tsx`.

**Trigger / entry point:**
Automatically active alongside the existing `LineChart` inside the table row expand panel when a range includes clear max limits (e.g. `<=`).

**Implementation complexity:** Low
Requires adding `markLine: { data: [{ yAxis: max }] }` directly into the existing series configuration alongside `markArea`.

**ECharts 5.6.0 API confirmed via context7:** yes (`series[].markLine`)

---

Recommended implementation order: Proposal 2 first (highest insight, lowest effort), then 3, then 1.
