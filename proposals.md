

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

**Proposal: PhenoAge Contribution Radar**

**ECharts type:** `radar`

**Codebase citation:**
Uses `tag.ts` (`a-PhenoAge` tags group) and `dataMapAtom` from `src/atom/dataAtom.ts`.

**Which existing data it uses:**
It pulls the current latest values for all biomarkers belonging to the `a-PhenoAge` tag group (Albumin, Glucose, Creatinin, MCV, RDW-CV, CRP-hs, % Lymphocyte, WBC, ALP, Age, etc.) from `dataMapAtom`.

**Axes:**
Each axis of the radar represents one of the PhenoAge components, with the min and max scaled based on the population or physiological ranges defined in `range.ts`.

**What it reveals that current charts don't:**
It provides a multi-dimensional "shape" of biological age. Instead of just seeing the final "Pheno age" number on a line chart, users can instantly see *which specific components* are pulling their biological age up (e.g., high CRP-hs vs low Albumin), revealing the underlying physiological drivers of their aging rate.

**Where it would live:**
New `src/layout/PhenoAgeContributionRadar.tsx`, potentially displayed in a dedicated Biological Age section or as an alternate view on the dashboard.

**Trigger / entry point:**
A toggle or dedicated section when the 'a-PhenoAge' category filter is selected.

---

**Proposal: Inferred vs Measured Value Distribution Boxplot**

**ECharts type:** `boxplot`

**Codebase citation:**
Uses `extra.inferred` flag from `src/types/biomarker.ts` and `nonInferredDataAtom` vs `dataAtom` from `src/atom/dataAtom.ts`.

**Which existing data it uses:**
It separates biomarkers into two groups: those that are directly measured (`extra.inferred` is falsy, i.e., `nonInferredDataAtom`) and those that are calculated/inferred (`extra.inferred === true`). It gathers the values of these two distinct populations.

**Axes:**
- X-axis: Two categories ("Directly Measured" vs "Inferred").
- Y-axis: Normalized value distribution (e.g., Z-score or coefficient of variation for each marker).

**What it reveals that current charts don't:**
It highlights the difference in variance and distribution between raw clinical measurements and algorithmically derived metrics. This can show if the inferred models are artificially smoothing out volatility or if they are amplifying noise from the underlying measurements, giving insight into the reliability of inferred health metrics.

**Where it would live:**
New `src/layout/InferredMeasuredBoxplot.tsx`, accessed via a data quality or statistical diagnostic view.

**Trigger / entry point:**
A "Data Quality Diagnostics" tab in the statistics or settings modal.

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

**Proposal: Multi-System Correlation Chord Diagram**

**ECharts type:** `graph` (with circular layout, mimicking a chord diagram)

**Codebase citation:**
Uses `extra.tag[]` assigned by `src/processors/post/tag.ts` and `correlationMapAtom` (or recomputed Spearman/Pearson from `values` array).

**Which existing data it uses:**
It computes the average correlation coefficient (or count of highly correlated edges) between different *system tags* (e.g., aggregating all correlations between `3-Liver` markers and `4-Lipid` markers) using the methods driven by `correlationMethodAtom`.

**What it reveals that current charts don't:**
Current correlation charts map individual markers, resulting in a dense hairball. This chord diagram provides a high-level view of inter-system dependencies—e.g. clearly showing if the Liver system is more tightly bound to the Metabolic system than to the Hormone system for a given user.

**Where it would live:**
New `src/layout/SystemCorrelationChord.tsx`.

**Trigger / entry point:**
A new "System-Level View" tab in the existing Correlation Analysis modal.

---

**Proposal: Biomarker Volatility Heatmap**

**ECharts type:** `heatmap`

**Codebase citation:**
Uses `extra.tag[]` from `src/processors/post/tag.ts` and overall `values` arrays from `dataAtom.ts`.

**Which existing data it uses:**
Calculates the historical volatility (e.g., standard deviation or coefficient of variation) for each measured biomarker in `nonInferredDataAtom`. The y-axis represents the individual biomarkers, grouped by their biological system tag (`extra.tag`), while the x-axis represents defined time blocks (e.g., quarterly or annual aggregations based on `labels`).

**Axes:**
- X-axis: Time (e.g., quarters or years derived from `labels`).
- Y-axis: Biomarkers, sorted and clustered by their `extra.tag` system.

**What it reveals that current charts don't:**
Reveals macroscopic trends in system instability over time. Users can quickly see if a specific biological system (e.g., all `4-Lipid` markers) is experiencing a period of high volatility simultaneously, indicating systemic stress, even if individual markers haven't fully crossed into abnormal ranges yet.

