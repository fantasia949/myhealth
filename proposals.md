---
**Proposal 1 of 3: Single Biomarker State Transition Markov Diagram**

**ECharts type:** `graph`

**Codebase citation:**
Reads `extra.optimality[]` pre-computed by `src/processors/post/range.ts`, index-aligned with `BioMarker[1]`.

**Which existing data it uses:**
Iterates over a single biomarker from `visibleDataAtom` (e.g. `Glucose`) and uses the `extra.optimality[]` boolean array across time (`labels[]`) to compute transition probabilities between "In Range" (`false`) and "Out of Range" (`true`).

**What it reveals that current charts don't:**
Instead of showing *when* out-of-range events occurred (which the time-series charts already do), this calculates the *probability of recovery or relapse*. It reveals systemic stability: "Once Glucose goes out of range, what is the probability it returns to normal on the next test, versus staying out of range?"

**Where it would live:**
New `src/layout/MarkovStateChart.tsx`, rendered conditionally inside the biomarker detail view or row expansion.

**Trigger / entry point:**
Activated from the existing row expansion where `LineChart.tsx` currently lives.

**Implementation complexity:** Medium
Requires computing a simple 2x2 transition matrix from `extra.optimality[]` before mapping to `graph` nodes and links.

**ECharts 6 API confirmed via context7:** unavailable (fallback to verified ECharts 6 core `graph` series).

---

**Proposal 2 of 3: Tag Group Anomaly Timeline**

**ECharts type:** `themeRiver` (Wait, `ThemeRiver` is banned. Using `scatter` with custom `symbolSize` and `opacity`)

**Codebase citation:**
Reads `extra.tag` arrays computed by `src/processors/post/tag.ts` and `extra.optimality[]` from `src/processors/post/range.ts`.

**Which existing data it uses:**
Aggregates all `BioMarker` entries in `dataAtom` by tag group. For each time point in `labels[]`, counts how many members of a specific tag group (e.g. `3-Liver`) were out of optimal range (`extra.optimality[i] === true`).

**What it reveals that current charts don't:**
Highlights systemic multi-marker cascading failures. Instead of viewing individual markers, it shows if the entire `5-Hormone` system was disrupted at a specific time point by rendering a single row per tag group on the Y-axis and a bubble on the X-axis (time) sized by the number of simultaneous anomalies.

**Where it would live:**
New `src/layout/TagAnomalyTimeline.tsx`, rendered as a global view toggle beside the current table/scatter views.

**Trigger / entry point:**
A new toggle button next to the existing global "Charts" button, utilizing the global `dataAtom` without relying on active `filterTextAtom` selections.

**Implementation complexity:** Low
Data transformation is a simple grouping and counting pass over `dataAtom`, mapping directly to a standard Cartesian `scatter` series.

**ECharts 6 API confirmed via context7:** unavailable (fallback to verified ECharts 6 core `scatter` series).

---

**Proposal 3 of 3: Supplement Protocol Impact Waterfall**

**ECharts type:** `bar` (with stack to simulate waterfall)

**Codebase citation:**
Reads `notesAtom` (specifically `Object.values(notes)`) from `src/atom/dataAtom.ts` which contains parsed supplements (`supps` or text) per time point.

**Which existing data it uses:**
Matches a single biomarker's time-series values from `dataAtom` against the sequence of active protocols parsed from `notesAtom`. Calculates the delta (change in value) between the start and end of each distinct protocol phase.

**What it reveals that current charts don't:**
Directly answers "Did protocol X move the needle?" The current `ScatterChart` shows dots over time, forcing the user to visually estimate the slope during a supplement phase. A waterfall chart plots the net positive/negative delta attributed to each protocol sequentially, clearly isolating which interventions drove the largest net change.

**Where it would live:**
New `src/layout/ProtocolImpactWaterfall.tsx`, rendered inside the AI/Correlation sidebar or a new tab.

**Trigger / entry point:**
Activated when a user selects a single biomarker and checks a "Analyze Protocols" toggle in the sidebar, leveraging `notesAtom` and the selected biomarker data.

**Implementation complexity:** High
Requires parsing the `notesAtom` phases, aligning the start/end dates with `labels[]`, and computing value deltas to format for stacked `bar` series (waterfall pattern).

**ECharts 6 API confirmed via context7:** unavailable (fallback to verified ECharts 6 core `bar` series stack feature).

---

Recommended implementation order: Proposal 2 first (highest global systemic insight), then 1, then 3.