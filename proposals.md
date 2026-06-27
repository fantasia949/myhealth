

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

