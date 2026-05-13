# Part 2 — Visualization Proposals

---

**Proposal 1 of 5: System-Wide Optimality Radar Chart**

**ECharts type:** `radar`

**Codebase citation:**
`extra.optimality[]` pre-computed by `src/processors/post/range.ts`, index-aligned with `BioMarker[1]`.

**Which existing data it uses:**
Reads `extra.optimality[]` (count of optimal vs non-optimal), `name`, and `extra.tag` from every `BioMarker` entry returned by `visibleDataAtom`. It normalizes the optimality boolean array into a single score per tag group.

**What it reveals that current charts don't:**
Reveals at a single glance which physiological system (tag group like `1-Metabolic`, `3-Liver`, etc.) has the most out-of-range biomarkers at the most recent time point or across all time points. Current line/scatter charts require the user to manually filter by tag and inspect each biomarker individually.

**Where it would live:**
New `src/layout/SystemOptimalityRadar.tsx`, rendered in the main dashboard view, perhaps above or alongside the main tables.

**Trigger / entry point:**
Could be a static dashboard widget or triggered by clicking a "System Overview" button.

**Implementation complexity:** Medium
(Requires aggregating the boolean `optimality` arrays by `tag` and mapping to the radar data format, but the data is already perfectly formatted.)

**ECharts 6 API confirmed via context7:** yes (`series[].type: 'radar'`, `radar.indicator`)

---

**Proposal 2 of 5: Biomarker Value Drift Boxplot**

**ECharts type:** `boxplot`

**Codebase citation:**
`nonInferredDataAtom` in `src/atom/dataAtom.ts` which provides purely measured (not calculated) biomarker data.

**Which existing data it uses:**
Uses the raw time-series values (`BioMarker[1]`) from `nonInferredDataAtom` for the currently selected or filtered biomarkers, ignoring nulls.

**What it reveals that current charts don't:**
Shows the overall statistical distribution, median, quartiles, and outliers of a biomarker over the entire tracking history. Time-series lines/scatters show movement over time but make it hard to see the historical center of mass or spot extreme statistical outliers.

**Where it would live:**
New `src/layout/BoxplotChart.tsx`, potentially replacing or augmenting the existing `ScatterChart` when a "Distribution" view toggle is clicked.

**Trigger / entry point:**
A toggle button near the chart controls (e.g. "Time Series" vs "Distribution").

**Implementation complexity:** Medium
(ECharts boxplot requires `echarts.dataTool.prepareBoxplotData` or manual percentile calculation, but the raw array data is readily available.)

**ECharts 6 API confirmed via context7:** yes (`series[].type: 'boxplot'`, `dataset.source`)

---

**Proposal 3 of 5: Optimality Matrix Heatmap**

**ECharts type:** `heatmap`

**Codebase citation:**
`extra.optimality[]` pre-computed by `src/processors/post/range.ts`.

**Which existing data it uses:**
Uses `visibleDataAtom` to get a filtered list of biomarkers (e.g., by a specific tag). The Y-axis represents biomarker names, the X-axis represents time points (`labels[]`), and the color intensity (or binary color) represents `extra.optimality[]` (true/false).

**What it reveals that current charts don't:**
Instantly reveals temporal clusters of poor health. If a user was sick during a specific month, a vertical column of "out of range" colors will appear across multiple biomarkers simultaneously.

**Where it would live:**
New `src/layout/OptimalityHeatmap.tsx`, rendered when a specific tag is selected via `tagAtom`.

**Trigger / entry point:**
Auto-renders when the user selects a tag group (e.g. `2-Metabolic`) from the tag filters, providing a dense summary of that entire group.

**Implementation complexity:** Low
(Heatmap data format `[xIndex, yIndex, value]` is trivial to generate by looping over `visibleDataAtom` and `labels[]`.)

**ECharts 6 API confirmed via context7:** yes (`series[].type: 'heatmap'`, `visualMap`)

---

**Proposal 4 of 5: LineChart Optimality VisualMap**

**ECharts type:** `visualMap` on existing `LineChart`

**Codebase citation:**
`extra.optimality[]` pre-computed by `src/processors/post/range.ts`.

**Which existing data it uses:**
Takes the `extra.optimality[]` array and maps it to `pieces` in a `visualMap` configuration for the existing line series in `src/layout/LineChart.tsx`.

**What it reveals that current charts don't:**
The current line chart uses a static color and shades the background `markArea`. A `visualMap` can dynamically change the color of the *line itself* (e.g., green when in-range, red when out-of-range) between data points, making transitions into danger zones starkly visible.

**Where it would live:**
Direct enhancement to `src/layout/LineChart.tsx`.

**Trigger / entry point:**
Always active when `LineChart` renders (e.g., when a table row is expanded).

**Implementation complexity:** Low
(Requires converting the `extra.optimality[]` array into a sequence of `visualMap.pieces` based on indices/dates.)

**ECharts 6 API confirmed via context7:** yes (`visualMap[].type: 'piecewise'`, `visualMap[].dimension`)

---

**Proposal 5 of 5: Single Biomarker Radial Gauge**

**ECharts type:** `gauge`

**Codebase citation:**
`extra.range` parsed string bounds from `src/processors/post/range.ts`.

**Which existing data it uses:**
Reads the most recent non-null value from `BioMarker[1]`, parses `extra.range` to get min/max, and plots the value as a needle on a gauge.

**What it reveals that current charts don't:**
Provides an instant, visceral "speedometer" view of how close the latest reading is to the edge of the optimal range. Current charts require reading the Y-axis and comparing against the shaded `markArea`.

**Where it would live:**
New `src/layout/BiomarkerGauge.tsx`, rendered inside the expanded table row alongside or replacing the sparkline for the latest reading.

**Trigger / entry point:**
Visible immediately upon expanding a biomarker row in the data table.

**Implementation complexity:** Low
(Parsing `extra.range` is already done in `LineChart.tsx` and can be extracted. Gauge config is simple.)

**ECharts 6 API confirmed via context7:** yes (`series[].type: 'gauge'`)

---

Recommended implementation order: Proposal 3 first (Optimality Matrix Heatmap), then 1 (System-Wide Optimality Radar Chart), then 4 (LineChart Optimality VisualMap), then 2 (Biomarker Value Drift Boxplot), then 5 (Single Biomarker Radial Gauge).
