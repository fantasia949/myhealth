### Visualization Proposals for MyHealth Dashboard

These visualization ideas leverage the existing data structure (like `extra.optimality[]`, `extra.tag[]`, and statistical atoms) to uncover health insights that current single/multi-line scatter charts do not fully surface.

---

**Proposal 1 of 5: System Health Radial Heatmap (Optimality Clock)**

**ECharts type:** `pie` (with `roseType: 'radius'`) or `polar` `heatmap`

**Codebase citation:**
Reads `extra.optimality[]` from every `BioMarker` entry via `visibleDataAtom`.

**Which existing data it uses:**
It will iterate over the `dataAtom` or `visibleDataAtom`. For each biomarker, it will count the number of `true` values in the pre-computed `extra.optimality[]` boolean array (representing out-of-range measurements) and divide by the total number of non-null measurements in `BioMarker[1]` to get an "out-of-range frequency" percentage.

**What it reveals that current charts don't:**
The current scatter and line charts show raw values over time, forcing users to manually check if points fall within the shaded `markArea` for each individual marker. A polar heatmap/rose chart groups all biomarkers into a single holistic "system health" view, immediately revealing which biomarkers are chronically out of range across the entire recorded history.

**Where it would live:**
New `src/layout/OptimalityRoseChart.tsx`, rendered in a "System Overview" tab or at the top of the main dashboard.

**Trigger / entry point:**
Always visible at the top level, dynamically updating as `tagAtom` changes to show the optimality breakdown specifically for the currently filtered category (e.g. `3-Liver`).

---

**Proposal 2 of 5: Biomarker Correlation Network Graph**

**ECharts type:** `graph`

**Codebase citation:**
Reads the `rankedDataMapAtom` cache and `correlationMethodAtom` (`'spearman'` / `'pearson'`).

**Which existing data it uses:**
Utilizes the pre-calculated Spearman/Pearson ranks from `rankedDataMapAtom` across the filtered `visibleDataAtom` pool. It connects biomarkers (nodes) with edges if their correlation coefficient exceeds the `correlationAlphaAtom` threshold. The edge color can map to positive/negative correlation, and the edge thickness to the absolute coefficient magnitude.

**What it reveals that current charts don't:**
Current charts plot two biomarkers against each other (`Chart2.tsx`) based on a manual dual-selection. A network graph automatically reveals the entire web of statistically significant relationships within a system (e.g., how all `4-Lipid` markers co-move), identifying central "hub" biomarkers that influence many others.

**Where it would live:**
New `src/layout/CorrelationNetworkChart.tsx`, added as a new view mode alongside the existing dual-biomarker `Chart2.tsx` view.

**Trigger / entry point:**
Activated via a "View Network" toggle button in the Correlation section, computing edges on the fly using the currently selected `tagAtom` to limit node density.

---

**Proposal 3 of 5: Measurement Density Calendar**

**ECharts type:** `calendar` with `heatmap` or `scatter`

**Codebase citation:**
Uses `labels[]` from `src/data/index.ts` and `BioMarker[1]` non-null values.

**Which existing data it uses:**
Scans the time-series arrays (`BioMarker[1]`) across all items in `dataAtom` to tally the number of non-null measurements for each date corresponding to the `labels[]` array (converted to standard Date strings via `formattedLabels`).

**What it reveals that current charts don't:**
Current time-series charts skip gaps, making it hard to see _when_ blood panels were actually drawn or how comprehensive a specific testing day was. A calendar heatmap immediately visualizes testing frequency, gaps in tracking, and the density/comprehensiveness of past lab visits.

**Where it would live:**
New `src/layout/TestingCalendar.tsx`.

**Trigger / entry point:**
Could live in a "Testing History" modal or side panel, or as an optional overlay on the main dashboard to help users pick dates for comparison.

---

**Proposal 4 of 5: Tag Group Deviation Bar (Tornado Chart)**

**ECharts type:** `bar` (Diverging Bar Chart)

**Codebase citation:**
Reads `extra.tag[]` from `BioMarker[3]`, `extra.range` string, and `BioMarker[1]`.

**Which existing data it uses:**
Filters `dataAtom` by the currently active `tagAtom` (e.g., `1-RBC`). For each biomarker in the group, it extracts the most recent non-null value from `BioMarker[1]`, parses the `extra.range` string to find the optimal midpoint, and calculates the percentage deviation of the current value from that midpoint.

**What it reveals that current charts don't:**
Instead of viewing 10 different line charts with 10 different y-axis scales to understand the current state of a tag group (like Liver or Kidney health), a tornado chart normalizes all current measurements into percentage deviations from their respective optimal midpoints, immediately showing which markers are trending high vs. low relative to their safe zones.

**Where it would live:**
New `src/layout/TagDeviationChart.tsx`.

**Trigger / entry point:**
Auto-renders when `tagAtom` is not null, summarizing the most recent health state for the selected category.

---

**Proposal 5 of 5: Out-of-Bounds Timeline (Scatter + MarkArea)**

**ECharts type:** `scatter` with custom `symbol` and `visualMap`

**Codebase citation:**
Reads `extra.optimality[]` from `BioMarker[3]` pre-computed by `range.ts`.

**Which existing data it uses:**
Maps the X-axis to time (`labels[]`) and the Y-axis to biomarker names (categorical axis derived from `visibleDataAtom`). It plots points only at indices where `extra.optimality[i] === true`.

**What it reveals that current charts don't:**
While `Chart.tsx` shows lines over time, it's difficult to see a summary of _all_ infractions across the system simultaneously. This chart acts as an "incident log", plotting only the points where a marker was out of range. A cluster of points vertically on a specific date indicates a systemic health event (e.g., an infection throwing off many markers at once), while a horizontal line of points indicates a chronic, unresolved issue for a specific marker.

**Where it would live:**
New `src/layout/IncidentTimelineChart.tsx`.

**Trigger / entry point:**
A "Show Anomalies" toggle that replaces the main multi-axis line chart with this categorical scatter view for rapid diagnostic scanning.

---

Recommended implementation order: Proposal 2 first (highest coefficient/correlations insight, historical insight, then other insights), then 1, then 4, then 5, then 3.
