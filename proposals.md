## Part 1 — Implementation Report

**The Issue:**
`src/layout/Chart.tsx`, line 53. The ECharts tooltip formatter iterated over dataset dimensions and displayed numerical values, but it failed to append the biomarker's unit string.

**Discovery Signal:**
Scan 2 — Tooltip Quality. Specifically, checking whether the tooltip shows the unit, which was completely missing from the multi-line chart popups.

**context7 Reference:**
`tooltip.formatter` and `series[].encode` — ECharts 5.6 docs.

**The Fix:**
Updated the `chartData` generation logic to attach the unit string inside the resulting mapped dataset array (via `item[\`${series.fieldKey}_unit\`] = series.unit || ''`). Then, inside the `tooltip.formatter` callback, the unit is extracted using `const unit = p.value[\`${dimName}\_unit\`] || ''` and successfully rendered into the tooltip HTML string alongside the base value.

**The Benefit:**
Multi-line charts now explicitly show measurement units inside their tooltips instead of raw, uncontextualized numbers.

---

## Part 2 — Visualization Proposals

These 3 visualization ideas use existing metadata to surface new insights without requiring new dependencies or processing logic.

**Proposal 1 of 3: Hierarchical System Health Sunburst**

**ECharts type:** `sunburst`

**Which existing data it uses:**
Uses the static `tagDescription` categories from `src/processors/post/tag.ts` mapped to all constituent `BioMarker` entries' `extra.optimality[]` boolean at the latest tested index.

**What it reveals that current charts don't:**
A hierarchical Sunburst chart (inner ring = Tag Groups, outer ring = specific Biomarkers) colored proportionally by their `optimality` provides a massive, single-glance structural overview of an individual's total biological wellness at their most recent blood draw.

**Where it would live:**
New `src/layout/SystemSunburst.tsx`.

**Trigger / entry point:**
A macro "Total Health Snapshot" button at the top of the main `Nav.tsx` or `Table.tsx` filter list, replacing the detailed table with a single holistic graphic.

**Implementation complexity:** Medium
(Medium: Requires formatting the linear `BioMarker` array into a nested JSON structure `[{ name: 'Metabolic', children: [{ name: 'Glucose', value: 1, itemStyle: {color: 'green'}}]}]`, which ECharts parses natively).

**ECharts 5.6.0 API confirmed via context7:** yes (`series[].type = 'sunburst'`)

---

**Proposal 2 of 3: Longitudinal ThemeRiver (Streamgraph)**

**ECharts type:** `themeRiver`

**Which existing data it uses:**
Uses the `labels[]` time-series dates and normalized biomarker values across a specific Tag Group (e.g., `2-Metabolic`).

**What it reveals that current charts don't:**
Current multi-line charts become a "spaghetti graph" when 5+ biomarkers are overlaid. A ThemeRiver visualizes the changing proportions and collective mass of a physiological system over time, letting the user immediately spot if their lipid burden or metabolic volume has fundamentally shifted across decades.

**Where it would live:**
New `src/layout/ThemeRiverChart.tsx`.

**Trigger / entry point:**
Available inside the Tag Filter UI (e.g., clicking the `2-Metabolic` tag could reveal a toggle to "View as ThemeRiver").

**Implementation complexity:** High
(High: Requires normalizing disparate units into percentage-based contributions or a zero-mean scale, then feeding standard coordinate data `[date, normalizedValue, biomarkerName]`).

**ECharts 5.6.0 API confirmed via context7:** yes (`series[].type = 'themeRiver'`)

---

**Proposal 3 of 3: Missing Data Gap Highlight (MarkArea)**

**ECharts type:** `markArea`

**Which existing data it uses:**
Uses consecutive null sequences in the `values` array for a given `BioMarker`.

**What it reveals that current charts don't:**
While ECharts handles connecting null points or breaking lines via `connectNulls`, it doesn't emphasize _how long_ a gap is. Overlaying dark gray, hashed `markArea` bands during periods with >6 months of missing data warns the user that trendlines or regressions spanning this void are less reliable.

**Where it would live:**
Modifying the existing `series` inside `src/layout/LineChart.tsx`.

**Trigger / entry point:**
Dynamically auto-renders behind the single biomarker line whenever a gap between tests exceeds an arbitrary threshold.

**Implementation complexity:** Medium
(Medium: Requires a new O(N) loop iterating over dates/values to find contiguous missing periods and generate `markArea` threshold bands).

**ECharts 5.6.0 API confirmed via context7:** yes (`series[].markArea`)

---

## Recommended implementation order: Proposal 3 first (highest insight, lowest effort), then 1, then 2.

**Proposal 4 of 5: Focused Diverging Bar Chart (Tornado Chart)**

**ECharts type:** `bar`

**Which existing data it uses:**
Uses the pairwise correlation coefficients (Pearson/Spearman) stored inside `correlationAtom.ts`.

**What it reveals that current charts don't:**
Correlation matrices are dense and suffer from cognitive overload. A diverging bar chart lets a user select a single target (e.g., the supplement "Vitamin D" or the biomarker "Glucose") and plots all other variables as horizontal bars diverging from 0 to +1 (right, positive correlation) and -1 (left, negative correlation). This gives an instantly readable, ranked list of top positive and negative influencers for a specific metric.

**Where it would live:**
New `src/layout/FocusedCorrelationChart.tsx`, embedded within the `Correlation.tsx` modal or detailed view.

