

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
`extra.optimality[]` pre-computed by `src/processors/post/range.ts` and `BioMarker[1]` lengths from `visibleDataAtom`.

**Which existing data it uses:**
Uses the length of non-null measurements in `BioMarker[1]` to calculate frequency, and counts the `true` values in `extra.optimality[]` to calculate the anomaly rate, reading from `visibleDataAtom`.

**What it reveals that current charts don't:**
Identifies biomarkers that are rarely tested but frequently abnormal when they are measured, highlighting potential testing blind spots or interventions that are neglected.

**Where it would live:**
New `src/layout/MeasurementAnomalyScatter.tsx`, rendered in the main dashboard when "Prioritization View" is enabled.

**Trigger / entry point:**
Triggered via the existing "Prioritization View" toggle in the main dashboard, filtering data based on `tagAtom` if one is active.

---

**Proposal: Tag-Group Measurement Density Calendar**

**ECharts type:** `calendar` + `heatmap`

**Codebase citation:**
`tagAtom` and `labels[]` from `src/data/index.ts`.

**Which existing data it uses:**
Reads the currently selected `tagAtom` to filter biomarkers, then maps the non-null data points in `BioMarker[1]` to their corresponding dates in `labels[]` to aggregate daily measurement counts.

**What it reveals that current charts don't:**
Shows the density of testing for specific physiological systems (e.g. `2-Metabolic`) on a calendar layout, revealing specific months or seasons where testing is clustered or neglected.

**Where it would live:**
New `src/layout/TagMeasurementCalendar.tsx`, rendered in a new modal or collapsible section on the main dashboard.

**Trigger / entry point:**
The existing tag filter buttons in `Nav.tsx` already set `tagAtom`; the calendar auto-renders when a single tag is active, showing the measurement density for that specific group.

**Proposal: Inferred-to-Origin Drift Area Overlay**

**ECharts type:** `line` (with `areastyle` between two series)

**Codebase citation:**
Uses `extra.inferred` and `extra.originValues[]` alongside the standard `values[]` from `BioMarker[1]` in `src/types/biomarker.ts` and `dataMapAtom.ts`.

**Which existing data it uses:**
Focuses on biomarkers where `extra.inferred === true` and `extra.hasOrigin === true`. It plots the calculated, normalized `values[]` (e.g., calculated LDL) against their raw `extra.originValues[]` (e.g., direct LDL) over time (`labels[]`). The area between the two lines is filled to represent drift magnitude.

**What it reveals that current charts don't:**
Exposes the exact structural discrepancy between a mathematically inferred health metric and its raw laboratory precursor over time. This highlights specific physiological periods where the mathematical inference model diverges significantly from actual clinical baselines, which standard scatter/line charts mask by only showing one value array.

**Where it would live:**
New `src/layout/InferredDriftAreaChart.tsx`.

**Trigger / entry point:**
An "Origin Discrepancy" toggle switch that becomes available in the detailed biomarker view whenever an inferred biomarker is selected.

---

**Proposal: Alternative Hypothesis Correlation Profiler**

**ECharts type:** `scatter` (Profile Scatter matrix subset)

**Codebase citation:**
Uses `correlationAlternativeAtom` ('two-sided', 'less', 'greater') and `correlationMethodAtom` from `src/atom/correlationAtom.ts`.

**Which existing data it uses:**
It calculates asymmetric, directional correlation scores by evaluating the `values[]` of pairs of biomarkers using the specific directionality setting stored in `correlationAlternativeAtom`. The resulting scores are plotted as an interactive scatter profile.

**What it reveals that current charts don't:**
Unlike standard two-sided correlation matrices, this chart uncovers directional limits and boundary-conditional relationships (e.g., "Biomarker A only drags Biomarker B down when it crosses a certain threshold, but not vice versa"). This provides deep insights into asymmetric physiological feedback loops.

**Where it would live:**
New `src/layout/DirectionalCorrelationScatter.tsx`.

**Trigger / entry point:**
A "Directional Profile" view option inside the correlation analysis tools modal, automatically activated when the user selects 'less' or 'greater' in the `correlationAlternativeAtom` dropdown.
