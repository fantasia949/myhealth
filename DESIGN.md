# Design & Architecture Guidelines

## Overview

This repository contains a React 19 + TypeScript health biomarker analytics dashboard. Visualizations use ECharts 6 and follow strict UI dark theme and accessibility standards.

## Chart Design Guidelines

### Dark Theme Consistency
- All ECharts instances must set `backgroundColor: 'transparent'` and `theme: 'dark'`.
- Shared palette is imported from `src/layout/Chart2.tsx` (`CHART_PALETTE`). Do not hardcode series colors.

### Tooltip Format
- Standardize tooltips with `#111111` background, `#3a3a3a80` border, and `#f0f0f0` text.
- Include rich context (date, percentile/rank, raw numerical value, unit). Guard against null/undefined values and `NaN`.

### ECharts Data & Missing Values
- Sentinel value `'-'` should be used for missing data points in time-series and parallel coordinate lines to render clean gaps without throwing errors.
- Always guard against missing or non-numeric entries when iterating over raw biomarker data (`BioMarker[1]`).

## Component Structure: Evolution Matrix (`LongitudinalRankParallel`)

The **Evolution Matrix** (`LongitudinalRankParallel.tsx`) implements a Parallel Coordinates chart to track rank inversions across time.

1. **Selection Criteria**: Selects top 10 measured (non-inferred) biomarkers with highest Coefficient of Variation ($CV = \frac{\sigma}{\mu}$).
2. **Axis Mapping**: Parallel axes represent historical dates (`labels`), inverted so that top rank percentiles ($0\%$) appear at the top.
3. **Data Mapping**: Converts Spearman ranks from `rankedDataMapAtom` to percentiles ($0-100\%$).
4. **Navigation Integration**: Toggled via the Analyze menu in `Nav.tsx` (`isEvolutionViewOpenAtom`).
