# Visualization Proposals

---

**Proposal 1 of 5: Cumulative Optimal Time Timeline**

**ECharts type:** `line`

**Codebase citation:**
`extra.optimality[]` boolean array computed in `src/processors/post/range.ts`.

**Which existing data it uses:**
Reads the `extra.optimality[]` array for all measured markers in `nonInferredDataAtom`. At each time point in `labels[]`, it calculates the total percentage of all measured markers that are "in range" (where `extra.optimality` is `false`).

**What it reveals that current charts don't:**
Provides a single, macro-level line chart of the user's overall system stability over time. It reveals if systemic health is generally improving or degrading without getting lost in the noise of 80+ individual biomarker fluctuations.

**Where it would live:**
New `src/layout/SystemTimeline.tsx`, rendered as the hero chart at the very top of the dashboard.

**Trigger / entry point:**
Always visible by default, replacing or alongside the current blank state when no individual markers or tags are selected.

---

**Proposal 2 of 5: Group Concordance Bar Chart**

**ECharts type:** `bar`

**Codebase citation:**
`tagAtom` and `visibleDataAtom` from `src/atom/dataAtom.ts` and `extra.optimality[]` from `src/processors/post/range.ts`.

**Which existing data it uses:**
Calculates the count of "in-range" vs "out-of-range" markers for the latest measurement within a selected tag group (filtered via `visibleDataAtom`). Data is mapped to a stacked bar chart showing the ratio.

**What it reveals that current charts don't:**
Quickly answers the question: "How messed up is my metabolic panel right now?" A single stacked bar showing 8 in-range and 4 out-of-range markers gives a better instant summary than scrolling through 12 separate scatter plots.

**Where it would live:**
New `src/layout/GroupConcordanceBar.tsx`, rendered inside the Tag header or next to the main ScatterChart.

**Trigger / entry point:**
Activated when the user selects a specific tag group via `Nav.tsx`, causing `tagAtom` to update and displaying the group summary.

---

**Proposal 3 of 5: Tag Group In-Range Proportion Pie Chart**

**ECharts type:** `pie`

**Codebase citation:**
`tagAtom` and `visibleDataAtom` combined with `extra.optimality[]`.

**Which existing data it uses:**
Takes the same count of "in-range" vs "out-of-range" from Proposal 2 but visualizes it as a proportion of the whole (pie/doughnut) for the currently selected tag group.

**What it reveals that current charts don't:**
Provides an intuitive, at-a-glance percentage of system health for a specific organ or system (e.g., "Liver function is 80% optimal").

**Where it would live:**
New `src/layout/GroupProportionPie.tsx`, placed as a summary widget above the table when filtered.

**Trigger / entry point:**
Rendered when a user clicks a tag filter in `Nav.tsx`.

---

**Proposal 4 of 5: Marker Trend Clustering**

**ECharts type:** `scatter` (with `ecStat:clustering`)

**Codebase citation:**
`nonInferredDataAtom` and the existing `echarts-stat` import used in `Chart2.tsx`.

**Which existing data it uses:**
Takes the raw time-series measurements (`BioMarker[1]`) for all measured markers and passes them to `(ecStat as any).clustering.hierarchicalKMeans` or standard `ecStat.clustering`.

**What it reveals that current charts don't:**
Groups disparate biomarkers into clusters based on their behavioral variance. It automatically discovers which markers act similarly across time, potentially revealing hidden physiological links that aren't captured by the static `tag.ts` groups.

**Where it would live:**
New `src/layout/MarkerClusteringChart.tsx`, an advanced analytical view separate from the main dashboard.

**Trigger / entry point:**
A new "Run Cluster Analysis" button that triggers the `ecStat` processing pipeline on the full dataset.

---

**Proposal 5 of 5: Measurement Volatility Scatter**

**ECharts type:** `scatter`

**Codebase citation:**
`nonInferredDataAtom` supplying raw measurements and `extra.range` supplying the expected min/max boundaries.

**Which existing data it uses:**
Calculates the coefficient of variation (Standard Deviation / Mean) for each biomarker's historical values (`BioMarker[1]`). Plotted on a standard 2D scatter chart where X is the mean value (normalized against `extra.range`) and Y is the volatility (variance).

**What it reveals that current charts don't:**
Highlights "noisy" biomarkers that swing wildly between tests versus "stable" biomarkers that never move. A marker on the high-volatility Y-axis might indicate a measurement artifact, an acute response, or a highly sensitive pathway.

**Where it would live:**
New `src/layout/VolatilityScatter.tsx`, an alternative view for the entire system dashboard.

**Trigger / entry point:**
A toggle button to switch the dashboard from "Timeline" (temporal view) to "Volatility" (statistical view).

---

Recommended implementation order: Proposal 1 first (highest system-level insight, historical insight, then other insights), then 2, then 3, then 5, then 4.
