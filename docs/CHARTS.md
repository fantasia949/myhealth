# Charts Documentation

This document provides an overview of all implemented charts in the application. It details the name, UI and code locations, purpose, and technical specifications for each chart component.

## Table of Contents

1. [Chart (Wrapper)](#chart-wrapper)
2. [Chart2 (Base Definitions)](#chart2-base-definitions)
3. [BiomarkerCorrelationBumpChart](#biomarkercorrelationbumpchart)
4. [BiomarkerCorrelationGraph](#biomarkercorrelationgraph)
5. [BoxplotChart](#boxplotchart)
6. [CorrelationChordDiagram](#correlationchorddiagram)
7. [FocusedCorrelationChart](#focusedcorrelationchart)
8. [HistogramChart](#histogramchart)
9. [LineChart](#linechart)
10. [RadarChart](#radarchart)
11. [ScatterChart](#scatterchart)
12. [SupplementCorrelationGraph](#supplementcorrelationgraph)
13. [SystemClustering](#systemclustering)
14. [CorrelationHeatmap](#correlationheatmap)

---

## Chart (Wrapper)

**Locations in UI:** Main View (Dashboard)
**Locations in code file:** `src/layout/Chart.tsx`
**Purpose:** A multi-axis line chart wrapper built on `@echarts-readymade/core`. It dynamically generates multiple Y-axes (alternating left/right with offsets) to support plotting multiple series on the same timeline grid without overlap. Used for displaying multiple distinct biomarker timelines simultaneously on a single view, allowing for visual correlation across different units and scales.
**Technical info:**

- **Chart Type:** `line`
- **Data/Atom:** Prop: `keys: string[]` (Array of biomarker names to fetch from global state). Uses `ChartProvider` context for data injection.

---

## Chart2 (Base Definitions)

**Locations in UI:** N/A (Helper)
**Locations in code file:** `src/layout/Chart2.tsx`
**Purpose:** Not a standalone chart component, but a foundational file exporting shared chart configurations, specifically the `CHART_PALETTE` array used across multiple visualizations to ensure consistent dark-mode theming. It also registers the `echarts-stat` regression transform.
**Technical info:**

- **Chart Type:** N/A
- **Data/Atom:** Exports `CHART_PALETTE` and base `echartsOptions`.

---

## BiomarkerCorrelationBumpChart

**Locations in UI:** Biomarker Correlation Modal (`BiomarkerCorrelation.tsx`)
**Locations in code file:** `src/layout/BiomarkerCorrelationBumpChart.tsx`
**Purpose:** A specialized bump chart displaying the correlation ranking between a target biomarker and various supplements/factors over time. It visually tracks how the correlation rank changes across different time windows.
**Technical info:**

- **Chart Type:** `line` (styled as a bump chart with rankings)
- **Data/Atom:** Props: `targetBiomarker: string`, `correlations: CorrelationResult[]`, `noteValues: NoteItem[]`.

---

## BiomarkerCorrelationGraph

**Locations in UI:** Biomarker Correlation Modal (`BiomarkerCorrelation.tsx`)
**Locations in code file:** `src/layout/BiomarkerCorrelationGraph.tsx`
**Purpose:** A force-directed network graph showing the correlation strength between a specific target biomarker and other related factors. Node size and edge thickness represent the absolute correlation magnitude (rho), while colors represent positive (emerald) vs negative (red) correlations.
**Technical info:**

- **Chart Type:** `graph` (force layout)
- **Data/Atom:** Props: `biomarkerId: string`, `correlations: CorrelationResult[]`.

---

## BoxplotChart

**Locations in UI:** Table Row Expansion (Data Grid)
**Locations in code file:** `src/layout/BoxplotChart.tsx`
**Purpose:** A standard boxplot visualization for a single continuous variable. Analyzes the distribution, central tendency, and outliers of a specific biomarker's values across all recorded timepoints.
**Technical info:**

- **Chart Type:** `boxplot` (via custom series or `echarts-stat` transform)
- **Data/Atom:** Props: `name: string`, `values: number[]`.

---

## CorrelationChordDiagram

**Locations in UI:** Main View (Dashboard)
**Locations in code file:** `src/layout/CorrelationChordDiagram.tsx`
**Purpose:** A circular layout graph (chord-style diagram) displaying global correlations across all tracked biomarkers simultaneously. Allows users to see the entire network of relationships, with edge thickness denoting correlation strength.
**Technical info:**

- **Chart Type:** `graph` (circular layout)
- **Data/Atom:** Directly consumes Jotai atoms: `nonInferredDataAtom`, `dataMapAtom`, `rankedDataMapAtom`, `correlationAlphaAtom`, `correlationAlternativeAtom`, `correlationMethodAtom`.

---

## FocusedCorrelationChart

**Locations in UI:** Correlation Modal (`Correlation.tsx`)
**Locations in code file:** `src/layout/FocusedCorrelationChart.tsx`
**Purpose:** A horizontal bar chart displaying the strongest positive and negative correlations for a given context. It dynamically scales the opacity of bars based on statistical significance (p-value compared to an alpha threshold).
**Technical info:**

- **Chart Type:** `bar` (horizontal layout)
- **Data/Atom:** Props: `correlations: Array<[string, number, number, number]>`, `alpha: number`.

---

## HistogramChart

**Locations in UI:** Table Row Expansion (Data Grid)
**Locations in code file:** `src/layout/HistogramChart.tsx`
**Purpose:** A histogram visualization that uses `echarts-stat` transform to bucket continuous data into frequency bins. Helps understand the frequency distribution and density of a biomarker's values.
**Technical info:**

- **Chart Type:** `bar` (using `echarts-stat` histogram transform)
- **Data/Atom:** Props: `name: string`, `values: number[]`.

---

## LineChart

**Locations in UI:** Table Row Expansion (Data Grid)
**Locations in code file:** `src/layout/LineChart.tsx`
**Purpose:** A single-series line chart with optional background mark areas to highlight specific target ranges or safe zones. Shows the trend of a single biomarker over time, overlaying a visual "optimal range" band.
**Technical info:**

- **Chart Type:** `line` (with `markArea`)
- **Data/Atom:** Props: `name: string`, `values: number[]`, `rangeStr?: string`.

---

## RadarChart

**Locations in UI:** Main View (Dashboard)
**Locations in code file:** `src/layout/RadarChart.tsx`
**Purpose:** A radar (spider) chart displaying multiple variables on a radial grid. Used for comparing a snapshot of multiple related biomarkers or system health scores against each other at a specific point in time.
**Technical info:**

- **Chart Type:** `radar`
- **Data/Atom:** Props: `data: BioMarker[]`, `tag: string`.

---

## ScatterChart

**Locations in UI:** Main View (Dashboard)
**Locations in code file:** `src/layout/ScatterChart.tsx`
**Purpose:** A multi-series scatter plot that plots distinct data points over time. Useful for visualizing sparse data, specific measurement events, or comparing exact measurement timing without interpolating lines between points.
**Technical info:**

- **Chart Type:** `scatter`
- **Data/Atom:** Prop: `keys: string[]` (Array of biomarker names to plot).

---

## SupplementCorrelationGraph

**Locations in UI:** Supplement Correlation Modal (`SupplementCorrelation.tsx`)
**Locations in code file:** `src/layout/SupplementCorrelationGraph.tsx`
**Purpose:** A force-directed network graph visualizing the strongest correlations between a specific supplement and various biomarkers. Node size and line width scale with correlation strength, highlighting key relationships.
**Technical info:**

- **Chart Type:** `graph` (force layout)
- **Data/Atom:** Props: `supplementName: string`, `correlations: SupplementCorrelationResult[]`.

---

## SystemClustering

**Locations in UI:** Sidebar / Overlay (Triggered from App header)
**Locations in code file:** `src/layout/SystemClustering.tsx`
**Purpose:** A treemap chart intended to visually cluster and group related systems, biomarkers, and metrics hierarchically. Allows users to drill down into specific physiological systems or categories.
**Technical info:**

- **Chart Type:** `treemap`
- **Data/Atom:** Props: `isOpen: boolean`, `onClose: () => void`. Directly consumes Jotai atoms for global data state (e.g., `dataMapAtom`).

--

## CorrelationHeatmap

--