**Trigger / entry point:**
Clicking on a specific row or column header in the existing correlation table switches the view to this focused chart.

**Implementation complexity:** Low
(Low: Standard `bar` series using an `xAxis` ranging from -1 to 1. The data is already fully processed in the correlation atom).

**ECharts 5.6.0 API confirmed via context7:** yes (`series[].type = 'bar'`)

---

**Proposal 5 of 5: Scatter Plot Matrix (SPLOM)**

**ECharts type:** `scatter` (multiple grids)

**Which existing data it uses:**
Uses the raw time-series numeric values of the `BioMarker` array mapped to identical date labels.

**What it reveals that current charts don't:**
A single correlation number ($r$) can be heavily skewed by a single outlier or a non-linear relationship. A SPLOM renders a grid of miniature scatter plots for a small subset of selected variables. This allows the user to visually audit the mathematical correlation and see the actual shape of the data relationships (e.g., identifying U-shaped curves).

**Where it would live:**
New `src/layout/CorrelationSPLOM.tsx`.

**Trigger / entry point:**
A button in the `Correlation.tsx` UI allowing the user to select 3-4 specific biomarkers/supplements to "Deep Dive" into their raw relationship plots.

**Implementation complexity:** High
(High: Requires generating multiple `grid`, `xAxis`, and `yAxis` layout objects dynamically based on the number of selected dimensions, and feeding subset data into multiple `scatter` series).

**ECharts 5.6.0 API confirmed via context7:** yes (`series[].type = 'scatter'`)

---

**Proposal 1 of 3: System-Wide Optimality Radar Chart**

**ECharts type:** `radar`

**Which existing data it uses:**
uses the tag group memberships from `src/processors/post/tag.ts` and the `extra.optimality[]` pre-computed array in `src/processors/post/range.ts`. It maps the ratio of non-optimal tests versus optimal tests for each tag group (e.g., '1-RBC', '2-Metabolic') to plot axes.

**What it reveals that current charts don't:**
Provides a macro-level view of which bodily systems (tags) have the highest density of out-of-range test results across the entire patient history, enabling users to instantly identify the most problematic areas of their health globally.

**Where it would live:**
New `src/layout/RadarChartSummary.tsx`, rendered conditionally as a dashboard-level summary overview at the top of the interface before any specific row is clicked or active tag is set.

**Trigger / entry point:**
Automatically displayed at the top of `App.tsx` (or `Table.tsx` if placed there) as a high-level summary overview panel.

**Implementation complexity:** Low
Both the tags classification and `optimality` arrays are already pre-computed. Mapping the sum of `false`/`true` optimality flags to an aggregate radar series array is a straightforward functional reduction without needing new data processors.

**ECharts 5.6.0 API confirmed via context7:** yes - `radar` configuration options are valid.

---

**Proposal 2 of 3: Biomarker Value Drift Boxplot**

**ECharts type:** `boxplot` (via `echarts-stat` if needed or built-in transform)

**Which existing data it uses:**
Uses the raw value arrays `item[1]` from `dataAtom` for each biomarker in a specific tag group to show distribution, median, and outlier ranges.

**What it reveals that current charts don't:**
Shows the statistical spread and volatility of a biomarker across all historical tests, instantly highlighting if a particular biomarker (like Glucose or LDL) is highly erratic with many outliers, versus stable and tightly clustered around a median value.

**Where it would live:**
Existing `src/layout/BoxplotChart.tsx` (if there is one, or replace an unused file) or a new modal view `src/layout/TagDistributionChart.tsx`.

**Trigger / entry point:**
Triggered via a new view toggle ("Distribution View") next to the Search Input when a specific Tag is selected from the tag filter buttons in `Nav.tsx`.

**Implementation complexity:** Medium
Requires setting up the `dataset` and ECharts built-in `transform: { type: 'boxplot' }` or using `@stdlib` for quantiles calculation. The dataset mapping needs careful null-handling.

**ECharts 5.6.0 API confirmed via context7:** yes - `dataset.transform` and `boxplot` series type.

---

**Proposal 3 of 3: Correlation Matrix Heatmap Timeline**

**ECharts type:** `heatmap`

**Which existing data it uses:**
Uses the output of `correlationMethodAtom` along with `visibleDataAtom` and the existing pairwise correlations logic used in `Correlation.tsx`.

**What it reveals that current charts don't:**
Provides a full-matrix bird's-eye view of how tightly correlated *all* visible biomarkers in a filtered subset (e.g. all 'Metabolic' or 'Liver' tags) are with one another at once, colored by correlation strength, instantly highlighting hidden secondary relationships.

**Where it would live:**
New `src/layout/CorrelationHeatmap.tsx`, augmenting the existing correlation analysis features.

**Trigger / entry point:**
A toggle button inside the existing `Correlation.tsx` modal or dialog to switch from the node-link graph view to a dense matrix view.

**Implementation complexity:** Medium
The math (Spearman/Pearson) is already present via `@stdlib/stats-pcorrtest` and cache atoms. The visual representation just needs a 2D array mapping into an ECharts `heatmap` series, paired with a `visualMap`.

**ECharts 5.6.0 API confirmed via context7:** yes - `heatmap` series and `visualMap` component.

---

Recommended implementation order: Proposal 1 first (highest insight, lowest effort), then Proposal 3, then Proposal 2.
