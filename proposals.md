
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

**Proposal: Biomarker Tag Completion Horizon Chart**

**ECharts type:** `custom` (Horizon Chart) or overlapping `line`

**Codebase citation:**
Relies on `labels` from `src/data/index.ts` and the `extra.tag` arrays generated in `src/processors/post/tag.ts`.

**Which existing data it uses:**
It utilizes `dataAtom` to track the count of actual non-null measurements for each tag group at each time point in `labels`. It overlays these density bands to show a compact history of testing completeness.

**What it reveals that current charts don't:**
Horizon charts are excellent for displaying overlapping density over time in a small vertical space. It allows the user to see at a glance if they've consistently neglected testing a specific tag group (like `6-Kidney` or `9-Mineral`) over the years, without taking up the vertical space of a massive heatmap.

**Where it would live:**
New `src/layout/TagCompletionHorizon.tsx`.

**Trigger / entry point:**
Rendered as a sparkline-style overview above the main `Table.tsx` view.

---

**Proposal: System-Wide Optimality Polar Bar Chart**

**ECharts type:** `polar` / `bar` (Nightingale / Polar Bar)

**Codebase citation:**
Reads `extra.optimality` from `src/processors/post/range.ts` and groups by the `tag` arrays derived from `tag.ts`.

**Which existing data it uses:**
Aggregates the current or most recent time-point data across `dataAtom`. It calculates the percentage of optimal vs. non-optimal markers within each tag group (e.g., `3-Liver`, `4-Lipid`) and plots them radially.

**What it reveals that current charts don't:**
Unlike radar charts that show continuous scores, a polar bar chart segmented by tag groups clearly visualizes the exact discrete volume of out-of-range markers per system for the most recent checkup, making it instantly clear which physiological system needs the most attention right now.

**Where it would live:**
New `src/layout/SystemOptimalityPolar.tsx`.

**Trigger / entry point:**
Displayed on the home dashboard or alongside the latest lab results summary.

---

**Proposal 9 of 13: Correlation Significance Network Directed Graph**

**ECharts type:** `graph` (Directed Force Layout)

**Codebase citation:**
Uses `correlationAlphaAtom` from `src/atom/correlationAtom.ts` and `rankedDataMapAtom` from `src/atom/dataAtom.ts`.

**Which existing data it uses:**
It calculates the pairwise correlation between all biomarkers in `nonInferredDataAtom`. It filters out correlations that do not meet the significance threshold defined by `correlationAlphaAtom`.

**What it reveals that current charts don't:**
The existing correlation chord diagram shows all relationships, but a directed graph filtered strictly by the user's chosen alpha threshold reveals the "core" statistically significant network. It allows users to see which biomarkers act as central hubs of significant physiological shifts, rather than just showing raw correlation strength.

**Where it would live:**
New `src/layout/SignificantCorrelationGraph.tsx`, rendered within the existing global dashboard.

**Trigger / entry point:**
Activated via a toggle on the existing `CorrelationChordDiagram.tsx` to "Filter by Alpha Significance".

---

**Proposal 10 of 13: Out-of-Range Risk Trajectory Slope Chart**

**ECharts type:** `line` (Slope Chart)

**Codebase citation:**
Reads the `extra.optimality` boolean arrays pre-computed by `src/processors/post/range.ts` and `dataAtom`.

**Which existing data it uses:**
It calculates the total count of `true` values in `extra.optimality` for each tag group (e.g., `1-RBC`, `2-Metabolic` from `src/processors/post/tag.ts`) at the first available time point and the most recent time point.

**What it reveals that current charts don't:**
Highlights which physiological systems are degrading or improving over the entire tracking period. A slope chart provides an immediate visual summary of macro-level health trajectories (e.g., "Metabolic anomalies increased, while Liver anomalies decreased") without getting bogged down in day-to-day noise.

**Where it would live:**
New `src/layout/RiskTrajectorySlope.tsx`, as a summary visualization on the dashboard.

**Trigger / entry point:**
Displayed in a "Macro Health Summary" panel or when the user selects a high-level "Compare First vs Last" view.

---

**Proposal 11 of 13: Strict Range Non-Compliance Tree Diagram**

**ECharts type:** `tree`

**Codebase citation:**
Checks `extra.range` and standard vs. `strictRange` definitions inferred from `src/processors/post/range.ts`.

**Which existing data it uses:**
It uses the `dataAtom` to build a hierarchical tree: Root -> Tag Group -> Biomarker. For each biomarker, it colors the node based on whether the most recent value falls within the standard range or violates a strict override range (if defined).

**What it reveals that current charts don't:**
Provides a hierarchical, root-cause analysis view of current health status. Users can instantly see which specific systems (branches) are failing strict functional medicine ranges, allowing for targeted interventions, whereas current tables require manual scanning.

**Where it would live:**
New `src/layout/StrictComplianceTree.tsx`, potentially replacing or augmenting the existing `SystemClustering.tsx` treemap.

**Trigger / entry point:**
Triggered via a "Current Snapshot" or "Functional Range Analysis" button in the header.

---

**Proposal 12 of 13: Measurement Recency Horizon Chart**

**ECharts type:** `custom` (Horizon/Density Plot) or `heatmap`

**Codebase citation:**
Examines the index alignment of `BioMarker[1]` (values) against `labels[]` from `src/data/index.ts`.

**Which existing data it uses:**
Iterates through all `visibleDataAtom` biomarkers. It creates a visual timeline where color intensity or bar height indicates how recently and frequently a specific biomarker has been tested, mapping nulls to gaps.

**What it reveals that current charts don't:**
Instantly identifies "stale" data. If a user is looking at a correlation or a tag group, this chart highlights which biomarkers haven't been tested in years versus those tested recently, indicating the confidence level of current inferred metrics or correlations.

**Where it would live:**
New `src/layout/MeasurementRecencyChart.tsx`, acting as a diagnostic overlay for the data table.

**Trigger / entry point:**
A "Show Data Freshness" toggle in the main data grid or sidebar.

---

**Proposal 13 of 13: Correlated Biomarker Synchrony Normalized Line Chart**

**ECharts type:** `line` (Normalized / Percentage)

**Codebase citation:**
Uses `nonInferredDataAtom` and `correlationAlternativeAtom` from `src/atom/correlationAtom.ts`.

**Which existing data it uses:**
When a user selects a target biomarker, it finds the top 3 most correlated biomarkers. It then normalizes their historical values (e.g., using z-scores or percentage change from baseline) and plots them on a single, shared percentage Y-axis.

**What it reveals that current charts don't:**
The multi-Y-axis `Chart.tsx` makes it hard to compare the relative magnitude of changes across different units. A normalized percentage line chart explicitly proves the correlation visually, showing how perfectly the selected markers move in lockstep relative to their own baselines.

**Where it would live:**
New `src/layout/NormalizedSynchronyLine.tsx`, within the `BiomarkerCorrelation.tsx` modal.

**Trigger / entry point:**
Automatically generated when a user clicks on a highly correlated node in the `BiomarkerCorrelationGraph.tsx`.

---


