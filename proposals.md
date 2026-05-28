---

**Proposal 1 of 5: Measurement Modality Pictorial Bar**

**ECharts type:** `pictorialBar`

**Codebase citation:**
`nonInferredDataAtom` vs full `dataAtom` from `src/atom/dataAtom.ts`.

**Which existing data it uses:**
Compares the length of `nonInferredDataAtom` against the full `dataAtom` per tag group (from `src/processors/post/tag.ts`). It explicitly uses the `extra.inferred` flag on `BioMarker[3]` to classify the measurements.

**What it reveals that current charts don't:**
Shows the ratio of purely measured (`nonInferredDataAtom`) to computationally inferred biomarkers per body system (e.g., `2-Metabolic`). Uses custom SVG icons in a `pictorialBar` to visually represent the "realness" or density of actual lab data in each system, helping users understand data provenance.

**Where it would live:**
New `src/layout/ModalityPictorialChart.tsx`.

**Trigger / entry point:**
A global dashboard widget rendered above the main table view that helps contextualize data quality before drilling down into specific rows.

---

**Proposal 2 of 5: Biomarker Correlation Timeline Brush**

**ECharts type:** `scatter` + `brush` + `dataZoom`

**Codebase citation:**
`rankedDataMapAtom` from `src/atom/dataAtom.ts` which provides the Spearman rank cache per biomarker as `Float64Array`.

**Which existing data it uses:**
It uses the `BioMarker[1]` time-series data from `visibleDataAtom` for the scatter plot and dynamically re-computes correlations against `rankedDataMapAtom` based on the brushed time window.

**What it reveals that current charts don't:**
Allows the user to brush (select) a specific short-term time window on a primary biomarker scatter plot, and instantly see which other biomarkers have the strongest rank correlation *only during that specific time period*, revealing short-term metabolic shifts that are hidden when looking at all-time historical correlation.

**Where it would live:**
Extends `src/layout/ScatterChart.tsx`.

**Trigger / entry point:**
The user activates the ECharts `toolbox.feature.brush` tool on the multi-series scatter chart to highlight a date range.

---

**Proposal 3 of 5: Missing Data Interpolation Line**

**ECharts type:** `line` (with `lineStyle.type: 'dashed'`)

**Codebase citation:**
`BioMarker[1]` arrays containing `null` for missing measurements, and `labels[]` from `src/data/index.ts`.

**Which existing data it uses:**
Reads the exact `BioMarker[1]` value array and `labels[]` from `src/data/index.ts` to identify the `null` gap sentinel markers (`'-'`).

**What it reveals that current charts don't:**
Rather than just dropping `null` values (which ECharts does by default when `connectNulls: false`), this chart explicitly plots the missing segments as a distinct dashed line (using a secondary series) connecting the known points. This visually highlights the uncertainty intervals in the patient's history, preventing false assumptions about linear progression during long gaps between lab tests.

**Where it would live:**
Extends `src/layout/LineChart.tsx`.

**Trigger / entry point:**
Auto-renders as a secondary visual series for any biomarker rendered in `LineChart.tsx` that contains at least one `null` value in its historical array.

---

**Proposal 4 of 5: Optimality Duration Bar Gantt**

**ECharts type:** `bar` (stacked horizontal)

**Codebase citation:**
`extra.optimality[]` pre-computed boolean array in `BioMarker[3]`.

**Which existing data it uses:**
Iterates through `extra.optimality[]` for all biomarkers in `visibleDataAtom` and maps sequences of `false` (in range) and `true` (out of range) to stacked horizontal bars along the `labels[]` time axis.

**What it reveals that current charts don't:**
Shows the exact *duration* a biomarker stayed optimal before falling out of range, aggregating the sequences into a gantt-style view. This helps differentiate chronic (long red bars) from acute (short red bars) issues across all visible biomarkers simultaneously.

**Where it would live:**
New `src/layout/OptimalityDurationChart.tsx`.

**Trigger / entry point:**
Displayed in the main table view above the `LineChart` expanders to summarize the current `visibleDataAtom` list's stability over time.

---

**Proposal 5 of 5: Significance Threshold Sensitivity Plot**

**ECharts type:** `line` + `markLine`

**Codebase citation:**
`correlationAlphaAtom` from `src/atom/correlationAtom.ts`.

**Which existing data it uses:**
Reads the currently selected `correlationAlphaAtom` and calculates the number of significant pairs across `rankedDataMapAtom` across a simulated sweep of alpha values (e.g., 0.001 to 0.1).

**What it reveals that current charts don't:**
Plots the number of statistically significant correlations (y-axis) against different possible alpha values (x-axis), with a `markLine` at the currently selected `correlationAlphaAtom`. This helps the user visually determine if their current alpha is too strict or too loose by showing the "elbow" of the correlation drop-off curve.

**Where it would live:**
New `src/layout/CorrelationSensitivityChart.tsx`.

**Trigger / entry point:**
Rendered in the settings/correlation view directly next to the correlation alpha input control.

---

Recommended implementation order: Proposal 2 first (highest coefficient/correlations insight, historical insight, then other insights), then 4, then 3, then 1, then 5.