---
**Proposal 1 of 5: Biomarker Out-of-Range Duration Gantt Chart**
**ECharts type:** `custom` (Gantt-style representation)
**Codebase citation:** `extra.optimality[]` pre-computed by `src/processors/post/range.ts`, index-aligned with `BioMarker[1]`.
**Which existing data it uses:** Iterates through `extra.optimality[]` and `labels[]` from `visibleDataAtom` to generate continuous "out-of-range" duration blocks for each biomarker.
**What it reveals that current charts don't:** Clearly visualizes *how long* a biomarker remained in a suboptimal state (the width of the block), rather than just spotting individual scattered dots outside a mark area, highlighting chronic versus acute deviations.
**Where it would live:** New `src/layout/OptimalityGanttChart.tsx`, rendered below the main scatter chart.
**Trigger / entry point:** Accessible via a new "View Optimality Timeline" toggle next to the tag filters, utilizing the already filtered `visibleDataAtom`.

---
**Proposal 2 of 5: Inferred Metric Influence Tree**
**ECharts type:** `tree`
**Codebase citation:** `inferred: true` flag on `BioMarker[3]`, populated from predefined inferred metric definitions.
**Which existing data it uses:** Uses `dataMapAtom` to link `inferred: true` metrics (like HOMA-IR or eGFR) to their parent measured metrics (like Glucose/Insulin or Creatinin), mapping the calculation dependencies.
**What it reveals that current charts don't:** Unpacks the "black box" of calculated metrics, visually explaining to the user which direct measurements drove the change in their inferred health scores at a given time point.
**Where it would live:** New `src/layout/InferredInfluenceTree.tsx`, rendered inside a popover or expanded row.
**Trigger / entry point:** Clicking on any biomarker pill that has `inferred: true` (e.g., in the Table view) opens this tree chart.

---
**Proposal 3 of 5: Biomarker Volatility Polar Scatter**
**ECharts type:** `scatter` (with `polar` coordinate system)
**Codebase citation:** `nonInferredDataAtom` from `src/atom/dataAtom.ts`.
**Which existing data it uses:** Calculates standard deviation/coefficient of variation across `BioMarker[1]` arrays strictly for measured data from `nonInferredDataAtom` (excluding calculated metrics to avoid double-counting variance).
**What it reveals that current charts don't:** Provides a single, unified "radar-like" view of which bodily systems or specific markers are fluctuating the most over the selected time period, immediately identifying instability.
**Where it would live:** New `src/layout/VolatilityPolarScatter.tsx`.
**Trigger / entry point:** A standalone widget on the main dashboard, independent of tag selection.

---
**Proposal 4 of 5: Tag Group Rank Bump Chart**
**ECharts type:** `line` (styled as a Bump Chart)
**Codebase citation:** `rankedDataMapAtom` from `src/atom/dataAtom.ts` and `tagKeys` from `src/processors/post/tag.ts`.
**Which existing data it uses:** Aggregates the Spearman rank float arrays (`Float64Array`) from `rankedDataMapAtom` by their assigned `extra.tag` to determine which physiological system (e.g., `3-Liver` vs `6-Kidney`) is performing best/worst relative to others over time.
**What it reveals that current charts don't:** Shifts focus from absolute measurement values to relative systemic performance, showing how entire tag groups shift in priority or severity compared to each other.
**Where it would live:** New `src/layout/TagSystemBumpChart.tsx`.
**Trigger / entry point:** An alternate view to the `RadarChart`, togglable when no specific `tagAtom` is selected (showing all systems).

---
**Proposal 5 of 5: Measurement Density Timeline Brush**
**ECharts type:** `bar` (with `dataZoom` and `brush` tool)
**Codebase citation:** `visibleDataAtom` from `src/atom/dataAtom.ts` and `labels[]` from `src/data/index.ts`.
**Which existing data it uses:** Stacks occurrences of non-null values in `BioMarker[1]` across all entries in `visibleDataAtom` to plot a frequency histogram against the `labels[]` time axis.
**What it reveals that current charts don't:** Highlights exactly when the user took the most comprehensive blood panels vs. sparse single-marker tests, helping to contextualize whether a "flat" line is due to stability or just lack of testing.
**Where it would live:** New `src/layout/DensityTimeline.tsx`, positioned at the very bottom of the viewport.
**Trigger / entry point:** Always visible as a global navigation mini-map, allowing the user to `brush` select a time window to filter the main charts above it.

---
Recommended implementation order: Proposal 1 first (highest insight-to-effort ratio utilizing pre-calculated optimality arrays), then 5, then 2, then 4, then 3.
