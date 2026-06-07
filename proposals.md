# Visualization Proposals

Based on the existing data model and charts in the MyHealth dashboard, here are 5 new visualization proposals.

---

**Proposal 1 of 5: Optimality Heatmap**

**ECharts type:** `heatmap`

**Codebase citation:**
`extra.optimality[]` pre-computed by `src/processors/post/range.ts` (index-aligned with `BioMarker[1]`) and `visibleDataAtom` from `src/atom/dataAtom.ts`.

**Which existing data it uses:**
Reads `extra.optimality[]` array and names (`BioMarker[0]`) from every entry returned by `visibleDataAtom`. The X-axis uses `labels[]` from `src/data/index.ts`.

**What it reveals that current charts don't:**
Shows exactly when multiple biomarkers simultaneously went out of bounds at a glance. The current scatter/line charts can only answer this by scanning each row individually. A heatmap provides a dense, system-wide overview of "red flags" (out-of-range values) across time.

**Where it would live:**
New `src/layout/OptimalityHeatmap.tsx`, rendered when the user selects a heatmap view or as a high-level summary at the top of the dashboard.

**Trigger / entry point:**
Activated automatically when `tagAtom` is set, showing the out-of-range heatmap for all biomarkers in the selected tag group (e.g., `3-Liver`), providing an instant "system health" snapshot.

---

**Proposal 2 of 5: Inferred vs Measured Accuracy Area**

**ECharts type:** `line` (with `areaStyle`) overlaid with `scatter`

**Codebase citation:**
`extra.inferred`, `extra.originValues`, and `extra.hasOrigin` from `BioMarker[3]` (`src/types/biomarker.ts`).

**Which existing data it uses:**
Filters `dataAtom` for markers where `extra.inferred === true` and `extra.hasOrigin === true`, plotting both the calculated/inferred `values[]` and the original measured `extra.originValues[]` on a shared timeline.

**What it reveals that current charts don't:**
Reveals how closely the inferred/calculated values (e.g. from a formula) track the actual raw/original measurements over time, highlighting divergence, accuracy, and data quality issues.

**Where it would live:**
New `src/layout/InferredAccuracyChart.tsx`.

**Trigger / entry point:**
Selected from a new "Data Quality" view or by clicking an info icon next to an inferred biomarker row in the main table.

---

**Proposal 3 of 5: Tag Group Progression Funnel**

**ECharts type:** `funnel`

**Codebase citation:**
`extra.tag` mapped to `tagKeys` (e.g. `1-RBC`, `2-Metabolic`) from `src/processors/post/tag.ts` and `nonInferredDataAtom`.

**Which existing data it uses:**
Computes the proportion of biomarkers within each tag group that have `extra.optimality` === true for the most recent date in `labels[]`. The funnel is ordered by severity (percentage out of range).

**What it reveals that current charts don't:**
Immediately identifies which bodily system (tag group) is currently under the most stress or has the most abnormal readings, guiding the user to focus there. It aggregates row-level optimality into a system-level prioritization.

**Where it would live:**
New `src/layout/SystemFunnelChart.tsx`.

**Trigger / entry point:**
A system overview dashboard widget, shown when `tagAtom` is null (overall view), giving the user a top-down entry point to filter the table.

---

**Proposal 4 of 5: Correlation Impact Radar**

**ECharts type:** `radar`

**Codebase citation:**
`correlationMethodAtom` and `correlationAlphaAtom` from `src/atom/correlationAtom.ts` and `rankedDataMapAtom`.

**Which existing data it uses:**
For a selected target biomarker, uses the pre-computed Spearman ranks in `rankedDataMapAtom` to compute correlation coefficients against representative markers from other major system tag groups.

**What it reveals that current charts don't:**
Shows a multivariate correlation profile—how strongly a single target marker positively or negatively correlates with different physiological systems simultaneously, moving beyond the 1-to-1 analysis of `Chart2.tsx`.

**Where it would live:**
New `src/layout/CorrelationRadarChart.tsx`.

**Trigger / entry point:**
Clicking "View Impact Profile" on a single biomarker row in the main table, rendering the radar chart in an expanded row view or modal.

---

**Proposal 5 of 5: PhenoAge Component Contribution Waterfall**

**ECharts type:** `bar` (waterfall style: using `stack` and invisible lower bars)

**Codebase citation:**
The `a-PhenoAge` tag group members from `src/processors/post/tag.ts` (Albumin, Glucose, Creatinin, MCV, etc.) and `dataMapAtom`.

**Which existing data it uses:**
Compares the `a-PhenoAge` component values for the latest date against their strict/optimal midpoints (from `strictRange` in `src/processors/post/range.ts` if available), plotting the positive/negative deviation of each component.

**What it reveals that current charts don't:**
Breaks down the composite biological age score to show exactly which individual markers are driving the PhenoAge up (aging) or down (youthful) at the current time point.

**Where it would live:**
New `src/layout/PhenoAgeWaterfallChart.tsx`.

**Trigger / entry point:**
Activated when `tagAtom` is set to `a-PhenoAge`, or when expanding the PhenoAge row in the table.

---

Recommended implementation order: Proposal 4 first (coefficient/correlations insight), then 1, then 5, then 3, then 2.
