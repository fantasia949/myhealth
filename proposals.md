
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

**Proposal: Optimal Range Boundary Proximity Scatter**

**ECharts type:** `scatter`

**Codebase citation:**
Uses `extra.range` and `extra.optimality[]` from `src/processors/post/range.ts` aligned with `dataAtom`.

**Which existing data it uses:**
For each marker in `dataAtom`, it calculates how close the most recent value in `values[]` is to the upper or lower boundary of the `extra.range`, normalizing it as a percentage distance.

**What it reveals that current charts don't:**
Identifies biomarkers that are *technically* in-range but dangerously close to crossing the boundary, providing early warning signals before they actually trigger the `extra.optimality === true` boolean flag.

**Where it would live:**
New `src/layout/BoundaryProximityScatter.tsx`.

**Trigger / entry point:**
A "Boundary Risk" view in the main dashboard or statistical overview.

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
