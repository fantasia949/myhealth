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

**Proposal 1 of 3: Deviation MarkLine Overlay**

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

**Proposal 2 of 3: Hierarchical System Health Sunburst**

**ECharts type:** `sunburst`

**Which existing data it uses:**
Uses the static `tagDescription` categories from `src/processors/post/tag.ts` mapped to all constituent `BioMarker` entries' `extra.optimality[]` boolean at the latest tested index.

**What it reveals that current charts don't:**
The current `RadarChart` focuses strictly on a single system category at a time (e.g. Metabolic). A hierarchical Sunburst chart (inner ring = Tag Groups, outer ring = specific Biomarkers) colored proportionally by their `optimality` provides a massive, single-glance structural overview of an individual's total biological wellness at their most recent blood draw.

**Where it would live:**
New `src/layout/SystemSunburst.tsx`.

**Trigger / entry point:**
A macro "Total Health Snapshot" button at the top of the main `Nav.tsx` or `Table.tsx` filter list, replacing the detailed table with a single holistic graphic.

**Implementation complexity:** Medium
(Medium: Requires formatting the linear `BioMarker` array into a nested JSON structure `[{ name: 'Metabolic', children: [{ name: 'Glucose', value: 1, itemStyle: {color: 'green'}}]}]`, which ECharts parses natively).

**ECharts 5.6.0 API confirmed via context7:** yes (`series[].type = 'sunburst'`)

---

**Proposal 3 of 3: Testing Consistency Gap Heatmap**

**ECharts type:** `heatmap`

**Which existing data it uses:**
Uses the `labels[]` time-series scale on the X-axis and all non-inferred `BioMarker` names (`dataAtom`) on the Y-axis. The data points evaluate strictly whether the measured value `!== null`.

**What it reveals that current charts don't:**
Unlike correlation matrix heatmaps that map statistical relationships, a temporal missing-data heatmap reveals the user's testing consistency gaps. It instantly shows "I have tracked Lipid markers flawlessly since 2015, but I only tested Vitamin D once in 2018." This helps identify testing blindspots in their protocol history.

**Where it would live:**
New `src/layout/TestingConsistencyHeatmap.tsx`.

**Trigger / entry point:**
A supplementary tab on the `Correlation.tsx` modal ("View Testing Consistency") or a standalone toggle above the main table.

**Implementation complexity:** Low
(Low: ECharts 2D Cartesian `heatmap` supports a simple coordinate map `[timeIndex, biomarkerIndex, isNotNull ? 1 : 0]`. It requires no new state derivations, merely iterating over the existing `values` arrays).

**ECharts 5.6.0 API confirmed via context7:** yes (`series[].type = 'heatmap'`)

---

Recommended implementation order: Proposal 1 first (highest insight, lowest effort), then 3, then 2.
