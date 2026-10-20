
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

**Proposal: Correlation Significance Funnel**

**ECharts type:** `funnel`

**Codebase citation:**
Uses `correlationAlphaAtom` from `src/atom/correlationAtom.ts`.

**Which existing data it uses:**
Takes all calculated pairwise correlations from `dataMapAtom` and funnels them through p-value significance thresholds (e.g., p < 0.05, p < 0.01, p < 0.001) based on the user's `correlationAlphaAtom` setting.

**What it reveals that current charts don't:**
Gives a macro sense of how statistically robust the entire dataset's correlations are. A steep funnel means most relationships are weak and potentially spurious; a wide funnel indicates a highly interconnected and confident biological state.

**Where it would live:**
New `src/layout/CorrelationSignificanceFunnel.tsx`.

**Trigger / entry point:**
Displayed inside the Correlation statistical summary panel.

---

**Proposal: Optimal Range Proximity vs Volatility Scatter**

**ECharts type:** `scatter`

**Codebase citation:**
Uses `extra.range` and `extra.optimality` pre-computed by `src/processors/post/range.ts`.

**Which existing data it uses:**
For the most recent timestamp, it plots all biomarkers from `visibleDataAtom`. The X-axis is the absolute distance from the center of their optimal range (normalized to the range width), and the Y-axis is their historical volatility (standard deviation of non-null `values[]`).

**Axes:**

- X-axis: Optimal Range Deviation (Normalized distance from optimal center)
- Y-axis: Historical Volatility (Standard Deviation)

**What it reveals that current charts don't:**
Distinguishes between biomarkers that are consistently on the edge of failing (high distance, low volatility) versus those that swing wildly in and out of range (low distance, high volatility), enabling better triaging of health interventions.

**Where it would live:**
New `src/layout/OptimalProximityScatter.tsx`.

**Trigger / entry point:**
A "Triage View" toggle in the main dashboard view alongside the RadarChart.

**Proposal: Optimality Reversion Duration Histogram**

**ECharts type:** `histogram` (via `echarts-stat`)

**Codebase citation:**
Uses `extra.optimality[]` pre-computed by `src/processors/post/range.ts` aligned with time-series `labels` from `src/data/index.ts`.

**Which existing data it uses:**
It calculates the continuous duration (in days) that a biomarker stays in a non-optimal state before reverting back to the optimal range (i.e. number of consecutive `true` values in `extra.optimality[]` before hitting a `false`, mapped to actual dates in `labels`).

**Axes:**

- X-axis: Reversion Duration (e.g. days or weeks in failure state)
- Y-axis: Frequency count (number of times it took that long to recover)

**What it reveals that current charts don't:**
Shows recovery momentum. Are out-of-range events becoming harder to recover from? A shift in the histogram towards longer durations indicates a loss of physiological resilience that simple timeline charts might obscure in noisy data.

**Where it would live:**
New `src/layout/ReversionHistogram.tsx`.

**Trigger / entry point:**
A "Recovery Resilience" toggle on individual biomarker detail views.

---

**Proposal: Correlation Residual Boxplot**

**ECharts type:** `boxplot`

**Codebase citation:**
Uses `nonInferredDataAtom` and the existing `ecStat.regression` transform logic currently employed in `src/layout/Chart2.tsx`.

**Which existing data it uses:**
It takes two user-selected biomarkers from `nonInferredDataAtom`. First, it computes the linear regression expected values for Biomarker Y given Biomarker X using the exact same paired datasets passed to `ecStat.regression('linear', mappedScatterData)`. It then calculates the residual (Measured Y - Expected Y) for every data point and plots the distribution of these residuals.

**Axes:**

- X-axis: Single category ("Regression Residuals").
- Y-axis: Residual value (difference between actual and predicted).

**What it reveals that current charts don't:**
While `Chart2.tsx` plots the raw scatter and the regression trendline, it doesn't quantify the distribution of deviations from that trend. This boxplot reveals structural uncoupling—if the residuals are highly skewed or have extreme outliers, it indicates moments in time where the expected physiological relationship between the two markers broke down entirely (e.g., insulin resistance causing a decoupling of glucose and insulin expectations).

**Where it would live:**
New `src/layout/CorrelationResidualBoxplot.tsx`.

**Trigger / entry point:**
A "Residual Distribution" sub-tab in the Biomarker Correlation Modal (near the existing scatter chart).

---


**Proposal: Origin Value Conversion Drift Scatter**

**ECharts type:** `scatter`

**Codebase citation:**
Reads `extra.originValues` and `extra.originUnit` from `src/types/biomarker.ts` for each biomarker returned by `visibleDataAtom`.

**Which existing data it uses:**
It pairs the standard standardized `values[]` (which power the main charts) with the pre-conversion raw lab numbers found in `extra.originValues[]`, if `extra.hasOrigin` is true.

**Axes:**

- X-axis: Standardized Value (e.g. standard SI unit)
- Y-axis: Raw Origin Value (from `extra.originValues`)

**What it reveals that current charts don't:**
Identifies systematic drift or rounding errors in unit conversions over time. If a user receives lab results from different providers using different raw units, standardizing them can introduce mathematical artifacts. This scatter plot visually verifies the integrity of the conversion pipeline: a perfect conversion should render as a perfectly straight line, whereas clusters off the line indicate potential calculation errors or undocumented lab reference shifts.

**Where it would live:**
New `src/layout/OriginDriftScatter.tsx`, accessible in the diagnostics or settings area.

**Trigger / entry point:**
A "Data Integrity" toggle within a specific Biomarker's detail modal.

---

**Proposal: Spearman vs Pearson Correlation Delta Heatmap**

**ECharts type:** `heatmap`

**Codebase citation:**
Uses `correlationMethodAtom` from `src/atom/correlationAtom.ts` and the `calculateSpearman` / `calculatePearson` utilities.

