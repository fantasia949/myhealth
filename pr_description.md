**The Issue:**
In `src/layout/Chart2.tsx`, the regression dataset tries to use `echarts-stat`'s data transform feature via `dataset.push({ transform: { type: 'ecStat:regression', ... } })`. However, `echarts-stat` v1.2.0 is incompatible with the ECharts 6 data transform API. When ECharts attempts to execute this transform on rendering, it crashes internally with `TypeError: upstream.cloneAllDimensionInfo is not a function`, preventing the regression line from rendering successfully. The code already calculates `const regRes = (ecStat as any).regression(...)` to extract the `regressionExpression` string for the tooltip fallback, so calculating it via the dataset is entirely redundant.

**Discovery Signal:**
Scan 4 (Runtime Error/Crash check) discovered a TypeError related to ECharts 6's API changes when attempting to use dataset transforms alongside `echarts-stat` 1.2.0.

**The Fix:**
Removed the `ecStat:regression` transform from the `dataset` array configuration entirely. Instead, explicitly passed the pre-calculated `regRes.points` array to the `data` property of the `line` series that renders the regression trend.

**The Benefit:**
Completely resolves the silent runtime crash, guaranteeing that the regression line renders reliably on correlation scatter plots without relying on deprecated/broken data transforms in ECharts 6.
