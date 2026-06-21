
**Proposal: Predictive Power Scatter Plot**

**ECharts type:** `scatter`

**Codebase citation:**
Uses `correlationMethodAtom` from `src/atom/correlationAtom.ts` and checks `extra.inferred` on `BioMarker[3]` from `src/types/biomarker.ts`.

**Which existing data it uses:**
It uses `nonInferredDataAtom` (measured markers) and cross-references them against inferred markers (where `extra.inferred === true`). It calculates the pairwise correlation (Pearson or Spearman, depending on `correlationMethodAtom`) between each measured marker and inferred markers.

**What it reveals that current charts don't:**
It visualizes which single measured biomarker (e.g., Glucose) is the strongest predictor of complex inferred metrics (e.g., HOMA-IR or PhenoAge). It helps the user understand *why* an inferred metric is changing by exposing its most correlated raw measurements over time, going beyond simple trendlines.

**Where it would live:**
New `src/layout/PredictivePowerChart.tsx`, accessible from a "Predictive Analysis" view or alongside the Correlation panel.

**Trigger / entry point:**
Activated when a user focuses on an inferred biomarker, potentially by clicking an "Analyze Predictors" button next to it.

---

**Proposal: Tag Group Synchrony Heatmap**

**ECharts type:** `heatmap`

**Codebase citation:**
Uses the `tagKeys` exported from `src/processors/post/tag.ts` and `dataAtom`.

**Which existing data it uses:**
It aggregates values across all biomarkers within the same `extra.tag` group. It creates a matrix where rows are tag groups (e.g., `1-RBC`, `2-Metabolic`) and columns are dates (`formattedLabels`). The intensity represents the percentage of biomarkers within that group that were out of optimal range (`extra.optimality`).

**What it reveals that current charts don't:**
Highlights systemic health shifts by showing when entire physiological systems (like liver or kidney function) experienced widespread fluctuations synchronously, as opposed to isolated anomalies. This makes identifying systemic trends across time immediate.

**Where it would live:**
New `src/layout/SystemSynchronyHeatmap.tsx`, acting as a high-level summary overview.

**Trigger / entry point:**
Rendered in a main dashboard view or a "System Health Overview" tab to provide a macroscopic view before diving into individual charts.

---

**Proposal: Measurement Panel Co-Occurrence Matrix**

**ECharts type:** `heatmap` (Adjacency Matrix)

**Codebase citation:**
Analyzes the `values` arrays (index 1) of the `BioMarker` tuples within `dataAtom` for null checks.

**Which existing data it uses:**
Iterates through all biomarkers in `dataAtom` and counts how often they were measured on the exact same date (by checking `values[i] !== null && values[i] !== undefined`). It generates a square matrix where the intensity represents the frequency of co-measurement.

**What it reveals that current charts don't:**
Visualizes the user's historical testing patterns—showing which lab panels were typically ordered together (e.g., showing a strong co-occurrence cluster for Thyroid markers). It helps identify disjointed testing histories where certain markers were tested in isolation, explaining data sparsity.

**Where it would live:**
New `src/layout/PanelCoOccurrenceMatrix.tsx`, in a settings or "Data Quality" view.

**Trigger / entry point:**
Available under a "Data Insights" or "Audit" section, independent of the main data visualization flows.

---

**Proposal: Spearman Rank Velocity Line Chart**

**ECharts type:** `line`

**Codebase citation:**
Directly utilizes the pre-computed `rankedDataMapAtom` from `src/atom/dataAtom.ts`.

**Which existing data it uses:**
Takes the `Float64Array` rank arrays from `rankedDataMapAtom` for the selected biomarkers (via `visibleDataAtom`). Instead of plotting the raw values, it plots the rank position or the *change* in rank position over time.

**What it reveals that current charts don't:**
Visualizes relative performance changes by abstracting away differing units and scales. It clearly shows when a biomarker's value significantly shifted in terms of its historical distribution, ignoring minor absolute fluctuations that don't change its rank, which highlights truly anomalous shifts.

**Where it would live:**
New `src/layout/RankVelocityChart.tsx`, accessible from individual marker details.

**Trigger / entry point:**
A toggle button on `LineChart.tsx` or `ScatterChart.tsx` that switches the Y-axis from "Absolute Value" to "Historical Rank Percentile".

---

**Proposal: Correlation Significance vs Effect Size Volcano Plot**

**ECharts type:** `scatter`