**Which existing data it uses:**
It computes both the Pearson (linear) and Spearman (monotonic rank) correlation coefficients for all pairwise combinations of biomarkers in `nonInferredDataAtom`. It then calculates the absolute difference between these two coefficients for each pair.

**Axes:**

- X-axis: Biomarker Name (from `nonInferredDataAtom`)
- Y-axis: Biomarker Name (from `nonInferredDataAtom`)

**What it reveals that current charts don't:**
The current `CorrelationChordDiagram` and `Chart2.tsx` only show correlation under a single selected mathematical lens. This heatmap specifically highlights pairs with a _large difference_ between Pearson and Spearman scores. A high Spearman but low Pearson score strongly implies a non-linear but consistent physiological relationship (e.g., exponential or logarithmic response), guiding the user to investigate the _shape_ of the relationship rather than assuming a straight line.

**Where it would live:**
New `src/layout/CorrelationDeltaHeatmap.tsx`.

**Trigger / entry point:**
A "Detect Non-Linearity" button within the existing Correlation Analysis view.

---

**Proposal: Correlation Directionality Shift Scatter**

**ECharts type:** `scatter`

**Codebase citation:**
Uses `correlationMethodAtom` from `src/atom/correlationAtom.ts` and overall `values[]` arrays loaded into `nonInferredDataAtom`.

**Which existing data it uses:**
Splits the `labels[]` and corresponding `values[]` from `nonInferredDataAtom` into two chronological halves (e.g., Early Timeline vs. Late Timeline). It computes pairwise correlation coefficients (Spearman/Pearson) between all biomarkers for both halves.

**Axes:**

- X-axis: Early Timeline Correlation Coefficient (e.g., -1.0 to 1.0).
- Y-axis: Late Timeline Correlation Coefficient (e.g., -1.0 to 1.0).

**What it reveals that current charts don't:**
Identifies shifting physiological relationships. A point plotted far from the diagonal indicates that two biomarkers have fundamentally changed how they interact (e.g., they were highly correlated early on, but became decoupled later due to an intervention, medication, or aging). This helps track metabolic adaptability.

**Where it would live:**
New `src/layout/CorrelationShiftScatter.tsx`.

**Trigger / entry point:**
A "Temporal Shift" toggle button in the main Correlation Analysis modal.

---

**Proposal: Out-of-Range Tag Density Dot Plot**

**ECharts type:** `scatter` (with varying symbol size)

**Codebase citation:**
`extra.optimality[]` pre-computed by `src/processors/post/range.ts` and `extra.tag[]` from `src/types/biomarker.ts`.

**Which existing data it uses:**
Reads the `optimality` boolean array for all biomarkers grouped by their `tag` (e.g., from `dataAtom`).

**Axes:**

- **X-Axis:** Time (`labels[]`)
- **Y-Axis:** Tag groups (e.g., '1-RBC', '3-Liver', '5-Hormone')

**What it reveals that current charts don't:**
By sizing the dots based on the count or percentage of biomarkers _out of range_ within a specific tag group at a given timestamp, it immediately visualizes which physiological systems (tags) were struggling the most at any point in time, without having to inspect individual lines or scatters.

**Where it would live:**
New `src/layout/SystemOptimalityDotPlot.tsx`, rendered in the main view alongside or instead of the multi-line chart when an aggregate view is desired.

**Trigger / entry point:**
A new "System View" toggle in the main layout that switches from plotting individual biomarkers to aggregate tag performance.

---

**Proposal: Baseline Deviation Histogram**

**ECharts type:** `histogram` (via `echarts-stat`)

**Codebase citation:**
Uses `extra.range` parsed values from `src/processors/post/range.ts` and `nonInferredDataAtom` from `src/atom/dataAtom.ts`.

**Which existing data it uses:**
It calculates the distance of each measurement in `nonInferredDataAtom` from the exact center (median) of its defined `extra.range`. It aggregates these deviations across all timepoints for a single selected biomarker to show the distribution of deviations from the optimal baseline.

**Axes:**

- X-axis: Deviation from Optimal Center (e.g. standard units)
- Y-axis: Frequency count (number of measurements at that deviation)

**What it reveals that current charts don't:**
Instead of plotting time linearly, this visualizes the structural "skew" of a user's health. A bell curve centered at 0 means the user generally hovers right in the middle of the optimal range. A curve skewed heavily right or left shows a chronic physiological bias that timeline charts often obscure due to visual noise.

**Where it would live:**
New `src/layout/BaselineDeviationHistogram.tsx`.

**Trigger / entry point:**
A "Deviation Distribution" sub-tab in the Table Row Expansion UI, alongside the existing BoxplotChart.

---

**Proposal: Longitudinal Measurement Delta Bar Chart**

**ECharts type:** `bar` (waterfall / up-down colored bars)

**Codebase citation:**
Uses `values[]` (which contains `number[] | null`) from `BioMarker[1]` in `src/types/biomarker.ts` returned by `dataAtom`.

**Which existing data it uses:**
It calculates the step-to-step difference (delta) between consecutive valid measurements in `values[]` for a given biomarker.

**Axes:**

- X-axis: Time (dates from `labels[]`)
- Y-axis: Measurement Delta (e.g., +15 mg/dL, -5 mg/dL)

**What it reveals that current charts don't:**
While the line and scatter charts show absolute values, they make it hard to spot rate-of-change volatility. A delta bar chart instantly highlights the magnitude and direction of changes between tests (e.g., "my cholesterol dropped sharply, but then rebounded equally sharply"). This helps evaluate the immediate impact of short-term interventions between specific test dates.

**Where it would live:**
New `src/layout/DeltaBarChart.tsx`.

**Trigger / entry point:**
A "Show Change Velocity" toggle inside the expanded Table row next to the existing `LineChart`.

---

**Proposal: Unified Z-Score Fluctuation Line Chart**

