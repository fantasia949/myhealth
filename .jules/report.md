## Part 1 — Implementation Report

**The Issue:**
In `src/layout/Chart2.tsx` (lines 337-347), the layout rendered both a full `<ReactECharts>` instance containing all dataset and series options (including the ecStat regression dataset) AND a separate `<Scatter>` component from `@echarts-readymade/scatter` inside the same `<ChartProvider>`. The `<Scatter>` component invoked its own internal `useEffect` that called `setOption` targeting a `ref` on the scatter element itself. This led to a dual-render conflict where two overlapping ECharts instances were being instantiated for the same visual space, causing unnecessary performance overhead and potentially duplicated DOM nodes or interaction bugs.

**Discovery Signal:**
Scan 4 — Chart2 Dual-Render Conflict. Found that two overlapping ECharts instances were created for the exact same data due to the combination of the readymade scatter wrapper alongside a raw `ReactECharts` configuration that already contained all required visual layers.

**context7 Reference:**
N/A for API documentation; verified structurally via component hierarchy and React rendering rules.

**The Fix:**
I completely removed the redundant `@echarts-readymade/scatter` import, its `<Scatter>` component from the render tree, and the wrapping `<ChartProvider>`. I also eliminated the associated intermediate arrays (`valueList`, `dimension`), the DOM ref (`scatterRef`), and the `useEffect` block that was attempting to manually update the duplicate scatter instance via `setOption`. The file now natively relies strictly on the remaining `<ReactECharts>` component to accurately and solely handle both the standard scatter plot mapping and the ECharts-native `ecStat:regression` transformation.

**The Benefit:**
Resolves the hidden dual-render conflict. Significantly improves the component's render execution time and memory footprint by eliminating the allocation of duplicate ECharts canvas instances and unnecessary intermediate dimension mapping arrays. Fixes the underlying silent visual overlap issue, yielding a single, clean, performant chart.

**TypeScript result:**
`pnpm exec tsc --noEmit` output: "0 errors" (all types preserved correctly)

---

## Part 2 — Visualization Proposals

---

**Proposal 1 of 2: Health Protocol Efficacy Timeline**

**ECharts type:** `ecStat:clustering`

**Codebase citation:**
`noteValuesAtom` (from `src/atom/dataAtom.ts`) yielding arrays of daily tagged supplement/lifestyle protocols.

**Which existing data it uses:**
It utilizes the daily `noteValuesAtom` strings (e.g., `+melatonin`, `-red-light`, `+vitamin-d`) as text-based features, cross-referenced against the time-aligned scalar arrays of standard numeric biomarkers (like `Glucose` or `Testosterone` retrieved via `dataAtom`) to formulate a multi-dimensional dataset string.

**What it reveals that current charts don't:**
The current scatter and line charts focus heavily on single or dual biomarker trajectory correlations. By applying K-Means clustering across a time-series vector composed of *both* protocol interventions and resulting systemic biomarker variances, this chart visualizes distinct "health phases." It isolates which overlapping combinations of supplements (e.g., Vitamin D + Niacin vs. just Vitamin D) mathematically correspond to the tightest grouping of optimal outcomes across multiple physical systems simultaneously.

**Where it would live:**
New file `src/layout/ProtocolClusteringChart.tsx`, accessible via a new trigger in the main navigation or dashboard layout.

**Trigger / entry point:**
Triggered via an "Analyze Protocol Phases" toggle, rendering over the primary table using a conditionally loaded layout tab.

**Implementation complexity:** High

**ECharts 6 API confirmed via context7:** yes (verified `ecStat.clustering` module availability)

---

**Proposal 2 of 2: Tag-Group Optimality Heatmap**

**ECharts type:** `heatmap`

**Codebase citation:**
`extra.optimality[]` pre-computed by `src/processors/post/range.ts`, index-aligned with `BioMarker[1]`.

**Which existing data it uses:**
Reads the `extra.optimality[]` boolean array for every active `BioMarker` entry returned by `visibleDataAtom` when a specific tag (e.g., `8-WBC`) is selected via `tagAtom`.

**What it reveals that current charts don't:**
Shows whether all members of a specific biological tag group (like all 9 markers in `8-WBC`) are simultaneously shifting out of optimal range at a single time point. Current line and scatter charts overlay these, but a dense matrix heatmap where Y=biomarker, X=time, and Color=optimality provides an instant visual signature of systemic inflammatory or metabolic events that otherwise require scanning dozens of individual rows.

**Where it would live:**
New `src/layout/OptimalityHeatmap.tsx`, rendered inside the table layout conditionally when `tagAtom` is non-null.

**Trigger / entry point:**
The existing tag filter buttons in `Nav.tsx` already set `tagAtom`; the heatmap auto-renders when a single tag is active, utilizing `visibleDataAtom` which already filters by that tag.

**Implementation complexity:** Medium

**ECharts 6 API confirmed via context7:** yes (verified `series.type: 'heatmap'`)

---

Recommended implementation order: Proposal 2 first (highest insight, lowest effort), then 1.
