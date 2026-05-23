---
**Proposal 1 of 5: Out-of-Range Tag Heatmap**

**ECharts type:** `heatmap`

**Codebase citation:** `extra.optimality[]` pre-computed by `src/processors/post/range.ts` and tag groups defined in `src/processors/post/tag.ts`

**Which existing data it uses:** Reads `extra.optimality[]` from every `BioMarker` in `dataAtom` and groups them by `extra.tag`. Uses `labels[]` from `src/data/index.ts` for the X-axis.

**What it reveals that current charts don't:** Provides a high-level system overview showing which physiological systems (e.g., `3-Liver`, `6-Kidney`) have the highest density of out-of-range biomarkers at any given time, allowing the user to spot systemic issues at a glance without drilling down into individual biomarker charts.

**Where it would live:** New `src/layout/SystemOptimalityHeatmap.tsx`, rendered in a new tab or an expandable section in `App.tsx` above the table.

**Trigger / entry point:** A new "System View" toggle or button in the navigation bar that switches the main view to this heatmap.

---

**Proposal 2 of 5: Biomarker Value Drift Boxplot**

**ECharts type:** `boxplot`

**Codebase citation:** `BioMarker[1]` (values array) and `extra.range` string from `src/processors/post/range.ts`.

**Which existing data it uses:** Reads `BioMarker[1]` from all `visibleDataAtom` entries. It groups historical values for each biomarker into a boxplot representation.

**What it reveals that current charts don't:** Shows the distribution, median, and outliers of a biomarker's historical values, revealing whether the user's values typically drift high or low relative to their own median and the optimal range, which time-series charts don't summarize as clearly.

**Where it would live:** Extended in `src/layout/LineChart.tsx` or as a new `src/layout/DistributionChart.tsx` rendered alongside the line chart in the expanded row view.

**Trigger / entry point:** A new "Distribution" tab/toggle within the expanded row view of the main data table.

---

**Proposal 3 of 5: Measured vs Inferred Ratio Gauge**

**ECharts type:** `gauge`

**Codebase citation:** `extra.inferred` boolean assigned in `src/types/biomarker.ts` and `nonInferredDataAtom` in `src/atom/dataAtom.ts`.

**Which existing data it uses:** Compares the length of `nonInferredDataAtom` to the total length of `dataAtom` (or within a specific tag via `visibleDataAtom`).

**What it reveals that current charts don't:** Visualizes the "data quality" or "measurement density" of the current view, showing how much of the displayed data is actual lab results vs. computed/inferred values.

**Where it would live:** A small inline component `src/layout/DataQualityGauge.tsx` rendered in the table header or filter bar.

**Trigger / entry point:** Always visible when filtering by tags or searching, updating dynamically as `visibleDataAtom` changes.

---

**Proposal 4 of 5: Correlation Matrix Heatmap**

**ECharts type:** `heatmap`

**Codebase citation:** `rankedDataMapAtom` in `src/atom/dataAtom.ts` and `correlationMethodAtom` in `src/atom/correlationAtom.ts`.

**Which existing data it uses:** Uses the pre-computed Spearman/Pearson rank arrays from `rankedDataMapAtom` for all `visibleDataAtom` entries to generate a cross-correlation matrix between all visible biomarkers.

**What it reveals that current charts don't:** Shows how every biomarker in the current view correlates with every other biomarker simultaneously, revealing hidden clusters of related markers (e.g., how different lipid markers correlate with inflammation markers).

**Where it would live:** New `src/layout/CorrelationMatrix.tsx`, rendered in the existing Correlation dialog.

**Trigger / entry point:** Added as a new tab ("Matrix View") inside the existing Correlation dialog opened via the table tools.

---

**Proposal 5 of 5: Missing Data / Sparsity Calendar Chart**

**ECharts type:** `calendar` (with `scatter` or `heatmap` series)

**Codebase citation:** Null values in `BioMarker[1]` arrays and `labels[]` from `src/data/index.ts`.

**Which existing data it uses:** Scans `BioMarker[1]` arrays from `dataAtom` for non-null values and maps them against the actual dates derived from `labels[]` (e.g., `20YY/MM/DD`).

**What it reveals that current charts don't:** Provides a "punch card" view of measurement frequency, showing exactly which days/months/years the user took blood tests and how comprehensive those tests were, highlighting gaps in tracking.

**Where it would live:** New `src/layout/MeasurementHistoryCalendar.tsx`.

**Trigger / entry point:** A small calendar icon button next to the date range selector or in the main navigation.

---

Recommended implementation order: Proposal 2 first (highest coefficient/correlations insight, historical insight, then other insights), then 1, then 5, then 4, then 3.
