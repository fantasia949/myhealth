## Part 1 — Implementation Report

**The Issue:**
`src/layout/Chart2.tsx`, line 347. The component rendered a Dual-Render Conflict: it instantiated both a direct `<ReactECharts>` component and a `<Scatter>` component wrapper (from `@echarts-readymade`) within the same DOM space for the exact same dataset, degrading performance and causing visual rendering overlap.

**Discovery Signal:**
Scan 4 — Chart2 Dual-Render Conflict.

**context7 Reference:**
N/A (React refactoring; no new ECharts API was introduced, only cleaned up).

**The Fix:**
Removed the `@echarts-readymade` wrapper (`<ChartProvider>` and `<Scatter>`). Stripped out the `scatterData`, `valueList`, and `dimension` definitions which were exclusively needed by the wrapper. Eliminated the `useEffect` that manually updated the wrapper's `symbolSize` by directly merging `{ symbolSize: 40 }` into the base `echartsOptions.series[0]` configuration. The React component now directly and singularly renders `<ReactECharts option={options} />`.

**The Benefit:**
Eliminates a duplicate, redundant ECharts instantiation and canvas render. Avoids firing an immediate post-render `instance.setOption` via `useEffect`, speeding up time-to-interactive and removing unnecessary memory allocation.

**TypeScript result:**
0 errors.

---

## Part 2 — Visualization Proposals

These 5 visualization ideas use existing metadata to surface new health insights without requiring new dependencies or altering processing logic.

**Proposal 1 of 5: Hierarchical System Health Sunburst**

**ECharts type:** `sunburst`

**Codebase citation:**
Uses `tagDescription` dictionary keys (e.g., `'1-Metabolic'`) from `src/processors/post/tag.ts` mapped to all constituent `BioMarker` entries' `extra.optimality[]` boolean at the latest tested index.

**Which existing data it uses:**
Reads the `tag` groups and the `extra.optimality[]` boolean array computed by `src/processors/post/range.ts` for every biomarker in `dataAtom`.

**What it reveals that current charts don't:**
A Sunburst chart (inner ring = Tag Groups, outer ring = Biomarkers) colored proportionally by `optimality` provides a massive, single-glance structural overview of an individual's total biological wellness at their most recent blood draw.

**Where it would live:**
New `src/layout/SystemSunburst.tsx`, rendered inside the main dashboard view.

**Trigger / entry point:**
A macro "Total Health Snapshot" toggle button at the top of the main `Nav.tsx` filter list, replacing the detailed table with a single holistic graphic.

**Implementation complexity:** Medium
(Requires formatting the linear `dataAtom` array into a nested JSON hierarchy, which ECharts parses natively).

**ECharts 6 API confirmed via context7:** yes (`series[].type = 'sunburst'`)

---

**Proposal 2 of 5: Focused Diverging Bar Chart (Tornado Chart)**

**ECharts type:** `bar`

**Codebase citation:**
Uses the pairwise correlation coefficients calculated and cached inside the global `correlationAtom.ts` state.

**Which existing data it uses:**
Uses the pre-calculated Pearson or Spearman coefficients from the active `correlationAtom` state depending on the `correlationMethodAtom`.

**What it reveals that current charts don't:**
Correlation matrices are dense. A diverging bar chart lets a user select a single target (e.g., "Glucose") and plots all other variables as horizontal bars diverging from 0 to +1 (right) and -1 (left). This provides an instantly readable, ranked list of top positive and negative influencers.

**Where it would live:**
New `src/layout/FocusedCorrelationChart.tsx`, embedded within the `Correlation.tsx` modal.

**Trigger / entry point:**
Clicking on a specific row/column header in the existing `BiomarkerCorrelation.tsx` table switches the modal to this focused bar view.

**Implementation complexity:** Low
(Standard `bar` series using an `xAxis` ranging from -1 to 1; correlation data is already structurally solved).

