## 2024-05-30 - Dialog Close Button Tooltip Consistency

**Learning:** Found an inconsistency in native browser tooltips (`title` attribute) for dialog close buttons. While `aria-label`s were correctly set to "Close dialog" across all modal components (`Nav`, `GistViewer`, `Correlation`, `PValue`, `BiomarkerCorrelation`, `SystemClustering`), `SupplementCorrelation.tsx` had its native `title` set to "Close" instead of "Close dialog".
**Action:** Always verify that native tooltips (`title`) mirror the `aria-label` exactly for standard actions like dialog closing to ensure consistent visual and screen-reader experiences across all dynamically loaded modules.
## 2024-07-06 - Missing button attributes in ECharts overlays

**Learning:** When using toggle buttons integrated into complex components like ECharts layouts (e.g. `CorrelationHeatmap`), they frequently lack standard interactive accessibility features like `aria-pressed`, `aria-label`, and explicit `type="button"`, causing confusion for keyboard-only and screen reader users about what state the visualization is currently in.
**Action:** Audit buttons that change state without navigating (e.g., changing visualization modes) to ensure they have `aria-pressed` set correctly and explicit labels.
