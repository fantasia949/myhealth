
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


