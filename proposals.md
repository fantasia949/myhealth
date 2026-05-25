## Part 2 — Visualization Proposals

**Proposal 1 of 5: Rank Volatility Area Chart**
**ECharts type:** `line` (with `areaStyle`)
**Codebase citation:** `rankedDataMapAtom` cache `Float64Array` from `src/atom/dataAtom.ts`.
**Which existing data it uses:** reads the Spearman ranks from `rankedDataMapAtom` across time for a selected set of biomarkers from `visibleDataAtom`.
**What it reveals that current charts don't:** visualizes how violently a biomarker's relative rank shifts over time compared to its peers, highlighting unstable markers even if their absolute values stay within optimal bounds.
**Where it would live:** `src/layout/RankVolatilityAreaChart.tsx`
**Trigger / entry point:** Rendered alongside `ScatterChart` when a user toggles a "View Rank Volatility" mode in the header navigation.

---

**Proposal 2 of 5: Missing Data Density Strip**
**ECharts type:** `scatter` (1D strip) or `custom`
**Codebase citation:** `BioMarker[1]` null values mapped in `src/atom/dataAtom.ts`.
**Which existing data it uses:** reads `BioMarker[1]` for `null` vs non-`null` presence across all labels in `visibleDataAtom`.
**What it reveals that current charts don't:** shows the sparsity or density of measurements across different tests, allowing users to instantly see which biomarkers are consistently tested versus sporadically measured.
**Where it would live:** `src/layout/MeasurementDensityStrip.tsx`
**Trigger / entry point:** Rendered directly above the main data table as a fixed metadata track that updates when `tagAtom` changes.

---

**Proposal 3 of 5: Strict vs Standard Range Bullet Chart**
**ECharts type:** `bar`
**Codebase citation:** `strictRange` vs `range` definitions in `src/processors/post/range.ts`.
**Which existing data it uses:** compares the `range` string from `extra.range` to the fallback `range.ts` hardcoded `strictRange` dictionary.
**What it reveals that current charts don't:** displays the current value against both the standard clinical range and the stricter optimal range simultaneously, clarifying borderline results that are "technically normal" but not optimal.
**Where it would live:** `src/layout/RangeBulletChart.tsx`
**Trigger / entry point:** Rendered inside the expanded table row (`Table.tsx`) directly next to the existing `LineChart`.

---

**Proposal 4 of 5: Non-Inferred Biomarker Count Bar**
**ECharts type:** `bar`
**Codebase citation:** `nonInferredDataAtom` from `src/atom/dataAtom.ts`.
**Which existing data it uses:** compares the temporal length/presence of data in `nonInferredDataAtom` vs `dataAtom` per time point `label`.
**What it reveals that current charts don't:** tracks the volume of actual lab measurements versus computed/derived metrics over time, showing the true diagnostic depth of each historical test date.
**Where it would live:** `src/layout/DiagnosticDepthBarChart.tsx`
**Trigger / entry point:** Rendered as a sparkline widget in the main application header, contextualizing the overall dataset depth.

---

**Proposal 5 of 5: Correlation Alpha Significance Scatter (Volcano Plot)**
**ECharts type:** `scatter`
**Codebase citation:** `correlationAlphaAtom` and `correlationAlternativeAtom` from `src/atom/correlationAtom.ts`.
**Which existing data it uses:** filters correlation pairs based on the `correlationAlphaAtom` threshold to plot P-values vs Correlation coefficients.
**What it reveals that current charts don't:** instantly separates highly significant, strong correlations from weak or statistically insignificant noise, leveraging the user's configured alpha threshold visually rather than just textually.
**Where it would live:** `src/layout/CorrelationVolcanoPlot.tsx`
**Trigger / entry point:** Rendered in the correlation analysis view when the user adjusts the `correlationAlphaAtom` slider.

---

Recommended implementation order: Proposal 5 first (highest coefficient/correlations insight, historical insight, then other insights), then 1, then 3, then 2, then 4.