**ECharts type:** `line`

**Codebase citation:**
Uses `BioMarker[1]` (values array) from `nonInferredDataAtom`.

**Which existing data it uses:**
Computes the historical mean and standard deviation for each selected biomarker's `values[]`, then transforms each non-null measurement into a Z-score `(value - mean) / stdDev`.

**Axes:**

- X-axis: Time (dates from `labels[]`)
- Y-axis: Standard Deviations from Mean (Z-score, typically -3 to +3).

**What it reveals that current charts don't:**
The current `Chart.tsx` and `ScatterChart.tsx` suffer from visual clutter when plotting 3+ biomarkers because each requires its own independent Y-axis (creating 4+ axes on screen). By normalizing all biomarkers to a unified Z-score, this chart can plot 10+ biomarkers on a single Y-axis, instantly revealing which biomarker experienced the most extreme relative deviation at any point in time, without axis scaling confusion.

**Where it would live:**
New `src/layout/ZScoreLineChart.tsx`.

**Trigger / entry point:**
A "Normalize Scales (Z-Score)" toggle switch within the existing multi-selection `Chart.tsx` view.

---

**Proposal: Longitudinal Rank-Percentile Area Chart**

**ECharts type:** `line` (with `areaStyle`)

**Codebase citation:**
Uses `rankedDataMapAtom` from `src/atom/dataAtom.ts`.

**Which existing data it uses:**
Reads the `Float64Array` rank values from `rankedDataMapAtom` for selected biomarkers. It converts the absolute rank into a rank-percentile (0% to 100%) based on the number of non-null measurements for that marker.

**Axes:**

- X-axis: Time (dates from `labels[]`)
- Y-axis: Rank Percentile (0 to 100)

**What it reveals that current charts don't:**
Raw measurements can be noisy or trend linearly due to aging. By plotting the _rank percentile_ over time, the user can see if a biomarker is consistently staying in their personal "top quartile" (e.g., historically high) or if a recent reading represents a sudden drop to their personal "bottom quartile", regardless of the absolute unit or normal reference range. This personalizes the baseline comparison.

**Where it would live:**
New `src/layout/RankPercentileChart.tsx`.

**Trigger / entry point:**
A "View Personal Rank History" toggle in the single-biomarker detail modal, swapping the raw value `LineChart` for this rank-based view.


---

**Proposal: Correlation vs P-Value Volcano Plot**

**ECharts type:** `scatter`

**Codebase citation:**
Uses `correlations` parameter mapped to the array of `[string, number, number]` (Biomarker Name, Coefficient, P-Value) from `src/layout/CorrelationPolarScatter.tsx` and significance threshold `correlationAlphaAtom` from `src/atom/correlationAtom.ts`.

**Which existing data it uses:**
It reads the array of calculated correlation pairs (Target Biomarker against all others) generated by `Correlation.tsx`, plotting the correlation coefficient (`rho`) on the X-axis and the negative log10 of the p-value (`-log10(p)`) on the Y-axis. It utilizes `correlationAlphaAtom` to draw a horizontal `markLine` indicating the threshold of statistical significance.

**Axes:**

- X-axis: Correlation Coefficient (-1.0 to 1.0)
- Y-axis: -log10(p-value) (Significance)

**What it reveals that current charts don't:**
While the `CorrelationPolarScatter` shows both magnitude and p-value in a polar format, a Volcano Plot is the gold-standard scientific visualization for rapidly isolating the most statistically meaningful and strongest relationships. It immediately separates random noise (low significance, bottom center) from highly actionable, robust physiological couplings (top left/right corners).

**Where it would live:**
New `src/layout/CorrelationVolcanoPlot.tsx`.

**Trigger / entry point:**
A "Volcano View" toggle inside the Correlation modal (`Correlation.tsx`), acting as an alternative to the Polar Scatter layout.

---

**Proposal: Rolling Correlation Decay Line Chart**

**ECharts type:** `line`

**Codebase citation:**
Uses `rankedDataMapAtom` from `src/atom/dataAtom.ts` and `correlationMethodAtom` (Spearman vs Pearson) from `src/atom/correlationAtom.ts`.

**Which existing data it uses:**
Instead of calculating a single correlation coefficient over the entire timeline `labels[]`, it slices the historical data into rolling windows (e.g., 6-month blocks). For two selected biomarkers, it computes the correlation coefficient within each rolling window and plots the resulting series of coefficients over time.

**Axes:**

- X-axis: Time (the center date of each rolling window, derived from `labels[]`)
- Y-axis: Correlation Coefficient (e.g., -1.0 to 1.0)

**What it reveals that current charts don't:**
The existing `Chart2.tsx` (Scatter) and `CorrelationChordDiagram` only show static, all-time average relationships. The Rolling Correlation Decay chart reveals whether a relationship is strengthening or breaking down over time. For example, it could show that Glucose and Insulin were highly coupled five years ago (rho=0.8), but the relationship has recently decoupled (rho=0.2), which is a key indicator of emerging insulin resistance that static averages completely mask.

**Where it would live:**
New `src/layout/RollingCorrelationChart.tsx`.

**Trigger / entry point:**
A "View Temporal Stability" action button in the Correlation modal when exactly two biomarkers are selected or when inspecting a specific edge in the Chord Diagram.

---

**Proposal: System Resilience Reversion Funnel**

**ECharts type:** `funnel`

**Codebase citation:**
Uses `extra.tag[]` assigned by `src/processors/post/tag.ts` and `extra.optimality[]` pre-computed by `src/processors/post/range.ts`.

**Which existing data it uses:**
For a specific user-selected tag group (e.g., `2-Metabolic`), it calculates the conversion rate through four stages using data from `dataAtom`:

1. Total valid measurements across all biomarkers in the tag group.
2. Measurements that fell out-of-range (`extra.optimality[] === true`).
3. Out-of-range measurements that successfully recovered to optimal on the _very next_ test date (evaluating the next non-null index in `values[]`).
4. Out-of-range measurements that remained chronic (did not recover on the next test).

