## 2026-04-10 - Add Skip-to-content links

**Learning:** Applications need skip-to-content links for keyboard users to bypass repetitive navigation elements, ensuring accessible workflows.

## 2025-04-11 - Add missing title tooltip to SystemClustering close button

**Learning:** Inconsistent visual tooltips on close dialog buttons can disrupt user expectations. Screen reader accessible `aria-label` attributes do not natively render visual hover tooltips in modern browsers; an explicit `title` attribute must be paired with `aria-label` for full coverage (visual and screen reader).
**Action:** When creating or auditing dialog components, systematically ensure the close button (`XMarkIcon`) implements both `aria-label` and `title` to provide equivalent feedback for mouse-hover and assistive technology users.

## 2025-04-14 - Add missing explicit label to search input

**Learning:** Relying solely on `aria-label` for inputs can sometimes be less robust than explicit, visually hidden `<label>` elements linked via `htmlFor` and `id`, especially across older assistive technologies. Explicit labels are considered the most robust HTML pattern.
**Action:** Prefer `htmlFor`/`id` linking with a `sr-only` class for accessible labels over `aria-label` when adding or auditing inputs, and ensure redundant `aria-label`s are removed when explicitly labeled.

## 2026-04-14 - Improve Markdown Readability in Dialogs

**Learning:** Default text styles in narrow dialogs make markdown difficult to read.
**Action:** Use `@tailwindcss/typography` plugin with `prose prose-invert` classes to automatically style markdown, and increase Dialog container widths (`max-w-3xl`) to improve overall readability.
