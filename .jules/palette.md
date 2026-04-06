
## 2026-04-06 - Structural Accessibility (Skip to content)
**Learning:** While individual components (buttons, inputs) had strong accessibility (ARIA labels, tooltips), the overall layout lacked structural accessibility primitives like a skip-to-content link and a semantic `<main>` wrapper. Without these, keyboard users cannot efficiently bypass top-level navigation components.
**Action:** Always verify high-level DOM structure for keyboard navigation accessibility alongside component-level ARIA compliance.