**What it reveals that current charts don't:**
Quantifies systemic biological resilience. Rather than just showing the static historical number of anomalies (like a bar chart), this funnel visualizes the _recovery bounce-back rate_. A steep funnel indicates a highly resilient system that corrects itself quickly, whereas a wide bottom indicates a system that is struggling to return to homeostasis once disturbed.

**Where it would live:**
New `src/layout/SystemResilienceFunnel.tsx`.

**Trigger / entry point:**
A "View System Resilience" sub-tab in the System Overview / Radar Chart dashboard area.

---

**Proposal: Biomarker Range Width vs Volatility Scatter**

**ECharts type:** `scatter`

**Codebase citation:**
Uses `extra.range` pre-computed by `src/processors/post/range.ts` and `values[]` arrays from `dataMapAtom` entries in `src/atom/dataAtom.ts`.

**Which existing data it uses:**
For each biomarker in `nonInferredDataAtom`, it parses `extra.range` (e.g. "3.9 - 6.4") to calculate the "Range Width" (e.g., 2.5). It then calculates the "Historical Volatility" of the biomarker by computing the standard deviation of its non-null `values[]` across all time points (`labels[]`).

**Axes:**

- X-axis: Optimal Range Width (Log scale, to handle tight vs wide ranges)
- Y-axis: Historical Volatility (Standard Deviation)

**What it reveals that current charts don't:**
Highlights biomarkers whose personal historical volatility exceeds their accepted optimal medical bounds. A biomarker sitting in the top-left quadrant (high volatility, narrow optimal range) is highly erratic and prone to frequent out-of-range warnings, whereas one in the bottom-right is stable within a wide buffer. This helps users differentiate between "noisy" markers and truly concerning shifts.

**Where it would live:**
New `src/layout/VolatilityMatrixScatter.tsx`.

**Trigger / entry point:**
A "Volatility vs Range Map" button in the Analyze dropdown menu.

---

**Proposal: Biomarker Volatility Polar Area Chart**

**ECharts type:** `pie` (with `roseType: 'area'`)

**Codebase citation:**
Uses `values[]` extracted from `nonInferredDataAtom` and `dataMapAtom` (from `src/atom/dataAtom.ts`).

**Which existing data it uses:**
Calculates the statistical standard deviation or coefficient of variation (volatility) for the raw `values[]` array of every measured biomarker across its entire timeline, excluding null gaps.

**Axes:**

- None (Polar coordinate system mapping value magnitude to sector radius).

**What it reveals that current charts don't:**
Rapidly exposes which biomarkers are the most unstable or erratic over time, contrasting them against those that remain tightly regulated by the body (homeostasis). While standard line charts show absolute values, this chart normalizes variance, allowing users to immediately spot unusually volatile markers that might indicate an underlying regulatory failure or extreme response to lifestyle interventions.

**Where it would live:**
New `src/layout/VolatilityPolarChart.tsx`.

**Trigger / entry point:**
A "Volatility Overview" button in the global dashboard header or Data Grid table header, complementing the existing system clustering and correlation overviews.
---


**Proposal: Alpha-Threshold Sensitivity Bar Chart**

**ECharts type:** `bar`

**Codebase citation:**
Uses `correlationAlphaAtom` from `src/atom/correlationAtom.ts` and global pairwise combinations from `dataMapAtom`.

**Which existing data it uses:**
Iterates through all possible pairwise biomarker correlations derived from `dataMapAtom` (excluding inferred data). It counts the total number of statistically significant correlations (edges) across three standard significance thresholds (Alpha = 0.10, 0.05, 0.01) rather than just a single active threshold.

**Axes:**

- X-axis: Significance Level (Alpha 0.10, 0.05, 0.01)
- Y-axis: Count of Significant Correlations

**What it reveals that current charts don't:**
The existing correlation tools (`Correlation.tsx` and Chord Diagram) only show results for the single globally selected `correlationAlphaAtom`. This bar chart provides a meta-analysis of the system's overall robustness. If the total number of significant correlations drops precipitously from Alpha 0.05 to Alpha 0.01, it reveals that most of the user's biomarker couplings are weak or borderline (potentially driven by noise), whereas a stable bar height across thresholds indicates deep, highly robust physiological linkage.

**Where it would live:**
New `src/layout/AlphaSensitivityBar.tsx`.

**Trigger / entry point:**
Displayed as a "Robustness Summary" widget above the main controls in the Correlation modal (`Correlation.tsx`).

---


**Proposal: Correlation Residuals vs. Time Scatter Plot**

**ECharts type:** `scatter` (with `markLine` at Y=0)

**Codebase citation:**
`ecStat.regression` transform output in `src/layout/Chart2.tsx`.

**Which existing data it uses:**
Utilizes the linear regression model generated by `ecStat.regression` in `Chart2.tsx` to calculate the mathematical residual (the vertical distance between the actual observed Y value and the predicted Y value on the regression line) for each timestamp in `formattedLabels`.

**Axes:**
X-axis: Time, Y-axis: Residual Value (distance from expected).

**What it reveals that current charts don't:**
Reveals whether a high correlation between two biomarkers is stable over time or if their relationship is fundamentally shifting. For example, if residuals consistently grow larger or shift from negative to positive over the years, it indicates the physiological coupling is breaking down, a nuance completely masked by a static scatter plot or a single R-value.

**Where it would live:**
New `src/layout/CorrelationResidualScatter.tsx`, rendered inside the Correlation Modal alongside `Chart2.tsx`.

**Trigger / entry point:**
A new "View Residuals Timeline" toggle button inside `Chart2.tsx` that appears when a regression model is successfully fitted.

---

**Proposal: Rank-Based Biomarker Cross-Correlation Heatmap**

