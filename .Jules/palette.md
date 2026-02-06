## 2026-01-25 - Improving Accessibility and Interaction in React Components
**Learning:** Found that direct DOM manipulation (e.g., `e.target.disabled = true`) in React event handlers leads to poor UX because it doesn't trigger re-renders for visual updates (like text changes "Asking..."). Transitioning to React state (`isAsking`) not only fixes this but makes the logic more declarative and testable.
**Action:** Always prefer React state over direct DOM manipulation for interactive states. Also, icon-only buttons consistently missed `aria-label`s, which is a common pattern to watch out for in this codebase.
## 2026-02-04 - Semantic HTML and Test Robustness
**Learning:** Replacing clickable `span` elements with semantic `button` tags significantly improves accessibility (keyboard nav, screen reader support). However, ensure corresponding tests are robust; replacing direct element selectors with accessible locators (e.g., `getByRole('checkbox', { name: ... })`) prevents fragility when DOM structures change and verifies the accessibility improvement itself.
**Action:** Default to `<button>` for interactions and prefer `getByRole` in tests.
