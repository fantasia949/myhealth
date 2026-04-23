## Implementation Report

**The Issue:**
In `src/layout/LineChart.tsx` lines 27-28 and 97-98, the tooltip formatter incorrectly formats without including the biomarker's unit because the `LineChartProps` does not receive a unit. The unit is missing in the tooltip, making the chart contextually incomplete for health data.

**Discovery Signal:**
Scan 2 & Scan 1 (Tooltip Quality & Completeness). Found that the tooltip does not include the biomarker unit, which is a known gap, and this data is accessible via `dataMapAtom`.

**context7 Reference:**
`tooltip.formatter` on `ReactECharts` options.

**The Fix:**
I added the imports `useAtomValue` and `dataMapAtom` to `src/layout/LineChart.tsx`. Then inside the component, I fetched the unit using `const dataMap = useAtomValue(dataMapAtom)` and `const unit = dataMap.get(name)?.[2] || ''`. I then updated both instances of the `tooltip.formatter` inside `options` to append the unit to the value string.

**The Benefit:**
The line chart tooltip now shows the unit alongside the value, giving users a complete understanding of the displayed data without changing the external prop interface.

**TypeScript result:**
`npx tsc --noEmit` output: 0 errors

---

## Visualization Proposals

**Proposal 1 of 5: Tag-Group Deviation Bar Chart**
**ECharts type:** `bar` + `markLine`
**Codebase citation:** `extra.range` and current values per tag group returned by `visibleDataAtom`.
**Which existing data it uses:** Uses `visibleDataAtom` filtered by the active tag, normalizing each value by its `extra.range` string limits to show distance from optimal center.
**What it reveals that current charts don't:** Provides an instantaneous ranking of which biomarkers in a specific tag group are furthest from optimal at the latest test, which isn't obvious from raw time series.
**Where it would live:** New `src/layout/DeviationBarChart.tsx`, rendered inside a new modal or tab.
**Trigger / entry point:** A new "View Deviations" button in the Nav or Table header when a specific tag is selected.
**Implementation complexity:** Medium (requires data normalization and layout creation).
**ECharts 6 API confirmed via context7:** yes (`series[].type: 'bar'`, `markLine`)

**Proposal 2 of 5: High-Variance Distribution Histogram**
**ECharts type:** `ecStat:histogram`
**Codebase citation:** Uses `nonInferredDataAtom`.
**Which existing data it uses:** Extracts all non-null values for a selected single biomarker from `nonInferredDataAtom`.
**What it reveals that current charts don't:** Visualises the frequency distribution of a biomarker's measurements over time, revealing if values are normally distributed or highly skewed, which is hard to glean from scatter or line charts.
**Where it would live:** New `src/layout/BiomarkerHistogram.tsx`, inside the existing PValue / Correlation modal space or a new detail modal.
**Trigger / entry point:** Clickable action button on a specific biomarker row in the main table.
**Implementation complexity:** Medium (requires setting up `ecStat:histogram` transform).
**ECharts 6 API confirmed via context7:** yes (`dataset.transform.type: 'ecStat:histogram'`)

**Proposal 3 of 5: Protocol Change Scatter Clustering**
**ECharts type:** `ecStat:clustering`
**Codebase citation:** Uses `dataAtom` and its array structure `BioMarker[1]`.
**Which existing data it uses:** Gathers multi-dimensional values across time points from `dataAtom` to cluster dates based on biomarker similarity.
**What it reveals that current charts don't:** Identifies "phases" of health based on hidden correlations across all markers, potentially tying clustered dates to changes in supplement protocols or lifestyle.
**Where it would live:** New `src/layout/ProtocolClustering.tsx`.
**Trigger / entry point:** A "Cluster Analysis" button in the global navigation bar.
**Implementation complexity:** High (complex data preparation to feed multi-dimensional arrays into the clustering transform and handling null values).
**ECharts 6 API confirmed via context7:** yes (`dataset.transform.type: 'ecStat:clustering'`)

**Proposal 4 of 5: Biomarker Range Optimality Strip Chart**
**ECharts type:** `visualMap` on `LineChart`
**Codebase citation:** Uses pre-computed `extra.optimality[]` array from `src/processors/post/range.ts`.
**Which existing data it uses:** Uses `extra.optimality[]` from `BioMarker` entries in `visibleDataAtom` to map colors to line segments based on boolean in/out-of-range state.
**What it reveals that current charts don't:** Integrates range state directly into the time series flow, making transitions into and out of optimal bounds immediately obvious visually without switching charts.
**Where it would live:** Extends the existing `src/layout/LineChart.tsx`.
**Trigger / entry point:** Automatically applied to the existing expanded line chart in table rows.
**Implementation complexity:** Low.
**ECharts 6 API confirmed via context7:** yes (`visualMap[].type: 'piecewise'`)

**Proposal 5 of 5: Parallel Coordinates Time-Slice Chart**
**ECharts type:** `parallel`
**Codebase citation:** Uses `tagAtom` and `dataAtom`.
**Which existing data it uses:** Extracts the latest value for all biomarkers inside the currently selected `tagAtom` group from `dataAtom`.
**What it reveals that current charts don't:** Allows spotting correlations and outliers across all related biomarkers at a single point in time, giving a "system state" snapshot.
**Where it would live:** New `src/layout/ParallelTagChart.tsx`.
**Trigger / entry point:** A dedicated button that appears only when a specific tag is filtered in the `Nav`.
**Implementation complexity:** Medium.
**ECharts 6 API confirmed via context7:** yes (`series[].type: 'parallel'`)

> Recommended implementation order: Proposal 4 first (highest insight, lowest effort), then 1, then 2, then 5, then 3.
