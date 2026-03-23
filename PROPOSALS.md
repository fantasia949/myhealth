**Part 1 — Implementation Report**

**The Issue:**
In `src/layout/Chart.tsx`, the multi-axis line chart lacked a custom tooltip formatter and was passing raw 6-digit `labels[i]` (e.g., "YYMMDD") directly into the X-axis dimension (`d1`). This caused the ECharts default tooltip to show unformatted dates and render `"SeriesName: -"` for any missing data points (nulls mapped to `'-'`), violating the null-suppression UX pattern.

**Discovery Signal:**
Scan 1 (Null Value Handling) & Scan 2 (Tooltip Quality). Found that the tooltip showed unformatted dates and raw `'-'` for null biomarker values.

**context7 Reference:**
Confirmed `option.tooltip.formatter` callback parameters for `trigger: 'axis'` and the `dataset` format structure for ECharts 5.6.0.

**The Fix:**
- Added a `formatTime(label)` helper to `src/layout/Chart.tsx`.
- Updated the `chartData` generation to pass formatted dates `formatTime(labels[i])` into `d1`.
- Added a custom `tooltip.formatter` to `echartsOptions.option` that intercepts `axis` triggers, unpacks the dataset rows via `p.dimensionNames[p.encode.y[0]]`, and only appends series to the tooltip string if their value `!== '-' && !== null && !== undefined`.

**The Benefit:**
The X-axis and tooltip now display correctly formatted readable dates (20YY/MM/DD). Tooltips are now completely clean of missing values, ensuring users only see data that was actually measured at a specific time point without distracting empty/null placeholders.

---

**Proposal 1 of 3: Tag Group vs Optimal Range Radar**

**ECharts type:** `radar`

**Which existing data it uses:**
It uses `extra.optimality[]` pre-computed in `src/processors/post/range.ts`, the `extra.tag` field for filtering by a specific group (e.g., `2-Metabolic`), and `extra.range` to format tooltip bounds.

**What it reveals that current charts don't:**
It shows whether all biomarkers in a specific tag group (like all 9 Metabolic markers) are simultaneously within their optimal ranges at a glance. Instead of requiring the user to scan each table row individually and track them over time, this provides a single "shape of health" for a specific subsystem at the latest time point.

**Where it would live:**
A new `src/layout/RadarChart.tsx` component, rendered dynamically below the main ScatterChart when a specific tag filter is active (via `tagAtom` in `App.tsx` or `Nav.tsx`).

**Trigger / entry point:**
The existing tag filter buttons in `Nav.tsx` already set `tagAtom`; the radar chart could auto-render when a single valid tag group is selected.

**Implementation complexity:** Low
`extra.optimality[]` and `extra.range` are already computed; only a new ECharts `radar` option config mapped from the filtered `visibleDataAtom` is needed.

**ECharts 5.6.0 API confirmed via context7:** yes - `radar` and `series-radar` options verified.

---

**Proposal 2 of 3: Biomarker Correlation Matrix Heatmap**

**ECharts type:** `heatmap`

**Which existing data it uses:**
It uses the pre-computed correlations available in the `correlationAtom` (which uses `correlationMethodAtom` for Spearman vs Pearson) and the `rankedDataMapAtom` cache for fast data fetching.

**What it reveals that current charts don't:**
It instantly visualizes the strength and direction of relationships across all tracked biomarkers simultaneously. Currently, users must manually select pairs or read the raw text output in the `BiomarkerCorrelation` table to find strong relationships. A heatmap provides a global view of how all markers influence each other (e.g., how metabolic markers cluster).

**Where it would live:**
A new `src/layout/CorrelationHeatmap.tsx` component, replacing or living alongside the existing `BiomarkerCorrelation.tsx` table when viewing the correlation analysis page.

**Trigger / entry point:**
A toggle button in the correlation analysis view to switch between the "Table View" (current) and "Matrix View" (new heatmap).

**Implementation complexity:** Medium
The math is already done and cached via `correlationAtom`. The challenge is formatting the NxN matrix data correctly for the ECharts `heatmap` series and ensuring the visual map scaling correctly handles [-1, 1] correlation bounds.

**ECharts 5.6.0 API confirmed via context7:** yes - `series-heatmap` and `visualMap` options verified.

---

**Proposal 3 of 3: Single Biomarker Drift Boxplot**

**ECharts type:** `boxplot`

**Which existing data it uses:**
It uses the raw values array (`bioMarker[1]`) for a single biomarker across all time points, ignoring nulls.

**What it reveals that current charts don't:**
It shows the distribution (min, max, median, quartiles) and outliers of a single biomarker over time. While the LineChart shows the exact path, a boxplot clearly identifies if a marker has high variance (widely spread boxes) or is tightly controlled, and instantly flags historical outlier readings that might represent acute events rather than chronic drift.

**Where it would live:**
A new `src/layout/BoxplotChart.tsx`, optionally rendered as a secondary tab inside the expanded row view of `Table.tsx` (next to the current `LineChart.tsx`).

**Trigger / entry point:**
A small toggle inside the expanded table row: "Line Chart" vs "Distribution (Boxplot)".

**Implementation complexity:** Low
We only need to map the non-null values of the selected biomarker into the standard ECharts boxplot format. We can use the `@echarts-readymade/core` or `echarts-for-react` wrapper.

**ECharts 5.6.0 API confirmed via context7:** yes - `series-boxplot` option verified.

---

Recommended implementation order: Proposal 2 first (highest insight, medium effort), then Proposal 1, then Proposal 3.