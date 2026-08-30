

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

**Proposal: Biomarker Recovery Velocity Line Chart**

**ECharts type:** `line`

**Codebase citation:**
Uses `BioMarker[1]` (values array) and `labels` array from `src/data/index.ts`.

**Which existing data it uses:**
Reads the values array of a target `BioMarker` from `dataAtom.ts` and calculates the first derivative (the numerical delta between consecutive measurements divided by the time gap between `labels`).

**Axes:**
X-axis: Time (dates from `labels`).
Y-axis: Value delta (rate of change, e.g., "mg/dL per day").

**What it reveals that current charts don't:**
Shows not just the absolute level of a biomarker, but the *velocity* of physiological improvement or deterioration between tests (e.g., whether a rapidly worsening trend is accelerating or slowing down).

**Where it would live:**
New `src/layout/RecoveryVelocityLineChart.tsx`, embedded within the Table Row Expansion (Data Grid) alongside the existing `LineChart` and `BoxplotChart`.

**Trigger / entry point:**
A toggle button in the Table Row Expansion UI allowing users to switch between "Absolute Values" (existing LineChart) and "Rate of Change" (Velocity Line Chart).

---

**Proposal: Tag-Group Correlation Heatmap Matrix**

**ECharts type:** `heatmap`

**Codebase citation:**
Uses `extra.tag[]` system classifications from `src/processors/post/tag.ts` and `correlationMethodAtom` (Spearman/Pearson) from `src/atom/correlationAtom.ts`.

**Which existing data it uses:**
Rather than computing pairwise correlations between individual biomarkers, this aggregates all markers within a specific tag (e.g., `1-RBC`, `4-Lipid`, `3-Liver`) and computes the average inter-tag correlation strength across the entire dataset. It leverages `nonInferredDataAtom` and the existing `calculateSpearman` or `calculatePearson` functions.

**Axes:**
- X-axis: System Tags (`1-RBC`, `2-Metabolic`, etc.)
- Y-axis: System Tags (same as X-axis)

**What it reveals that current charts don't:**
The current `CorrelationChordDiagram` and `CorrelationPolarScatter` map individual markers, often leading to visual overload ("hairballs"). This matrix provides a macro-level view of how major physiological systems interact—for example, instantly showing if a user's Liver system (`3-Liver`) is tightly coupled to their Metabolic system (`2-Metabolic`), which could indicate a specific metabolic phenotype like NAFLD, without getting lost in the noise of 80 individual marker correlations.

**Where it would live:**
New `src/layout/SystemCorrelationHeatmap.tsx`.

**Trigger / entry point:**
A "System Interactions" toggle button in the main Correlation Analysis modal.

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
The current `CorrelationChordDiagram` and `Chart2.tsx` only show correlation under a single selected mathematical lens. This heatmap specifically highlights pairs with a *large difference* between Pearson and Spearman scores. A high Spearman but low Pearson score strongly implies a non-linear but consistent physiological relationship (e.g., exponential or logarithmic response), guiding the user to investigate the *shape* of the relationship rather than assuming a straight line.

**Where it would live:**
New `src/layout/CorrelationDeltaHeatmap.tsx`.

**Trigger / entry point:**
A "Detect Non-Linearity" button within the existing Correlation Analysis view.
**Proposal: Longitudinal Origin Reversion Funnel**

**ECharts type:** `funnel`

**Codebase citation:**
Uses the `inferred` boolean and `originValues` from `BioMarker[3]` as well as values from `nonInferredDataAtom`.

**Which existing data it uses:**
This chart groups biomarkers based on whether they are directly measured or `inferred` (e.g. calculated ratios). It traces a step-by-step reduction of "out of bounds" inferred metrics back to their root origin biomarkers. For instance, if an inferred marker like LDL/HDL ratio is out of range, it maps down to the underlying `originValues` (LDL and HDL) to show where the deviation stems from.

**Axes:**
No standard X/Y axes. The stages of the funnel represent:
- Total Inferred Biomarkers
- Out-of-Range Inferred Biomarkers
- Out-of-Range Origin Biomarkers (the root cause)

**What it reveals that current charts don't:**
It helps identify systemic "root causes." While current charts show if a complex, inferred metric (like Phenotypic Age or an Atherogenic Index) is worsening, this funnel reveals whether the deterioration is driven by a single origin marker going wildly out of range, or a subtle compounding of multiple markers simultaneously shifting.

**Where it would live:**
New `src/layout/OriginReversionFunnel.tsx`.

**Trigger / entry point:**
A sub-tab under a "System Diagnostics" modal that analyzes inferred age/risk scores.

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

**Proposal: Biomarker-to-Tag Outlier Ratio Line Chart**

**ECharts type:** `line`

