**Proposal 1 of 3: Tag Group Completeness Radar**

**ECharts type:** `radar`

**Codebase citation:**
Reads `tag` keys dynamically derived from `src/processors/post/tag.ts` via `extra.tag` on `BioMarker[3]` elements of the `dataAtom`.

**Which existing data it uses:**
It utilizes `dataAtom` from `src/atom/dataAtom.ts` and iterates over each `BioMarker` entry. It extracts the `extra.tag` arrays and counts the occurrences of each tag group (e.g., `1-RBC`, `2-Metabolic`).

**What it reveals that current charts don't:**
Shows which physiological systems (tag groups) have the most robust data coverage and which are missing measurements. Current scatter and line charts require the user to visually inspect each tag group one by one to infer completeness, whereas a radar chart instantly visualizes the density and completeness of all system clusters in one view.

**Where it would live:**
New `src/layout/CompletenessRadar.tsx`, rendered conditionally in `App.tsx` or a new summary dashboard panel.

**Trigger / entry point:**
Could be toggled via a new "Data Coverage" button in the global navigation or sidebar, activating a modal that renders this summary chart.

---

**Proposal 2 of 3: Inferred Marker Network Diagram**

**ECharts type:** `graph` (Network)

**Codebase citation:**
Reads `extra.inferred`, `extra.originValues`, and `extra.hasOrigin` from `BioMarker[3]`, which are defined in `src/types/biomarker.ts` and set during preprocessing.

**Which existing data it uses:**
It queries `dataAtom` for all biomarkers where `extra.inferred === true` and uses their `extra.originValues` references (or names, if map is updated to link them) to draw connections to the measured biomarkers that generated them.

**What it reveals that current charts don't:**
Visualizes the dependency tree between actual measured lab results and computed/inferred scores (like eGFR, HOMA-IR, or PhenoAge). This clarifies for the user which raw measurements have the highest "leverage" (i.e., contribute to the most computed metrics), which is impossible to see in isolated time-series plots.

**Where it would live:**
New `src/layout/InferredNetworkDiagram.tsx`, potentially added as an extra tab in the `BiomarkerCorrelation.tsx` view or as a standalone exploration tool.

**Trigger / entry point:**
Activated via a "View Dependencies" toggle on inferred biomarkers, or as a global view when no specific tag is selected.

---

**Proposal 3 of 3: Correlation Rank Scatter Matrix**

**ECharts type:** `scatter` (SPLOM - Scatter Plot Matrix)

**Codebase citation:**
Uses `rankedDataMapAtom` from `src/atom/dataAtom.ts`, which caches the Spearman rank array (Float64Array) for each biomarker name.

**Which existing data it uses:**
It accesses `visibleDataAtom` to get the current list of biomarkers being viewed and retrieves their corresponding rank arrays from `rankedDataMapAtom`. It plots these rank values against each other for all possible pairs in the visible set.

**What it reveals that current charts don't:**
The existing correlation tools (like the network graph or bump chart) only show the *strength* of the correlation (the coefficient). A scatter matrix of the underlying rank values reveals the *shape* of the relationship (e.g., non-linear patterns, clusters, or outliers) that drive the correlation score, providing deeper statistical context.

**Where it would live:**
New `src/layout/RankScatterMatrix.tsx`, rendered inside the existing `Correlation.tsx` view.

**Trigger / entry point:**
Activated when exactly two or three biomarkers are visible (via search or tag filters), rendering below the main `ScatterChart.tsx` to provide immediate correlation context.

---

Recommended implementation order: Proposal 3 first (correlation insight), then 1, then 2.
---

**Proposal 4 of 8: Predictive Power Scatter Plot**

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

**Proposal 5 of 8: Tag Group Synchrony Heatmap**

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

**Proposal 6 of 8: Measurement Panel Co-Occurrence Matrix**

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

**Proposal 7 of 8: PhenoAge vs Total Out-of-Range Count Dual-Axis Line**

**ECharts type:** `line` (Dual-Axis)

**Codebase citation:**
Uses the `a-PhenoAge` group and `extra.optimality` from `src/processors/post/range.ts` combined with `dataAtom`.

**Which existing data it uses:**
Calculates a rolling count of total out-of-range biomarkers (by summing `true` values in `extra.optimality` across all markers at each time point `i`). It then plots this total count on the left Y-axis, and the calculated "Pheno age" (filtered from `dataAtom` where name is "Pheno age") on the right Y-axis.

**What it reveals that current charts don't:**
Directly correlates the high-level inferred biological age score against the raw volume of physiological anomalies. It allows the user to see if their calculated biological age rises in lockstep with the sheer number of biomarkers falling out of range, validating the score's sensitivity.

**Where it would live:**
New `src/layout/PhenoAgeComparisonChart.tsx`, specialized for the PhenoAge view.

**Trigger / entry point:**
Automatically displayed when the `tagAtom` is set to `a-PhenoAge`.

---

**Proposal 8 of 8: Spearman Rank Velocity Line Chart**

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

Recommended implementation order: Proposal 4 first (correlation insight), then 5 (systemic insight), then 7, then 8, then 6.
