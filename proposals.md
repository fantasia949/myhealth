**Proposal: Spearman Rank Velocity Line Chart**

**ECharts type:** `line`

**Codebase citation:**
Directly utilizes the pre-computed `rankedDataMapAtom` from `src/atom/dataAtom.ts`.

**Which existing data it uses:**
Takes the `Float64Array` rank arrays from `rankedDataMapAtom` for the selected biomarkers (via `visibleDataAtom`). Instead of plotting the raw values, it plots the rank position or the _change_ in rank position over time.

**What it reveals that current charts don't:**
Visualizes relative performance changes by abstracting away differing units and scales. It clearly shows when a biomarker's value significantly shifted in terms of its historical distribution, ignoring minor absolute fluctuations that don't change its rank, which highlights truly anomalous shifts.

**Where it would live:**
New `src/layout/RankVelocityChart.tsx`, accessible from individual marker details.

**Trigger / entry point:**
A toggle button on `LineChart.tsx` or `ScatterChart.tsx` that switches the Y-axis from "Absolute Value" to "Historical Rank Percentile".

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
It calculates the pairwise correlation between the _aggregated average percent-to-optimal_ scores for each tag group (e.g., aggregating all `1-RBC` markers vs all `3-Liver` markers) using the methods in `correlationAtom`.

