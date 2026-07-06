

**Proposal: Conditional Anomaly Probability Heatmap**

**ECharts type:** `heatmap`

**Codebase citation:**
Uses `extra.optimality[]` from `src/processors/post/range.ts` aligned with `values` in `dataAtom` from `src/atom/dataAtom.ts`.

**Which existing data it uses:**
It computes the conditional probability that a target biomarker is out of range (`extra.optimality` is `true`) given that another condition (e.g. another biomarker being out of range, or belonging to a specific `extra.tag` group) holds true. The heatmap visualizes these calculated probabilities pairwise between biomarkers.

**What it reveals that current charts don't:**
Unlike the standard correlation charts that map linear relationships across all values, this explicitly highlights cascading anomalous states—answering "If biomarker A is failing, how likely is it that biomarker B is also failing?" This reveals specific, non-linear failure dependencies.

**Where it would live:**
New `src/layout/ConditionalAnomalyHeatmap.tsx`.

**Trigger / entry point:**
A "Conditional Probability View" toggle within the correlation and statistical modal.

---


**Proposal: System-Wide Volatility Sankey Diagram**

**ECharts type:** `sankey`

**Codebase citation:**
Uses `extra.tag[]` assigned by `src/processors/post/tag.ts` and `extra.optimality[]` from `src/processors/post/range.ts`, aggregated using `dataMapAtom` from `src/atom/dataAtom.ts`.

**Which existing data it uses:**
It reads the out-of-range (`extra.optimality` is `true`) occurrences from `dataMapAtom` for each biomarker and flows them into their respective system tags (`extra.tag`). The flow links represent the total non-optimal measurements.

**What it reveals that current charts don't:**
It provides a high-level macroscopic view of how cumulative health anomalies are distributed across various biological systems over time. Instead of looking at individual markers, users can quickly see which system (e.g., `4-Lipid` vs `3-Liver`) holds the highest out-of-range burden.

**Where it would live:**
New `src/layout/SystemVolatilitySankey.tsx`, accessible from a System Overview page.

**Trigger / entry point:**
A "System Load" overview tab in the main navigation.

---

**Proposal: Longitudinal Rank Inversion Parallel Coordinates**

**ECharts type:** `parallel`

**Codebase citation:**
Uses the pre-computed Spearman rank caches (`rankedDataMapAtom`) from `src/atom/dataAtom.ts` along with the non-inferred markers from `nonInferredDataAtom`.

**Which existing data it uses:**
It takes the top K (e.g., 10) most volatile measured biomarkers from `nonInferredDataAtom` and plots their relative Spearman rank percentile (`rankedDataMapAtom`) at each historical time point (`labels`).

**What it reveals that current charts don't:**
It reveals complex structural shifts in a user's health profile. If the ranks of metabolic markers cross over and invert against the ranks of kidney markers over a 2-year period, this chart immediately flags the systemic shift, which is completely hidden in raw value line charts.

**Where it would live:**
New `src/layout/LongitudinalRankParallel.tsx`, included in the statistical toolset.

**Trigger / entry point:**
An "Evolution Matrix" toggle in the Data Correlation tools section.

---


**Proposal: Measurement Frequency vs. Anomaly Rate Scatter**

**ECharts type:** `scatter`

**Codebase citation:**
Uses `values` (for counting valid measurements) from `dataAtom` and `extra.optimality[]` from `src/processors/post/range.ts`.

**Which existing data it uses:**
It calculates the total number of non-null measurements for each biomarker in `dataAtom` (frequency) and maps it against the percentage of those measurements that are marked `true` in `extra.optimality[]` (anomaly rate).

**Axes:**
- X-axis: Measurement Frequency (Count of non-null values for a biomarker)
- Y-axis: Anomaly Rate (Percentage of measurements flagged as out-of-range)

**What it reveals that current charts don't:**
It immediately identifies "under-tested problem areas." If a biomarker is extremely anomalous but rarely tested (high Y, low X), it warrants much more frequent testing. Existing charts show values over time, but do not juxtapose testing cadence against historical failure rates.

**Where it would live:**
New `src/layout/MeasurementFrequencyScatter.tsx`.

**Trigger / entry point:**
Available as a "Testing Strategy" diagnostic view in the main sidebar or dashboard overview.

---

**Proposal: Tag-Group Measurement Density Calendar**

**ECharts type:** `calendar` (with custom series mapping)

**Codebase citation:**
Uses the date array `labels` from `src/data/index.ts`, grouped by `extra.tag[]` from `src/processors/post/tag.ts`.

**Which existing data it uses:**
For each specific day in `labels`, it counts the total number of biomarkers within a given tag group (e.g. `2-Metabolic`) that have a non-null value. It maps this density to a calendar heatmap.

**What it reveals that current charts don't:**
It provides a high-level view of testing consistency over the year. Instead of seeing discrete points in a line chart or scatter plot, a user can instantly see the cadence and "completeness" of their testing panels on specific dates (e.g., "I only tested Hormone markers three times last year, but Liver markers every month").

**Where it would live:**
New `src/layout/MeasurementDensityCalendar.tsx`.

**Trigger / entry point:**
A "Calendar Overview" toggle or tab in the primary Dashboard view, reacting to the currently selected `tagAtom`.

---

**Proposal: Biomarker Volatility vs. Baseline Scatter Plot**

**ECharts type:** `scatter`

**Codebase citation:**
Uses `extra.isNotOptimal` function from `src/types/biomarker.ts` and overall `values` arrays from `dataAtom.ts`.

**Which existing data it uses:**
It calculates the coefficient of variation (CV) for each biomarker from its `values[]` array and plots it against its baseline deviation (mean difference from the median of its optimal range defined in `extra.range`). It strictly uses measured values from `nonInferredDataAtom`.

**Axes:**
- X-axis: Baseline Deviation (Normalized mean distance from optimal range center).
- Y-axis: Coefficient of Variation (Volatility over time).

**What it reveals that current charts don't:**
Identifies "silent drifters" (low volatility but high baseline deviation) vs "unstable responders" (high volatility, close to baseline). This helps prioritize interventions: stabilize highly volatile markers vs gradually shift structurally displaced markers. Current timeline charts only show raw values, making systemic volatility comparison difficult.

**Where it would live:**
New `src/layout/VolatilityBaselineScatter.tsx`, rendered in the main Dashboard next to the existing RadarChart.

**Trigger / entry point:**
A "Volatility vs. Baseline" toggle in the Dashboard view.

---