**ECharts type:** `heatmap`

**Codebase citation:**
Uses `rankedDataMapAtom` from `src/atom/dataAtom.ts` (which caches Spearman rank calculations for each biomarker name) and `correlationMethodAtom` from `src/atom/correlationAtom.ts`.

**Which existing data it uses:**
It utilizes the pre-computed arrays within `rankedDataMapAtom` to generate a correlation matrix between all biomarkers within a selected tag group (via `tagAtom`). When `correlationMethodAtom` is set to 'spearman', it instantly computes pairwise correlation coefficients using the already-ranked arrays, avoiding costly recalculations on every matrix cell.

**Axes:**
- X-axis: Biomarker Names (from `tagAtom` members)
- Y-axis: Biomarker Names (from `tagAtom` members)
- Color/Value: Correlation Coefficient (-1.0 to 1.0)

**What it reveals that current charts don't:**
While the existing Chord Diagram shows relationships, it only displays links that pass the significance threshold, making it a sparse representation. A correlation heatmap provides a dense, continuous overview of how every biomarker in a system (e.g., all lipids in `4-Lipid`) relates to one another, instantly revealing blocks of highly co-regulated markers versus independent outliers within the same biological category.

**Where it would live:**
New `src/layout/SystemCorrelationHeatmap.tsx`.

**Trigger / entry point:**
A "View System Correlation Matrix" button in the System Overview pane when a specific `tagAtom` is active.

---

**Proposal: Systemic Anomaly Scatter Matrix**

**ECharts type:** `scatter` (Scatter Plot Matrix / SPLOM)

**Codebase citation:**
Uses `extra.optimality[]` from `src/processors/post/range.ts` combined with `1-RBC` to `9-Mineral` from `src/processors/post/tag.ts`.

**Which existing data it uses:**
It maps out out-of-range rates for all biological systems simultaneously by aggregating the boolean out-of-range arrays (`extra.optimality[]`) within each tag group returned by `visibleDataAtom`.

**Axes**
- X-axis: Time (`formattedLabels`)
- Y-axis: Biomarker count currently out of range.
- Grid: Multiple scatter plots in a grid format, one for each tag group (e.g., Liver, Kidney).

**What it reveals that current charts don't:**
The existing dashboard provides correlation heatmaps between single biomarkers. This matrix aggregates the anomalies per physiological system to reveal which systems are failing simultaneously or sequentially, identifying cascading health deteriorations (e.g., Metabolic strain preceding Liver strain) over time that a 1-to-1 correlation chart cannot capture.

**Where it would live:**
New `src/layout/SystemicAnomalyScatterMatrix.tsx`.

**Trigger / entry point:**
A new "Systemic Health Map" button within the main control nav header.

---

**Proposal: Rank-Based Biomarker Cross-Correlation Heatmap**

**ECharts type:** `heatmap`

**Codebase citation:**
Uses `rankedDataMapAtom` from `src/atom/dataAtom.ts` (which caches Spearman rank calculations for each biomarker name) and `correlationMethodAtom` from `src/atom/correlationAtom.ts`.

**Which existing data it uses:**
It utilizes the pre-computed arrays within `rankedDataMapAtom` to generate a correlation matrix between all biomarkers within a selected tag group (via `tagAtom`). When `correlationMethodAtom` is set to 'spearman', it instantly computes pairwise correlation coefficients using the already-ranked arrays, avoiding costly recalculations on every matrix cell.

**Axes:**
- X-axis: Biomarker Names (from `tagAtom` members)
- Y-axis: Biomarker Names (from `tagAtom` members)
- Color/Value: Correlation Coefficient (-1.0 to 1.0)

**What it reveals that current charts don't:**
While the existing Chord Diagram shows relationships, it only displays links that pass the significance threshold, making it a sparse representation. A correlation heatmap provides a dense, continuous overview of how every biomarker in a system (e.g., all lipids in `4-Lipid`) relates to one another, instantly revealing blocks of highly co-regulated markers versus independent outliers within the same biological category.

**Where it would live:**
New `src/layout/SystemCorrelationHeatmap.tsx`.

**Trigger / entry point:**
A "View System Correlation Matrix" button in the System Overview pane when a specific `tagAtom` is active.

---

**Proposal: Longitudinal Optimality Streak Bar Chart**

**ECharts type:** `bar`

**Codebase citation:**
Uses `extra.optimality[]` pre-computed by `src/processors/post/range.ts` for all biomarkers in `dataAtom`.

**Which existing data it uses:**
For a given biomarker selected via the UI, it iterates through its chronological `extra.optimality[]` boolean array. It calculates the duration of consecutive "true" (out-of-range) streaks versus "false" (in-range) streaks, plotting these continuous durations as alternating positive and negative bars over time.

**Axes:**
- X-axis: Streak Start Date (from `formattedLabels`)
- Y-axis: Duration of Streak (in days, positive for optimal, negative for out-of-range)

**What it reveals that current charts don't:**
Standard line charts and scatter plots show point-in-time optimality, but they don't explicitly visualize the *persistence* of a health state. This chart immediately answers "How long have I kept this biomarker in check before a relapse?" by converting raw point anomalies into continuous state durations, highlighting improving or degrading stability over the long term.

**Where it would live:**
New `src/layout/OptimalityStreakChart.tsx`.

**Trigger / entry point:**
Displayed as a "Robustness Summary" widget above the main controls in the Correlation modal (`Correlation.tsx`).


**Proposal: Strict-Range Volatility vs Standard-Range Adherence Matrix**

**ECharts type:** `heatmap`

**Codebase citation:**
Uses `extra.range` and `strictRange` overrides defined in `src/processors/post/range.ts` combined with raw `values[]` via `dataMapAtom` (in `src/atom/dataAtom.ts`).

