## 2026-01-25 - Improving Accessibility and Interaction in React Components
**Learning:** Found that direct DOM manipulation (e.g., `e.target.disabled = true`) in React event handlers leads to poor UX because it doesn't trigger re-renders for visual updates (like text changes "Asking..."). Transitioning to React state (`isAsking`) not only fixes this but makes the logic more declarative and testable.
**Action:** Always prefer React state over direct DOM manipulation for interactive states. Also, icon-only buttons consistently missed `aria-label`s, which is a common pattern to watch out for in this codebase.

## 2026-01-29 - Semantic HTML for Table Actions
**Learning:** Table row actions (like chart toggles) implemented as `span` elements with `onClick` completely exclude keyboard users. Refactoring these to `<button>` elements provides immediate accessibility wins (focus, Enter/Space support) and allows for proper ARIA states like `aria-expanded`.
**Action:** When auditing tables, specifically look for "clickable spans" or divs and convert them to semantic `<button>` elements with clear `aria-label`s.
