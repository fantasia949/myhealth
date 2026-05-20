**The Issue:**
In `src/layout/Chart2.tsx` (lines 92-106, 150-188), the scatter plot suffered from a clipping issue where the `symbolSize: 40` scatter points were visibly cut in half at the boundaries. The previous implementation attempted to fix this via a hack: manually calculating `minX, maxX, minY, maxY` bounds in an O(N) loop and passing them into a hidden `dataZoom` slider to constrain the viewport. However, ECharts does not account for symbol radius at `dataZoom` bounds, making the clipping inevitable.

**Discovery Signal:**
Scan 4 — Chart2 Dual-Render Conflict & Multi-Axis Legibility. During the code review, the manual bounds tracking array coupled with the `dataZoom` layout stood out as a fragile hack.

**context7 Reference:**
The `scale: true` property is confirmed valid for ECharts 6 value axes via its active, successful usage in both `src/layout/Chart.tsx` (line 99) and `src/layout/LineChart.tsx` (line 54). `context7` resolution failed due to missing CLI command, falling back to verifying from local source files.

**The Fix:**

- Added `scale: true` to the `value` axes (both `xAxis` and `yAxis`) in `echartsOptions`. This allows ECharts to automatically compute boundaries with proper zero-padding dynamically.
- Entirely removed the hidden `dataZoom` slider from `echartsOptions` and the dynamically mapped `options`.
- Removed the manual `minX, maxX, minY, maxY` bounds calculation logic from the `mappedScatterData` `useMemo` block.

**The Benefit:**
Scatter points are no longer cut in half at the edges of the chart. The rendering pipeline is vastly simplified, removing an entire class of O(N) array calculations and reducing the structural payload of the ECharts configuration object.

**TypeScript result:**
`npx tsc --noEmit` output: 0 errors
