## Part 1 — Implementation Report

**The Issue:**
In `src/layout/Chart.tsx` (approx. line 140), calling `instance.setOption({ yAxis, grid, series }, { notMerge: true })` inside a `useEffect` completely wiped out the base option provided by `@echarts-readymade`. Because `notMerge: true` drops everything not explicitly provided, it destroyed the `tooltip`, the custom `color` palette (`CHART_PALETTE`), and the `backgroundColor` setup passed down from `echartsOptions`. This led to a visually inconsistent chart with broken tooltips and un-themed defaults bleeding into the React app.

**Discovery Signal:**
Scan 5 ("setOption Correctness") revealed this behavior. `notMerge: true` is unsafe when using partial option updates in an environment where base themes and tooltips must persist, and memory explicitly mentioned this as an ECharts gotcha: "To avoid inadvertently destroying existing configurations ... pass the full options object or utilize `replaceMerge: ['series', ...]` instead."

**context7 Reference:**
`setOption` / `replaceMerge` (ECharts 5.x docs).

**The Fix:**
Replaced `{ notMerge: true }` with `{ replaceMerge: ['series', 'yAxis'] }`. This instructs ECharts to discard only the stale arrays corresponding to series/yAxis that are no longer requested, while smoothly merging and preserving the root-level config like `tooltip`, `grid`, and `color`.

**The Benefit:**
Multi-key `Chart.tsx` visualizations no longer crash their own tooltips or flash white/default palettes. They maintain full visual consistency with the app's dark mode and custom formatter constraints.

---

## Part 2 — Visualization Proposals

These 3 visualization ideas use existing metadata to surface new insights without requiring new dependencies or processing logic.

### Proposal 1 of 3: PhenoAge Gauge
**ECharts type:** `gauge`

**Which existing data it uses:**
The app already computes a specific tag group `a-PhenoAge`. The `dataAtom` contains these measured markers.

**What it reveals that current charts don't:**
Right now, biological age metrics are scattered across rows. A gauge showing the percentage of the 9 Phenotypic Age biomarkers currently sitting inside their `extra.optimality` bounds provides a single, high-level "Metabolic Health Score" that's instantly recognizable.

**Where it would live:**
A new `src/layout/GaugeChart.tsx` file, inserted as a mini-dashboard card at the top of `App.tsx` or when filtering by the "PhenoAge" tag.

**Trigger / entry point:**
Automatically displayed beside the current "Filter by Tag" row as a persistent high-level metric.

**Implementation complexity:** Low
The calculation is simply `phenoAgeMarkers.filter(m => m.optimality[latestIndex]).length / phenoAgeMarkers.length`. The gauge config in ECharts 5.6.0 handles the visual representation entirely.

**ECharts 5.6.0 API confirmed via context7:** yes

---

### Proposal 2 of 3: Supplement Phase Clustering
**ECharts type:** `ecStat:clustering`

**Which existing data it uses:**
The app already records `tags` arrays within `noteValues` at specific `validIndices`. We can cross-reference the supplement protocols currently recorded with the time-series arrays.

**What it reveals that current charts don't:**
Instead of requiring users to manually guess if stopping a supplement changed their results, this would use echarts-stat to statistically cluster time points where specific supplements were active, proving (or disproving) if "Phase 1: Vitamin D" resulted in a distinctly different mathematical cluster than "Phase 2: Off Supplements".

**Where it would live:**
A new tab or view alongside the correlation tables in `App.tsx` or a new dialog triggered from the Nav.

**Trigger / entry point:**
A "Detect Phases" button near the "Correlate" button.

**Implementation complexity:** High
It requires formatting the multi-dimensional marker arrays into the specific matrix shape `ecStat:clustering` expects and generating the hull/scatter view.

**ECharts 5.6.0 API confirmed via context7:** yes

---

### Proposal 3 of 3: Cross-Category Parallel Plot
**ECharts type:** `parallel`

**Which existing data it uses:**
`nonInferredDataAtom` provides all actual lab measurements. `extra.optimality` provides boolean true/false for each time point.

**What it reveals that current charts don't:**
Scatter and Line charts only handle 2-4 axes before becoming unreadable. A Parallel plot can handle 15-20 biomarkers simultaneously, allowing users to draw a brush selection over the latest time point to instantly see which 5 markers across *different* categories (e.g., Liver, Kidney, Metabolic) are simultaneously out of range.

**Where it would live:**
A new `src/layout/ParallelChart.tsx` component.

**Trigger / entry point:**
A "System Overview" toggle button replacing the multi-axis scatter when >5 markers are selected.

**Implementation complexity:** Medium
ECharts handles parallel plots well, but defining optimal axis scaling for 10+ distinct unit scales (mg/dL vs 10^12/L) requires careful `parallelAxis` configuration to align their optimal bands visually.

**ECharts 5.6.0 API confirmed via context7:** yes

---

> Recommended implementation order: Proposal 1 first (highest insight, lowest effort), then 3, then 2.
