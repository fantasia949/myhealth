---

**Proposal 1 of 5: Inferred vs Measured Accuracy Area**

**ECharts type:** `line` (with `areaStyle` representing delta)

**Codebase citation:**
Reads `inferred: true` and `originValues` from `BioMarker[3]` as populated by `src/types/biomarker.ts` and inferred markers from `nonInferredDataAtom` in `src/atom/dataAtom.ts`.

**Which existing data it uses:**
It uses `nonInferredDataAtom` to grab all directly measured biomarkers, and compares those against inferred biomarkers (e.g., computed equations). It plots the direct components against the resultant inferred value across time.

**What it reveals that current charts don't:**
Highlights measurement drift by plotting inferred mathematical values against their measured origin components (e.g. tracking eGFR equation confidence over time). It reveals if a patient's lab components are diverging mathematically from standard calculations.

**Where it would live:**
New `src/layout/InferredAccuracyArea.tsx`, rendered conditionally in `App.tsx` when an inferred biomarker is selected.

**Trigger / entry point:**
Triggered automatically when a biomarker with `extra.inferred === true` is selected from the `visibleDataAtom`.

---

**Proposal 2 of 5: Ranked Correlation Network Timeline**

**ECharts type:** `themeRiver` / `streamgraph`

**Codebase citation:**
Utilizes `rankedDataMapAtom` (Spearman rank cache: `Map<string, Float64Array>`) from `src/atom/dataAtom.ts` and the currently selected `correlationMethodAtom` from `src/atom/correlationAtom.ts`.

**Which existing data it uses:**
It uses the pre-computed `Float64Array` rank values from `rankedDataMapAtom` for the active tag group (`tagAtom`), applying the user's `correlationMethodAtom` settings.

**What it reveals that current charts don't:**
Visualizes the shift in statistical rank importance among a tag group's members over time. It exposes long-term systemic shifts (e.g. which `8-WBC` component is dominating the statistical distribution historically).

**Where it would live:**
New `src/layout/RankStreamGraph.tsx`, inserted below the `ScatterChart.tsx`.

**Trigger / entry point:**
Activated when the user toggles a new "View Ranked Stream" switch in `Nav.tsx`, filtering by the active `tagAtom`.

---

**Proposal 3 of 5: Out-of-Range Severity Gauge**

**ECharts type:** `gauge` (customized for time-series aggregation)

**Codebase citation:**
Uses `extra.optimality[]` pre-computed by `src/processors/post/range.ts` and `labels[]` from `src/data/index.ts`.

**Which existing data it uses:**
Iterates through all datasets in `dataAtom`, counting `true` values within the `optimality[]` array for the most recent index in `labels[]`, producing a global system score.

**What it reveals that current charts don't:**
Provides a single, immediately digestible "System Status" score indicating what percentage of all tracked biomarkers are currently out-of-range at the latest time point, allowing a high-level health glance without scanning individual charts.

**Where it would live:**
New `src/layout/SystemSeverityGauge.tsx`, placed in the global dashboard header.

**Trigger / entry point:**
Auto-renders on initial dashboard load and updates whenever `dataAtom` is fully populated.

---

**Proposal 4 of 5: Data Density Waterfall**

**ECharts type:** `bar` (waterfall configuration)

**Codebase citation:**
Uses the raw length of `BioMarker[1]` null-gaps and `labels[]` from `src/data/index.ts`.

**Which existing data it uses:**
Reads the `values[]` array for biomarkers in `visibleDataAtom`, counting the occurrence of `null` vs `number` across time.

**What it reveals that current charts don't:**
Visualizes test frequency gaps and measurement consistency over time. Instead of merely plotting points where data exists, it actively highlights the *missing* measurements as negative space blocks, showing testing compliance.

**Where it would live:**
New `src/layout/TestingFrequencyWaterfall.tsx`, available via a global toggle.

**Trigger / entry point:**
A new "Test History" button in `Nav.tsx` toggles the dashboard from value-view to density-view.

---

**Proposal 5 of 5: Bivariate Tag Scatter**

**ECharts type:** `scatter` (with `visualMap`)

**Codebase citation:**
Reads `extra.processedTags` from `src/types/biomarker.ts` and output from `src/processors/post/tag.ts`.

**Which existing data it uses:**
Reads `values[]` from `visibleDataAtom` but groups axes strictly by two opposing tags (e.g. `2-Metabolic` vs `4-Lipid`), averaging their normalized values.

**What it reveals that current charts don't:**
Exposes macro-level system interplay by comparing the aggregate health of one complete physiological system against another at each point in time, revealing if (for example) liver stress directly correlates with kidney stress across the patient's entire timeline.

**Where it would live:**
New `src/layout/SystemInterplayScatter.tsx`, rendered when exactly two tags are compared.

**Trigger / entry point:**
Activated when the user selects a "Compare Tags" feature in the sidebar, setting two active entries in a new `compareTagsAtom`.

---

Recommended implementation order: Proposal 2 first (highest coefficient/correlations insight, historical insight, then other insights), then 5, then 1, then 3, then 4.