**Proposal 1 of 5: Coefficient of Variation (CV) Timeline Bubble Chart**

**ECharts type:** `scatter` (bubble chart style with varying symbolSize)

**Codebase citation:**
`extra.getSamples(num, count)` method on `BioMarker[3]`, generated in `biomarker.ts` and `tag.ts`.
Reads `labels[]` from `src/data/index.ts`.

**Which existing data it uses:**
Calculates the Coefficient of Variation (Standard Deviation / Mean) using the sample arrays returned by `extra.getSamples()` across time periods defined by `labels[]` for biomarkers filtered by `visibleDataAtom`.

**What it reveals that current charts don't:**
Highlights which biomarkers are highly volatile over time vs which are stable, independently of their absolute values or scales. Volatile markers will have larger bubbles.

**Where it would live:**
New `src/layout/VolatilityBubbleChart.tsx`, rendered in a new 'Volatility Analysis' tab.

**Trigger / entry point:**
Activated when the user selects a specific tag group using `tagAtom` to analyze the stability of a specific body system (e.g., '3-Liver').

---

**Proposal 2 of 5: Spearman Ranked Correlation Chord Diagram**

**ECharts type:** `graph` (circular layout)

**Codebase citation:**
`rankedDataMapAtom` cache in `src/atom/dataAtom.ts` and `correlationMethodAtom` / `correlationAlphaAtom` in `src/atom/correlationAtom.ts`.

**Which existing data it uses:**
Computes a correlation matrix between all biomarkers within `visibleDataAtom` using `rankedDataMapAtom` values, filtered by `correlationAlphaAtom` significance threshold.

**What it reveals that current charts don't:**
Displays complex multi-way relationships between biomarkers, revealing unexpected cross-system correlations (e.g., how '2-Metabolic' markers connect to '4-Lipid' markers) that pairwise scatter charts cannot show simultaneously.

**Where it would live:**
New `src/layout/CorrelationChordDiagram.tsx`.

**Trigger / entry point:**
Activated from a new 'Network View' toggle when `tagAtom` is null (showing system-wide connections) or when viewing a specific tag group to see intra-group correlations.

---

**Proposal 3 of 5: Out-of-Range Duration Waterfall Chart**

**ECharts type:** `bar` (with transparent bottom bars to create a waterfall effect)

**Codebase citation:**
`extra.optimality[]` boolean array pre-computed in `src/processors/post/range.ts`.

**Which existing data it uses:**
Iterates through `extra.optimality[]` for each biomarker in `visibleDataAtom` to calculate consecutive streaks of 'true' (out of range) values across the time periods defined in `labels[]`.

**What it reveals that current charts don't:**
Shows the cumulative duration (number of consecutive tests) a biomarker has spent in an unoptimal state, highlighting chronic issues vs acute, one-off spikes.

**Where it would live:**
New `src/layout/ChronicIssuesWaterfall.tsx`.

**Trigger / entry point:**
Rendered in a new 'Chronic Tracking' panel within the main dashboard.

---

**Proposal 4 of 5: Tag Group Optimality Stacked Area Chart**

**ECharts type:** `line` (with `areaStyle` and `stack: 'total'`)

**Codebase citation:**
`tagKeys` from `src/processors/post/tag.ts` and `dataAtom` from `src/atom/dataAtom.ts`.

**Which existing data it uses:**
Groups all biomarkers from `dataAtom` by their primary tag (from `tagKeys`). Calculates the percentage of biomarkers within each tag group that are in range (using `extra.optimality[]`) at each time point in `labels[]`.

**What it reveals that current charts don't:**
Provides a macro-level view of overall system health over time. Shows if an improvement in the '2-Metabolic' system coincided with a decline in the '3-Liver' system.

**Where it would live:**
New `src/layout/SystemHealthAreaChart.tsx`.

**Trigger / entry point:**
Displayed prominently at the top of the dashboard when `tagAtom` is null (global view).

---

**Proposal 5 of 5: Measured vs Inferred Data Source Treemap**

**ECharts type:** `treemap`

**Codebase citation:**
`extra.inferred` boolean and `extra.hasOrigin` boolean on `BioMarker[3]`, plus `nonInferredDataAtom` in `src/atom/dataAtom.ts`.

**Which existing data it uses:**
Categorizes all biomarkers in `dataAtom` by tag group (parent node) and then by measurement source (child node): 'Measured' (`!extra.inferred`), 'Computed' (`extra.inferred`), or 'Derived from Origin' (`extra.hasOrigin`).

**What it reveals that current charts don't:**
Visualizes the data provenance and density of the health profile. Quickly shows which biological systems (tags) rely heavily on computed metrics versus direct lab measurements.

**Where it would live:**
New `src/layout/DataProvenanceTreemap.tsx`.

**Trigger / entry point:**
Accessible via a new 'Data Audit' or 'Data Quality' button in the application header or settings menu.

---

Recommended implementation order: Proposal 2 first (highest coefficient/correlations insight, historical insight, then other insights), then 4, then 3, then 1, then 5.
