# Proposals

---

**Proposal 1 of 5: Biomarker Non-Optimal Streak Heatmap**

**ECharts type:** `heatmap`

**Codebase citation:**
`extra.optimality[]` array pre-computed by `src/processors/post/range.ts` and `labels[]` from `src/data/index.ts`.

**Which existing data it uses:**
Reads `extra.optimality` boolean array from the `BioMarker` metadata and cross-references it with `labels` to display a matrix of non-optimal streaks. It uses `dataAtom` or `visibleDataAtom` to source the active biomarkers.

**What it reveals that current charts don't:**
The existing timeline charts visualize the magnitudes of out-of-range values, but they don't clearly summarize the *duration* or *consistency* of non-optimal states across multiple biomarkers. This heatmap would instantly highlight chronic issues (a solid horizontal red line) vs. anomalous spikes (isolated dots) across all filtered markers at once.

**Where it would live:**
New `src/layout/OptimalityStreakHeatmap.tsx`, potentially rendered in a new tab or below the main chart areas when multiple biomarkers are selected.

**Trigger / entry point:**
Could be toggled via a new view mode button next to the existing scatter/line toggle when viewing groups or tag filters.

---

**Proposal 2 of 5: Tag Group Performance Radar**

**ECharts type:** `radar`

**Codebase citation:**
Tag group memberships (e.g., `1-RBC`, `2-Metabolic`) defined in `src/processors/post/tag.ts` and `extra.optimality[]` from `range.ts`.

**Which existing data it uses:**
Aggregates the ratio of optimal vs. non-optimal readings within each tag group (defined in `tag.ts`) over a selected time period (from `labels[]`). Uses the full `dataAtom` dataset.

**What it reveals that current charts don't:**
Provides a macro-level view of body system health. Instead of looking at individual biomarkers (like Glucose or AST), a user can see at a glance if their "Metabolic" system is improving while their "Liver" system is declining over the last 3 tests.

**Where it would live:**
New `src/layout/TagPerformanceRadar.tsx`, ideal for a dashboard overview or a dedicated "Systems Summary" panel.

**Trigger / entry point:**
A new "System Summary" button or tab at the top level of the application, rendering the radar chart alongside or instead of the main biomarker table.

---

**Proposal 3 of 5: Inferred vs. Measured Data Distribution**

**ECharts type:** `pie` or `sunburst`

**Codebase citation:**
`extra.inferred` boolean flag in `BioMarker` metadata, set in `src/processors/post/tag.ts` (or wherever inferred markers are generated), and `nonInferredDataAtom` in `src/atom/dataAtom.ts`.

**Which existing data it uses:**
Compares the count or weight of biomarkers with `extra.inferred === true` versus those in `nonInferredDataAtom`.

**What it reveals that current charts don't:**
Helps the user understand data provenance. If a large portion of their displayed or correlated data is derived (e.g., calculated ratios or estimated metrics) rather than directly measured in a lab, this chart clarifies the reliance on computed values, increasing transparency.

**Where it would live:**
New `src/layout/DataProvenanceChart.tsx`, perhaps in an "About this Data" modal or settings panel.

**Trigger / entry point:**
An "Info" icon next to the main dataset selector or filter summary.

---

**Proposal 4 of 5: Measurement Gap Timeline**

**ECharts type:** `custom` (Gantt-style) or `scatter` with custom symbols

**Codebase citation:**
The presence of `null` values within the `BioMarker[1]` value arrays, aligned with the `labels[]` from `src/data/index.ts`.

**Which existing data it uses:**
Iterates through `visibleDataAtom` and maps the `null` vs. non-`null` state of each biomarker across the timeline.

**What it reveals that current charts don't:**
Current charts (like `ScatterChart.tsx`) filter out or drop `null` values, hiding the *pattern of missing data*. A gap timeline would explicitly visualize testing frequency and highlight which specific markers were skipped in certain blood panels, helping users plan their next lab test.

**Where it would live:**
New `src/layout/MeasurementGapTimeline.tsx`, displayed as a supplementary view for data quality auditing.

**Trigger / entry point:**
A "Data Quality / Gaps" toggle in the table header or filter bar.

---

**Proposal 5 of 5: Correlation Significance Scatter Matrix**

**ECharts type:** `scatter` (Bubble chart)

**Codebase citation:**
`correlationMethodAtom`, `correlationAlphaAtom` from `src/atom/correlationAtom.ts` and the Spearman rank data from `rankedDataMapAtom` in `src/atom/dataAtom.ts`.

**Which existing data it uses:**
Uses the computed correlation coefficients and p-values (derived using `correlationMethodAtom` and `correlationAlphaAtom`) between pairs of active biomarkers.

**What it reveals that current charts don't:**
The application already computes correlations (as seen in the atoms), but a visual scatter matrix would plot Effect Size (correlation coefficient) on the X-axis against Significance (p-value or inverse alpha) on the Y-axis. This instantly separates strong, highly significant relationships from weak or spurious ones, which is hard to parse from a dense table of numbers.

**Where it would live:**
New `src/layout/CorrelationSignificanceMatrix.tsx`, rendered within the existing Correlation modal/view.

**Trigger / entry point:**
A "Visual Matrix" tab within the existing Correlation dialog.

---

Recommended implementation order: Proposal 5 first (highest coefficient/correlations insight, historical insight, then other insights), then 1, then 2, then 4, then 3.
