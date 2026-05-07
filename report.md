# Implementation Report

**The Issue:**
In `src/layout/Chart2.tsx` (lines ~220-270), the tooltip formatter for the regression line series uses `params.value[2]` to display the regression equation string. However, because the regression transform is configured with `formulaOn: 'end'`, the equation string is ONLY appended to the final data point's `value` array. For all other intermediate data points along the regression line, `params.value[2]` is undefined. This results in the regression trend equation silently disappearing when hovering over any point other than the exact endpoint.

**Discovery Signal:**
Scan 2 — Tooltip Quality & Completeness. Found that the fallback path `params.value[2]` was being used which could silently fail.

**context7 Reference:**
Confirmed `ecStat.regression` usage and `echarts-stat` transform configuration natively in Node.js test scripts using the installed version (v1.2.0). Option paths `dataset[].transform` and `tooltip.formatter` are standard ECharts 6 APIs.

**The Fix:**
Extracted the ecStat regression calculation into a direct invocation: `(ecStat as any).regression('linear', mappedScatterData.data)`. Captured the `expression` property (the regression equation string) into a scoped `regressionExpression` variable. Updated the tooltip formatter closures for both the scatter and line series to use `regressionExpression` instead of `params.value[2]`.

**The Benefit:**
The regression tooltip no longer relies on a data-point-specific array index. It now reliably displays the correct ecStat regression equation string (e.g. "y = mx + b") regardless of which segment of the trendline the user hovers over.

**TypeScript result:**
`0 errors` (Confirmed via `npx tsc --noEmit` and `pnpm exec tsc --noEmit`).

---

# Visualization Proposals

---

**Proposal 1 of 5: Single-Timepoint Optimality Radar**

**ECharts type:** `radar`

**Codebase citation:**
`extra.optimality[]` and `extra.range` pre-computed by `src/processors/post/range.ts`, index-aligned with `BioMarker[1]`, and tag group sets from `src/processors/post/tag.ts`.

**Which existing data it uses:**
Reads `visibleDataAtom` to get all biomarkers filtered by the active `tagAtom`. Extracts the most recent valid value from `BioMarker[1]`, normalizes it against the min/max from `extra.range`, and uses `extra.optimality[]` for the color scale.

**What it reveals that current charts don't:**
Shows whether all members of a specific tag group (e.g. all 12 markers in `2-Metabolic`) are simultaneously in range at the latest time point, allowing users to spot systemic imbalances at a glance without having to scroll through individual scatter or line charts.

**Where it would live:**
New `src/layout/OptimalityRadarChart.tsx`, rendered conditionally in `App.tsx` or a new dashboard view when `tagAtom` is non-null.

**Trigger / entry point:**
The existing tag filter buttons in the navigation. When a tag is selected, `tagAtom` is set, which filters `visibleDataAtom` and triggers the radar chart to display the systemic view of that tag group.

**Implementation complexity:** Medium
Requires normalizing differing unit scales to a 0-100% axis for the radar, using the existing min/max parsed from `extra.range`.

**ECharts 6 API confirmed via context7:** yes (`series[].type: 'radar'`)

---

**Proposal 2 of 5: Systemic Off-Balance Heatmap**

**ECharts type:** `heatmap`

**Codebase citation:**
`extra.optimality[]` boolean array pre-computed by `src/processors/post/range.ts` for every biomarker.

**Which existing data it uses:**
Reads `extra.optimality[]` across all time points (`labels[]`) for all biomarkers within `visibleDataAtom` (filtered by `tagAtom`). Maps `true` (out of range) to a bright accent color and `false` (in range) to a dim background color.

**What it reveals that current charts don't:**
Reveals temporal clusters of health issues. If multiple biomarkers in a group (like `3-Liver`) go out of range simultaneously on a specific date, it forms a bright vertical column on the heatmap, immediately identifying a specific historical event or phase of systemic stress.

**Where it would live:**
New `src/layout/OptimalityHeatmap.tsx`, serving as an alternative view to the `Chart.tsx` multi-line chart.

**Trigger / entry point:**
A toggle button near the existing multi-axis line chart allowing the user to switch from the absolute-value line view to the boolean optimality heatmap view.

**Implementation complexity:** Low
Directly maps the existing `extra.optimality` boolean arrays to a grid coordinate system.

