# New Visualization Proposals

---

**Proposal 1 of 5: Out-of-Range Frequency vs Optimality Matrix Scatter**

**ECharts type:** `scatter`

**Codebase citation:**
Reads `extra.optimality[]` pre-computed by `src/processors/post/range.ts` (index-aligned with `BioMarker[1]`) and the Spearman rank cache `rankedDataMapAtom` computed in `src/atom/dataAtom.ts`.

**Which existing data it uses:**
It utilizes the output of `visibleDataAtom` to get the list of active biomarkers. For each biomarker, it calculates the percentage of time points where `extra.optimality[]` is `true` (Out of Range Frequency). It pairs this with its Spearman rank values from `rankedDataMapAtom`.

**What it reveals that current charts don't:**
It isolates biomarkers that frequently drift out of their optimal range and visualizes how their variance behaves within the overall system rank, helping identify unstable vs chronically out-of-range biomarkers without digging into individual timelines.

**Where it would live:**
New file `src/layout/OptimalityFrequencyScatter.tsx`, rendered conditionally as a sub-view within `SystemClustering.tsx` or `App.tsx` when the user selects a specific tag group.

**Trigger / entry point:**
Activated via a new "View Optimality Matrix" toggle button placed near the existing correlation chart mode switch, utilizing the current `tagAtom` to scope the analysis.

---

**Proposal 2 of 5: Measurement Gap Density Heatmap**

**ECharts type:** `heatmap`

**Codebase citation:**
Utilizes `BioMarker[1]` (the time-series value array which may contain nulls) and `labels[]` from `src/data/index.ts`.

**Which existing data it uses:**
It processes the `dataAtom` to map which biomarkers have `null` or missing values (`'-'`) at each time point in `labels[]`. The heatmap axes will be `labels` (X) vs `BioMarker[0]` names (Y).

**What it reveals that current charts don't:**
It provides a macroscopic view of data completeness across all tests. Current charts handle nulls silently by leaving gaps (e.g. `connectNulls: false` in `Chart.tsx`), but a user cannot easily see *when* the most comprehensive panels were drawn vs when only partial panels were drawn.

**Where it would live:**
New file `src/layout/DataCompletenessHeatmap.tsx`, added as a global data health dashboard view.

**Trigger / entry point:**
A global "Data Quality" tab or modal triggered from the `Nav.tsx` or `App.tsx` header area.

---

**Proposal 3 of 5: Tag Group Deviation Radar**

**ECharts type:** `radar`

**Codebase citation:**
Reads `extra.processedTags` mapped in `src/types/biomarker.ts` and `src/processors/post/tag.ts` along with `extra.isNotOptimal(value)`.

**Which existing data it uses:**
Groups data from `dataAtom` by tag group (e.g. `1-RBC`, `2-Metabolic`). For a given time slice (from `labels[]`), it calculates the percentage of optimal vs non-optimal biomarkers within each tag group. The radar chart axes represent the different tag groups.

**What it reveals that current charts don't:**
Provides a cross-system snapshot of health for a single time point. Currently, users have to filter by tag and look at individual lines/scatters. This would show immediately if "2-Metabolic" is doing poorly while "1-RBC" is perfect at a specific date.

**Where it would live:**
New file `src/layout/TagGroupRadar.tsx`.

**Trigger / entry point:**
When a specific date is selected (e.g., clicking on a point in the scatter chart or adding a global date filter state), the radar chart updates to show the systemic breakdown for that date.

---

**Proposal 4 of 5: Inferred vs Measured Value Discrepancy Bar**

**ECharts type:** `bar` (stacked or divergent)

**Codebase citation:**
Reads `extra.inferred` and `extra.hasOrigin` from `BioMarker[3]` mapped in `src/types/biomarker.ts`, along with `nonInferredDataAtom` vs `dataAtom`.

**Which existing data it uses:**
Filters `dataAtom` for biomarkers where `extra.inferred === true` and their corresponding base values. It calculates the variance or impact of the inferred computation vs raw measurements (using `extra.originValues` if available).

**What it reveals that current charts don't:**
Highlights how much of the "out of range" data is directly measured vs calculated/inferred. This helps users understand the confidence level of their out-of-range metrics.

**Where it would live:**
New file `src/layout/InferredDiscrepancyBar.tsx`.

**Trigger / entry point:**
A sub-view toggle on the main dashboard, or automatically displayed below the main scatter chart when `visibleDataAtom` contains mostly inferred metrics.

---

**Proposal 5 of 5: Correlation Significance Distribution Boxplot**

**ECharts type:** `boxplot`

**Codebase citation:**
Reads `correlationAlphaAtom`, `correlationMethodAtom`, and `correlationAlternativeAtom` from `src/atom/correlationAtom.ts`.

**Which existing data it uses:**
When computing correlations (e.g., in `SystemClustering.tsx` or a new analyzer), it takes the distribution of correlation coefficients (or p-values) across different tag groups and plots them as boxplots.

**What it reveals that current charts don't:**
Instead of just showing a linear regression for two specific biomarkers (`Chart2.tsx`), this summarizes the *overall strength* of correlations within a system (e.g., are metabolic markers tightly coupled or loosely coupled?).

**Where it would live:**
New file `src/layout/CorrelationDistributionBoxplot.tsx`.

**Trigger / entry point:**
A new "Correlation Analysis" tab that leverages the existing `correlationAtom` configuration states.

---

Recommended implementation order: Proposal 1 first (highest coefficient/correlations insight, historical insight, then other insights), then 3, then 2, then 5, then 4.
