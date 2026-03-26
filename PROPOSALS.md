
**Recommended implementation order:** Proposal 1 first (highest insight, lowest effort), then Proposal 2, then Proposal 3.

---

**Proposal 1 of 3: Range Deviation VisualMap**

**ECharts type:** `visualMap`

**Which existing data it uses:**
Uses the boolean array `extra.optimality[]` from `src/processors/post/range.ts` (available inside `dataAtom`'s `BioMarker`) to indicate whether each test value is within the optimal bounds.

**What it reveals that current charts don't:**
Color-encodes the main line graph in `LineChart.tsx` or `Chart.tsx` (e.g., green when within range, red when out of bounds), revealing exactly when a biomarker drifted into an unhealthy state without requiring the user to cross-reference against shaded `markArea` zones manually.

**Where it would live:**
Enhancement to existing `src/layout/LineChart.tsx` (the single biomarker line inside table row expander).

**Trigger / entry point:**
Triggered automatically whenever a user expands a table row to view a single biomarker's time-series chart.

**Implementation complexity:** Low
(Low: `extra.optimality[]` is already fully pre-computed per value in parallel with the data array; only requires mapping this into a `visualMap.pieces` config option inside the line chart.)

**ECharts 5.6.0 API confirmed via context7:** yes - `visualMap.pieces` and `visualMap.dimension` path checked.

---

**Proposal 2 of 3: Optimal Proximity Gauge**

**ECharts type:** `gauge`

**Which existing data it uses:**
Uses `extra.range` (parsed into min/max bounds) and the most recent valid value from `biomarkerValues[]` within the active `BioMarker` from `dataAtom`.

**What it reveals that current charts don't:**
Visually represents how dangerously close the current biomarker value is to the edge of the optimal range. While the table shows absolute numbers, the gauge instantly contextualizes the risk of drifting out-of-bounds.

**Where it would live:**
New `src/layout/GaugeChart.tsx` component, rendered as a small summary visualization inside the table row expander section next to the `LineChart.tsx`.

**Trigger / entry point:**
Accessible immediately upon expanding any biomarker row in the main `Table.tsx` view.

**Implementation complexity:** Medium
(Medium: requires parsing the string `extra.range` bounds correctly to set the gauge `min` and `max` limits dynamically, and calculating color thresholds for the gauge axis.)

**ECharts 5.6.0 API confirmed via context7:** yes - `series[type=gauge]` path checked.

---

**Proposal 3 of 3: Tag Group Outlier Bar Analysis**

**ECharts type:** `bar` + `markLine`

**Which existing data it uses:**
Uses the latest values of all biomarkers grouped by the active tag in `tagAtom`, along with their corresponding `extra.range` values to normalize the variance.

**What it reveals that current charts don't:**
Instantly highlights which specific biomarkers within an entire physiological category (e.g., all 9 Metabolic markers) are the most severely out of optimal range at the time of the latest test, ranking them by standard deviation or absolute offset from normal.

**Where it would live:**
New `src/layout/DeviationChart.tsx`, rendered conditionally in `App.tsx` or `Nav.tsx` view area when a specific tag filter is active.

**Trigger / entry point:**
Auto-renders when the user clicks a specific tag button (e.g., "3-Liver") in the top navigation area, complementing the existing radar chart.

**Implementation complexity:** High
(High: requires a new data transformation step to normalize values from completely different units/ranges onto a single comparable percentage or standard-deviation scale for the bar chart.)

**ECharts 5.6.0 API confirmed via context7:** yes - `series[type=bar].markLine` path checked.

Recommended implementation order: Proposal 2 first (highest insight, medium effort), then Proposal 1, then Proposal 3.