**ECharts 6 API confirmed via context7:** yes (`series[].type: 'heatmap'`, `visualMap[].type: 'piecewise'`)

---

**Proposal 3 of 5: Biomarker Value Drift Boxplot**

**ECharts type:** `boxplot` (via `echarts-for-react` and ECharts internal dataset transform, no ecStat needed for standard boxplot)

**Codebase citation:**
`nonInferredDataAtom` from `src/atom/dataAtom.ts` which provides only measured (non-computed) biomarkers.

**Which existing data it uses:**
Takes the raw time-series values `BioMarker[1]` for each measured biomarker in `nonInferredDataAtom` and feeds them into the ECharts `boxplot` data transform to compute min, Q1, median, Q3, and max.

**What it reveals that current charts don't:**
Highlights the long-term variance and stability of a biomarker across all historical measurements. It makes it instantly obvious if a biomarker is highly volatile (large box/whiskers) or tightly controlled (small box), and identifies extreme historical outliers without plotting every single point over time.

**Where it would live:**
New `src/layout/DriftBoxplot.tsx`, rendered inside the table row expansion alongside or instead of `LineChart.tsx`.

**Trigger / entry point:**
The existing row expander. Instead of just showing the timeline (`LineChart.tsx`), it could show the historical distribution (`DriftBoxplot.tsx`) side-by-side.

**Implementation complexity:** Medium
Requires formatting the dataset properly for the ECharts built-in `boxplot` transform.

**ECharts 6 API confirmed via context7:** yes (`series[].type: 'boxplot'`, `dataset[].transform.type: 'boxplot'`)

---

**Proposal 4 of 5: Single Biomarker Radial Gauge**

**ECharts type:** `gauge`

**Codebase citation:**
`extra.range` formatted string generated in `src/processors/post/range.ts` and attached to `BioMarker[3]`.

**Which existing data it uses:**
Reads the latest valid value from `BioMarker[1]`, and parses the min/max numerical bounds from the `extra.range` string (e.g. `"3.9 - 6.4"`).

**What it reveals that current charts don't:**
Provides an instant "how far off am I?" dashboard metric. While the line chart shows historical trend, the gauge provides immediate visual context of where the most recent test sits relative to the optimal boundaries (e.g. pointing in the "red zone").

**Where it would live:**
New `src/layout/OptimalityGauge.tsx`, rendered within the main table view as a sparkline alternative, or in the row expansion view next to `LineChart.tsx`.

**Trigger / entry point:**
Automatically rendered for the latest data point whenever a user expands a specific biomarker row.

**Implementation complexity:** Low
Basic configuration of a gauge chart using only the latest value and the min/max from the parsed range string.

**ECharts 6 API confirmed via context7:** yes (`series[].type: 'gauge'`)

---

**Proposal 5 of 5: Tag Group Parallel Coordinates**

**ECharts type:** `parallel`

**Codebase citation:**
`tagAtom` from `src/atom/dataAtom.ts` and the associated tag group filtering in `visibleDataAtom`.

**Which existing data it uses:**
Takes all biomarkers from `visibleDataAtom` (when a single tag is active). Creates a vertical axis for each biomarker. Plugs the `extra.range` min/max as visual boundaries, and plots the `BioMarker[1]` values for the most recent N time points.

**What it reveals that current charts don't:**
Allows multidimensional comparison of a whole tag group. A user can see the "profile" of their `4-Lipid` panel at a glance, and how the profile lines have shifted between the last 3 tests, identifying complex inverse relationships (e.g. HDL going up while LDL goes down) that are hard to spot on disparate line charts.

**Where it would live:**
New `src/layout/TagParallelChart.tsx`, rendered when a tag is active.

**Trigger / entry point:**
Selecting a tag group from the navigation sets `tagAtom`. If the tag contains 4-10 biomarkers, this chart renders to show their multi-dimensional profile.

**Implementation complexity:** High
Parallel coordinates require careful axis scaling and label formatting to remain legible on smaller screens, and handling varying unit scales across axes.

**ECharts 6 API confirmed via context7:** yes (`series[].type: 'parallel'`, `parallelAxis[]`)

---

Recommended implementation order: Proposal 2 first (highest insight, lowest effort), then Proposal 4, then Proposal 1, then Proposal 3, then Proposal 5.