**Codebase citation:**
Uses `extra.optimality[]` from `src/processors/post/range.ts` and `extra.tag[]` from `src/processors/post/tag.ts`.

**Which existing data it uses:**
For a specific user-selected biomarker in `dataAtom.ts`, it retrieves the biomarker's primary tag group (e.g., `2-Metabolic`). It then calculates the average anomaly rate (percentage of `extra.optimality[] === true`) of all *other* biomarkers within that tag group across all timestamps.

**Axes:**
- X-axis: Time (dates from `labels[]`).
- Y-axis (Left, Value): Target biomarker absolute measurement value.
- Y-axis (Right, Percentage): Tag-group average anomaly rate (0% - 100%).

**What it reveals that current charts don't:**
Provides systemic context for individual biomarker failures. It instantly reveals whether a worsening biomarker is an isolated anomaly (e.g., a one-off bad reading while the rest of the Metabolic system remains healthy) or if it is merely the symptom of a broader, systemic collapse across the entire tag group.

**Where it would live:**
New `src/layout/TagContextLineChart.tsx`.

**Trigger / entry point:**
A "System Context Overlay" toggle in the existing Table Row Expansion UI, rendering alongside the standard LineChart.

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
By sizing the dots based on the count or percentage of biomarkers *out of range* within a specific tag group at a given timestamp, it immediately visualizes which physiological systems (tags) were struggling the most at any point in time, without having to inspect individual lines or scatters.

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
Raw measurements can be noisy or trend linearly due to aging. By plotting the *rank percentile* over time, the user can see if a biomarker is consistently staying in their personal "top quartile" (e.g., historically high) or if a recent reading represents a sudden drop to their personal "bottom quartile", regardless of the absolute unit or normal reference range. This personalizes the baseline comparison.

**Where it would live:**
New `src/layout/RankPercentileChart.tsx`.

**Trigger / entry point:**
A "View Personal Rank History" toggle in the single-biomarker detail modal, swapping the raw value `LineChart` for this rank-based view.
**Proposal: Imminent Out-of-Range Warning Heatmap**

**ECharts type:** `heatmap`

**Codebase citation:**
Uses `extra.optimality[]` and `extra.range` (e.g. `'3.9 - 6.4'`) from `src/processors/post/range.ts` combined with data from `dataAtom`.

**Which existing data it uses:**
It parses the string in `extra.range` to extract the min/max thresholds. For the most recent values (`labels[]` slice), it computes how close a biomarker value is to its boundary. It uses the `optimality` boolean array to filter out markers that are *already* out of range, focusing only on those that are nominally "in range" but dangerously close to the limit (e.g., > 95% of the distance from the median to the boundary).

**Axes:**
- X-axis: Time (the most recent 3-5 measurements from `labels[]`).
- Y-axis: Biomarker Name (from `visibleDataAtom`).

**What it reveals that current charts don't:**
The current charts show what *has already broken* (values outside the shaded `markArea`). This heatmap acts as a predictive early-warning system. It reveals which physiological markers are rapidly degrading and about to cross into abnormal territory, allowing for preventative intervention *before* a clinical out-of-range flag is triggered.

**Where it would live:**
New `src/layout/ImminentWarningHeatmap.tsx`.

**Trigger / entry point:**
A "Predictive Warnings" widget on the main dashboard that appears automatically if any markers meet the >95% boundary proximity threshold.

---

**Proposal: Tag-Group Reversion-to-Mean Funnel**

**ECharts type:** `funnel`

**Codebase citation:**
Uses `extra.optimality[]` pre-computed by `src/processors/post/range.ts` combined with data from `dataAtom` and `labels[]`.

**Which existing data it uses:**
For a given tag group (e.g., `5-Hormone`), it counts total measurements across all its biomarkers. It tracks the number of times any marker falls out-of-range (`optimality[] === true`). Crucially, it then checks the *subsequent* valid measurement for that same marker to see if it reverted to optimal (`optimality[] === false`) or remained chronic.

**Axes:**
- No standard axes for Funnel.
- Stages: Total Measurements -> Out-of-Range Events -> Recovered on Next Test -> Chronic (Failed to Recover).

**What it reveals that current charts don't:**
Shows resilience and recovery momentum. A line chart only shows the trajectory; this funnel quantifies the user's biological bounce-back rate for a specific system. If 90% of out-of-range metabolic markers recover by the next test, the system is resilient. If only 10% recover, the system is chronically stuck.

**Where it would live:**
New `src/layout/SystemResilienceFunnel.tsx`.

**Trigger / entry point:**
A "View Resilience Metrics" action when hovering over or selecting a specific tag group in the main Tag Navigation bar.

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

**Proposal: Predictive Trend-to-Boundary Line Chart**

**ECharts type:** `line` (with `markArea` and `markLine`)

