---

**Proposal 1 of 5: System-Wide Optimality Radar Chart**

**ECharts type:** `radar`

**Codebase citation:**
`extra.optimality[]` pre-computed by `src/processors/post/range.ts`, index-aligned with `BioMarker[1]`.

**Which existing data it uses:**
Reads `extra.range` min/max boundaries and `extra.optimality[]` from every `BioMarker` returned by `visibleDataAtom`. Uses the most recent measurement value.

**What it reveals that current charts don't:**
Shows whether all members of a selected tag group (e.g., `8-WBC`) are simultaneously within their optimal ranges at the most recent time point, allowing a quick holistic system health check.

**Where it would live:**
New `src/layout/RadarChart.tsx`, rendered conditionally in `App.tsx` below the main chart layout when `tagAtom` is non-null.

**Trigger / entry point:**
The existing tag filter buttons in the nav (which set `tagAtom`) already filter `visibleDataAtom` by tag. The Radar chart auto-renders when a specific tag is active.

**Implementation complexity:** Low
Requires passing `visibleDataAtom` entries to a new wrapper component.

**ECharts 6 API confirmed via context7:** yes - `series[].type: 'radar'`, `radar.indicator[]`

---

**Proposal 2 of 5: Biomarker Value Drift Boxplot**

**ECharts type:** `boxplot`

**Codebase citation:**
`nonInferredDataAtom` from `src/atom/dataAtom.ts`.

**Which existing data it uses:**
Reads all historical measurement values (`BioMarker[1]`) for a single biomarker across the entire timeline (using `nonInferredDataAtom` to avoid inferred duplicates).

**What it reveals that current charts don't:**
Highlights the long-term distribution, median drift, and outliers of a high-variance biomarker over the full time range, exposing long-term trends beyond individual scatter points.

**Where it would live:**
New `src/layout/BoxplotChart.tsx`, rendered inside the table row expand view alongside the existing `LineChart.tsx`.

**Trigger / entry point:**
Expanding a table row for a specific biomarker.

**Implementation complexity:** Medium
Requires processing the time-series values into the specific 5-point array format required by ECharts `boxplot` series data.

**ECharts 6 API confirmed via context7:** yes - `series[].type: 'boxplot'`

---

**Proposal 3 of 5: Optimality Matrix Heatmap**

**ECharts type:** `heatmap`

**Codebase citation:**
`extra.optimality[]` pre-computed by `src/processors/post/range.ts`, index-aligned with `BioMarker[1]`.

**Which existing data it uses:**
Reads the full time-series array of `extra.optimality[]` for all biomarkers within the current `visibleDataAtom`.

**What it reveals that current charts don't:**
Reveals clusters of out-of-range biomarkers across time, easily spotting correlations between different markers failing simultaneously across the timeline.

**Where it would live:**
New `src/layout/OptimalityHeatmap.tsx`, rendered at the top of the application view when multiple biomarkers are visible.

**Trigger / entry point:**
Always visible or triggered via a new "View Matrix" toggle button on the main dashboard layout.

**Implementation complexity:** Medium
Requires transforming the 2D matrix of biomarkers x time points into ECharts' expected `[x, y, value]` coordinate array format.

**ECharts 6 API confirmed via context7:** yes - `series[].type: 'heatmap'`, `visualMap[].type: 'piecewise'`

---

**Proposal 4 of 5: Time-Series Protocol Clustering**

**ECharts type:** `ecStat:clustering`

**Codebase citation:**
All biomarkers in `dataAtom.ts` (`BioMarker[]`).

**Which existing data it uses:**
Reads the vectors of all available biomarker values across all time points (`labels[]`).

**What it reveals that current charts don't:**
Groups time points into statistical clusters based on all-biomarker vector similarity. Detects distinct physiological states or phases that might align with unknown variables (like specific supplement cycles or lifestyle changes).

**Where it would live:**
New `src/layout/ClusteringChart.tsx`, rendered as a scatter plot with distinct cluster colors.

**Trigger / entry point:**
A dedicated "Run Clustering" button within the correlation modal or alongside the main chart controls.

**Implementation complexity:** High
Requires flattening time-series data into a dense matrix format acceptable by `ecStat.clustering.hierarchicalKMeans` and handling null value imputation/gaps.

**ECharts 6 API confirmed via context7:** yes - `ecStat.clustering`

---

**Proposal 5 of 5: LineChart Optimality VisualMap**

**ECharts type:** `visualMap` on `LineChart`

**Codebase citation:**
`extra.optimality[]` pre-computed by `src/processors/post/range.ts`, index-aligned with `BioMarker[1]`.

**Which existing data it uses:**
Reads `extra.optimality[]` from the single `BioMarker` passed into `LineChartProps`.

**What it reveals that current charts don't:**
Colour-encodes the existing line chart segments in `LineChart.tsx` based on the `optimality` flag, making in/out-of-range state transitions immediately and continuously visible without a separate chart.

**Where it would live:**
Extends the existing `src/layout/LineChart.tsx`.

**Trigger / entry point:**
Automatically active when expanding a biomarker row in the table.

**Implementation complexity:** Low
Requires passing `optimality` array via props and defining a `piecewise` visual map directly in `echartsOptions`.

**ECharts 6 API confirmed via context7:** yes - `visualMap.type: 'piecewise'`

---

Recommended implementation order: Proposal 5 first (lowest effort, high continuous visibility), then 1, then 3, then 2, then 4.
