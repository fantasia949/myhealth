**The Issue:**
In `src/layout/Chart2.tsx`, the fallback tooltip formatter for the `ecStat` regression line evaluates the regression equation from `params.value[2]` (or the fallback `regressionExpression`), returning a raw string like `y = 2x + 1` via `getRegressionTooltip()`. This provides a mathematically accurate but poor UX, since `x` and `y` are generic and disconnected from the selected biomarker keys.

**Discovery Signal:**
Scan 2 (Tooltip Quality & Completeness) highlighted that while `Chart2.tsx` falls back to `return params.value[2] ? ...` correctly to avoid showing a data index, the literal `y = 2x + ...` string was suboptimal. Memory guidelines suggested a regex-based substitution pattern (`/\bx\b/g` and `/^y\s*=/`) to handle string formatting safely.

**The Fix:**
Modified `getRegressionTooltip` in `src/layout/Chart2.tsx` to accept the X and Y biomarker keys as arguments. Implemented safe regex replacements to transform `x` to `keyX` and `y = ` to `keyY = ` inside the formatted HTML string. Updated all `getRegressionTooltip` call sites within `options.tooltip` and `series.tooltip` to pass `keys[0]` and `keys[1]`.

**The Benefit:**
Massively improves context for the regression line tooltip. Hovering over the regression trend now displays a readable formula tied to the actual selected variables (e.g., `Cholesterol = 2 * Glucose + 1` instead of `y = 2x + 1`), providing immediate clarity.