**Codebase citation:**
Uses `correlationAlphaAtom` from `src/atom/correlationAtom.ts` and `rankedDataMapAtom` from `src/atom/dataAtom.ts`.

**Which existing data it uses:**
It computes both the correlation coefficient (effect size) and the p-value (significance) for pairs of biomarkers derived from `rankedDataMapAtom` arrays. It visually maps the correlation coefficient to the X-axis and the -log10(p-value) to the Y-axis. The threshold line is driven by `correlationAlphaAtom`.

**What it reveals that current charts don't:**
The existing correlation tools show coefficient strengths but hide the statistical significance until hovered or clicked. A volcano plot immediately separates strong but noisy correlations from highly significant ones, allowing the user to trust the underlying patterns before exploring them in detail.

**Where it would live:**
New `src/layout/CorrelationVolcanoPlot.tsx`, rendered within the `Correlation.tsx` module.

**Trigger / entry point:**
Activated via a "Significance View" toggle on the main Correlation chart screen.

---



**Proposal: Biomarker Volatility vs. Age Area Scatter Plot**

**ECharts type:** `scatter` (Area scatter with size/color variation)

**Codebase citation:**
Uses `dataAtom` from `src/atom/dataAtom.ts` and date indices inferred from `labels` in `src/data/index.ts`.

**Which existing data it uses:**
It calculates the variance or standard deviation (volatility) of each valid biomarker in `dataAtom` over its available time points. It plots each biomarker as a bubble, where the X-axis is the total timeline span (e.g., number of years measured), and the Y-axis is the volatility score.

**What it reveals that current charts don't:**
Identifies which biomarkers fluctuate wildly compared to those that remain stable throughout a patient's measurement history. The current multi-axis line chart shows absolute values but makes it hard to compare normalized stability across different scales simultaneously.

**Where it would live:**
New `src/layout/VolatilityScatter.tsx`.

**Trigger / entry point:**
Triggered via a "Volatility Analysis" toggle in the main Dashboard next to the tag filters.

---

**Proposal: Cross-System Correlation Force Graph**

**ECharts type:** `graph` (Force Directed)

**Codebase citation:**
Uses `correlationAlphaAtom` from `src/atom/correlationAtom.ts` and `extra.tag` from `src/processors/post/tag.ts`.

**Which existing data it uses:**
It calculates the pairwise correlation between the *aggregated average percent-to-optimal* scores for each tag group (e.g., aggregating all `1-RBC` markers vs all `3-Liver` markers) using the methods in `correlationAtom`.

