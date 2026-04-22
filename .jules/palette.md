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
## 2026-04-18 - Improve Dynamic Button Tooltips
**Learning:** Action buttons dependent on UI state (e.g., table selections) must utilize explicit `disabled` attributes alongside dynamic `title` tooltips that inform the user why the action is disabled when conditions aren't met (e.g., 'Select at least one item to visualize').
**Action:** Always pair conditionally disabled action buttons with contextual tooltips to clarify the system state to the user.

## 2026-04-20 - [Add Empty State with Actionable CTA]
**Learning:** Replaced plain text empty states with structured UI (Icon + Heading + Explanation + CTA Button) significantly improves the perceived quality of the application and guides users effectively when there is no data.
**Action:** When encountering `files.length === 0` or similar conditions, always prefer a structured empty state over plain text, ensuring it includes a helpful call-to-action to resolve the empty state.