**Which existing data it uses:**
It compares the time-series measurements for any biomarker that possesses a strict range override (e.g., Glucose: standard [3.9, 6.4] vs strict [3.9, 4.7]). For each such marker in `visibleDataAtom`, it calculates the frequency at which the value is within the standard boundaries but fails the stricter optimally tight boundaries.

**Axes:**
- X-axis: Time (e.g., Year/Quarter groupings of `formattedLabels`)
- Y-axis: Biomarker Names (filtered for those possessing `strictRange` limits)
- Color/Value: Frequency (Percentage) of "borderline" measurements (passing standard, failing strict).

**What it reveals that current charts don't:**
The existing dashboard treats "out of range" as a binary condition based on the default bounds (`extra.optimality[]`). This matrix reveals sub-clinical drift—periods where a system (like metabolic markers) technically looks "normal" to standard tests, but is highly volatile when judged against strict longevity/optimal targets.

**Where it would live:**
New `src/layout/SubClinicalDriftHeatmap.tsx`.

**Trigger / entry point:**
A new "View Strict Adherence" toggle when viewing the Data Grid.

---

**Proposal: Biomarker Inferred-Origin Stale Measurement Density**

**ECharts type:** `calendar`

**Codebase citation:**
Uses `hasOrigin` and `originValues` from `src/types/biomarker.ts`, populated by computed/inferred processors.

**Which existing data it uses:**
Analyzes the `originValues` array for biomarkers where `inferred: true` and `hasOrigin === true`. It identifies time points (`formattedLabels`) where the inferred calculation heavily relies on interpolated, null, or excessively lagged base measurements rather than fresh data.

**Axes:**
- X-axis: Time (Calendar Year layout matching `formattedLabels` range)
- Y-axis: Day of Week
- Color/Value: Stale/Missing Data Score for inferred combinations on that day.

**What it reveals that current charts don't:**
Currently, users view inferred metrics (e.g., PhenoAge) on a line chart as if they are perfectly continuous. This calendar chart reveals the *confidence* of those calculated metrics, instantly showing periods where the underlying multi-biomarker panel was incomplete, warning the user that the inferred peak/valley might be a data artifact rather than a true physiological shift.

**Where it would live:**
New `src/layout/InferredConfidenceCalendar.tsx`.

**Trigger / entry point:**
A "View Data Confidence" button next to any inferred metric line chart.

---

**Proposal: System-Wide Correlation Distribution Histogram**

**ECharts type:** `bar` (with `echarts-stat` histogram transform)

**Codebase citation:**
Uses `rankedDataMapAtom` from `src/atom/dataAtom.ts` (which caches Spearman rank calculations for each biomarker name) and `correlationMethodAtom` from `src/atom/correlationAtom.ts`.

**Which existing data it uses:**
Computes the entire matrix of pairwise correlation coefficients (rho) for all `nonInferredDataAtom` pairs. It uses `echarts-stat` to transform these coefficients into a 1D histogram.

**Axes:**
- X-axis: Correlation coefficient bins (-1.0 to 1.0)
- Y-axis: Frequency/count of biomarker pairs in that bin.

**What it reveals that current charts don't:**
Shows the macroscopic coupling state of the biology. A normal healthy system might have a normal distribution centered at 0. A stressed or aging system might show a bimodal distribution with many highly positive or negative correlations, indicating systemic lock-in or collapse across systems.

**Where it would live:**
New `src/layout/SystemCouplingHistogram.tsx`.

**Trigger / entry point:**
A "View System Rigidity" button in the Correlation Modal.

---

**Proposal: Network Density vs. Significance Alpha Line Chart**

**ECharts type:** `line`

**Codebase citation:**
Uses `correlationAlphaAtom` from `src/atom/correlationAtom.ts` and `nonInferredDataAtom` from `src/atom/dataAtom.ts`.

**Which existing data it uses:**
Iterates over a range of hypothetical alpha values (e.g., 0.01 to 0.10). At each step, it calculates how many pairwise correlations in `nonInferredDataAtom` pass the threshold (i.e. the count of edges where `p < alpha`).

**Axes:**
- X-axis: Alpha threshold (0.01 to 0.10)
- Y-axis: Count of significant edges (Network Density)

**What it reveals that current charts don't:**
Shows how "fragile" the correlation network is. If the edge count collapses drastically at alpha 0.04, it means most observed correlations are borderline and possibly noisy. A robust biological network will have a stable plateau, proving strong interactions.

**Where it would live:**
New `src/layout/NetworkSensitivityLineChart.tsx`.

**Trigger / entry point:**
A "Test Network Robustness" icon near the Alpha slider in the Correlation settings.
**Proposal: Longitudinal Tag Group Rank Correlation Network**

**ECharts type:** `graph` (Graph/Network Chart)

**Codebase citation:**
Uses `rankedDataMapAtom` from `src/atom/dataAtom.ts` and tag groups defined in `src/processors/post/tag.ts`.

**Which existing data it uses:**
It utilizes the pre-computed, zero-copy `Float64Array` buffers in `rankedDataMapAtom` for a selected physiological system (e.g., all markers in the `3-Liver` tag group). By computing pairwise Spearman rank correlations between all active biomarkers within that tag group over time, it generates a network layout where nodes are biomarkers and edge weights (line thickness/color) represent the strength of their correlation.

**Axes:**
- Nodes: Biomarkers within a specific tag group
- Edges: Correlation strength (from `rankedDataMapAtom`)

**What it reveals that current charts don't:**
Current charts (like the 1-to-1 scatter or linear correlation heatmaps) only examine two biomarkers at a time, making it hard to see the broader "shape" of a system's failure or recovery. A network graph instantly reveals "hub" biomarkers (those strongly linked to many others within the same tag group) versus isolated markers, helping users pinpoint the most central driver of a systemic imbalance.

**Where it would live:**
New `src/layout/SystemRankCorrelationNetwork.tsx`.

