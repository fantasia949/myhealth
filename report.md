## Part 1 — Implementation Report

**The Issue:**
`src/layout/Chart.tsx` (Lines 91-105 & 165-177). When multiple biomarkers were selected in `Chart.tsx`, all Y-axes were rendered at the exact same location (default `offset: 0` and `position: 'left'`). This caused complete visual overlapping of axis lines, ticks, and labels, making the axis scales unreadable. Additionally, the `grid` padding was hardcoded (`top: 40, bottom: 20`), which meant that even if offsets were added, axes pushed outward would overflow the SVG boundary and disappear.

**Discovery Signal:**
Scan 3 — Multi-Axis Legibility (Chart). Identified that `Chart.tsx` sets `name: keys[i]` but does not configure `offset`, `position`, or dynamic `grid` padding like `ScatterChart.tsx` does, resulting in multi-axis overlap.

**context7 Reference:**
`yAxis.offset`, `yAxis.position`, and `grid` padding confirmed valid for ECharts 6. (Verified via Node introspection of `echarts/charts` and standard ECharts 6 axis configuration rules, bypassing unavailable context7).

**The Fix:**
I modified `yAxis` generation in `src/layout/Chart.tsx` to explicitly calculate an alternating `position` (`left`/`right`) and an incremental `offset` (`Math.floor(i / 2) * 80`) for each axis. To prevent these shifted axes from being cut off, I dynamically calculated `grid.left` (`Math.ceil(keys.length / 2) * 80 + 40`) and `grid.right` in the `instance.setOption` call. `backgroundColor: 'transparent'`, `theme: 'dark'`, and the imported `CHART_PALETTE` mapping per axis line were all preserved.

**The Benefit:**
Users can now clearly compare the scales of multiple overlapping biomarker trends in `Chart.tsx`. Axis scales, ticks, and labels are beautifully fanned out and legible without overlapping or clipping, fully matching the refined multi-axis UX of `ScatterChart`.

**TypeScript result:**
`pnpm exec tsc --noEmit --strict` output: 0 errors.

---

## Part 2 — Visualization Proposals

_Note: As context7 was unavailable, ECharts 6 component availability was verified via Node introspection of `require('echarts/charts')`._

**Proposal 1 of 5: Tag Group Optimality Funnel**
**ECharts type:** `funnel`
**Codebase citation:** `extra.optimality[]` pre-computed boolean array in `src/processors/post/range.ts` and `tagAtom` from `src/atom/dataAtom.ts`.
**Which existing data it uses:** Calculates the percentage of total time points where `optimality === false` (in-range) for each biomarker in the currently selected `tagAtom` group (via `visibleDataAtom`).
**What it reveals that current charts don't:** Provides a clear hierarchy of system fragility. By ranking markers within a biological system (e.g. `3-Liver`) by their historical "in-range" frequency, the funnel instantly identifies the system's weakest link that needs the most long-term support.
**Where it would live:** New `src/layout/OptimalityFunnel.tsx`, rendered below the main table when a tag is active.
**Trigger / entry point:** Activating any tag filter button (e.g., "Liver") in `Nav.tsx`.
**Implementation complexity:** Low. Requires a simple percentage reduction of the existing `optimality[]` array and standard ECharts funnel configuration.
**ECharts 6 API confirmed:** Yes (via `require('echarts/charts')` -> `FunnelChart`).

**Proposal 2 of 5: Biomarker Volatility Treemap**
**ECharts type:** `treemap`
**Codebase citation:** `nonInferredDataAtom` and `tagDescription` from `src/processors/post/tag.ts`.
**Which existing data it uses:** Groups all `nonInferredDataAtom` markers into nested hierarchical blocks by their assigned `tag`. The area of each leaf block represents the marker's coefficient of variation (standard deviation / mean) across its entire `values[]` history.
**What it reveals that current charts don't:** Gives a zoomed-out view of bodily instability. Rather than focusing on values, it visualizes which entire biological systems (e.g., Hormones vs. Minerals) are experiencing the wildest historical swings, drawing attention to systemic turbulence rather than static point-in-time abnormalities.
**Where it would live:** A new "Volatility Overview" tab on the main dashboard.
**Trigger / entry point:** A dedicated "View System Volatility" button next to the correlation toggles.
**Implementation complexity:** Medium. Requires calculating the CV (standard deviation divided by mean) across valid indices of each biomarker's value array.
**ECharts 6 API confirmed:** Yes (via `require('echarts/charts')` -> `TreemapChart`).

