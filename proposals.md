---
**Proposal 1 of 5: Out-of-Range Heatmap**

**ECharts type:** `heatmap`

**Codebase citation:**
`extra.optimality[]` pre-computed by `src/processors/post/range.ts`, index-aligned with `BioMarker[1]`

**Which existing data it uses:**
Reads `extra.optimality[]` and the `values` from every `BioMarker` entry returned by `visibleDataAtom`. It also aligns with the global `labels[]` from `src/data/index.ts`.

**What it reveals that current charts don't:**
Displays a high-level grid (X-axis: time, Y-axis: biomarkers) where cells are colored red if out of range, green if optimal, and gray if missing. This allows instant visual identification of clusters of abnormalities over time without needing to open individual line charts or analyze scatter plots.

**Where it would live:**
New `src/layout/HeatmapChart.tsx`, rendered in `App.tsx` conditionally when users want a system-wide overview.

**Trigger / entry point:**
Could be toggled via a new "Overview Mode" button alongside the current Tag filters, or automatically rendered at the top of the list.

---

**Proposal 2 of 5: Pearson vs Spearman Discrepancy Scatter**

**ECharts type:** `scatter` (with `markLine`)

**Codebase citation:**
`correlationMethodAtom` from `src/atom/correlationAtom.ts` and `rankedDataMapAtom` from `src/atom/dataAtom.ts`

**Which existing data it uses:**
It computes both Pearson (using raw values from `dataMapAtom`) and Spearman (using the pre-computed `Float64Array` from `rankedDataMapAtom`) coefficients across all biomarker pairs, then plots them against each other.

**What it reveals that current charts don't:**
Highlights pairs of biomarkers that have strong monotonic relationships (high Spearman) but weak linear relationships (low Pearson) due to non-linearity or outliers. Points far from the `y=x` diagonal line reveal complex biological correlations hidden by standard linear assumptions.

**Where it would live:**
New `src/layout/CorrelationDiscrepancy.tsx` component.

**Trigger / entry point:**
When users select the correlation tool and set `correlationMethodAtom`, an advanced view can expand to show the discrepancy map.

---

**Proposal 3 of 5: Optimality Radar**

**ECharts type:** `radar`

**Codebase citation:**
`extra.optimality[]` pre-computed by `src/processors/post/range.ts`

**Which existing data it uses:**
Aggregates the `optimality[]` booleans for all biomarkers in `visibleDataAtom` at the most recent time point (the last index of the values array).

**What it reveals that current charts don't:**
Shows a snapshot of the user's current health status across multiple dimensions. Each axis of the radar represents a different biomarker or tag group, displaying the proportion of markers within that group that are optimal. It gives an immediate "shape" to the user's health profile.

**Where it would live:**
New `src/layout/OptimalityRadar.tsx`.

**Trigger / entry point:**
A static dashboard widget that appears in the sidebar or at the top of the main list view.

---

**Proposal 4 of 5: Measured vs Inferred Value Deviation Boxplot**

**ECharts type:** `boxplot`

**Codebase citation:**
`inferred: true` flag on `BioMarker[3]` from `src/types/biomarker.ts` and `nonInferredDataAtom` from `src/atom/dataAtom.ts`.

**Which existing data it uses:**
Compares the distribution of values for `inferred` biomarkers (calculated formulas) against the distributions of raw `nonInferredDataAtom` (measured lab results).

**What it reveals that current charts don't:**
Allows users to see the spread and outliers of calculated markers (like HOMA-IR or eGFR) compared to raw markers, identifying if the inferred formulas are yielding highly volatile or skewed results relative to actual measurements.

**Where it would live:**
New `src/layout/DeviationBoxplot.tsx`.

**Trigger / entry point:**
Could be added as a distinct tab within the current scatter plot view, allowing users to toggle between "Time Series" and "Distribution" modes.

---

**Proposal 5 of 5: Tag Group Optimal Progression Area**

**ECharts type:** `line` (with `stack: 'Total', areaStyle: {}`)

**Codebase citation:**
`tag` array on `BioMarker[3]` (e.g., `['2-Metabolic']`) assigned by `src/processors/post/tag.ts`.

**Which existing data it uses:**
Uses the time `labels[]` from `src/data/index.ts` and aggregates the `extra.optimality[]` data for all biomarkers grouped by their `tag`.

**What it reveals that current charts don't:**
Instead of showing individual biomarker values, this chart shows the total count (or percentage) of optimal biomarkers over time, stacked by tag group (e.g., how many Metabolic vs. Liver markers are optimal). It visualizes macro-level health progression and which bodily systems are improving or degrading.

**Where it would live:**
New `src/layout/TagProgressionArea.tsx`.

**Trigger / entry point:**
A dedicated "Trends" page or as a primary visualization above the biomarker list when no specific tag is selected in `tagAtom`.

---

Recommended implementation order: Proposal 2 first (highest coefficient/correlations insight, historical insight, then other insights), then 1, then 5, then 3, then 4.
