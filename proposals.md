

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