**Trigger / entry point:**
A "View System Network" toggle button inside the Tag Overview panel when a specific tag (like `4-Lipid`) is active.

---

**Proposal: Biomarker Optimality Cross-Correlation Heatmap**

**ECharts type:** `heatmap`

**Codebase citation:**
Uses `extra.optimality[]` pre-computed by `src/processors/post/range.ts` and `correlationAlphaAtom` from `src/atom/correlationAtom.ts`.

**Which existing data it uses:**
Instead of correlating raw values or ranks, it correlates the boolean `extra.optimality[]` arrays across all active biomarkers in `dataAtom.ts`. For each pair, it calculates a binary similarity metric (e.g., Jaccard index or phi coefficient) to determine how frequently the two biomarkers go *out of range* simultaneously, applying the significance threshold from `correlationAlphaAtom`.

**Axes:**
- X-axis: Biomarker Names (from `visibleDataAtom`)
- Y-axis: Biomarker Names (from `visibleDataAtom`)
- Color/Value: Optimality Correlation Score (0 to 1)

**What it reveals that current charts don't:**
The existing dashboard focuses heavily on whether two biomarkers move up or down together (Spearman/Pearson on raw values). However, a patient might have two biomarkers that move independently most of the time but *fail* (cross their clinical thresholds) together during periods of high stress. This heatmap specifically highlights *coupled failures*, revealing hidden clinical co-morbidities that value-based correlations mask.

**Where it would live:**
New `src/layout/OptimalityCorrelationHeatmap.tsx`.

**Trigger / entry point:**
A "Data QA / Integrity View" toggle in the Data Grid header, allowing users to verify the trustworthiness of their compiled record before analyzing correlations.

---


**Proposal: Tag-Group Homeostatic Resilience Heatmap**

**ECharts type:** `heatmap`

**Codebase citation:**
Uses `tagAtom` from `src/atom/dataAtom.ts` (currently active tag filter), and `extra.optimality[]` generated by `src/processors/post/range.ts`.

**Which existing data it uses:**
It filters the `dataAtom` by the active `tagAtom` (e.g., `3-Liver`). For each timepoint in `labels[]`, it calculates the percentage of biomarkers within that tag group that are out of bounds (where `optimality[i] === true`).

**Axes**
- X-axis: Time (`formattedLabels`)
- Y-axis: Tag Group (or sub-categories if aggregating multiple tags)
- Color: Percentage of biomarkers out-of-range (e.g., green for 0%, red for 100%).

**What it reveals that current charts don't:**
The current `RadarChart.tsx` only shows a single snapshot in time. This heatmap would show the *longitudinal resilience* of an entire physiological system (like Liver or Metabolic) simultaneously, revealing systemic cascading failures over months/years rather than just individual biomarker anomalies.

**Where it would live:**
New `src/layout/SystemResilienceHeatmap.tsx`.

**Trigger / entry point:**
A "View System Resilience History" button inside the Tag Overview panel, using the currently selected tag from `tagAtom`.

---

**Proposal: Missing Data Imputation Confidence Overlay**

**ECharts type:** `line` (with `markArea` for confidence intervals)

**Codebase citation:**
Uses the null values natively present within `BioMarker[1]` (the time-series values array) from `dataAtom.ts` and the `extra.inferred` boolean.

**Which existing data it uses:**
When an inferred biomarker (e.g., HOMA-IR) is calculated, its underlying origin values (Glucose, Insulin) might have gaps (`null` values) requiring imputation or skipping. This chart graphs the inferred value but overlays a semi-transparent `markArea` or shaded confidence band that widens on dates where more source values were `null`.

**Axes**
- X-axis: Time (`formattedLabels`)
- Y-axis: Inferred Biomarker Value (e.g., HOMA-IR)
- MarkArea/Band: Imputation Confidence (inversely proportional to the number of missing source measurements on that date).

**What it reveals that current charts don't:**
Current line charts either skip nulls or connect them, treating all plotted points with equal confidence. This overlay visualizes the *uncertainty* of computed metrics. A user might see a sudden spike in HOMA-IR, but the confidence overlay would reveal that 2 out of 3 underlying variables were missing that month, indicating the spike is likely an artifact rather than a true physiological shift.

**Where it would live:**
New `src/layout/InferredConfidenceLineChart.tsx`.

**Trigger / entry point:**
An "Overlay Confidence" toggle button next to the standard LineChart for any biomarker where `extra.inferred === true`.

---

**Proposal: Data-Driven Hierarchical Cluster Dendrogram**

**ECharts type:** `tree` (Orthogonal / Radial Dendrogram)

**Codebase citation:**
Uses pairwise correlation output stored in `correlationAtom.ts` and active biomarkers from `dataAtom.ts`.

**Which existing data it uses:**
It applies hierarchical agglomerative clustering on the full distance matrix derived from `correlationAtom` (e.g., converting correlation scores into distance metrics). It consumes the names and properties of biomarkers from `visibleDataAtom`.

**Axes**
- Nodes represent individual biomarkers.
- Branch lengths / hierarchy depth represent the correlation distance between clusters.

**What it reveals that current charts don't:**
Current visualizations group biomarkers by strict predefined medical tags (like `3-Liver` or `4-Lipid`). A dendrogram automatically discovers hidden, patient-specific physiological groupings based purely on how the data behaves longitudinally. It might reveal that a specific metabolic marker and a hormone marker cluster tightly together in this specific patient, suggesting a novel physiological linkage that traditional categorization obscures.

**Where it would live:**
New `src/layout/DataDrivenClusterTree.tsx`.

**Trigger / entry point:**
A "Discover Hidden Clusters" toggle in the Analyze menu, replacing the standard predefined tag-based correlation views.

---

**Proposal: Biomarker Velocity (First Derivative) Bar Chart**

**ECharts type:** `bar`

