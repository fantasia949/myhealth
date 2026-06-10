**Proposal 1 of 5: Out-of-Range Tag Occurrence Timeline**

**ECharts type:** `scatter` (categorical Y-axis)

**Codebase citation:**
`extra.optimality[]` pre-computed by `src/processors/post/range.ts` and `extra.tag[]` assigned by `src/processors/post/tag.ts`.

**Which existing data it uses:**
Reads `labels[]` from `src/data/index.ts` for the X-axis. Uses `dataAtom` to extract all biomarkers. It checks the `extra.optimality[]` array. When `optimality[i]` is `true`, it flags that timepoint (`labels[i]`) for any tag group present in `extra.tag[]`.

**What it reveals that current charts don't:**
Currently, you can view the optimality of a specific marker over time, but you cannot easily see if *systemic* issues exist across multiple markers within a specific domain (like "Liver" or "Kidney"). This chart groups out-of-range occurrences by Tag, allowing users to instantly spot periods where a specific biological system was under stress (e.g., multiple "3-Liver" markers out of range simultaneously).

**Where it would live:**
New file `src/layout/SystemStressTimeline.tsx`, could be rendered within a new summary or overview panel.

**Trigger / entry point:**
Could be triggered via a toggle in the main `Nav.tsx` alongside the filter text, rendering a high-level summary.

---

**Proposal 2 of 5: Inferred vs Measured Value Distribution**

**ECharts type:** `scatter` (or layered `bar`)

**Codebase citation:**
`extra.inferred` flag and `extra.originValues[]` present in `BioMarker[3]`.

**Which existing data it uses:**
Reads `dataAtom` to find biomarkers where `extra.inferred` is true. It compares `BioMarker[1]` (the inferred/processed values) against `extra.originValues[]` (the raw measured values, if available and comparable) at the same time points.

**What it reveals that current charts don't:**
Many values are inferred mathematically rather than measured directly. This visualization would highlight the variance or relationship between direct measurements and the resulting inferred metrics, revealing to the user how much their tracked profile relies on derived data vs hard lab results for any given time slice.

**Where it would live:**
New `src/layout/InferredVarianceChart.tsx`.

**Trigger / entry point:**
Rendered when the user is viewing data that contains a high proportion of inferred markers, or via a new "Data Quality/Source" toggle.

---

**Proposal 3 of 5: Marker Trend Velocity Histogram**

**ECharts type:** `histogram` (via `echarts-stat` or manual binning)

**Codebase citation:**
`BioMarker[1]` (time-series values) and `labels[]`.

**Which existing data it uses:**
Uses the currently selected biomarkers (`keys` prop, like in `Chart.tsx`) and calculates the rate of change (velocity) between consecutive measurements in `BioMarker[1]` across the `labels[]` time gaps. It then bins these velocities to create a histogram.

**What it reveals that current charts don't:**
While line charts show the absolute value over time, a velocity histogram reveals the *volatility* of a biomarker. Are changes usually gradual, or are there frequent extreme spikes? This helps identify highly unstable markers that might need closer monitoring.

**Where it would live:**
New `src/layout/VelocityHistogram.tsx`, potentially rendered below or alongside the main `Chart.tsx` when specific biomarkers are selected.

**Trigger / entry point:**
Automatically generated based on the current selection in `visibleDataAtom` or triggered by clicking a "Volatility Analysis" button for a selected marker.

---

**Proposal 4 of 5: Correlation Significance Matrix**

**ECharts type:** `heatmap`

**Codebase citation:**
`correlationAlphaAtom`, `correlationAlternativeAtom`, and `correlationMethodAtom` from `src/atom/correlationAtom.ts`.

**Which existing data it uses:**
Takes the output of the correlation matrix generation (using the selected method from `correlationMethodAtom`) but instead of plotting the correlation coefficients, it calculates and plots the p-values, highlighting cells that fall below the threshold defined by `correlationAlphaAtom` taking into account the `correlationAlternativeAtom` directionality.

**What it reveals that current charts don't:**
While a standard correlation matrix shows the strength of a relationship, this significance matrix explicitly shows *confidence*. It separates visually strong but statistically weak (low sample size) correlations from robust, highly significant relationships, preventing users from drawing false conclusions from sparse data.

**Where it would live:**
New `src/layout/CorrelationSignificanceMatrix.tsx`, or as a toggle mode within the existing `Correlation.tsx` component.

**Trigger / entry point:**
A toggle button in the correlation view: "View Coefficients" vs "View Significance (p < alpha)".

---

**Proposal 5 of 5: System Optimality Radar**

**ECharts type:** `radar`

**Codebase citation:**
`extra.optimality[]` pre-computed by `src/processors/post/range.ts` and tag groups defined in `src/processors/post/tag.ts`.

**Which existing data it uses:**
Aggregates the `extra.optimality[]` booleans from all markers within `dataAtom`, grouped by their primary tag (from `src/processors/post/tag.ts`). For a specific time point (or across all time), it calculates the percentage of markers *in-range* for each tag group (e.g., "Liver: 90% optimal", "Kidney: 60% optimal").

**What it reveals that current charts don't:**
Provides a single, holistic snapshot of overall systemic health. Instead of viewing individual markers, a user can instantly see which biological system (tag group) is currently the weakest or most out of balance.

**Where it would live:**
New `src/layout/SystemOptimalityRadar.tsx`.

**Trigger / entry point:**
Could serve as the dashboard's "Home" or "Overview" component, rendered by default before specific markers are selected.

---

Recommended implementation order: Proposal 4 first (highest coefficient/correlations insight, historical insight, then other insights), then 1, then 5, then 3, then 2.