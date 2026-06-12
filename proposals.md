**Proposal 1 of 5: Correlation Alternative Distribution Violin Plot**

**ECharts type:** Custom (using paths or SVG to simulate violin shape/density plot) or `boxplot` if custom is too complex.

**Codebase citation:**
`correlationAlternativeAtom` ('two-sided' | 'less' | 'greater') from `src/atom/correlationAtom.ts`. `rankedDataMapAtom` from `src/atom/dataAtom.ts`.

**Which existing data it uses:**
Takes the rank arrays cached in `rankedDataMapAtom` for the active tag group and graphs their distribution density, visually splitting or skewing the plot based on the current `correlationAlternativeAtom` choice to demonstrate how the one-sided vs two-sided hypotheses cluster the data.

**What it reveals that current charts don't:**
The current scatter plot merely shows linear trends. A distribution plot that adjusts based on the chosen "alternative" hypothesis helps the user understand *why* a particular correlation is or isn't significant when restricting to a one-tailed test (e.g. 'less'). It visualizes the shape of the data, not just the mean.

**Where it would live:**
New `src/layout/CorrelationDistributionPlot.tsx`, rendered in the `CorrelationDialog`.

**Trigger / entry point:**
Changing the 'Alternative' dropdown in the Correlation dialog.

---

**Proposal 2 of 5: Biomarker Range Volatility Band Chart**

**ECharts type:** `line` (with `areastyle` / band data overlay)

**Codebase citation:**
`extra.range` formatted string pre-computed by `src/processors/post/range.ts` and `BioMarker[1]`.

**Which existing data it uses:**
For a specific biomarker in `dataMapAtom`, it parses `extra.range` to construct dynamic upper and lower boundaries (the "band") and plots the `BioMarker[1]` time series data within this band over the `labels[]` timeline.

**What it reveals that current charts don't:**
While `LineChart` uses `markArea` to shade a static optimal band, a volatility band chart dynamically scales the Y-axis so the *optimal band takes up a consistent visual percentage of the chart*. This makes it instantly obvious how severely out of range a metric is relative to its own specific normal bounds, instead of just showing absolute values which are hard to interpret without a medical degree.

**Where it would live:**
New `src/layout/VolatilityBandChart.tsx`, supplementing or replacing the standard `LineChart`.

**Trigger / entry point:**
A toggle button on the biomarker's row to switch from "Absolute Scale" to "Range-Normalized Scale".

---

**Proposal 3 of 5: Missing Origin Value Contribution Chart**

**ECharts type:** `pie` (specifically `roseType: 'radius'`)

**Codebase citation:**
`inferred?: boolean` and `originValues?: (string|number|null)[]` on `BioMarker[3]`.

**Which existing data it uses:**
It filters the active `visibleDataAtom` for biomarkers that have `inferred: true` and compares the lengths of their `originValues` against their computed `values`. It counts how many times an inferred value was generated despite missing a standard component vs having full data.

**What it reveals that current charts don't:**
Shows the user how much of their "Inferred" data is actually built on assumptions vs complete underlying measurements. If the pie chart shows that 50% of the HOMA-IR data points were calculated using only a fasting glucose value with an assumed insulin average, the user knows that metric is less reliable.

**Where it would live:**
New `src/layout/InferredDataQualityChart.tsx`, accessible in a data audit view.

**Trigger / entry point:**
A small "Data Confidence" metric badge next to inferred variables that expands into the chart on click.

---

**Proposal 4 of 5: Spearman vs Pearson Divergence Scatter**

**ECharts type:** `scatter` (with a Y=X reference `markLine`)

**Codebase citation:**
`correlationMethodAtom` from `src/atom/correlationAtom.ts`. `dataMapAtom` from `src/atom/dataAtom.ts`.

**Which existing data it uses:**
Computes the correlation between all active pairs (using `visibleDataAtom`) *twice*: once using Pearson and once using Spearman. It plots each pair as a dot where X = Pearson coefficient and Y = Spearman coefficient.

**What it reveals that current charts don't:**
Highlights non-linear relationships. Points that fall directly on the Y=X line have identical linear and monotonic correlations. Points that deviate far from the line (e.g., high Spearman, low Pearson) indicate a strong but non-linear relationship (like exponential growth) that the user might miss if they only looked at the standard correlation table.

**Where it would live:**
New `src/layout/CorrelationDivergencePlot.tsx`, rendered inside the `CorrelationDialog`.

**Trigger / entry point:**
A new tab inside the Correlation Dialog next to "Correlation Matrix".

---

**Proposal 5 of 5: Out-of-Range Severity Gradient Heatmap**

**ECharts type:** `heatmap` (using `visualMap` gradient)

**Codebase citation:**
`extra.optimality[]` array and the `isNotOptimal: (value: number) => boolean` function from `src/processors/post/range.ts`.

**Which existing data it uses:**
Maps the `labels[]` (X-axis) against all biomarker names in `visibleDataAtom` (Y-axis). For each cell, if `extra.optimality[i]` is true, it passes the corresponding `BioMarker[1][i]` value back into a severity calculation (how far outside the bounds it is) and assigns a gradient color from yellow (mildly out) to deep red (severely out).

**What it reveals that current charts don't:**
The existing views only tell you *if* a value is out of bounds, not *how badly* out of bounds it is relative to the rest of your health system. This heatmap provides a whole-body overview of acute distress, making it easy to see if a particular date was a mild anomaly across many systems, or a severe spike in just one.

**Where it would live:**
New `src/layout/SeverityHeatmap.tsx`, rendered below the main scatter chart.

**Trigger / entry point:**
A "Health System Distress" toggle switch near the tag filters.

---

Recommended implementation order: Proposal 5 first (highest coefficient/correlations insight, historical insight, then other insights), then 4, then 1, then 2, then 3.