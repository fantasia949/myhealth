# Implementation Report

**The Issue:**
In `src/layout/ScatterChart.tsx`, `src/layout/LineChart.tsx`, and `src/layout/Chart2.tsx`, the ECharts wrapper components were missing `theme="dark"` and `notMerge={true}` props, causing them to fall back occasionally to default styling or merge stale line series when selecting/deselecting multiple keys. Additionally, `src/layout/Chart.tsx` failed to include the standard 12-color palette in its multi-series line chart configuration, meaning it deviated from the visual identity.

**Discovery Signal:**
Scan 5 (`setOption` correctness causing stale renders if `notMerge` isn't handled correctly when updating `keys`) and Scan 7 (Visual Consistency checking `theme="dark"` and the 12-color palette across all layout files).

**context7 Reference:**
`echarts-for-react` component props include `theme` and `notMerge` booleans (ECharts 5.6.0). ECharts `color` array within the `option` object handles multi-series palettes.

**The Fix:**
I added the `notMerge={true}` and `theme="dark"` props to the `<ReactECharts />` components in `src/layout/ScatterChart.tsx`, `src/layout/LineChart.tsx`, and `src/layout/Chart2.tsx`. I also copied the exact 12-color hex array from `Chart2` into the `echartsOptions.option` configuration inside `src/layout/Chart.tsx`.

**The Benefit:**
Changing selected biomarkers in the UI no longer causes "ghost lines" to remain incorrectly rendered due to option merging, and all charts reliably enforce the global dark theme and specific data color codes perfectly.

---

# Visualization Proposals

---

**Proposal 1 of 3: Correlation Matrix Heatmap**

**ECharts type:** `heatmap`

**Which existing data it uses:**
It uses the precomputed pairwise correlation results from `correlationAtom` (which already calculates Pearson/Spearman coefficients) found in `src/atom/correlationAtom.ts`.

**What it reveals that current charts don't:**
Shows a comprehensive 2D grid matrix of all available biomarkers against one another, allowing users to rapidly spot unexpected physiological links (like a dense red spot revealing that strong Lipid-Hormone linkage exists) at a glance without having to select each pair manually on a scatter chart.

**Where it would live:**
New `src/layout/CorrelationHeatmap.tsx`, rendered in a "Matrix" tab right beside the existing `BiomarkerCorrelation` table view.

**Trigger / entry point:**
A toggle button in the Biomarker Correlation view switches between the tabular list and the 2D Heatmap visual matrix.

**Implementation complexity:** Medium
The math is already done in `correlationAtom`. Creating the chart simply requires mapping the `[keyA, keyB, score]` tuples into the `[xIndex, yIndex, value]` format expected by ECharts, and defining a generic `visualMap` from -1 to 1.

**ECharts 5.6.0 API confirmed via context7:** yes (`series-heatmap.data`, `visualMap`)

---

**Proposal 2 of 3: Biomarker Value Distribution**

**ECharts type:** `bar` with dataset transform `ecStat:histogram`

**Which existing data it uses:**
The raw historical values array (`number[]`) for any single `BioMarker` accessed from `dataAtom` in `src/atom/dataAtom.ts`.

**What it reveals that current charts don't:**
Reveals the statistical distribution of a single biomarker. Instead of a messy time-series line, it clearly shows if your Glucose historically clusters heavily around one number (normal distribution), or if there are two distinct clusters indicating different physiological states over the years.

**Where it would live:**
A new `src/layout/HistogramChart.tsx`.

**Trigger / entry point:**
When a user expands a specific biomarker row in the data table, the existing `LineChart` could be accompanied by a small segmented control to toggle between "Time View" (line) and "Distribution View" (histogram).

**Implementation complexity:** Low
The exact array of numbers is already passed to the LineChart. We just need to load it into a generic ECharts dataset and declare the `transform: { type: 'ecStat:histogram' }` option, requiring almost no custom JS logic.

**ECharts 5.6.0 API confirmed via context7:** yes (`dataset.transform.type = 'ecStat:histogram'`)

---

**Proposal 3 of 3: Seasonal Biomarker Heatmap**

**ECharts type:** `calendar` + `heatmap`

**Which existing data it uses:**
The values array (`number[]`) and the time-series labels (`labels[]` strings) mapped to the `BioMarker`.

**What it reveals that current charts don't:**
Highlights seasonal or structural patterns that traditional line charts obscure. For slowly-changing metrics, a calendar view immediately exposes if values tend to spike during the winter holidays, or drop sharply on weekends, mapped directly to actual days of the week and months.

**Where it would live:**
New `src/layout/CalendarHeatmap.tsx`.

**Trigger / entry point:**
An additional chart view option selectable from the main dashboard when viewing high-density biomarkers (ones measured frequently enough over the 2008–present window to populate a calendar).

**Implementation complexity:** Medium
Requires formatting the existing `YYMMDD` string tags from `labels[]` into proper Date objects/strings compatible with the ECharts `calendar` coordinate system, but no new state atoms are required.

**ECharts 5.6.0 API confirmed via context7:** yes (`calendar`, `series-heatmap.coordinateSystem = 'calendar'`)

---

> Recommended implementation order: Proposal 1 first (highest insight, lowest effort relative to impact, as it uses the already-expensive math atom), then 2, then 3.
