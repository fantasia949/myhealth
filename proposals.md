---

**Proposal 1 of 5: System Group Range Status Gauge**

**ECharts type:** `gauge`

**Codebase citation:**
`extra.optimality[]` pre-computed by `src/processors/post/range.ts` and `tag` grouping output from `src/processors/post/tag.ts`

**Which existing data it uses:**
Reads the `extra.optimality[]` arrays and `tag` strings from all `BioMarker` entries returned by `dataAtom`, filtered down to a specific system/tag group (e.g., `8-WBC`).

**What it reveals that current charts don't:**
Shows an overall "system health" score for a single time point (e.g., latest data) by calculating the percentage of biomarkers within a specific tag group that are in their optimal range. The current scatter and line charts show individual trajectories but do not provide a quick aggregate view of an entire physiological system's status.

**Where it would live:**
New `src/layout/SystemHealthGauge.tsx`, rendered as summary cards in a dashboard view above or alongside the existing table/charts.

**Trigger / entry point:**
Could be triggered by clicking on a tag filter button in `Nav.tsx`, which currently sets `tagAtom`. When a tag is active, the gauge(s) for that tag's health score appear.

---

**Proposal 2 of 5: Inferred vs. Measured Correlation Matrix Heatmap**

**ECharts type:** `heatmap`

**Codebase citation:**
`correlationMethodAtom` from `src/atom/correlationAtom.ts` and `inferred: true` flag from `src/types/biomarker.ts`

**Which existing data it uses:**
Computes correlations (using the method defined by `correlationMethodAtom`) between the measured markers (`nonInferredDataAtom`) and the computed/inferred markers (filtered from `dataAtom` where `inferred: true`).

**What it reveals that current charts don't:**
Highlights how well raw physiological measurements (like Glucose, Lipid panels) correlate with complex derived indices (like PhenoAge or HOMA-IR). This exposes the driving factors behind the inferred metrics at a glance.

**Where it would live:**
New `src/layout/InferredCorrelationHeatmap.tsx`, potentially added as an alternative view within the existing `Correlation.tsx` component or a dedicated tab.

**Trigger / entry point:**
A new toggle in the correlation settings panel (alongside Alpha and Alternative selection) to switch between "All-to-All" and "Measured vs Inferred" matrix views.

---

**Proposal 3 of 5: Biomarker Missingness / Data Density Calendar**

**ECharts type:** `calendar` (or a categorical `heatmap`)

**Codebase citation:**
`labels[]` from `src/data/index.ts` and the presence of `null` values within `BioMarker[1]` (values array).

**Which existing data it uses:**
Iterates through all dates in `labels[]` and counts the number of non-null values across all `BioMarker` entries in `visibleDataAtom` for each date.

**What it reveals that current charts don't:**
Provides a clear visual map of testing frequency and comprehensiveness over time. It immediately shows which dates were comprehensive full-panel blood draws versus isolated single-marker tests, helping contextualize the data density shown in the time-series charts.

**Where it would live:**
New `src/layout/DataDensityCalendar.tsx`, perhaps placed at the top of the timeline or as a collapsable data quality overview.

**Trigger / entry point:**
A "Data Density" or "Timeline Overview" toggle button near the main chart controls.

---

**Proposal 4 of 5: Out-of-Range Frequency Parallel Coordinates**

**ECharts type:** `parallel`

**Codebase citation:**
`extra.range` string and `extra.optimality[]` from `src/processors/post/range.ts`

**Which existing data it uses:**
Selects a subset of biomarkers (e.g., top 5 most frequently out-of-range based on `optimality[]`) from `visibleDataAtom` and plots their raw `values[]` across parallel axes, using `extra.range` to color or highlight the paths that fall outside the optimal bounds.

**What it reveals that current charts don't:**
Shows multi-variate relationships and co-occurrences of out-of-range events across different biomarkers simultaneously for each time point. It helps identify if certain markers tend to go out of range together (e.g., high Glucose co-occurring with high Triglycerides).

**Where it would live:**
New `src/layout/ParallelOutliersChart.tsx`.

**Trigger / entry point:**
Activated when exactly 3 to 6 biomarkers are selected (keys are set), offering a "Multivariate View" alongside the existing `Chart.tsx` and `ScatterChart.tsx`.

---

**Proposal 5 of 5: Biomarker Volatility Boxplot**

**ECharts type:** `boxplot`

**Codebase citation:**
`BioMarker[1]` (values array) and `nonInferredDataAtom` from `src/atom/dataAtom.ts`

**Which existing data it uses:**
Takes the raw `values[]` for the currently selected biomarkers (via `keys`) or all markers in `visibleDataAtom`, calculates statistical quartiles (min, Q1, median, Q3, max) ignoring `null` values.

**What it reveals that current charts don't:**
Visualizes the historical volatility, variance, and distribution spread of a biomarker independently of time. This helps determine if a current value is an extreme outlier relative to the user's personal historical baseline, which a simple time-series line chart makes difficult to quantify visually.

**Where it would live:**
New `src/layout/VolatilityBoxplot.tsx`.

**Trigger / entry point:**
A "Distribution View" tab or toggle on individual biomarker detail cards (like the one that contains `LineChart.tsx`).

---

Recommended implementation order: Proposal 2 first (highest coefficient/correlations insight, historical insight, then other insights), then 1, then 5, then 4, then 3.