**Where it would live:**
New `src/layout/VolatilityHeatmap.tsx`, accessible from a System Overview or Diagnostics page.

**Trigger / entry point:**
A "Volatility Trends" toggle in the main Dashboard or a dedicated Diagnostics section.

---

**Proposal: Tag Optimality Radar**

**ECharts type:** `radar`

**Codebase citation:**
Uses `extra.tag[]` assigned by `src/processors/post/tag.ts` and the `extra.optimality[]` array from `src/processors/post/range.ts`.

**Which existing data it uses:**
Calculates an aggregated "optimality score" for each major system tag (e.g., `1-RBC`, `2-Metabolic`, `3-Liver`, etc.) at the most recent timestamp. The score is based on the percentage of biomarkers within that tag that have an `extra.optimality` value of `false` (i.e., they are within the optimal range).

**Axes:**
Each axis of the radar chart represents a different biological system tag (e.g., Metabolic, Liver, Hormone, Lipid). The scale ranges from 0% (all markers out of range) to 100% (all markers optimal).

**What it reveals that current charts don't:**
Provides an instant, holistic snapshot of overall systemic health at a given moment. Instead of scrolling through individual biomarkers or examining mathematically inferred ages, users see exactly which biological systems are currently underperforming or burdened compared to others.

**Where it would live:**
New `src/layout/TagOptimalityRadar.tsx`, displayed prominently on the main Dashboard.

**Trigger / entry point:**
Always visible on the top level Dashboard as the primary health snapshot summary.
**Proposal: Annual Seasonality Radial Bar Chart**

**ECharts type:** `bar` (with polar coordinate system)

**Codebase citation:**
Extracts month data from `labels[]` (defined in `src/data/index.ts`) and maps against biomarker `values[]` via `dataMapAtom`.

**Which existing data it uses:**
It parses the YYMMDD `labels[]` to extract the month (MM), and groups the measurements for a given biomarker (from `dataMapAtom`) by month. It then calculates the average (or median) value for each month across all years in the dataset.

**Axes:**
- Angle Axis (Polar): 12 months (January to December).
- Radius Axis (Polar): Average value of the biomarker.

**What it reveals that current charts don't:**
Uncovers seasonal physiological cycles (e.g., Vitamin D crashing in winter months, or lipid profiles shifting during holiday seasons). The current linear time-series charts (LineChart/ScatterChart) make it very difficult to spot recurring annual patterns over multi-year datasets because the timeline stretches horizontally without wrapping by season.

**Where it would live:**
New `src/layout/SeasonalityRadialBar.tsx`, rendered inside the table row expansion alongside the existing BoxplotChart and LineChart.

**Trigger / entry point:**
A new "Seasonality" tab/toggle in the expanded row view of the main dashboard table.

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

**Proposal: Tag-Level Health Score Trajectory**

**ECharts type:** `line` (stacked area)

**Codebase citation:**
Uses the `tag` constant (and internally derived `taggedDic`) from `src/processors/post/tag.ts` and `extra.optimality[]` from `src/processors/post/range.ts`.

**Which existing data it uses:**
Reads `visibleDataAtom` and computes a daily aggregate score for each tag group (e.g., `3-Liver`, `6-Kidney`) based on the percentage of biomarkers in that group whose `extra.optimality[]` is `false` (optimal) at that time point.

**Axes:**
X-axis: Time (dates).
Y-axis: Percentage (0% to 100%) of optimal biomarkers within the tag group.

**What it reveals that current charts don't:**
Reveals holistic system health trends over time. While the current RadarChart shows a single snapshot of system health, this trajectory chart lets users track whether their liver or kidney system stability is improving or degrading globally across years.

**Where it would live:**
New `src/layout/TagHealthTrajectory.tsx`, rendered in the Main View (Dashboard).

**Trigger / entry point:**
Displayed in the main dashboard when the user clicks a "System View" tab, acting as a longitudinal companion to the current RadarChart snapshot.

---

**Proposal: Biomarker Volatility vs. Recovery Velocity Scatter Matrix**

**ECharts type:** `scatter` (with `markLine` for quadrant mapping)

**Codebase citation:**
Uses the `extra.optimality[]` from `src/processors/post/range.ts` and overall `values[]` arrays loaded into `nonInferredDataAtom`.

