**Proposal 1 of 5: Co-Occurrence Tag Out-of-Range Heatmap Matrix**

**ECharts type:** `heatmap`

**Codebase citation:**
`extra.optimality[]` pre-computed by `src/processors/post/range.ts` (index-aligned with `BioMarker[1]`) and the tag groupings in `src/processors/post/tag.ts` (e.g. `['1-RBC', '2-Metabolic', ...]`).

**Which existing data it uses:**
Reads the `extra.optimality[]` boolean array from all biomarkers categorized by `extra.tag` across the time series `labels[]` (both from `dataAtom`).

**What it reveals that current charts don't:**
Reveals systemic cascading failures across biological systems over time. By aggregating out-of-range rates (`optimality === true`) per tag group (e.g., "how often are Liver and Lipid biomarkers simultaneously out of range at a given date"), it uncovers inter-system correlations (e.g. a spike in Metabolic stress perfectly preceding a rise in Hormone instability) which individual line or scatter charts obscure due to noise.

**Where it would live:**
New `src/layout/SystemCoOccurrenceHeatmap.tsx`, rendered below the main scatter chart in the dashboard overview when no specific biomarker or tag is selected.

**Trigger / entry point:**
Displayed globally by default when `tagAtom` is null and `filterTextAtom` is empty, giving a high-level system overview before drilling down.

---

**Proposal 2 of 5: Out-of-Range Density Distribution Violin / Scatter**

**ECharts type:** `scatter` (simulating a violin or 1D strip plot using random X-jitter on a category axis)

**Codebase citation:**
`dataMapAtom`'s `BioMarker[1]` (values) and `extra.range` boundaries parsed from `src/processors/post/range.ts`.

**Which existing data it uses:**
Reads `visibleDataAtom`, taking `values[]` and `extra.range` min/max thresholds, filtering out `null` and `'-'` entries.

**What it reveals that current charts don't:**
Current line and scatter charts emphasize *when* measurements occurred. This chart ignores time, mapping all historical values for visible biomarkers into a vertical distribution (normalized around their optimal range, mapped to a baseline). It instantly reveals if a biomarker is chronically skirting the very edge of the optimal zone vs having rare extreme spikes, providing a pure distribution perspective.

**Where it would live:**
New `src/layout/DistributionScatter.tsx`, rendered as an alternative tab/view next to `ScatterChart.tsx`.

**Trigger / entry point:**
A toggle button near the "Time Series" / "Distribution" view selector. It leverages `visibleDataAtom` so it automatically scales to currently filtered tags or searches.

---

**Proposal 3 of 5: Data Sparsity & Measurement Cadence Calendar Chart**

**ECharts type:** `calendar` with a `heatmap` or `scatter` series

**Codebase citation:**
`labels[]` from `src/data/index.ts` and `BioMarker[1]` null-checks from `dataAtom.ts`.

**Which existing data it uses:**
Maps the 6-digit `labels[]` strings into actual `Date` objects, and counts the number of non-null, non-inferred measurements (`nonInferredDataAtom`) present on each date.

**What it reveals that current charts don't:**
Highlights user testing habits, measurement density, and gap periods. It visually answers "when did I get the most comprehensive blood panels done?" vs "which months did I skip testing completely?". This helps contextualize the reliability of the time-series interpolations in the other charts.

**Where it would live:**
New `src/layout/CadenceCalendar.tsx`, placed in a "Data Quality" or "Metadata" section, or in the sidebar.

**Trigger / entry point:**
Always available as a miniature overview widget or expandable panel, independent of `tagAtom` filtering.

---

**Proposal 4 of 5: Inferred vs Measured Value Divergence Line Chart**

**ECharts type:** `line` (dual-series: measured vs inferred)

**Codebase citation:**
`extra.inferred` and `extra.originValues` fields from `src/types/biomarker.ts` and `nonInferredDataAtom`.

**Which existing data it uses:**
Identifies biomarkers that have both a calculated/inferred counterpart (e.g., eGFR inferred vs measured Creatinin or computed LDL vs direct LDL). It uses `BioMarker[1]` for both the raw measurement and the inferred formula result.

**What it reveals that current charts don't:**
Validates the accuracy of the system's inferred health metrics. By charting the strictly measured value alongside the formulaically inferred value (`extra.inferred === true`) on the same `scale: true` axis, it visually highlights divergence. A growing gap over time might indicate a shift in underlying physiological assumptions (e.g. changing muscle mass affecting Creatinin-based eGFR).

**Where it would live:**
New `src/layout/InferredValidationChart.tsx`, accessible when viewing details of an inferred biomarker.

**Trigger / entry point:**
When a user clicks on an inferred biomarker in the table (where `extra.inferred` is true), this chart is injected below the standard `LineChart.tsx` row expansion.

---

**Proposal 5 of 5: Spearman Ranked Volatility Parallel Coordinates**

**ECharts type:** `parallel`

**Codebase citation:**
`rankedDataMapAtom` cache (pre-computed `Float64Array` Spearman ranks per biomarker) and `correlationMethodAtom` from `src/atom/correlationAtom.ts`.

**Which existing data it uses:**
Takes the rank arrays from `rankedDataMapAtom` for the biomarkers currently in `visibleDataAtom`.

**What it reveals that current charts don't:**
By charting purely statistical rank (1st, 2nd, 3rd highest historical value) rather than raw mg/dL values, it normalizes disparate units (e.g. Glucose vs WBC). A parallel coordinates chart of ranks reveals synchronous volatility: do 5 different metabolic markers all hit their 90th percentile rank on the exact same date? This exposes deep correlative trends that are invisible when raw values are plotted on disjointed Y-axes.

**Where it would live:**
New `src/layout/VolatilityParallelChart.tsx`, replacing or accompanying the `Chart.tsx` multi-axis view.

**Trigger / entry point:**
Activated when the user selects 3 to 7 biomarkers simultaneously (where the current `Chart.tsx` multi-axis view becomes too cluttered), utilizing the existing `correlationMethodAtom` to choose the rank calculation.

---
Recommended implementation order: Proposal 1 first (highest system-wide optimality insight), then 5, then 2, then 3, then 4.
