

**Proposal: Biomarker Normality Q-Q Scatter Plot**

**ECharts type:** `scatter` (Q-Q plot format)

**Codebase citation:**
Utilizes `values` from `dataAtom` and standard statistical transformations.

**Which existing data it uses:**
It takes the valid numeric `values` for a single biomarker from `dataAtom` and calculates their theoretical quantiles against a normal distribution. It plots the empirical quantiles against these theoretical quantiles.

**What it reveals that current charts don't:**
The existing Boxplot and Histogram charts show basic distribution, but a Q-Q plot specifically highlights whether the data follows a normal distribution or has heavy tails/skewness. This is crucial for biomarkers where deviations from a normal distribution might indicate underlying chronic issues rather than random variation.

**Where it would live:**
New `src/layout/QQPlot.tsx` alongside the existing statistical charts like `BoxplotChart.tsx`.

**Trigger / entry point:**
Available as an advanced statistical view toggle within the table row expansion alongside the Histogram and Boxplot.

---

**Proposal: Correlation Directionality Polar Scatter**

**ECharts type:** `scatter` (polar coordinate system)

**Codebase citation:**
Uses `rankedDataMapAtom` from `src/atom/dataAtom.ts` and `correlationMethodAtom` from `src/atom/correlationAtom.ts`.

**Which existing data it uses:**
Calculates the pairwise correlation between the selected biomarker and all other biomarkers in `dataAtom` using the selected method (e.g., Spearman).

**What it reveals that current charts don't:**
By mapping the magnitude of the correlation to the radius and the directionality (positive vs. negative) to the angle, it allows users to visually separate biomarkers that move together from those that move inversely, which is difficult to parse in a dense linear scatter plot.

**Where it would live:**
New `src/layout/CorrelationPolarScatter.tsx`.

**Trigger / entry point:**
A "Directional View" toggle inside the correlation modal.

---


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

**Proposal: Inferred vs Measured Origin Deviation Parallel Coordinates**

**ECharts type:** `parallel`

**Codebase citation:**
Uses `extra.originValues[]` and `extra.inferred` from `src/types/biomarker.ts` for biomarkers accessed via `dataAtom`.

**Which existing data it uses:**
It filters for biomarkers that have both `extra.inferred: true` and a valid underlying `extra.originValues[]` (the measured data before unit conversion or computational derivation). It compares the progression of the normalized inferred `values` against the normalized `extra.originValues` across multiple time steps in `labels`.

**Axes:**
Each parallel axis represents a time point from `labels`. The lines plot the normalized relative rank or percentile of the `values` vs. the `originValues`.

**What it reveals that current charts don't:**
It highlights "computational drift." When inferred biomarkers (e.g. calculated LDL or complex scores) deviate significantly from their origin inputs over time, the parallel coordinate paths will criss-cross, exposing a divergence where the computational model might be exaggerating or masking true physiological changes present in the measured origin data.

**Where it would live:**
New `src/layout/InferredDriftParallel.tsx`.

**Trigger / entry point:**
A "Computation Audit" mode in the main settings that becomes active when inferred markers are selected via `filterTextAtom` or `tagAtom`.

---

**Proposal: Multi-Tag Synchronized Volatility Brush Timeline**

**ECharts type:** `line` (with `dataZoom` and `brush` capabilities across synchronized multiple grids)

**Codebase citation:**
Leverages `extra.tag[]` from `src/processors/post/tag.ts` and `rankedDataMapAtom` from `src/atom/dataAtom.ts`.

**Which existing data it uses:**
It calculates a moving average volatility score for each major tag group (e.g., `3-Liver`, `4-Lipid`, `2-Metabolic`) using the aggregated `rankedDataMapAtom` scores for the markers inside those tags.

**Axes:**
- X-axis: Time (from `labels`)
- Y-axis (multiple stacked grids): Tag Group Volatility (Standard deviation or change rate of Spearman ranks over a rolling window).

**What it reveals that current charts don't:**
By stacking these tags vertically on synchronized time axes with brush support, users can highlight a specific window where one system (e.g., Liver) became highly volatile, and immediately see if another system (e.g., Metabolic) experienced a delayed cascading volatility spike weeks later, revealing chronological cross-system health dependencies.

**Where it would live:**
New `src/layout/CrossSystemVolatilityTimeline.tsx`.

**Trigger / entry point:**
A "System Interplay" view toggle next to the standard line/scatter chart tabs.