**Which existing data it uses:**
It calculates two new derived metrics for each biomarker in `nonInferredDataAtom`:
1. **Historical Volatility** (Y-axis): the standard deviation or coefficient of variation of the biomarker's values across all timestamps.
2. **Average Recovery Velocity** (X-axis): when a biomarker enters an out-of-range state (`extra.optimality[] === true`), the average rate of change (delta per day using `labels[]`) back into the optimal range.

**Axes:**
- X-axis: Recovery Velocity (Rate of return to optimal, e.g. units/day)
- Y-axis: Historical Volatility (Coefficient of variation)

**What it reveals that current charts don't:**
Identifies which biomarkers are highly erratic but quickly corrected (high volatility, high recovery), versus those that drift slowly out of range and resist correction (low volatility, low recovery—often a sign of chronic systemic decline rather than acute stress). The current `KeystoneCentralityScatter` maps centrality vs anomaly frequency, but misses the *velocity of recovery* which is crucial for distinguishing between acute flare-ups and chronic metabolic entrenchment.

**Where it would live:**
New `src/layout/VolatilityRecoveryScatter.tsx`, accessible from the Diagnostics or Correlation view.

**Trigger / entry point:**
A "Recovery Dynamics" sub-tab in the Correlation Modal.

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

**Proposal: Tag-Level Stability Area Chart**

**ECharts type:** `line` (stacked area)

**Codebase citation:**
Uses `extra.optimality[]` pre-computed by `src/processors/post/range.ts` and tag groups `1-RBC`, `2-Metabolic` from `src/processors/post/tag.ts`.

**Which existing data it uses:**
It calculates the percentage of biomarkers within each tag group that are within their optimal range at every timestamp `labels[]`. For example, if there are 10 Metabolic markers and 8 are optimal at time T, the score is 80%. These percentages for all systems are stacked over time.

**Axes:**
- X-axis: Time (dates from `labels[]`)
- Y-axis: Aggregated Optimal Percentage (0-100%, stacked or overlaid)

**What it reveals that current charts don't:**
It provides a longitudinal view of systemic health stability. While the current `RadarChart` gives a point-in-time snapshot of system health, this chart shows how systemic stability drifts over months or years. It makes it obvious if, for example, the Liver system is gradually destabilizing before any single marker crosses a critical clinical threshold.

**Where it would live:**
New `src/layout/TagStabilityAreaChart.tsx`.

**Trigger / entry point:**
A "Longitudinal System Health" toggle next to the current `RadarChart` in the Main Dashboard.

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
**Proposal: Testing Cadence & Seasonality Scatter**

**ECharts type:** `scatter` (or `calendar` modified for multi-year overlay)

**Codebase citation:**
Uses `labels[]` from `src/data/index.ts` to plot time against the density/cadence of measurements.

**Which existing data it uses:**
Reads the length of arrays in `dataAtom` and aligns them with `labels[]` (which contains timestamps in the format `YYMMDD`).

**Axes:**
- **X-Axis:** Month of the year (Jan - Dec)
- **Y-Axis:** Year

**What it reveals that current charts don't:**
The current charts plot biomarker values over time, but they don't explicitly show the user's testing cadence or whether tests are clustered around certain seasons or years. This reveals the habit pattern of the user's health tracking.

**Where it would live:**
New `src/layout/TestingCadenceChart.tsx`, accessible perhaps on a high-level summary view or dashboard overview.

**Trigger / entry point:**
Could be added as a top-level widget that renders automatically, requiring no specific UI trigger, to give context on the overall data density.

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

**Proposal: Measurement Lag Timeline (Horizontal Bar Chart)**

**ECharts type:** `bar` (horizontal)

**Codebase citation:**
Uses `labels[]` from `src/data/index.ts` and the array index null-checking against `values[]` from `dataAtom`.

**Which existing data it uses:**
For each biomarker in `nonInferredDataAtom` or `visibleDataAtom`, it iterates backward through the values array to find the index of the most recent non-null measurement. It then compares this index's corresponding date in `labels[]` with the most recent global date in `labels[]` (or current date).

**Axes:**
- X-axis: Days (or Months) since last measurement.
- Y-axis: Biomarker Name (or grouped by `tag` from `src/processors/post/tag.ts`).

**What it reveals that current charts don't:**
It visualizes data staleness. When looking at a multi-axis chart or radar, users might assume all data points represent current health. This chart explicitly exposes the "lag" – showing, for instance, that while Lipid markers were tested a week ago, Hormone markers haven't been measured in 18 months, highlighting critical gaps in the user's testing regimen.

**Where it would live:**
New `src/layout/MeasurementLagTimeline.tsx`.

**Trigger / entry point:**
A "Data Freshness" toggle or a warning badge near the global date filter that expands into this chart.
