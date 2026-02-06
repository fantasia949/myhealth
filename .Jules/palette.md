## 2026-01-25 - Improving Accessibility and Interaction in React Components
**Learning:** Found that direct DOM manipulation (e.g., `e.target.disabled = true`) in React event handlers leads to poor UX because it doesn't trigger re-renders for visual updates (like text changes "Asking..."). Transitioning to React state (`isAsking`) not only fixes this but makes the logic more declarative and testable.
**Action:** Always prefer React state over direct DOM manipulation for interactive states. Also, icon-only buttons consistently missed `aria-label`s, which is a common pattern to watch out for in this codebase.

## 2025-05-21 - Form Accessibility Patterns
**Learning:** Critical configuration inputs relied solely on placeholders, causing context loss when filled. Found duplicate `name` attributes in these ad-hoc forms, likely from copy-paste coding.
**Action:** Enforce visible labels for all inputs using a vertical flex container pattern (`flex-col gap-1`) to maintain layout while improving usability. Always audit `name` and `id` attributes when cloning form fields.
