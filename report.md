## Part 1 — Implementation Report

**The Issue:**
`src/layout/LineChart.tsx` (Lines 26-44). The existing tooltip formatter displayed the series name, date, and raw value, but silently omitted the biomarker's unit (e.g., `mg/dL`). This occurred because the `LineChartProps` interface only provides a `values: number[]` array, offering no native way for the component to know the unit.

**Discovery Signal:**
Scan 2 — Tooltip Quality & Completeness. Found that the `LineChart.tsx` tooltip checked for gaps (`'-'`) but lacked unit integration, which is a significant UX gap for health metrics.

**context7 Reference:**
`tooltip.formatter` confirmed valid for ECharts 6. (Verified locally via node runtime introspection of `echarts/components` and `package.json` version 6.0.0, as context7 was unavailable).

**The Fix:**
Without modifying the prohibited `LineChartProps` interface, I leveraged Jotai's global state by adding `const dataMap = useAtomValue(dataMapAtom); const unit = dataMap.get(name)?.[2] || '';` inside the component. I then moved the tooltip formatter inside the component's `useMemo` options block, modifying it to append the resolved `unit` to `p.value[1]`. `backgroundColor: 'transparent'` and `theme: 'dark'` were preserved.

**The Benefit:**
The LineChart tooltip now displays full context (e.g., "14.5 mg/dL" instead of just "14.5"). Users can accurately interpret their measurements without cross-referencing other charts or tables.

**TypeScript result:**
`npx tsc --noEmit` output: 0 errors.

---

## Part 2 — Visualization Proposals

_Note: As context7 was unavailable for ECharts option lookups, ECharts 6 component availability was verified via Node introspection of `require('echarts/components')` and `require('echarts/charts')`._

**Proposal 1 of 5: Out-of-Range Heatmap by Tag Cluster**
**ECharts type:** `heatmap`
**Codebase citation:** `extra.optimality[]` pre-computed boolean array in `src/processors/post/range.ts` and `tagAtom` from `src/atom/dataAtom.ts`.
**Which existing data it uses:** Reads `extra.optimality[]` for every `BioMarker` entry returned by `visibleDataAtom` when `tagAtom` is active.
**What it reveals that current charts don't:** Instantly highlights temporal "danger zones" where multiple related markers (e.g., all `3-Liver` markers) fell out of range simultaneously on the same date, revealing cascading system stress that single-line charts obscure.
**Where it would live:** New `src/layout/OptimalityHeatmap.tsx`, rendered conditionally in the main view when `tagAtom` is selected.
**Trigger / entry point:** Selecting any tag group button (e.g., "Liver") sets `tagAtom`, triggering the heatmap.
**Implementation complexity:** Low. Uses existing boolean arrays and standard `echarts-for-react` heatmap.
**ECharts 6 API confirmed:** Yes (via `require('echarts/charts')` -> `HeatmapChart`).

**Proposal 2 of 5: Metric Drift Gauge**
**ECharts type:** `gauge`
**Codebase citation:** `extra.range` string (e.g., "3.9 - 6.4") and `extra.isNotOptimal` function from `src/processors/post/range.ts`.
**Which existing data it uses:** Parses the numeric bounds from `extra.range` and maps the latest temporal value of a single `BioMarker` from `visibleDataAtom`.
**What it reveals that current charts don't:** Provides an instant, context-rich "dashboard dial" for a single metric, showing exactly how close the latest reading is to crossing the upper/lower bounds of the optimal range.
**Where it would live:** Embedded within the expanded row of the main table, alongside `LineChart.tsx`.
**Trigger / entry point:** Expanding a single biomarker row in the data table.
**Implementation complexity:** Medium. Requires parsing the `range` string back into min/max values if they aren't explicitly exported as tuples.
**ECharts 6 API confirmed:** Yes (via `require('echarts/charts')` -> `GaugeChart`).

**Proposal 3 of 5: Biomarker Snapshot Parallel Coordinates**
**ECharts type:** `parallel`
**Codebase citation:** `nonInferredDataAtom` in `src/atom/dataAtom.ts` and `labels[]` from `src/data/index.ts`.
**Which existing data it uses:** Takes a vertical slice of all `nonInferredDataAtom` biomarkers at the most recent time index (last element of `labels[]`).
**What it reveals that current charts don't:** Plots a full systemic snapshot of all physical measurements at one specific doctor's visit on parallel vertical axes, allowing the user to trace a "health fingerprint" line across all metrics.
**Where it would live:** New `src/layout/SnapshotParallelChart.tsx`.
**Trigger / entry point:** A new "Latest Snapshot" tab or button on the dashboard.
**Implementation complexity:** High. Requires careful axis normalization to prevent crossing lines from becoming a visual mess.
**ECharts 6 API confirmed:** Yes (via `require('echarts/charts')` -> `ParallelChart`).

**Proposal 4 of 5: Missing Data / Measurement Frequency Calendar**
**ECharts type:** `calendar` (with `heatmap` overlay)
**Codebase citation:** `labels[]` from `src/data/index.ts` and `BioMarker[1]` null gaps.
**Which existing data it uses:** Aggregates the density of non-null values across all biomarkers in `dataAtom` for each date in `labels[]`.
**What it reveals that current charts don't:** Visualizes the user's measurement compliance over the year, showing which weeks had dense testing vs. missing gaps.
**Where it would live:** A small overview chart at the very top of the dashboard.
**Trigger / entry point:** Always visible, acting as a global time-navigation minimap.
**Implementation complexity:** Medium. Requires date math to map `YYMMDD` labels to a continuous calendar grid.
**ECharts 6 API confirmed:** Yes (via `require('echarts/components')` -> `CalendarComponent`).

**Proposal 5 of 5: Most Deviant Markers Bar Chart**
**ECharts type:** `bar`
**Codebase citation:** `extra.range` and `extra.optimality[]` from `src/processors/post/range.ts` and `visibleDataAtom`.
**Which existing data it uses:** Filters `visibleDataAtom` for biomarkers where the latest index of `extra.optimality[]` is `true`, then calculates the percentage deviation from the `extra.range` midpoint.
**What it reveals that current charts don't:** Automatically ranks and highlights the "worst offenders" (most out-of-range metrics) right now, prioritizing what needs immediate attention.
**Where it would live:** Dashboard home view, below the global filters.
**Trigger / entry point:** Always rendered as an "Attention Needed" summary widget.
**Implementation complexity:** Medium. Requires calculating midpoints from the `range` strings and sorting the array.
**ECharts 6 API confirmed:** Yes (via `require('echarts/charts')` -> `BarChart`).

> Recommended implementation order: Proposal 1 first (highest insight, lowest effort), then 5, then 2, then 4, then 3.
