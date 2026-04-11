## 2026-04-10 - Add Skip-to-content links

**Learning:** Applications need skip-to-content links for keyboard users to bypass repetitive navigation elements, ensuring accessible workflows.
## 2025-04-11 - Add missing title tooltip to SystemClustering close button
**Learning:** Inconsistent visual tooltips on close dialog buttons can disrupt user expectations. Screen reader accessible `aria-label` attributes do not natively render visual hover tooltips in modern browsers; an explicit `title` attribute must be paired with `aria-label` for full coverage (visual and screen reader).
**Action:** When creating or auditing dialog components, systematically ensure the close button (`XMarkIcon`) implements both `aria-label` and `title` to provide equivalent feedback for mouse-hover and assistive technology users.