**Codebase citation:**
Uses `labels[]` (time) from `src/data/index.ts` and the `values[]` array inside the `BioMarker` tuple defined in `src/types/biomarker.ts`.

**Which existing data it uses:**
It calculates the rate of change (first derivative: Δvalue / Δtime) between consecutive non-null measurements for a single selected biomarker from `dataMapAtom`.

**Axes**
- X-axis: Time (`formattedLabels`) corresponding to the midpoint between measurements.
- Y-axis: Rate of Change (e.g., Value per Month).
- Bars: Positive bars indicate an accelerating rising trend, negative bars indicate a falling trend.

**What it reveals that current charts don't:**
Current line and scatter charts focus entirely on absolute values relative to static optimal ranges. A biomarker might still technically be within the "safe" range, but a massive positive velocity bar indicates a dangerous momentum or trajectory. This visualization highlights physiological *momentum* rather than state, allowing users to take preventative action before an anomaly actually occurs.

**Where it would live:**
New `src/layout/BiomarkerVelocityChart.tsx`.

**Trigger / entry point:**
A "View Momentum" toggle rendered above the standard `LineChart` inside the individual biomarker drill-down modal (Table Row Expansion).
**Proposal: Initial Anomaly Onset EffectScatter**

**ECharts type:** `effectScatter`

**Codebase citation:**
Uses `extra.optimality[]` pre-computed by `src/processors/post/range.ts` which is index-aligned with `BioMarker[1]`.

**Which existing data it uses:**
Scans the current list of biomarkers returned by `visibleDataAtom` to find the earliest chronological index where `optimality[i] === true` for each biomarker. Plots these specific onset points.

**Axes:**
- X-axis: Time (`labels[]` from `src/data/index.ts`)
- Y-axis: Categorical axis of biomarker names

**What it reveals that current charts don't:**
Uses ECharts' animated `effectScatter` ripple to draw visual attention exclusively to the exact chronological moment a biomarker first deviated from its optimal range. Instead of clustering thousands of data points on lines or scatters, it isolates the *onset timeline*, helping users precisely pinpoint when a chronic physiological issue originally started.

**Where it would live:**
New `src/layout/AnomalyOnsetTimeline.tsx`.

**Trigger / entry point:**
A new "Onset Timeline" tab near the main table view that focuses purely on tracking the chronological emergence of health issues across the active `visibleDataAtom` dataset.

---

**Proposal: Correlation Alternative Hypothesis Split-Bar Chart**

**ECharts type:** `bar` (grouped)

**Codebase citation:**
Uses `correlationAlternativeAtom` (values `'two-sided' | 'less' | 'greater'`) and `correlationMethodAtom` from `src/atom/correlationAtom.ts`.

**Which existing data it uses:**
When performing statistical correlation across the `dataMapAtom` for exactly two selected biomarkers, it programmatically computes all three hypothesis alternatives (`less`, `greater`, `two-sided`) simultaneously using the method defined in `correlationMethodAtom`, mapping the resulting p-values or test statistics into a grouped bar layout.

**Axes:**
- X-axis: Categorical hypothesis type (`less`, `greater`, `two-sided`)
- Y-axis: P-Value magnitude (or test statistic strength)

**What it reveals that current charts don't:**
Currently, users must manually toggle the `correlationAlternativeAtom` dropdown and remember previous values to compare directional significance. This chart visualizes the significance of positive correlation vs negative correlation side-by-side, immediately revealing asymmetric directional strength (e.g., proving that one biomarker only drives the other *down*, but not *up*).

**Where it would live:**
New `src/layout/CorrelationDirectionalityBar.tsx`.

**Trigger / entry point:**
Rendered inside the existing `Analyze` (Correlation) panel when exactly two biomarkers are selected, replacing the manual alternative hypothesis dropdown with an instant visual comparison.

---

---

**Proposal: Biomarker Strict-Range Deviation Waterfall**

**ECharts type:** `bar` (with `stack` for waterfall effect)

**Codebase citation:**
`strictRange` object vs standard `range` in `src/processors/post/range.ts`.

**Which existing data it uses:**
Iterates through `dataAtom`, identifying biomarkers that possess both a standard `range` and a `strictRange` override. It extracts the lower/upper bounds of both and calculates the magnitude of the "buffer zone" (the difference between the clinical norm and the stricter anti-aging target).

**Axes**
X-axis: Biomarker names (filtered to those with dual ranges).
Y-axis: Normalized value margin (representing the boundaries and the gap).

**What it reveals that current charts don't:**
Visually quantifies the "buffer zone" eliminated by strict criteria, helping users immediately understand how much more aggressive their optimality targets are compared to clinical norms. Current charts only show static string labels or shaded bands independently.

**Where it would live:**
New `src/layout/StrictRangeWaterfall.tsx`, rendered within the range analysis section.

**Trigger / entry point:**
A new "Range Adherence" toggle when viewing biomarkers with defined strict ranges.

---

**Proposal: Spearman-Pearson Divergence Scatter Plot**

**ECharts type:** `scatter`

**Codebase citation:**
`correlationMethodAtom` from `src/atom/correlationAtom.ts` and `rankedDataMapAtom` from `src/atom/dataAtom.ts`.

**Which existing data it uses:**
For every pair of biomarkers in `nonInferredDataAtom`, calculates both the Pearson (linear) and Spearman (rank-based) correlation coefficients.

**Axes**
X-axis: Pearson correlation coefficient (-1 to 1).
Y-axis: Spearman correlation coefficient (-1 to 1).

**What it reveals that current charts don't:**
Points that deviate significantly from the `y = x` diagonal indicate highly non-linear but monotonic relationships (where Spearman is high but Pearson is low). This exposes hidden biological links that standard linear regression misses entirely.

**Where it would live:**
New `src/layout/CorrelationDivergenceScatter.tsx`.

**Trigger / entry point:**
A new "Non-Linearity Analysis" button within the correlation modal.