**What it reveals that current charts don't:**
The existing correlation tools map individual biomarkers to each other or to supplements. This graph maps _entire physiological systems_ against each other to reveal macro-level cascades (e.g., proving that liver stress strongly correlates with lipid metabolism degradation in this specific user's history).

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
Instead of showing discrete points where a biomarker was out of range, it emphasizes the _continuous duration_ of chronic issues. A single bad reading might be noise, but a Gantt chart instantly highlights which biomarker has been out of optimal bounds continuously for the longest period of time.

**Where it would live:**
New `src/layout/ChronicDurationGantt.tsx`.

**Trigger / entry point:**
A "Chronic Risk View" button above the main data table that replaces the table view with a horizontal duration chart.

---

**Proposal: Optimality Survival Step Chart**

**ECharts type:** `line` (with `step: 'end'`)

**Codebase citation:**
Relies on `extra.optimality[]` from `src/processors/post/range.ts` aligned with time `labels` from `src/data/index.ts`.

**Which existing data it uses:**
Iterates through `dataAtom` to track the first date each biomarker transitioned into an out-of-range state (`extra.optimality[i] === true`). It plots a declining step function starting at 100% representing the proportion of biomarkers that have _never_ breached their optimal range over time.

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
Identifies "keystone" vulnerabilities—biomarkers that are both highly volatile/abnormal _and_ strongly coupled to the rest of the systemic network. Prioritizing interventions on these specific markers could yield the highest cascading health benefits.

**Where it would live:**
New `src/layout/KeystoneCentralityScatter.tsx` accessed via the correlation tools.

**Trigger / entry point:**
A "Prioritization View" toggle within the Correlation modal.

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

**Proposal: Longitudinal Out-of-Range Burden Stacked Bar Chart**

**ECharts type:** `bar` (stacked)

**Codebase citation:**
Uses `extra.optimality[]` from `src/processors/post/range.ts` aligned with time `labels` from `src/data/index.ts` and `extra.tag` from `src/processors/post/tag.ts`.

**Which existing data it uses:**
Iterates through all biomarkers in `dataAtom` for each date in `labels`. Counts the total number of out-of-range markers (`extra.optimality[i] === true`), grouped and stacked by their `extra.tag` (e.g., `3-Liver`, `4-Lipid`).

**What it reveals that current charts don't:**
Shows the overall physiological burden over time. A spike in the bar indicates a cascading failure across multiple systems on a specific test date, broken down visually by which physiological system contributed most.

**Where it would live:**
New `src/layout/SystemicBurdenStackedBar.tsx`.

**Trigger / entry point:**
An "Overall System Burden" widget at the top of the dashboard.

---

**Proposal: Rank Velocity Line Chart**

**ECharts type:** `line`

**Codebase citation:**
Uses `rankedDataMapAtom` from `src/atom/dataAtom.ts`.

**Which existing data it uses:**
It utilizes the `Float64Array` rank arrays produced by `rankedDataMapAtom` alongside the shared `labels` from `src/data/index.ts` to plot the progression of a biomarker's rank over time, instead of its raw absolute value.

**What it reveals that current charts don't:**
The current `LineChart.tsx` shows absolute value trends, which can make it hard to distinguish true systemic degradation from simple volatility within the normal bounds. Showing rank velocity visualizes when a biomarker has truly broken its historical percentiles, filtering out the noise of normal day-to-day variance.

**Where it would live:**
New `src/layout/RankVelocityChart.tsx`.

**Trigger / entry point:**
Could be rendered as a toggle state within the existing `Chart.tsx` view or row expansion to switch the Y-axis interpretation from absolute values to rank progression.

---

**Proposal: Correlation Directionality Polar Scatter**

**ECharts type:** `scatter` (polar coordinate system)

**Codebase citation:**
Utilizes `rankedDataMapAtom` from `src/atom/dataAtom.ts` and `correlationMethodAtom` from `src/atom/correlationAtom.ts`.

**Which existing data it uses:**
Computes the pairwise correlations between the target biomarker and all other biomarkers, plotting the correlation magnitude (radius) against the sign/direction (angle) in a polar graph.

**What it reveals that current charts don't:**
While `Chart2.tsx` plots an exact 1:1 regression on Cartesian axes, a polar correlation scatter can simultaneously plot the relationships of *many* markers against a central target. This instantly segregates biomarkers that move symbiotically (positive correlation angles) from those that move antagonistically (negative correlation angles) in a single dense view.

**Where it would live:**
New `src/layout/PolarCorrelationScatter.tsx`.

**Trigger / entry point:**
A new "Polar Comparison" tab within the biomarker Correlation Modal.

---

**Proposal: Out-of-Range Duration Gantt Chart**

**ECharts type:** `custom` (styled as Gantt duration bars)

**Codebase citation:**
Uses `extra.optimality[]` from `src/processors/post/range.ts` combined with `labels` from `src/data/index.ts`.

**Which existing data it uses:**
Processes `visibleDataAtom` to isolate the specific indices where `extra.optimality[i] === true`. It merges contiguous `true` periods into duration blocks along a shared X-axis timeline.

**What it reveals that current charts don't:**
Current multi-axis timeline charts (`Chart.tsx`, `ScatterChart.tsx`) show magnitude effectively, but tracking exactly how long a system has been chronically failing requires tracing the line against a boundary. A Gantt duration block specifically emphasizes the *chronicity* of an issue by collapsing magnitude and focusing purely on the duration spent outside optimal bounds.

**Where it would live:**
New `src/layout/OptimalityDurationGantt.tsx`.

**Trigger / entry point:**
A "Chronic Risk View" button added to the main Dashboard view options, rendering in place of `ScatterChart.tsx`.

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

**Proposal: Annual Distribution Ridgeline Plot**

**ECharts type:** `custom` (simulating ridgelines via overlapping offset line/area series)

**Codebase citation:**
Uses `dataAtom` and standard dates extracted from the YYMMDD `labels` array in `src/data/index.ts`.

**Which existing data it uses:**
Groups `values` from `dataAtom` for a selected biomarker into discrete years. It generates smoothed density line charts (with area fill) for each year and stacks them vertically on a shared Y-axis (with partial overlap).

**What it reveals that current charts don't:**
Instead of a continuous time-series (like `LineChart.tsx`) or a single aggregate distribution (like `HistogramChart.tsx`), a ridgeline plot shows how the *shape of the distribution* for a biomarker morphs year over year. This highlights long-term, subtle shifts in variance or modality that a mean-value line completely misses.

**Where it would live:**
New `src/layout/RidgelineChart.tsx`.

**Trigger / entry point:**
Available as an advanced historical view on a single biomarker, near the Boxplot and Histogram toggles.

---

**Proposal: Inferred Origin Component Stacked Bar**

**ECharts type:** `bar` (stacked)

**Codebase citation:**
Uses `inferred` and `originValues` from `BioMarker[3]` and filtered through `nonInferredDataAtom`.

**Which existing data it uses:**
For biomarkers where `inferred` is `true`, it breaks down their computed value into the relative contributions of their underlying `originValues`.

**What it reveals that current charts don't:**
Currently, inferred biomarkers are treated as monolithic values. A stacked bar chart dissecting the inferred value shows exactly *which* underlying measured metric is driving the change in the inferred index (e.g., if PhenoAge spiked, did it spike because of Glucose or CRP?).

**Where it would live:**
New `src/layout/InferredComponentDecomposition.tsx`.

**Trigger / entry point:**
An "Inspect Origin Components" button when an inferred biomarker is selected in a table row expansion.
