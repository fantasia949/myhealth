

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

**Proposal: Biomarker Optimality Cascade Graph**

**ECharts type:** `graph` (Directed Acyclic Graph layout)

**Codebase citation:**
Uses `extra.tag[]` from `src/processors/post/tag.ts`, and pre-computed `extra.optimality[]` array from `src/processors/post/range.ts` aligned with time-series `labels`.

**Which existing data it uses:**
It reads the out-of-range (`extra.optimality` is `true`) occurrences across all tracked biomarkers in `dataAtom.ts`. The visualization clusters nodes by their `extra.tag` system group, weighting node size by historical out-of-range frequency, and linking nodes if they tend to fail at the same timestamps (co-occurrence).

**What it reveals that current charts don't:**
It shows the "failure cascade" between biological systems (e.g., does a failure in the `3-Liver` system frequently co-occur or precede failures in the `4-Lipid` system?). While the current `BiomarkerCorrelationGraph` shows mathematical value correlation (Spearman), this graph exclusively maps structural range-failures, highlighting systemic vulnerability points rather than pure numerical trends.

**Where it would live:**
New `src/layout/BiomarkerOptimalityCascadeGraph.tsx`, rendered within the Biomarker Correlation Modal or a dedicated "System Vulnerability" view.

**Trigger / entry point:**
A "System Vulnerability" toggle near the current correlation charts, feeding all `dataAtom` data directly.

---

**Proposal: PhenoAge Component Volatility Stacked Area**

**ECharts type:** `line` (Stacked Area configuration)

**Codebase citation:**
Uses the specific member array for the `a-PhenoAge` tag from `src/processors/post/tag.ts` (e.g. `Albumin`, `Glucose`, `Creatinin`, `MCV`, `CRP-hs`, etc.). Uses `rankedDataMapAtom` from `src/atom/dataAtom.ts`.

**Which existing data it uses:**
It pulls the normalized ranks (via `rankedDataMapAtom`) specifically for the constituents of the `a-PhenoAge` system group, stacking them temporally (`labels`) into a 100% normalized area chart to show the relative contribution of each component to overall volatility.

**Axes:**
- X-axis: Time (mapped to `labels`)
- Y-axis: Normalized Spearman rank proportion (0-100% of total variance for that snapshot)

**What it reveals that current charts don't:**
The current `RadarChart` shows a snapshot of current values, and line charts show individual trajectories. This stacked area explicitly shows *which specific biomarker is driving the Phenotypic Age score's volatility at any given point in time*. If the CRP-hs band suddenly swells to take up 60% of the area in Q3, it immediately isolates the inflammatory driver of age acceleration.

**Where it would live:**
New `src/layout/PhenoAgeVolatilityArea.tsx`.

**Trigger / entry point:**
When a user clicks on or expands the `a-PhenoAge` system group in the sidebar or dashboard summary, this view provides the longitudinal breakdown.



**Proposal: Inter-Tag Correlation Radar**

**ECharts type:** `radar`

**Codebase citation:**
Uses `extra.tag[]` assigned by `src/processors/post/tag.ts` and `correlationMethodAtom` from `src/atom/correlationAtom.ts`.

**Which existing data it uses:**
Aggregates the median correlation score (using the method defined in `correlationMethodAtom`) between the currently selected biomarker (from `visibleDataAtom`) and all other biomarkers grouped by their `extra.tag` groups (e.g., `4-Lipid`, `3-Liver`).

**Axes:**
- Radar axes represent the different `extra.tag` groups.

**What it reveals that current charts don't:**
Provides a holistic view of how a single biomarker's fluctuations correlate systemically with entire biological subsystems, revealing systemic coupling rather than just 1-to-1 biomarker relationships.

**Where it would live:**
New `src/layout/SystemicCorrelationRadar.tsx`.

**Trigger / entry point:**
A new "Systemic Impact" tab when a single biomarker row is expanded in the main table.

---

**Proposal: Missing Measurement Interpolation Confidence Area**

**ECharts type:** `line` (with `areastyle`)

**Codebase citation:**
Uses the raw null gaps in `values[]` from `dataAtom.ts` against the non-inferred markers in `nonInferredDataAtom`.

**Which existing data it uses:**
For any biomarker in `nonInferredDataAtom`, it linearly interpolates missing values across `labels` dates where measurements are missing. It draws a confidence band (`areastyle`) that widens the longer the gap between valid measurements, calculating gap width using `labels` time delta.

**Axes:**
- X-axis: `labels` (Time).
- Y-axis: Biomarker Value with interpolation error bounds.

**What it reveals that current charts don't:**
Visually communicates the uncertainty caused by testing gaps. A wide area clearly signals "we have no idea what this marker did during this 6-month gap", whereas current scatter charts just show a blank space, and connected lines give a false sense of certainty.

**Where it would live:**
New `src/layout/InterpolationConfidenceArea.tsx`.

**Trigger / entry point:**
A "Show Uncertainty" toggle above the existing time-series Line/Scatter charts.

---

**Proposal: Biomarker Pairwise Ratio Line Chart**

**ECharts type:** `line`

**Codebase citation:**
Uses `values[]` array from `dataAtom` and time-series `labels[]`.

**Which existing data it uses:**
It calculates the ratio between two user-selected biomarkers (e.g., `Testosterone` and `Cortisol` or `AST` and `ALT`) over time, directly utilizing their `values[]` from `dataAtom` aligned via `labels[]`. Null values are handled by skipping the calculation for timestamps where either is missing.

**Axes:**
- X-axis: Time (mapped to `labels`)
- Y-axis: Calculated numerical ratio between the two markers

**What it reveals that current charts don't:**
It allows users to track physiological balance and stress states that are defined by the ratio between markers rather than their absolute levels. Current charts only allow overlaying absolute values on multiple axes (ScatterChart / Chart), which makes relative ratio shifts hard to discern visually.

**Where it would live:**
New `src/layout/PairwiseRatioChart.tsx`.

**Trigger / entry point:**
A new "Custom Ratio" toggle above the existing main time-series charts, feeding two selected markers from `visibleDataAtom`.

---

**Proposal: PhenoAge Contribution Waterfall Chart**

**ECharts type:** `bar` (using waterfall/transparent base bar pattern)

**Codebase citation:**
Uses the `a-PhenoAge` tag group from `src/processors/post/tag.ts` and their `values[]` from `dataAtom.ts`.

**Which existing data it uses:**
Takes the most recent measurement (latest non-null value) for each constituent of the `a-PhenoAge` system group (e.g., `Albumin`, `Glucose`, `Creatinin`, `CRP-hs`). It calculates their individual +/- effect on the final Phenotypic Age score compared to a normalized baseline, plotting them as a waterfall sequence leading to the final total.

**Axes:**
- X-axis: Categorical components of the `a-PhenoAge` tag group
- Y-axis: Incremental contribution (in years) to the total Phenotypic Age

**What it reveals that current charts don't:**
Reveals exactly which biomarker is adding or subtracting years from the user's biological age *today*. While the RadarChart shows relative values, the waterfall explicitly quantifies the absolute weight and direction of each marker's impact on the final calculated score, highlighting the highest-impact intervention point.

**Where it would live:**
New `src/layout/PhenoAgeWaterfall.tsx`.

**Trigger / entry point:**
Accessible from a "Deconstruct Score" button when viewing the PhenoAge system summary.
