**The Issue:**
In `src/layout/Chart2.tsx`, the fallback tooltip formatter for the regression `line` series was using a stale variable captured in a closure:
```typescript
// Scan 2 Fix: Fallback for regression tooltip (regression line is rendered by 'line' series type)
// `regressionExpression` is outside the closure. ecStat formulaOn: 'end' does not reliably expose the equation at `params.value[2]` for line points during hover.
return getRegressionTooltip(regressionExpression)
```
This causes the tooltip for the regression line to either show an empty equation or not update correctly across re-renders because ECharts triggers formatters outside of the React reactive context.

**Discovery Signal:**
Scan 2 - Tooltip Quality & Completeness. The fallback formatter was returning `getRegressionTooltip(regressionExpression)` which is outside the formatter closure.

**The Fix:**
Updated the tooltip formatter for the `nextSeries` regression line to inspect `params.value`. If ECharts ecStat's `formulaOn: 'end'` places the equation string in `params.value[2]`, it extracts and returns it. If not, it falls back to the captured `regressionExpression`.
```typescript
if (Array.isArray(params.value) && typeof params.value[2] === 'string' && params.value[2].includes('=')) {
  return getRegressionTooltip(params.value[2])
}
return getRegressionTooltip(regressionExpression)
```

**The Benefit:**
The regression line tooltip now reliably displays the actual regression equation (e.g., 'y = 2x + 1') when hovering over the regression line, significantly improving the visibility of the calculated trendline relationship.
