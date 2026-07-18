

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

**Proposal: Longitudinal Statistical Significance Brush**

**ECharts type:** `line` (with `brush`)

**Codebase citation:**
Uses `correlationAlphaAtom` from `src/atom/correlationAtom.ts` and `rankedDataMapAtom` from `src/atom/dataAtom.ts`.

**Which existing data it uses:**
Plots the rank trajectories of two selected biomarkers from `rankedDataMapAtom` over time (`labels`). The user can use the `brush` tool to select a specific time window. The component calculates the local correlation just for that window and highlights the area if the p-value is below `correlationAlphaAtom`.

**Axes:**
- X-axis: `labels` (Time).
- Y-axis: Spearman rank value.

**What it reveals that current charts don't:**
Identifies *temporary* periods of strong correlation. Two markers might not be correlated over a 5-year span, but strongly coupled during a specific 6-month illness window. Current charts only show global correlation.

**Where it would live:**
New `src/layout/LocalCorrelationBrushLine.tsx`.

**Trigger / entry point:**
A "Time-Window Analysis" toggle in the Correlation view.


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

**Proposal: Optimality Transition Sankey Diagram**

**ECharts type:** `sankey`

**Codebase citation:**
`extra.optimality[]` pre-computed boolean array in `BioMarker[3]`, generated by `src/processors/post/range.ts`, index-aligned with the time series values.

**Which existing data it uses:**
Reads `extra.optimality[]` and historical time `labels[]` from `dataAtom.ts`. Groups time periods (e.g., Year 1 vs Year 2) and tracks how many biomarkers transitioned states:
- Optimal -> Optimal (Maintained Health)
- Sub-optimal -> Optimal (Recovered)
- Optimal -> Sub-optimal (Degraded)
- Sub-optimal -> Sub-optimal (Persistently out-of-range)

**Axes:**
No explicit X/Y axes. The Sankey nodes represent State and Time (e.g. "Year 1 Optimal", "Year 2 Sub-optimal"), and links represent the count of biomarkers transitioning between those states.

**What it reveals that current charts don't:**
The current line/scatter charts show single biomarker trajectory but fail to show systemic momentum. This chart answers "Is my overall health system currently in a state of recovery or degradation?" by quantifying the flow of biomarkers moving in and out of their optimal ranges over time.

**Where it would live:**
New `src/layout/OptimalityTransitionSankey.tsx`, rendered as a dedicated view in the main dashboard or inside a "System Health Summary" modal.

**Trigger / entry point:**
A new "Health Momentum" toggle button in `Nav.tsx` or a tab in the dashboard that utilizes the globally available `dataAtom` to aggregate the transitions across all measured markers.

---

**Proposal: System Health Racing Bar Chart**

**ECharts type:** `bar` (with timeline / racing animation configuration)

**Codebase citation:**
`tag` string array in `BioMarker[3]` assigned by `src/processors/post/tag.ts` (e.g. `["3-Liver"]`), and `extra.optimality[]` array from `src/processors/post/range.ts`.

**Which existing data it uses:**
Uses the `tag` groups and the `extra.optimality[]` array to compute a "System Optimality Score" for each physiological group (e.g., % of Liver markers in range) at every time point in `labels[]`.

**Axes:**
X-axis: Optimality Percentage (0-100%).
Y-axis (Category): Tag Groups (e.g. "3-Liver", "2-Metabolic").

**What it reveals that current charts don't:**
Current charts (like Radar) show a static snapshot of health. A Racing Bar Chart dynamically animates through the historical `labels[]` timeline, allowing the user to visually track the "race" of different physiological systems over time. It reveals which system has been consistently the weakest link and how different systems respond to interventions over months/years.

**Where it would live:**
New `src/layout/SystemHealthRacingBar.tsx`, rendered as a standalone dashboard widget or a dedicated view mode.

**Trigger / entry point:**
A "Play Timeline" button in the dashboard or system summary view that iterates over the `labels` array and passes the corresponding time index to the chart to drive the animation.

---

**Proposal: Measurement Frequency vs. Anomaly Rate Scatter**

**ECharts type:** `scatter`

**Codebase citation:**
Uses `extra.optimality[]` from `src/processors/post/range.ts` and `values[]` arrays length/density from `dataAtom` in `src/atom/dataAtom.ts`.

**Which existing data it uses:**
It calculates the number of valid measurements (non-null in `values[]` from `dataAtom`) versus the percentage of those measurements that are out-of-range (`extra.optimality` is `true`). It specifically targets non-inferred data using `nonInferredDataAtom`.

**Axes**
- X-axis: Measurement Frequency (Total valid test count).
- Y-axis: Anomaly Rate (Percentage of tests out of optimal range).

**What it reveals that current charts don't:**
Identifies testing biases and monitoring priorities. It reveals if a marker is tested frequently because it's known to be problematic, or if a rarely tested marker actually has a high failure rate and should be monitored more closely. Current charts focus on longitudinal time series but do not cross-examine the density of data points against their failure probability.

**Where it would live:**
New `src/layout/MeasurementAnomalyScatter.tsx`, rendered in the Dashboard or statistical section.

**Trigger / entry point:**
A "Monitoring Priority" view inside the statistical toolset modal.

---

**Proposal: Biomarker State Duration Step Line**

**ECharts type:** `line` (with `step: 'middle'`)

**Codebase citation:**
Uses `extra.optimality[]` boolean array pre-computed in `src/processors/post/range.ts` (stored in `BioMarker[3]`).

**Which existing data it uses:**
Translates `extra.optimality[]` booleans from `visibleDataAtom` into a binary state (1 for optimal/in-range, 0 for sub-optimal/out-of-range) for a specific biomarker and plots it over the chronological `labels[]` as a step line.

**Axes**
- X-axis: Time (mapped to `labels`).
- Y-axis: State (Discrete 0 or 1).

**What it reveals that current charts don't:**
Visually emphasizes the *duration* of time spent in an optimal vs. non-optimal state, abstracting away the noise of absolute magnitude changes. It is perfect for identifying chronic vs acute out-of-range periods, which can be difficult to see in standard line/scatter charts where small fluctuations around the boundary line might look similar to massive deviations.

**Where it would live:**
New `src/layout/StateDurationStepLine.tsx`.

**Trigger / entry point:**
A "Time-in-Range" toggle inside the expanded Table Row for a specific biomarker (as an alternative view to the current `LineChart` and `BoxplotChart`).
