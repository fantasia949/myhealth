# Visualization Proposals

**Recommended implementation order: Proposal 2 first (highest coefficient/correlations insight, historical insight, then other insights), then 4, then 1, then 3, then 5.**

---

**Proposal 1 of 5: Tag Group Data Density Stacked Bar**

**ECharts type:** `bar` (stacked)

**Codebase citation:**
Uses `dataAtom`, `src/processors/post/tag.ts` grouping (`tagKeys`), and `labels[]`.

**Which existing data it uses:**
Reads `labels[]` for X-axis timepoints. Groups `dataAtom` by tag groups (from `src/processors/post/tag.ts` via `extra.tag`). For each timepoint, counts the number of non-null measurements for each tag group, displaying this as a stacked bar chart.

**What it reveals that current charts don't:**
Shows longitudinal test completeness by system group—users can easily see if they had comprehensive "1-RBC" or "3-Liver" tests at a specific date, or if certain testing groups were frequently omitted over time.

**Where it would live:**
New `src/layout/TestDensityChart.tsx`, potentially rendered in the global metrics area.

**Trigger / entry point:**
Always visible or toggled via a "Test Density" button in the global nav.

---

**Proposal 2 of 5: Correlation Effect Size vs Optimality Scatter**

**ECharts type:** `scatter`

**Codebase citation:**
Uses `rankedDataMapAtom` (Spearman rho baseline), `src/processors/post/range.ts` (`extra.optimality[]`).

**Which existing data it uses:**
Calculates the correlation of each marker (via `rankedDataMapAtom`) with a selected target biomarker. For the X-axis, it uses the correlation effect size (r value). For the Y-axis, it plots the percentage of time that specific marker was out of bounds (calculated by summing `true` values in `extra.optimality[]` over total non-null length).

**What it reveals that current charts don't:**
Reveals which highly correlated biomarkers are also frequently problematic (out of bounds). This helps prioritize interventions by isolating markers that are tightly linked to a target *and* frequently suboptimal.

**Where it would live:**
New `src/layout/CorrelationOptimalityScatter.tsx`.

**Trigger / entry point:**
Rendered as an alternate view when a single biomarker is selected for correlation analysis.

---

**Proposal 3 of 5: PhenoAge vs Systemic Optimality Dual-Axis Line**

**ECharts type:** `line` (dual-axis)

**Codebase citation:**
Uses `a-PhenoAge` (an inferred marker from `nonInferredDataAtom`/`dataAtom`) and `extra.optimality[]` from measured markers.

**Which existing data it uses:**
Plots the time series of `a-PhenoAge` on the primary Y-axis. On the secondary Y-axis, it plots a "Systemic Load Score" for each timepoint (sum of all `true` flags in `extra.optimality[]` across all measured markers from `nonInferredDataAtom`).

**What it reveals that current charts don't:**
Shows whether holistic systemic burden (total number of out-of-range markers) tracks over time with the inferred phenotypic age, potentially validating if generalized out-of-range trends drive biological age estimation.

**Where it would live:**
New `src/layout/PhenoAgeOptimalityLine.tsx`.

**Trigger / entry point:**
Automatically shown when the `a-PhenoAge` tag filter is active (via `tagAtom`).

---

**Proposal 4 of 5: Normalized Volatility 1D Strip Plot**

**ECharts type:** `scatter` (1D strip or constrained Y-axis)

**Codebase citation:**
Uses `BioMarker[1]` (values) and `extra.range` boundaries from `src/processors/post/range.ts`.

**Which existing data it uses:**
For each marker, parses `extra.range` into Min and Max. Normalizes all non-null values in `BioMarker[1]` to a 0-100 scale based on these bounds. Plots all historical normalized points on a single horizontal line per biomarker.

**What it reveals that current charts don't:**
Visually demonstrates volatility and skewness *relative to optimal bounds* across multiple markers simultaneously. Users can immediately see if a marker is tightly clustered near the high bound vs wildly swinging across the entire range.

**Where it would live:**
New `src/layout/NormalizedVolatilityStrip.tsx`.

**Trigger / entry point:**
Rendered when a specific tag group is selected in `tagAtom`, showing all markers in that group.

---

**Proposal 5 of 5: Missing Data Audit Heatmap**

**ECharts type:** `heatmap`

**Codebase citation:**
Uses `BioMarker[1]` null gaps and `labels[]`.

**Which existing data it uses:**
Uses `visibleDataAtom`. The Y-axis is biomarker names, the X-axis is `labels[]`. The data value is simply 1 (measurement exists) or 0 (null/missing in `BioMarker[1]`).

**What it reveals that current charts don't:**
Provides a clear system-wide audit of which measurements are actively being collected versus ignored over time. Unlike standard charts that hide gaps, this chart makes gaps the central focus.

**Where it would live:**
New `src/layout/MissingDataHeatmap.tsx`.

**Trigger / entry point:**
Toggled by an "Audit Data Quality" view mode button or global setting.