**Proposal 3 of 5: Cumulative Progress Waterfall (Bar)**
**ECharts type:** `bar` (using standard waterfall/transparent-base configuration)
**Codebase citation:** `labels[]` from `src/data/index.ts` and `visibleDataAtom`.
**Which existing data it uses:** Takes a single biomarker's timeline. The first bar represents the earliest recorded value. Subsequent bars plot the positive or negative delta (difference) between consecutive test dates, culminating in a total "current value" bar.
**What it reveals that current charts don't:** Unpacks the specific journey of long-term interventions (e.g., losing Weight or lowering LDL). It highlights exactly _when_ the biggest regressions or breakthroughs occurred between tests, rather than just showing a smoothed line trend.
**Where it would live:** Embedded within the expanded table row, alongside the existing `LineChart.tsx`.
**Trigger / entry point:** Expanding a single biomarker row in the data table.
**Implementation complexity:** Medium. Requires mapping the raw `values[]` array into a sequence of calculated step deltas with a transparent base series.
**ECharts 6 API confirmed:** Yes (via `require('echarts/charts')` -> `BarChart` using `stack` and `transparent` item colors).

**Proposal 4 of 5: Spearman Correlation Ranking Bump Chart**
**ECharts type:** `line` (with `smooth: true` and Y-axis inversion)
**Codebase citation:** `rankedDataMapAtom` from `src/atom/dataAtom.ts` (which caches Spearman ranks) and `correlationMethodAtom`.
**Which existing data it uses:** Takes the top 5 most highly correlated markers to a target biomarker. Instead of plotting raw values, it plots their relative _rank_ against each other over 5 to 10 distinct chronological windows.
**What it reveals that current charts don't:** Tracks how biological relationships evolve over time. It reveals whether a metric like LDL always moved perfectly with Weight (rank remains flat), or if their correlation temporarily decoupled during a specific intervention phase.
**Where it would live:** Inside the existing `BiomarkerCorrelation.tsx` modal view.
**Trigger / entry point:** Clicking the "Correlations" action on a specific biomarker.
**Implementation complexity:** High. Requires chunking the time-series arrays and running the correlation/ranking calculation per chronological window to form the bump lines.
**ECharts 6 API confirmed:** Yes (via `require('echarts/charts')` -> `LineChart`).

**Proposal 5 of 5: Metabolic Phase Trajectory (Connected Scatter)**
**ECharts type:** `scatter` (with `polyline` or sequential chronological `line` connecting the dots)
**Codebase citation:** `dataMapAtom` and `labels[]`.
**Which existing data it uses:** Plots two different biomarkers (e.g., Glucose vs Insulin) on the X and Y axes, and connects their chronological coordinates sequentially using dates from `labels[]`.
**What it reveals that current charts don't:** Visualizes biological hysteresis. By connecting the dots over time, it shows not just that two markers correlate, but the "loop" they take—revealing if the body's path into insulin resistance looks different from its path out of it.
**Where it would live:** An alternative view toggle inside `Chart2.tsx` (which already handles two-marker XY plotting).
**Trigger / entry point:** A new "Show Trajectory Path" toggle inside `Chart2.tsx` when exactly two biomarkers are selected.
**Implementation complexity:** Low. Can be achieved simply by enabling a connecting line with arrows on the existing `ScatterChart` options and ensuring the dataset maintains chronological sort.
**ECharts 6 API confirmed:** Yes (via `require('echarts/charts')` -> `ScatterChart` and `LineChart` for the connector).

> Recommended implementation order: Proposal 1 first (highest insight, lowest effort), then 5, then 3, then 2, then 4.
