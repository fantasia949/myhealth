# Implementation Report

**The Issue:**
In `src/layout/ScatterChart.tsx`, when 4 or more biomarkers were selected (e.g. RBC, Hb, HCT, MCV), the generated Y-axes all defaulted to `position: 'left'` and stacked their labels on top of each other using an `offset: index * 80` that eventually overflowed the chart container. Additionally, the Vietnamese biomarker names were too long and were not truncated, further overlapping with the grid and other axes.

**Discovery Signal:**
Scan 3 — Multi-Axis Legibility (ScatterChart): "Y-axes use `offset: index * 80`. For 4+ biomarkers does the rightmost axis overflow the chart container? Are axis names truncating?"

**context7 Reference:**
`yAxis.position`, `yAxis.offset`, `yAxis.nameTextStyle.width`, `yAxis.nameTextStyle.overflow`, `grid.left`, and `grid.right` (ECharts 5.6 docs).

**The Fix:**
I modified the dynamic Y-axis generation in `src/layout/ScatterChart.tsx` to:
1. Alternate axis placement by checking `index % 2 === 0 ? 'left' : 'right'`.
2. Group the offsets for each side using `Math.floor(index / 2) * 80`.
3. Add `nameTextStyle: { width: 70, overflow: 'truncate' }` to ensure long names don't bleed into other axis lanes.
4. Dynamically calculate and expand `grid.left` and `grid.right` based on the maximum offset needed by the active axes on each side.

**The Benefit:**
Users can now reliably select 4+ biomarkers simultaneously and compare them on the scatter plot. All Y-axes are distinctly readable, evenly distributed across the left and right sides of the chart container, and properly padded so no text overflows off-screen or overlaps with the data grid.

---

# Visualization Proposals

**Proposal 1 of 3: Range Deviation VisualMap**

**ECharts type:** `visualMap`

**Which existing data it uses:**
Uses the boolean array `extra.optimality[]` from `src/processors/post/range.ts` (available inside `dataAtom`'s `BioMarker`) to indicate whether each test value is within the optimal bounds.

**What it reveals that current charts don't:**
Color-encodes the main line graph in `LineChart.tsx` (e.g., green when within range, red when out of bounds), revealing exactly when a biomarker drifted into an unhealthy state without requiring the user to cross-reference against shaded `markArea` zones manually.

**Where it would live:**
Enhancement to existing `src/layout/LineChart.tsx` (the single biomarker line inside table row expander).

**Trigger / entry point:**
Triggered automatically whenever a user expands a table row to view a single biomarker's time-series chart.

**Implementation complexity:** Low
`extra.optimality[]` is already fully pre-computed per value in parallel with the data array; only requires mapping this into a `visualMap.pieces` config option inside the line chart.

**ECharts 5.6.0 API confirmed via context7:** yes (checked `visualMap.pieces` and `visualMap.dimension`)

---

**Proposal 2 of 3: Single-Biomarker Boxplot Distribution**

**ECharts type:** `boxplot`

**Which existing data it uses:**
The raw historical values array (`number[]`) for any single `BioMarker` accessed from `dataAtom` in `src/atom/dataAtom.ts`.

**What it reveals that current charts don't:**
Reveals the statistical distribution of a single biomarker. Instead of a messy time-series line, a boxplot clearly shows the median, quartiles, and outliers of a biomarker over the entire 2008-present timeframe, highlighting long-term structural variance vs normal fluctuations.

**Where it would live:**
A new `src/layout/BoxplotChart.tsx`.

**Trigger / entry point:**
When a user expands a specific biomarker row in the data table, the existing `LineChart` could be accompanied by a small segmented control to toggle between "Time View" (line) and "Distribution View" (boxplot).

**Implementation complexity:** Medium
The exact array of numbers is already passed to the LineChart. We just need to load it into a generic ECharts dataset and declare the `transform: { type: 'boxplot' }` option (via ECharts built-in data transform), requiring very little custom JS logic.

**ECharts 5.6.0 API confirmed via context7:** yes (checked `dataset.transform.type = 'boxplot'`)

---

**Proposal 3 of 3: Seasonal Biomarker Heatmap**

**ECharts type:** `calendar` + `heatmap`

**Which existing data it uses:**
The values array (`number[]`) and the time-series labels (`labels[]` strings) mapped to the `BioMarker` in `dataAtom`.

**What it reveals that current charts don't:**
Highlights seasonal or structural patterns that traditional line charts obscure. For slowly-changing metrics (like Weight, Vitamin D, or Glucose), a calendar view immediately exposes if values tend to spike during the winter holidays or drop sharply in specific months, mapped directly to a year view.

**Where it would live:**
New `src/layout/CalendarHeatmap.tsx`.

**Trigger / entry point:**
An additional chart view option selectable from the main dashboard or specific biomarker rows when viewing high-density biomarkers (ones measured frequently enough to populate a calendar).

**Implementation complexity:** Medium
Requires formatting the existing `YYMMDD` string tags from `labels[]` into proper Date objects/strings compatible with the ECharts `calendar` coordinate system, but no new state atoms or complex data fetching are required.

**ECharts 5.6.0 API confirmed via context7:** yes (checked `calendar`, `series-heatmap.coordinateSystem = 'calendar'`)

---

> Recommended implementation order: Proposal 1 first (highest insight, lowest effort), then 2, then 3.