**Codebase citation:**
Uses `extra.range` from `src/processors/post/range.ts` and `ecStat.regression` from `echarts-stat`.

**Which existing data it uses:**
Extracts min/max boundaries from `extra.range`. Plots a single biomarker's historical values and extends a linear regression line into the future (extrapolating the X-axis) to predict when the value will intersect the boundary.

**Axes:**
- X-axis: Time (including future dates extrapolated from `labels[]`)
- Y-axis: Biomarker Value

**What it reveals that current charts don't:**
Provides a predictive timeline of when a degrading biomarker will officially cross into "abnormal" territory, allowing proactive intervention before it hits the critical limit.

**Where it would live:**
New `src/layout/PredictiveTrendChart.tsx`.

**Trigger / entry point:**
A "Predictive Trend" toggle on the single-biomarker `LineChart` view (e.g., inside the Table Row Expansion).

---
**Proposal: System Resilience Reversion Funnel**

**ECharts type:** `funnel`

**Codebase citation:**
Uses `extra.tag[]` assigned by `src/processors/post/tag.ts` and `extra.optimality[]` pre-computed by `src/processors/post/range.ts`.

**Which existing data it uses:**
For a specific user-selected tag group (e.g., `2-Metabolic`), it calculates the conversion rate through four stages using data from `dataAtom`:
1. Total valid measurements across all biomarkers in the tag group.
2. Measurements that fell out-of-range (`extra.optimality[] === true`).
3. Out-of-range measurements that successfully recovered to optimal on the *very next* test date (evaluating the next non-null index in `values[]`).
4. Out-of-range measurements that remained chronic (did not recover on the next test).

**What it reveals that current charts don't:**
Quantifies systemic biological resilience. Rather than just showing the static historical number of anomalies (like a bar chart), this funnel visualizes the *recovery bounce-back rate*. A steep funnel indicates a highly resilient system that corrects itself quickly, whereas a wide bottom indicates a system that is struggling to return to homeostasis once disturbed.

**Where it would live:**
New `src/layout/SystemResilienceFunnel.tsx`.

**Trigger / entry point:**
A "View System Resilience" sub-tab in the System Overview / Radar Chart dashboard area.

---

**Proposal: Measurement Cadence Overlay Chart**

**ECharts type:** `scatter` (or single-axis timeline)

**Codebase citation:**
Uses `labels[]` from `src/data/index.ts` and array lengths / null-gaps from `dataAtom`.

**Which existing data it uses:**
It aligns the non-null `values[]` counts for all biomarkers in `dataAtom` against the global timeline `labels[]` (format `YYMMDD`). The size or density of the scatter point represents the total number of distinct biomarkers tested on that specific date.

**Axes:**
- X-axis: Time (dates parsed from `labels[]`)
- Y-axis: Categorical testing intensity or single baseline.

**What it reveals that current charts don't:**
The existing timeline charts connect points with lines, masking the underlying testing habit. This cadence chart explicitly visualizes the user's testing density over time, exposing long gaps in medical tracking or highlighting clusters of intensive diagnostics (e.g., distinguishing between a user who tests 5 markers monthly vs one who tests 80 markers annually).

**Where it would live:**
New `src/layout/MeasurementCadenceTimeline.tsx`.

**Trigger / entry point:**
Displayed as a global "Data Density Map" widget in the top-level settings or data overview dashboard.

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

**Proposal: Correlation Lag Offset Line Chart**

**ECharts type:** `line`

**Codebase citation:**
Uses `labels[]` from `src/data/index.ts` and the `values[]` arrays extracted from entries in `dataMapAtom` (from `src/atom/dataAtom.ts`).

**Which existing data it uses:**
It utilizes the historical time-series arrays (`BioMarker[1]`) for two user-selected biomarkers, along with the `labels[]` array for the timeline. It offsets one biomarker's data series by a user-defined number of index steps (representing chronological measurements) to visually align shifted time horizons.

**Axes:**
- X-axis: Time (the shared `labels[]` dates)
- Y-axes: Dual Y-axes (one for each biomarker, properly scaled according to their respective units `BioMarker[2]`)

**What it reveals that current charts don't:**
The existing correlation scatter plot (`Chart2.tsx`) and standard line chart (`Chart.tsx`) only compare biomarkers at the *exact same point in time*. This lag-offset chart reveals *leading versus lagging* indicators. For example, it can visually demonstrate if a spike in Vitamin D levels today consistently precedes an increase in Calcium levels 30 days from now. Discovering these delayed physiological responses is impossible with statically aligned arrays.

**Where it would live:**
New `src/layout/CorrelationLagChart.tsx`.

**Trigger / entry point:**
A "Time-Shift" interactive slider inside the existing Biomarker Correlation modal (`BiomarkerCorrelation.tsx`) that dynamically applies a positive/negative index offset to the target biomarker's data series.

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
