**Proposal 1 of 5: Out-of-Range Duration Horizon Chart**

**ECharts type:** `themeRiver` or `custom` polygon rendering

**Codebase citation:**
Reads `extra.optimality[]` pre-computed by `src/processors/post/range.ts` and `labels[]` from `src/data/index.ts`.

**Which existing data it uses:**
Uses the boolean `extra.optimality[]` array from `visibleDataAtom` mapping across all biomarkers over the exact date indices provided in `labels[]`.

**What it reveals that current charts don't:**
The current charts show momentary points of being out-of-range via `markArea` or individual scatter points. A Horizon or ThemeRiver chart grouping all biomarkers' `optimality[]` vectors would visualize the *duration and concurrent density* of out-of-range states over time, revealing periods of systemic stress where many markers are simultaneously out of bounds.

**Where it would live:**
New `src/layout/OptimalityDensityChart.tsx`, rendered under the main data table in `App.tsx` or `Table.tsx`.

**Trigger / entry point:**
Could be toggled on via a new button near the tag filters, visualizing the density of the currently active `visibleDataAtom`.

---

**Proposal 2 of 5: Correlation Alpha Significance Network**

**ECharts type:** `graph` (Network)

**Codebase citation:**
Uses `correlationAlphaAtom` from `src/atom/correlationAtom.ts` and `extra.tag` arrays from `src/types/biomarker.ts` (`BioMarker[3]`).

**Which existing data it uses:**
It uses the pre-computed Spearman or Pearson correlation matrices, applying the strict `correlationAlphaAtom` threshold to establish edges (links) between biomarker nodes (vertices) derived from `dataAtom`. Nodes can be colored based on their primary `tag[0]`.

**What it reveals that current charts don't:**
While the existing `CorrelationChordDiagram` and `FocusedCorrelationChart` show strong individual correlations, a threshold-filtered force-directed graph would reveal clusters of highly interdependent biomarkers (e.g., metabolic markers strongly linked to lipid markers) that move together significantly (p < alpha).

**Where it would live:**
New `src/layout/SignificanceNetworkChart.tsx`, potentially replacing or augmenting the chord diagram in the correlation tab/modal.

**Trigger / entry point:**
Activated from the correlation analysis view, dynamically re-rendering as the user adjusts the `correlationAlphaAtom` slider/input.

---

**Proposal 3 of 5: Inferred vs. Measured Trend Ribbon**

**ECharts type:** `line` (with `areastyle` / error bands)

**Codebase citation:**
Reads `inferred` boolean and `originValues[]` from `src/types/biomarker.ts` (`BioMarker[3]`).

**Which existing data it uses:**
Compares biomarkers from `nonInferredDataAtom` against their derived/computed counterparts (where `inferred` is true), specifically examining cases where the underlying `originValues[]` diverged before unit conversion or calculation.

**What it reveals that current charts don't:**
Currently, inferred markers are plotted identically to measured ones. An error-band or ribbon chart overlaying a measured marker with an inferred index (e.g., PhenoAge components vs. actual PhenoAge) would show the exact contribution and divergence of the mathematical inference from raw measured reality.

**Where it would live:**
New `src/layout/InferredTrendChart.tsx`, accessible when expanding a row for an inferred biomarker in `Table.tsx`.

**Trigger / entry point:**
Available as an alternative view (tab) inside the row expansion when `inferred: true` is detected on the current `BioMarker`.

---

**Proposal 4 of 5: Alternative Distribution Histogram Map**

**ECharts type:** `heatmap` (1D matrix) or staggered `boxplot`

**Codebase citation:**
Uses `correlationAlternativeAtom` from `src/atom/correlationAtom.ts` and `getSamples` function from `src/types/biomarker.ts` (`BioMarker[3]`).

**Which existing data it uses:**
Leverages the `correlationAlternativeAtom` ('two-sided', 'less', 'greater') context alongside the statistical distribution of biomarker `values[]` via `getSamples` or raw array iteration.

**What it reveals that current charts don't:**
When analyzing correlation directionality (less/greater), a staggered distribution visualization helps explain *why* a specific alternative hypothesis test yielded significance, by visually isolating the skewed tails of the value distributions that are driving the correlation, which standard line/scatter plots obscure.

**Where it would live:**
New `src/layout/DirectionalDistributionChart.tsx`

**Trigger / entry point:**
Shown as a contextual tooltip or secondary modal when hovering over a significant correlation result in `BiomarkerCorrelationBumpChart.tsx`.

---

**Proposal 5 of 5: Measured Sparsity Timeline**

**ECharts type:** `scatter` (categorical Y-axis) or `custom` timeline

**Codebase citation:**
Uses `nonInferredDataAtom` and the presence of `null` values within `BioMarker[1]` (values array) over `labels[]`.

**Which existing data it uses:**
Iterates through all series in `nonInferredDataAtom`, checking each index `i` against `labels.length` for strictly non-null values.

**What it reveals that current charts don't:**
Currently, users only see gaps when viewing a specific line chart or by noticing missing points in a multi-series scatter. A consolidated sparsity map would show the exact dates of comprehensive blood panels vs. dates where only 1-2 specific markers were tested, revealing the user's overall testing frequency and comprehensiveness at a glance.

**Where it would live:**
New `src/layout/TestingSparsityChart.tsx`

**Trigger / entry point:**
A global view accessible from the main navigation (`Nav.tsx`), providing metadata about the dataset's overall quality and timeline density before diving into specific biomarkers.

---

Recommended implementation order: Proposal 2 first (highest coefficient/correlations insight, historical insight, then other insights), then 1, then 5, then 3, then 4.