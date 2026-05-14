**Proposal 1 of 5: Biomarker Group Optimality Radar Chart**

**ECharts type:** `radar`

**Codebase citation:**
`extra.range` (parsed into min/max) and `extra.optimality[]` computed by `src/processors/post/range.ts`

**Which existing data it uses:**
Reads `extra.range` and the latest valid value from `BioMarker[1]` for all biomarkers grouped by a specific tag in `tagAtom` from `visibleDataAtom`.

**What it reveals that current charts don't:**
By normalizing different biomarkers (e.g., all 9 members of tag group `8-WBC`) against their individual optimal ranges (represented as the radar's boundaries or colored bands), users can instantly spot which specific member of the group is furthest out of optimal bounds at the most recent time point—a system-level view that scatter or line charts obscure.

**Where it would live:**
New `src/layout/GroupRadarChart.tsx`, rendered in `App.tsx` conditionally when `tagAtom` has an active selection.

**Trigger / entry point:**
The existing tag filter buttons in `Nav.tsx` set `tagAtom`. When a tag is clicked, the radar chart auto-renders alongside the table, providing a snapshot of that specific tag group.

**Implementation complexity:** Medium
(Requires normalizing distinct scales into a unified percentage representation for the radar's axes, but uses standard ECharts radar features.)

**ECharts 6 API confirmed via context7:** yes (`series[].type: 'radar'`, `radar.indicator`)

---

**Proposal 2 of 5: System-wide Deviation Heatmap**

**ECharts type:** `heatmap`

**Codebase citation:**
`extra.optimality[]` boolean array computed in `src/processors/post/range.ts` index-aligned with time points in `labels[]`.

**Which existing data it uses:**
Maps the `extra.optimality[]` arrays (or calculating absolute deviation from midpoint of `extra.range`) for all biomarkers in `nonInferredDataAtom` against the `labels[]` dates on the X-axis.

**What it reveals that current charts don't:**
Reveals historical clusters of off-baseline health signals (e.g., observing that multiple liver enzymes and metabolic markers fell out of range simultaneously during a specific month). Current charts force you to look at one or two biomarkers at a time, making it hard to see systemic protocol failures.

**Where it would live:**
New `src/layout/DeviationHeatmap.tsx`, added as a collapsible panel at the top of the `Dashboard` or `Table` view.

**Trigger / entry point:**
Always visible or toggled via a new "System Heatmap" button, automatically reacting to updates in `nonInferredDataAtom`.

**Implementation complexity:** Medium
(Requires formatting data into `[x, y, value]` grid coordinates, but native to ECharts `heatmap` series.)

**ECharts 6 API confirmed via context7:** yes (`series[].type: 'heatmap'`, `visualMap`)

---

**Proposal 3 of 5: High-Variance Biomarker Distribution Boxplot**

**ECharts type:** `boxplot`

**Codebase citation:**
`nonInferredDataAtom` providing raw measurement series.

**Which existing data it uses:**
Uses the raw values (`BioMarker[1]`) across all time points for a specific biomarker (e.g., from `dataMapAtom`), passed to the `echarts-stat` library to generate boxplot statistics.

**What it reveals that current charts don't:**
Shows the overall statistical distribution (median, quartiles, and outliers) for high-variance markers like Glucose or Testosterone across the entire recorded history. This helps distinguish whether a recent "out of range" measurement is a true outlier or just typical variance for that individual.

**Where it would live:**
New `src/layout/DistributionBoxplot.tsx`, rendered inside the expanded row view of the data table (next to `LineChart.tsx`).

**Trigger / entry point:**
Renders automatically when a user clicks to expand a biomarker row in the data table.

**Implementation complexity:** Low
(Relies on `ecStat.statistics.dataToBoxplot` which does the heavy lifting, passing result directly to ECharts `boxplot` series.)

**ECharts 6 API confirmed via context7:** yes (`series[].type: 'boxplot'`, `dataset.transform` with `echarts-stat`)

---

**Proposal 4 of 5: Biomarker Variance Histogram**

**ECharts type:** `ecStat:histogram`

**Codebase citation:**
Uses `BioMarker[1]` raw arrays from `dataMapAtom`.

**Which existing data it uses:**
Takes the continuous history array of a single biomarker and processes it through `ecStat:histogram` to group values into bins.

**What it reveals that current charts don't:**
Instead of viewing values chronologically, this shows the frequency of values falling into specific sub-ranges. It clearly illustrates whether a biomarker typically hovers near the lower or upper boundary of its optimal range over time.

**Where it would live:**
New `src/layout/VarianceHistogram.tsx`, an alternate tab or toggle next to the `LineChart.tsx` in the table's expanded row.

**Trigger / entry point:**
A toggle button in the expanded row component allowing the user to switch between chronological "Timeline" (LineChart) and "Distribution" (Histogram).

**Implementation complexity:** Low
(Leverages existing `ecStat` dependency and standard transform capabilities without complex data wrangling.)

**ECharts 6 API confirmed via context7:** yes (`dataset.transform` with `type: 'ecStat:histogram'`)

---

**Proposal 5 of 5: Tag Group Deviation Bar Chart**

**ECharts type:** `bar` + `markLine`

**Codebase citation:**
`tag` property and `extra.range` from `BioMarker[3]`, computed in `src/processors/post/tag.ts`.

**Which existing data it uses:**
Calculates the delta between the latest measurement and the optimal range midpoint for all markers within a specific active `tagAtom`, rendering them side-by-side.

**What it reveals that current charts don't:**
Ranks biomarkers within a physiological system (e.g., `3-Liver`) by severity of deviation from their ideal midpoint, immediately answering "Which liver marker needs the most attention right now?"

**Where it would live:**
New `src/layout/DeviationBarChart.tsx`, replacing or accompanying the `ScatterChart` when a specific tag filter is applied.

**Trigger / entry point:**
Triggered when the user selects a tag group from `Nav.tsx`, updating `tagAtom` and automatically displaying the bar chart for the filtered group.

**Implementation complexity:** Low
(Simple bar chart with a fixed `markLine` at 0 representing the optimal midpoint.)

**ECharts 6 API confirmed via context7:** yes (`series[].type: 'bar'`, `series[].markLine`)

---

Recommended implementation order: Proposal 2 first (highest coefficient/correlations insight, historical insight, then other insights), then 1, then 5, then 3, then 4.
