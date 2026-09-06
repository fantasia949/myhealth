## 2024-05-30 - Dialog Close Button Tooltip Consistency

**Learning:** Found an inconsistency in native browser tooltips (`title` attribute) for dialog close buttons. While `aria-label`s were correctly set to "Close dialog" across all modal components (`Nav`, `GistViewer`, `Correlation`, `PValue`, `BiomarkerCorrelation`, `SystemClustering`), `SupplementCorrelation.tsx` had its native `title` set to "Close" instead of "Close dialog".
**Action:** Always verify that native tooltips (`title`) mirror the `aria-label` exactly for standard actions like dialog closing to ensure consistent visual and screen-reader experiences across all dynamically loaded modules.

## 2024-07-06 - Missing button attributes in ECharts overlays

**Learning:** When using toggle buttons integrated into complex components like ECharts layouts (e.g. `CorrelationHeatmap`), they frequently lack standard interactive accessibility features like `aria-pressed`, `aria-label`, and explicit `type="button"`, causing confusion for keyboard-only and screen reader users about what state the visualization is currently in.
**Action:** Audit buttons that change state without navigating (e.g., changing visualization modes) to ensure they have `aria-pressed` set correctly and explicit labels.

## 2024-11-20 - Select Dropdown Focus Visibility

**Learning:** When styling native interactive elements like `<select>` dropdowns (e.g., in `DirectionalCorrelationScatter`), they often receive basic focus outline overrides (`focus:outline-none focus:border-blue-500`) but miss the standard ring indicator classes (`focus-visible:ring-2 focus-visible:ring-blue-500`) used across buttons and inputs, degrading the experience for keyboard-only users who expect a uniform visual focus state.
**Action:** Audit native HTML input and select elements to verify they all implement the `focus-visible:ring-2` class standard for the application, not just `focus:border-color`.

## 2024-11-20 - Select Dropdown Focus Visibility

**Learning:** When styling native interactive elements like `<select>` dropdowns (e.g., in `DirectionalCorrelationScatter`), they often receive basic focus outline overrides (`focus:outline-none focus:border-blue-500`) but miss the standard ring indicator classes (`focus-visible:ring-2 focus-visible:ring-blue-500`) used across buttons and inputs, degrading the experience for keyboard-only users who expect a uniform visual focus state.
**Action:** Audit native HTML input and select elements to verify they all implement the `focus-visible:ring-2` class standard for the application, not just `focus:border-color`.

## 2026-07-27 - Clear Selection Button Accessibility\n**Learning:** Found that the 'Clear Selection' icon-only button in the top navigation bar lacked a semantic `aria-label`, meaning screen readers would only announce its native `title` or guess its purpose. Additionally, it missed standard keyboard focus states (`focus-visible:ring-2`), making keyboard navigation difficult.\n**Action:** Always verify that icon-only buttons receive both a descriptive `aria-label` and consistent application-wide keyboard focus utility classes (`focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded`).

## 2026-08-10 - Mobile Menu Button Accessibility

**Learning:** Found that the 'Open menu' and 'Close panel' icon-only buttons in the mobile navigation lacked consistent keyboard focus indicators (`focus-visible:ring-2`) and proper `aria-label`/`title` tooltip synchronization, which degrades the experience for keyboard-only and screen reader users on smaller viewports.
**Action:** Always verify that mobile-specific icon-only buttons receive a descriptive `aria-label`, a matching `title` for visual tooltips, and consistent application-wide keyboard focus utility classes (`focus-visible:ring-2 focus-visible:ring-accent`).
