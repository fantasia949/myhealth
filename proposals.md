**Proposal 1 of 5: Correlation P-Value / Significance Heatmap**

**ECharts type:** `heatmap`

**Codebase citation:**
`correlationAlphaAtom` and `correlationAlternativeAtom` from `src/atom/correlationAtom.ts`. `dataMapAtom` from `src/atom/dataAtom.ts`.

**Which existing data it uses:**
Reads `correlationAlphaAtom` for the threshold, uses the `pcorrtest` logic (if available, otherwise standard Spearman calculation), loops through all pairwise biomarker arrays in `dataMapAtom` (accessing `BioMarker[1]`) to compute significance levels.

**What it reveals that current charts don't:**
The current scatter plot and regression line show correlation visually between *two* specific biomarkers, but this heatmap would show the statistical significance matrix across *all* biomarker pairs simultaneously. This allows users to quickly spot strongly linked systems (e.g., discovering their sleep score strongly predicts next-day cortisol).

**Where it would live:**
New `src/layout/CorrelationHeatmap.tsx`, rendered conditionally as a new tab or overlay when a "Correlations" view is active.

**Trigger / entry point:**
A new "Correlation Matrix" button near the tag filters in `Nav.tsx`, passing the currently visible `tagAtom` biomarkers to the heatmap.

---

**Proposal 2 of 5: Biomarker Volatility (CV) Radar Chart**

**ECharts type:** `radar`

**Codebase citation:**
`tagAtom` and `visibleDataAtom` from `src/atom/dataAtom.ts`.

**Which existing data it uses:**
Iterates through all `BioMarker[1]` arrays returned by `visibleDataAtom` (which filters by the current `tagAtom`). For each array, it calculates the Coefficient of Variation (Standard Deviation / Mean) over the time series.

**What it reveals that current charts don't:**
Rather than tracking absolute values, this chart shows *which biomarkers are fluctuating the most*. A high CV in 'HbA1c' might indicate poor metabolic control, even if the absolute values occasionally hit the normal range. The radar chart allows comparing volatility across the entire tag group at once.

**Where it would live:**
New `src/layout/VolatilityRadar.tsx`, replacing or accompanying the scatter chart when multiple biomarkers are selected.

**Trigger / entry point:**
A toggle button in `Nav.tsx` or `scatter` view: "Show Values vs Show Volatility".

---

**Proposal 3 of 5: Optimality Duration Gantt Chart**

**ECharts type:** `custom` (acting as a Gantt chart) or `boxplot` (modified)

**Codebase citation:**
`extra.optimality[]` pre-computed by `src/processors/post/range.ts`, index-aligned with `BioMarker[1]`.

**Which existing data it uses:**
Reads `extra.optimality[]` and the `labels[]` from `src/data/index.ts` for each biomarker in `nonInferredDataAtom`.

**What it reveals that current charts don't:**
The current `LineChart` uses `markArea` to show the optimal band, but a Gantt chart would show *how long* a biomarker was out of range across its history, as a continuous block. This helps answer: "Did my 3-month intervention actually keep my LDL in range the whole time, or was it just one good test?"

**Where it would live:**
New `src/layout/OptimalityGantt.tsx`, rendered as a timeline summary below the main charts.

**Trigger / entry point:**
A global "Health Journey Summary" button, displaying the Gantt chart for the current `tagAtom` group.

---

**Proposal 4 of 5: Inferred Metric Influence Tree (Sankey)**

**ECharts type:** `sankey`

**Codebase citation:**
`inferred?: boolean` and `originValues?: (string|number|null)[]` on `BioMarker[3]`.

**Which existing data it uses:**
Filters `dataMapAtom` for biomarkers with `inferred: true` (e.g., HOMA-IR, eGFR). It maps the known mathematical relationships (e.g., Glucose + Insulin -> HOMA-IR, Creatinine -> eGFR) to create the Sankey nodes.

**What it reveals that current charts don't:**
Shows users *why* an inferred metric is out of range. If HOMA-IR is high, the Sankey diagram visually weights whether it's driven more by high fasting glucose or high fasting insulin based on their relative deviation from optimal, helping target the root cause.

**Where it would live:**
New `src/layout/InferredInfluenceTree.tsx`, rendered in a modal when an inferred biomarker is clicked.

**Trigger / entry point:**
Clicking the name of an `inferred: true` biomarker in the `BiomarkerTable` or `ScatterChart` legend.

---

**Proposal 5 of 5: Missing Data / Gap Heatmap**

**ECharts type:** `heatmap`

**Codebase citation:**
`labels[]` from `src/data/index.ts` and `BioMarker[1]` from `dataAtom`.

**Which existing data it uses:**
Maps the `labels[]` (X-axis) against all biomarker names in `visibleDataAtom` (Y-axis). The cell value is 1 if `BioMarker[1][i]` is not null, and 0 (or null) if it is missing.

**What it reveals that current charts don't:**
Visualizes test panel completeness. The scatter and line charts simply don't draw points for missing data, making it hard to see patterns in *what wasn't tested*. A gap heatmap immediately shows if a specific doctor keeps forgetting to order the 'Insulin' test on the '2-Metabolic' panel.

**Where it would live:**
New `src/layout/MissingDataHeatmap.tsx`, rendered in a "Data Quality" or "Audit" view.

**Trigger / entry point:**
A small "Data Audit" icon in the footer or settings menu.

---

Recommended implementation order: Proposal 1 first (highest coefficient/correlations insight, historical insight, then other insights), then 2, then 3, then 4, then 5.