**What it reveals that current charts don't:**
The existing correlation tools map individual biomarkers to each other or to supplements. This graph maps *entire physiological systems* against each other to reveal macro-level cascades (e.g., proving that liver stress strongly correlates with lipid metabolism degradation in this specific user's history).

**Where it would live:**
New `src/layout/SystemCorrelationGraph.tsx` alongside `BiomarkerCorrelationGraph.tsx`.

**Trigger / entry point:**
Available as a specific "System Level" toggle inside the global Correlation modal.

---

**Proposal: Out-of-Range Duration Gantt Chart**

**ECharts type:** `custom` (Gantt Chart style)

**Codebase citation:**
Uses `extra.optimality[]` from `src/processors/post/range.ts` matched against `labels` from `src/data/index.ts`.

**Which existing data it uses:**
It processes `dataAtom` and identifies continuous streaks where `extra.optimality` is `true`. It maps these periods into horizontal duration bars for each biomarker.

**What it reveals that current charts don't:**
Instead of showing discrete points where a biomarker was out of range, it emphasizes the *continuous duration* of chronic issues. A single bad reading might be noise, but a Gantt chart instantly highlights which biomarker has been out of optimal bounds continuously for the longest period of time.

**Where it would live:**
New `src/layout/ChronicDurationGantt.tsx`.

**Trigger / entry point:**
A "Chronic Risk View" button above the main data table that replaces the table view with a horizontal duration chart.

---

**Proposal: Tag-Level Range Velocity Bar Chart**

**ECharts type:** `bar`

**Codebase citation:**
Uses `extra.tag` from `src/processors/post/tag.ts` and `extra.range` boundaries applied to `BioMarker[1]` from `src/atom/dataAtom.ts`.

**Which existing data it uses:**
Aggregates `BioMarker` values by their associated `extra.tag` strings. For each tag group, it calculates the average normalized rate of change (e.g., slope) from the first to the last available time point (`labels`), using the `extra.range` boundaries to normalize differing units into a common scale.

**What it reveals that current charts don't:**
Instantly highlights which overall physiological systems (e.g., Kidney, Liver) are improving or degrading the fastest longitudinally, rather than just showing absolute values of individual markers.

**Where it would live:**
New `src/layout/TagVelocityBarChart.tsx`, embedded within a "System Health Trajectory" summary view.

**Trigger / entry point:**
A standalone component rendered at the top of the dashboard summarizing longitudinal systemic progression.

---

**Proposal: Optimality Survival Step Chart**

**ECharts type:** `line` (with `step: 'end'`)

**Codebase citation:**
Relies on `extra.optimality[]` from `src/processors/post/range.ts` aligned with time `labels` from `src/data/index.ts`.

**Which existing data it uses:**
Iterates through `dataAtom` to track the first date each biomarker transitioned into an out-of-range state (`extra.optimality[i] === true`). It plots a declining step function starting at 100% representing the proportion of biomarkers that have *never* breached their optimal range over time.

**What it reveals that current charts don't:**
Provides a macroscopic "health span" indicator. Instead of viewing daily fluctuations, it shows the systemic accumulation of clinical abnormalities, indicating whether a user's health is remaining stable or cascading into multiple out-of-range markers simultaneously.

**Where it would live:**
New `src/layout/OptimalitySurvivalChart.tsx`.

**Trigger / entry point:**
An "Overall Health Span" dashboard widget that provides a high-level summary before jumping into specific biomarker graphs.

---

**Proposal: Keystones Biomarker Centrality Scatter Plot**

**ECharts type:** `scatter`

**Codebase citation:**
Uses `correlationMethodAtom` from `src/atom/correlationAtom.ts` and `extra.optimality[]` from `src/processors/post/range.ts`.

**Which existing data it uses:**
For every biomarker in `dataAtom`, it computes its average absolute correlation coefficient with all other biomarkers. It plots each biomarker where the X-axis is this average correlation (centrality) and the Y-axis is the historical out-of-range frequency (derived by counting `true` values in `extra.optimality[]`).

**What it reveals that current charts don't:**
Identifies "keystone" vulnerabilities—biomarkers that are both highly volatile/abnormal *and* strongly coupled to the rest of the systemic network. Prioritizing interventions on these specific markers could yield the highest cascading health benefits.

**Where it would live:**
New `src/layout/KeystoneCentralityScatter.tsx` accessed via the correlation tools.

**Trigger / entry point:**
A "Prioritization View" toggle within the Correlation modal.


**Proposal: Optimality Recovery Time Distribution Bar**

**ECharts type:** `bar`

**Codebase citation:**
Uses `extra.optimality[]` from `src/processors/post/range.ts` matched against `labels` from `src/data/index.ts`.

**Which existing data it uses:**
It processes `dataAtom` to find streaks where a biomarker goes out-of-range (`optimality[i] === true`) and measures the number of days (calculated from `labels`) until it returns to normal (`optimality[i] === false`).

**What it reveals that current charts don't:**
Highlights how quickly the user's body corrects imbalances. Instead of showing simply if a marker was out of bounds, it visualizes the *recovery speed*, helping identify systems losing their resilience over time (e.g., if recovery time for Glucose spikes is gradually lengthening).

**Where it would live:**
New `src/layout/RecoveryTimeBar.tsx`.

**Trigger / entry point:**
A "Resilience Analysis" button inside the individual biomarker view.

---

**Proposal: Historical Testing Interval Histogram**

**ECharts type:** `bar` (histogram using `echarts-stat` transform)

**Codebase citation:**
Analyzes the `values` arrays of `BioMarker` tuples within `dataAtom` alongside the global `labels` array from `src/data/index.ts`.

**Which existing data it uses:**
For each biomarker, it iterates through `values` and calculates the time gap (in days or months derived from `labels`) between each non-null measurement (`values[i] !== null && values[i] !== undefined`). It then plots a histogram of these intervals.

**What it reveals that current charts don't:**
Visualizes the user's testing consistency for each biomarker. It can expose erratic testing behaviors, such as measuring Vitamin D frequently in summer but leaving large gaps in winter, which the standard time-series line chart masks due to `connectNulls: false`.

**Where it would live:**
New `src/layout/TestingIntervalHistogram.tsx`.

**Trigger / entry point:**
An "Audit Continuity" button within the main dashboard or table view.

---

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


