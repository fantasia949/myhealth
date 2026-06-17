## 2024-05-30 - Dialog Close Button Tooltip Consistency

**Learning:** Found an inconsistency in native browser tooltips (`title` attribute) for dialog close buttons. While `aria-label`s were correctly set to "Close dialog" across all modal components (`Nav`, `GistViewer`, `Correlation`, `PValue`, `BiomarkerCorrelation`, `SystemClustering`), `SupplementCorrelation.tsx` had its native `title` set to "Close" instead of "Close dialog".
**Action:** Always verify that native tooltips (`title`) mirror the `aria-label` exactly for standard actions like dialog closing to ensure consistent visual and screen-reader experiences across all dynamically loaded modules.
