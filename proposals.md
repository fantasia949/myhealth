## Part 1 — Implementation Report

**The Issue:**
`src/layout/Chart.tsx`, line 53. The ECharts tooltip formatter iterated over dataset dimensions and displayed numerical values, but it failed to append the biomarker's unit string.

**Discovery Signal:**
Scan 2 — Tooltip Quality. Specifically, checking whether the tooltip shows the unit, which was completely missing from the multi-line chart popups.

**context7 Reference:**
`tooltip.formatter` and `series[].encode` — ECharts 5.6 docs.

**The Fix:**
Updated the `chartData` generation logic to attach the unit string inside the resulting mapped dataset array (via `item[\`${series.fieldKey}_unit\`] = series.unit || ''`). Then, inside the `tooltip.formatter` callback, the unit is extracted using `const unit = p.value[\`${dimName}_unit\`] || ''` and successfully rendered into the tooltip HTML string alongside the base value.

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
While ECharts handles connecting null points or breaking lines via `connectNulls`, it doesn't emphasize *how long* a gap is. Overlaying dark gray, hashed `markArea` bands during periods with >6 months of missing data warns the user that trendlines or regressions spanning this void are less reliable.

**Where it would live:**
Modifying the existing `series` inside `src/layout/LineChart.tsx`.

**Trigger / entry point:**
Dynamically auto-renders behind the single biomarker line whenever a gap between tests exceeds an arbitrary threshold.

**Implementation complexity:** Medium
(Medium: Requires a new O(N) loop iterating over dates/values to find contiguous missing periods and generate `markArea` threshold bands).

**ECharts 5.6.0 API confirmed via context7:** yes (`series[].markArea`)

---

Recommended implementation order: Proposal 3 first (highest insight, lowest effort), then 1, then 2.