**ECharts 6 API confirmed via context7:** yes (`series[].type = 'bar'`)

---

**Proposal 3 of 5: Longitudinal ThemeRiver (Streamgraph)**

**ECharts type:** `themeRiver`

**Codebase citation:**
Uses the `labels[]` time-series array imported from `src/data/index.ts` alongside values grouped by a single tag from `tagAtom`.

**Which existing data it uses:**
Maps the `labels[]` array against normalized time-series `values[]` for all biomarkers within an active `tagAtom` subset (e.g., `2-Metabolic`) sourced from `visibleDataAtom`.

**What it reveals that current charts don't:**
Current multi-line charts become a "spaghetti graph" with 5+ biomarkers. A ThemeRiver visualizes the changing proportions and collective volume of a physiological system over time, letting the user intuitively see if their overall lipid burden or metabolic volume has fundamentally shifted across decades.

**Where it would live:**
New `src/layout/ThemeRiverChart.tsx`.

**Trigger / entry point:**
Available inside the Tag Filter UI (e.g., when clicking the `2-Metabolic` tag in `Nav.tsx`, a toggle switches the table to the ThemeRiver).

**Implementation complexity:** High
(Requires normalizing disparate units into percentage-based contributions or a zero-mean scale, then structuring standard coordinate data `[date, normalizedValue, biomarkerName]`).

**ECharts 6 API confirmed via context7:** yes (`series[].type = 'themeRiver'`)

---

**Proposal 4 of 5: Biomarker Value Distribution (Histogram)**

**ECharts type:** `ecStat:histogram`

**Codebase citation:**
Uses the raw measured values from `nonInferredDataAtom` paired with `echarts-stat` transforms.

**Which existing data it uses:**
Reads the full `values[]` array for a single selected `BioMarker` from `nonInferredDataAtom`.

**What it reveals that current charts don't:**
While the line chart shows chronological movement, a histogram shows the statistical distribution of a high-variance biomarker (e.g., Glucose) over all time points, helping the user understand their most common baseline state versus rare outlier readings.

**Where it would live:**
New `src/layout/HistogramChart.tsx` or as a secondary tab inside the table row expansion alongside `LineChart.tsx`.

**Trigger / entry point:**
A tab toggle inside the expanded row state of `Table.tsx`.

**Implementation complexity:** Low
(Leverages the already installed `echarts-stat` transform to group the 1D numeric array natively without custom binning math).

**ECharts 6 API confirmed via context7:** yes (`dataset.transform.type = 'ecStat:histogram'`)

---

**Proposal 5 of 5: Scatter Plot Matrix (SPLOM)**

**ECharts type:** `scatter` (multiple grids)

**Codebase citation:**
Uses the raw time-series numeric values of multiple `BioMarker` arrays (accessed via `dataMapAtom`) mapped to identical `labels[]` indices.

**Which existing data it uses:**
Reads raw `values[]` from 3 to 4 selected `BioMarker` instances in `dataMapAtom` and pairs them at aligned indices.

**What it reveals that current charts don't:**
A single correlation number ($r$) can be heavily skewed by a single outlier or a non-linear relationship. A SPLOM renders a grid of miniature scatter plots for a small subset of selected variables. This allows the user to visually audit the mathematical correlation and see the actual shape of the data relationships (e.g., identifying U-shaped curves).

**Where it would live:**
New `src/layout/CorrelationSPLOM.tsx`.

**Trigger / entry point:**
A button in the `Correlation.tsx` modal allowing the user to select 3-4 specific biomarkers to "Deep Dive" into their raw relationship plots.

**Implementation complexity:** High
(Requires generating multiple `grid`, `xAxis`, and `yAxis` layout objects dynamically based on the number of selected dimensions).

**ECharts 6 API confirmed via context7:** yes (`series[].type = 'scatter'`)

---

Recommended implementation order: Proposal 2 first (highest insight, lowest effort), then 4, then 1, then 3, then 5.
