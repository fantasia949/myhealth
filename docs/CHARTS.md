# Charts Documentation

This document provides an overview of all implemented charts in the application. It is structured to be easily parsable and understood by LLMs, detailing the name, description, typical use cases, and data shape (props) for each chart component.

## Table of Contents
1. [Chart (Wrapper)](#chart)
2. [Chart2 (Base Definitions)](#chart2)
3. [BiomarkerCorrelationBumpChart](#biomarkercorrelationbumpchart)
4. [BoxplotChart](#boxplotchart)
5. [FocusedCorrelationChart](#focusedcorrelationchart)
6. [HistogramChart](#histogramchart)
7. [LineChart](#linechart)
8. [RadarChart](#radarchart)
9. [ScatterChart](#scatterchart)

---

## Chart
**Description:** A multi-axis line chart wrapper built on `@echarts-readymade/core` and `echarts-for-react`. It dynamically generates multiple Y-axes (alternating left/right with offsets) to support plotting multiple series on the same timeline grid without overlap.
**Typical Use Cases:** Displaying multiple distinct biomarker timelines simultaneously on a single view, allowing for visual correlation across different units and scales.
**Data Shape (Props):**
```typescript
interface ChartProps {
  keys: string[]; // Array of biomarker names to fetch from global state and plot.
}
```

---

## Chart2
**Description:** Not a standalone chart component, but a foundational file exporting shared chart configurations, specifically the `CHART_PALETTE` array used across multiple visualizations to ensure consistent theming. It also registers the `echarts-stat` regression transform.
**Typical Use Cases:** Imported by other charts to retrieve the application's standard dark-mode color palette.

---

## BiomarkerCorrelationBumpChart
**Description:** A specialized bump chart displaying the correlation ranking between a target biomarker and various supplements/factors over time. It visually tracks how the correlation rank changes across different time windows.
**Typical Use Cases:** Identifying which lifestyle factors or supplements consistently correlate strongly (positively or negatively) with a specific biomarker over rolling periods.
**Data Shape (Props):**
```typescript
interface BumpChartProps {
  targetBiomarker: string;
  correlations: CorrelationResult[];
  noteValues: NoteItem[];
}

// Referenced shapes
type CorrelationResult = [string, number, number, number]; // [name, N, pValue, coeff]
interface NoteItem {
  id: string;
  date: string;
  content: string;
  // ... other note properties
}
```

---

## BoxplotChart
**Description:** A standard boxplot visualization for a single continuous variable, built using `echarts-for-react`.
**Typical Use Cases:** Analyzing the distribution, central tendency, and outliers of a specific biomarker's values across all recorded timepoints.
**Data Shape (Props):**
```typescript
interface BoxplotChartProps {
  name: string;      // The name of the biomarker or dataset
  values: number[];  // Array of numeric values representing the distribution
}
```

---

## FocusedCorrelationChart
**Description:** A horizontal bar chart displaying the strongest positive and negative correlations for a given context. It dynamically scales the opacity of bars based on statistical significance (p-value compared to an alpha threshold).
**Typical Use Cases:** Providing a quick summary of the top positive and negative influences (e.g., diet, sleep, supplements) on a target metric, filtering out insignificant noise.
**Data Shape (Props):**
```typescript
interface FocusedCorrelationChartProps {
  correlations: Array<[string, number, number, number]>; // [name, N, pValue, coeff]
  alpha: number; // The significance threshold (e.g., 0.05)
}
```

---

## HistogramChart
**Description:** A histogram visualization that uses `echarts-stat` transform to bucket continuous data into frequency bins.
**Typical Use Cases:** Understanding the frequency distribution and density of a biomarker's values, helping to identify normal ranges versus rare extremes for the individual.
**Data Shape (Props):**
```typescript
interface HistogramChartProps {
  name: string;      // The name of the dataset
  values: number[];  // Array of numeric values to be bucketed
}
```

---

## LineChart
**Description:** A single-series line chart with optional background mark areas to highlight specific target ranges or safe zones.
**Typical Use Cases:** Showing the trend of a single biomarker over time, often overlaying a visual "optimal range" band so users can see when they fell in or out of bounds.
**Data Shape (Props):**
```typescript
interface LineChartProps {
  name: string;        // The name of the dataset being plotted
  values: number[];    // Array of numeric values corresponding to the timeline
  rangeStr?: string;   // Optional string representing the target range (e.g., "5.0-7.0")
}
```

---

## RadarChart
**Description:** A radar (spider) chart displaying multiple variables on a radial grid.
**Typical Use Cases:** Comparing a snapshot of multiple related biomarkers (or system health scores) against each other at a specific point in time or comparing current values to historical baselines.
**Data Shape (Props):**
```typescript
interface RadarChartProps {
  data: BioMarker[]; // Array of biomarker data tuples
  tag: string;       // A specific tag or category to filter/focus the radar on
}

// Referenced shapes
type BioMarker = [string, number[], string?]; // [name, values, unit]
```

---

## ScatterChart
**Description:** A multi-series scatter plot that plots distinct data points over time.
**Typical Use Cases:** Visualizing sparse data, specific measurement events, or comparing the exact measurement timing of multiple biomarkers without interpolating lines between points.
**Data Shape (Props):**
```typescript
interface ScatterChartProps {
  keys: string[]; // Array of biomarker names to fetch and plot
}
```
