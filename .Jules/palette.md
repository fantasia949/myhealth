## 2026-01-25 - Improving Accessibility and Interaction in React Components
**Learning:** Found that direct DOM manipulation (e.g., `e.target.disabled = true`) in React event handlers leads to poor UX because it doesn't trigger re-renders for visual updates (like text changes "Asking..."). Transitioning to React state (`isAsking`) not only fixes this but makes the logic more declarative and testable.
**Action:** Always prefer React state over direct DOM manipulation for interactive states. Also, icon-only buttons consistently missed `aria-label`s, which is a common pattern to watch out for in this codebase.

## 2026-02-05 - Semantic Interactive Elements
**Learning:** Found interactive `span` elements acting as buttons (e.g., chart toggles). Converting them to semantic `<button>` elements immediately improves accessibility (keyboard focus, screen reader support) without complex custom ARIA implementations.
**Action:** Scan for `onClick` handlers on non-interactive elements (div, span) and convert them to semantic buttons or links.
