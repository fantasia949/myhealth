**The Issue:**
`src/layout/Chart2.tsx` lines 195-197. The global `echartsOptions` configuration object was being mutated during the React `useMemo` render path.
```typescript
  const options: any = useMemo(() => {
    let { series, yAxis, xAxis } = echartsOptions
    ;(xAxis as any[])[0].name = keys[0]
    ;(yAxis as any[])[0].name = keys[1]
```
This is a standard React anti-pattern that causes global state pollution. Because `echartsOptions` lives outside the component, multiple mounts or remounts will read from the same polluted reference, leading to stale or permanently overridden axis labels.
Additionally, the dynamic scatter tooltip on line 245 lacked a null-guard on `params.value`, which would cause a runtime crash (`params.value[0]`) if an incomplete data point was hovered.

**Discovery Signal:**
Scan 4/6 (Chart2 Dual-Render Conflict & Edge Cases). A close inspection of the `options` useMemo hook revealed the mutating assignment on the `xAxis` and `yAxis` objects pulled directly from the global constant.

**context7 Reference:**
`context7` was unavailable for this run. However, the ECharts properties `xAxis[0].name`, `yAxis[0].name`, and `tooltip.formatter` are all widely used, existing APIs within the codebase whose signatures were verified implicitly from the current file context.

**The Fix:**
I replaced the mutating assignments with immutable array and object spreading. The `xAxis` and `yAxis` arrays are now cloned safely before appending the dynamic `keys`:
```typescript
    const nextXAxis = [{ ...xAxis[0], name: keys[0] }, ...xAxis.slice(1)]
    const nextYAxis = [{ ...yAxis[0], name: keys[1] }, ...yAxis.slice(1)]
```
I also added an early return `if (!params.value) return ''` to the scatter series condition within the tooltip formatter.

**The Benefit:**
Stale or incorrect axis names will no longer appear when multiple instances of the chart are rendered or when the component unmounts and remounts rapidly. The dynamic tooltip will no longer crash if an undefined value array is passed by the engine.

**TypeScript result:**
0 errors
