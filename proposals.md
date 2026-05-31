# Proposals for New Visualizations

These proposals aim to introduce new visualizations grounded in the existing data model within the MyHealth dashboard.

---

**Proposal 1 of 5: Optimal vs Out-of-Range Composition Stacked Bar**

**ECharts type:** `bar` (with `stack: 'total'`)

**Codebase citation:**
`extra.optimality[]` pre-computed by `src/processors/post/range.ts`, index-aligned with `BioMarker[1]`.

**Which existing data it uses:**
Reads `extra.optimality[]` from every `BioMarker` entry returned by `visibleDataAtom`. Calculates the percentage of biomarkers that are `true` (out-of-range) versus `false` (in-range) across the selected context.

**What it reveals that current charts don't:**
Reveals at a glance if a particular tag group (like `8-WBC`) has a worsening ratio of out-of-range biomarkers over time. While the current charts highlight individual variations, they do not show the composition or the aggregate health impact of the currently selected group.

**Where it would live:**
New `src/layout/OptimalityStackedBar.tsx`, rendered conditionally in `App.tsx` or `Table.tsx` when a `tagAtom` is active.

**Trigger / entry point:**
The existing tag filter buttons (e.g. `1-RBC`, `8-WBC`) in the UI update the `tagAtom`. When a tag is active, this chart would appear alongside or above the main Table/ScatterChart to show the group's aggregate performance.

---

**Proposal 2 of 5: System Health Heatmap Grid**

**ECharts type:** `heatmap`

**Codebase citation:**
Tag groups from `tagAtom` and `tagKeys` (from `src/processors/post/tag.ts`), plus `extra.optimality[]` from `src/processors/post/range.ts`.

**Which existing data it uses:**
Reads all `dataAtom` values, grouping them by their assigned `extra.tag`. For each tag and each time point in `labels[]`, it computes a health score (ratio of `false` optimality over total items in the group).

**What it reveals that current charts don't:**
Provides a compact way to view all 10 system tag health scores simultaneously over the measurement timeline. It highlights systemic trends (e.g., metabolic health deteriorating while kidney health remains stable), which currently requires manually clicking through each tag to inspect.

**Where it would live:**
New `src/layout/SystemHealthHeatmap.tsx`, rendered globally (perhaps in a dashboard summary section before the detailed table).

**Trigger / entry point:**
Automatically rendered at the top of the view when no specific `tagAtom` is selected (global overview), or accessible via a dedicated "System Overview" toggle.

---

**Proposal 3 of 5: Correlated Outliers Network Map**

**ECharts type:** `graph`

**Codebase citation:**
Uses `correlationAlphaAtom` and `correlationMethodAtom` from `src/atom/correlationAtom.ts`, combined with `extra.optimality` from `src/processors/post/range.ts`.

**Which existing data it uses:**
Reads `rankedDataMapAtom` to compute significant correlations between biomarkers. It cross-references these links with `extra.optimality` to weight edges or color nodes based on whether the correlated markers are simultaneously out of range.

**What it reveals that current charts don't:**
Highlights whether an out-of-range state in one marker reliably co-occurs with an out-of-range state in a correlated marker. This network perspective identifies central "problem" nodes that might be driving broader physiological instability.

**Where it would live:**
New `src/layout/CorrelationNetwork.tsx`, triggered from the existing `BiomarkerCorrelation` modal or a new dedicated view.

**Trigger / entry point:**
When the user clicks the correlation button in the table row (which sets `correlationBiomarker`), this graph could visually map the target's first and second-degree connections, colored by their out-of-range frequency.

---

**Proposal 4 of 5: Inferred Value Accuracy Scatter**

**ECharts type:** `scatter`

**Codebase citation:**
Uses `extra.inferred` and `extra.originValues` from `BioMarker[3]`, processed in various points but defined in `src/types/biomarker.ts`.

**Which existing data it uses:**
Filters `dataAtom` for entries where `extra.inferred` is true, then plots the inferred `BioMarker[1]` values against the corresponding `extra.originValues`.

**What it reveals that current charts don't:**
Highlights how much the computational formula deviates from directly measured origin parameters if both exist or are proximate. This is crucial for verifying the reliability of inferred markers (like certain calculated ratios or indices) against raw data.

**Where it would live:**
New `src/layout/InferredAccuracyScatter.tsx`, perhaps integrated into the details view of an inferred biomarker.

**Trigger / entry point:**
Rendered when expanding a row in `Table.tsx` for a biomarker where `extra.inferred` is true, providing a quality check alongside the standard `LineChart`.

---

**Proposal 5 of 5: Missing Measurement Gap Analysis Chart**

**ECharts type:** `heatmap` or `custom`

**Codebase citation:**
Uses the distribution of `null` or missing values within `BioMarker[1]` arrays across `visibleDataAtom`.

**Which existing data it uses:**
Scans `visibleDataAtom` across all `labels[]` indices, plotting a matrix where rows are biomarkers and columns are dates, with colors indicating presence or absence (null) of a measurement.

**What it reveals that current charts don't:**
Visualizes testing inconsistency, showing which systems are under-monitored. It clearly identifies gaps in the patient's testing protocol over time, which current charts obscure by either connecting lines or leaving empty space.

**Where it would live:**
New `src/layout/MeasurementGapHeatmap.tsx`, rendered in a "Data Quality" or "Audit" tab.

**Trigger / entry point:**
Accessible via a settings or audit toggle in the navigation bar, providing a meta-analysis of the dataset's completeness.

---

Recommended implementation order: Proposal 2 first (highest coefficient/correlations insight, historical insight, then other insights), then 1, then 3, then 5, then 4.
