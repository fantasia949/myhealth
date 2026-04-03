# Implementation Report

**The Issue:**
In `src/vite-env.d.ts` and `src/types/biomarker.ts`, several type annotations inside the `Entry` and `BioMarker` definitions used the weak types `unknown` and `any`. This bypassed TypeScript's strict type checking for critical properties like `range`, `originValues`, and `isNotOptimal`.

**The Discovery Signal:**
Scan H — Weak or Missing Type Annotations:

- `src/vite-env.d.ts`: `range?: unknown`, `originValues?: Array<unknown>`, `extra?: Record<string, any>`, `isNotOptimal?: (val?: any) => boolean`
- `src/types/biomarker.ts`: `range?: unknown`

**The Fix:**
I extracted concrete types from the existing usage and `BioMarker` definition to replace all `any` and `unknown` types within the `Entry` tuple:

1. `range?: unknown` -> `range?: string`
2. `originValues?: Array<unknown>` -> `originValues?: Array<string | number | null>`
3. `Record<string, any>` -> `Record<string, unknown>`
4. `isNotOptimal?: (val?: any) => boolean` -> `isNotOptimal?: (val: number) => boolean`
5. Updated `src/processors/post/range.ts` to explicitly call `parseFloat(val)` before passing the value to the `isNotOptimal` callback, satisfying the newly strict numeric type signature.

**The Benefit:**
Significant improvement in codebase health and type safety (zero-risk substitution). Future refactors and processing logic (like in `postProcess`) will benefit from concrete type inference rather than silently bypassing type checks or crashing at runtime due to `any`/`unknown` ambiguity.

---

# Visualization Proposals

**Proposal 1 of 3: Range Deviation VisualMap [REJECTED]**

**[REJECTED]: Do not propose this again.**

**ECharts type:** `visualMap`

**Which existing data it uses:**
Uses the boolean array `extra.optimality[]` from `src/processors/post/range.ts` (available inside `dataAtom`'s `BioMarker`) to indicate whether each test value is within the optimal bounds.

**What it reveals that current charts don't:**
Color-encodes the main line graph in `LineChart.tsx` (e.g., green when within range, red when out of bounds), revealing exactly when a biomarker drifted into an unhealthy state without requiring the user to cross-reference against shaded `markArea` zones manually.

**Where it would live:**
Enhancement to existing `src/layout/LineChart.tsx` (the single biomarker line inside table row expander).

**Trigger / entry point:**
Triggered automatically whenever a user expands a table row to view a single biomarker's time-series chart.

**Implementation complexity:** Low
`extra.optimality[]` is already fully pre-computed per value in parallel with the data array; only requires mapping this into a `visualMap.pieces` config option inside the line chart.

**ECharts 6 API confirmed via context7:** yes (checked `visualMap.pieces` and `visualMap.dimension`)

---

**Proposal 2 of 3: Single-Biomarker Boxplot Distribution [RESOLVED]**

**[RESOLVED]: Already implemented in `src/layout/BoxplotChart.tsx`.**

**ECharts type:** `boxplot`

**Which existing data it uses:**
The raw historical values array (`number[]`) for any single `BioMarker` accessed from `dataAtom` in `src/atom/dataAtom.ts`.

**What it reveals that current charts don't:**
Reveals the statistical distribution of a single biomarker. Instead of a messy time-series line, a boxplot clearly shows the median, quartiles, and outliers of a biomarker over the entire 2008-present timeframe, highlighting long-term structural variance vs normal fluctuations.

**Where it would live:**
A new `src/layout/BoxplotChart.tsx`.

**Trigger / entry point:**
When a user expands a specific biomarker row in the data table, the existing `LineChart` could be accompanied by a small segmented control to toggle between "Time View" (line) and "Distribution View" (boxplot).

**Implementation complexity:** Medium
The exact array of numbers is already passed to the LineChart. We just need to load it into a generic ECharts dataset and declare the `transform: { type: 'boxplot' }` option (via ECharts built-in data transform), requiring very little custom JS logic.

**ECharts 6 API confirmed via context7:** yes (checked `dataset.transform.type = 'boxplot'`)

---

**Proposal 3 of 3: Seasonal Biomarker Heatmap [REJECTED]**

**[REJECTED]: Do not propose this again.**

**ECharts type:** `calendar` + `heatmap`

**Which existing data it uses:**
The values array (`number[]`) and the time-series labels (`labels[]` strings) mapped to the `BioMarker` in `dataAtom`.

**What it reveals that current charts don't:**
Highlights seasonal or structural patterns that traditional line charts obscure. For slowly-changing metrics (like Weight, Vitamin D, or Glucose), a calendar view immediately exposes if values tend to spike during the winter holidays or drop sharply in specific months, mapped directly to a year view.

**Where it would live:**
New `src/layout/CalendarHeatmap.tsx`.

**Trigger / entry point:**
An additional chart view option selectable from the main dashboard or specific biomarker rows when viewing high-density biomarkers (ones measured frequently enough to populate a calendar).

**Implementation complexity:** Medium
Requires formatting the existing `YYMMDD` string tags from `labels[]` into proper Date objects/strings compatible with the ECharts `calendar` coordinate system, but no new state atoms or complex data fetching are required.

**ECharts 6 API confirmed via context7:** yes (checked `calendar`, `series-heatmap.coordinateSystem = 'calendar'`)
