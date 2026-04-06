## Part 1 — Implementation Report

**The Issue:**
`RadarChart.tsx` (line 149) is missing `notMerge={true}` on its `<ReactECharts>` component instance, which causes stale series from previous tag renders to bleed through and overlap on re-render.

**Discovery Signal:**
Triggered by Scan 5 (`setOption` Correctness). `RadarChart` was missing the prop unlike `ScatterChart`, `Chart`, and `Chart2`.

**context7 Reference:**
`echartsInstance.setOption` `notMerge` — ECharts 5.6 docs (Confirmed behavior replacement via API fallback search).

**The Fix:**
Added `notMerge={true}` property to `<ReactECharts />` inside `RadarChart.tsx`.

**The Benefit:**
Ensures complete option replacement during radar transitions, preventing stale visual UI states from bleeding into the current visualization frame.

---

## Part 2 — Visualization Proposals

These 3 visualization ideas use existing metadata to surface new insights without requiring new dependencies or processing logic.

**Proposal 1 of 3: Correlation Matrix Heatmap**

**ECharts type:** `heatmap`

**Which existing data it uses:**
uses `correlationAtom` (which outputs Pearson/Spearman pair results across pre-computed tags) from `src/atom/correlationAtom.ts`.

**What it reveals that current charts don't:**
Reveals at a single glance pairwise positive/negative correlative weights across tag groups. Current visualizations represent singular line or point scatter points, missing matrix-level dependency views between markers.

**Where it would live:**
new `src/layout/CorrelationHeatmap.tsx`, potentially nested under `Correlation.tsx` layout blocks.

**Trigger / entry point:**
Added alongside existing `BiomarkerCorrelation.tsx` UI under the "Correlate" row expansions or macro toggle switches in the Correlation view pane.

**Implementation complexity:** Medium
(Medium: Extracting array matrix weights into a distinct 2D ECharts `heatmap` series requires parsing the structured correlation Atom outputs to X/Y dataset maps without new external calculation blocks.)

**ECharts 5.6.0 API confirmed via context7:** yes

---

**Proposal 2 of 3: Gauge Optimization Dial**

**ECharts type:** `gauge`

**Which existing data it uses:**
uses `extra.optimality[]` and `extra.range` pre-computed values from `src/processors/post/range.ts` for individual elements in `BioMarker`.

**What it reveals that current charts don't:**
Condenses current long historical tracking vectors into a single "Now" dial for a specific biomarker, highlighting its deviation or closeness to its respective boundaries against a singular fixed value scope.

**Where it would live:**
Existing main data row expansions. Rendered adjacent to `LineChart.tsx` where isolated biomarkers expand.

**Trigger / entry point:**
Row expansion in the main data list. Rendering alongside `LineChart.tsx` for deeper single-metric visibility.

**Implementation complexity:** Low
(Low: Data constraints for `extra.optimality[]` and `extra.range` already exist at the per-row level. `gauge` implementation maps straight to normalized boundary scales.)

**ECharts 5.6.0 API confirmed via context7:** yes

---

**Proposal 3 of 3: Frequency Timeline Distribution**

**ECharts type:** `ecStat:histogram`

**Which existing data it uses:**
uses `BioMarker` array value frequencies against defined time intervals (the length index of dataset `values` mapped to `labels` across the 2008–present density span).

**What it reveals that current charts don't:**
Visualizes the density/frequency distribution over time frames rather than tracking direct numeric magnitude via line/scatter interpolation, highlighting metric consistency and variance skew.

**Where it would live:**
new `src/layout/HistogramChart.tsx`, rendered inside the broader app tracking layout panes or table header popovers.

**Trigger / entry point:**
A toggle button on row expansion headers switching the context from temporal lines (`LineChart.tsx`) to metric distribution frequencies.

**Implementation complexity:** High
(High: ECharts `ecStat:histogram` transforms involve setting correct statistical boundary bin limits on raw scalar historical biomarker sets without breaking dataset rendering loops for smaller, sparse intervals.)

**ECharts 5.6.0 API confirmed via context7:** yes

Recommended implementation order: Proposal 2 first (highest insight, lowest effort), then 1, then 3.
