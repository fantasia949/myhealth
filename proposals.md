**Proposal 1 of 3: Tag Group Completeness Radar**

**ECharts type:** `radar`

**Codebase citation:**
Reads `tag` keys dynamically derived from `src/processors/post/tag.ts` via `extra.tag` on `BioMarker[3]` elements of the `dataAtom`.

**Which existing data it uses:**
It utilizes `dataAtom` from `src/atom/dataAtom.ts` and iterates over each `BioMarker` entry. It extracts the `extra.tag` arrays and counts the occurrences of each tag group (e.g., `1-RBC`, `2-Metabolic`).

**What it reveals that current charts don't:**
Shows which physiological systems (tag groups) have the most robust data coverage and which are missing measurements. Current scatter and line charts require the user to visually inspect each tag group one by one to infer completeness, whereas a radar chart instantly visualizes the density and completeness of all system clusters in one view.

**Where it would live:**
New `src/layout/CompletenessRadar.tsx`, rendered conditionally in `App.tsx` or a new summary dashboard panel.

**Trigger / entry point:**
Could be toggled via a new "Data Coverage" button in the global navigation or sidebar, activating a modal that renders this summary chart.

---

**Proposal 2 of 3: Inferred Marker Network Diagram**

**ECharts type:** `graph` (Network)

**Codebase citation:**
Reads `extra.inferred`, `extra.originValues`, and `extra.hasOrigin` from `BioMarker[3]`, which are defined in `src/types/biomarker.ts` and set during preprocessing.

**Which existing data it uses:**
It queries `dataAtom` for all biomarkers where `extra.inferred === true` and uses their `extra.originValues` references (or names, if map is updated to link them) to draw connections to the measured biomarkers that generated them.

**What it reveals that current charts don't:**
Visualizes the dependency tree between actual measured lab results and computed/inferred scores (like eGFR, HOMA-IR, or PhenoAge). This clarifies for the user which raw measurements have the highest "leverage" (i.e., contribute to the most computed metrics), which is impossible to see in isolated time-series plots.

**Where it would live:**
New `src/layout/InferredNetworkDiagram.tsx`, potentially added as an extra tab in the `BiomarkerCorrelation.tsx` view or as a standalone exploration tool.

**Trigger / entry point:**
Activated via a "View Dependencies" toggle on inferred biomarkers, or as a global view when no specific tag is selected.

---

**Proposal 3 of 3: Correlation Rank Scatter Matrix**

**ECharts type:** `scatter` (SPLOM - Scatter Plot Matrix)

**Codebase citation:**
Uses `rankedDataMapAtom` from `src/atom/dataAtom.ts`, which caches the Spearman rank array (Float64Array) for each biomarker name.

**Which existing data it uses:**
It accesses `visibleDataAtom` to get the current list of biomarkers being viewed and retrieves their corresponding rank arrays from `rankedDataMapAtom`. It plots these rank values against each other for all possible pairs in the visible set.

**What it reveals that current charts don't:**
The existing correlation tools (like the network graph or bump chart) only show the *strength* of the correlation (the coefficient). A scatter matrix of the underlying rank values reveals the *shape* of the relationship (e.g., non-linear patterns, clusters, or outliers) that drive the correlation score, providing deeper statistical context.

**Where it would live:**
New `src/layout/RankScatterMatrix.tsx`, rendered inside the existing `Correlation.tsx` view.

**Trigger / entry point:**
Activated when exactly two or three biomarkers are visible (via search or tag filters), rendering below the main `ScatterChart.tsx` to provide immediate correlation context.

---

Recommended implementation order: Proposal 3 first (correlation insight), then 1, then 2.