## 2024-05-07 - Differentiating Filter-Driven vs Global Empty States

**Learning:** Screen readers and sighted users both benefit from a clear distinction between a "global" empty state (no data available at all) and a "filter-driven" empty state (data exists, but doesn't match the search criteria). Previously, the table empty state simply stated the lack of results.
**Action:** When designing empty states for data tables or lists with search/filter capabilities, dynamically swap the visual icon (e.g. `InboxIcon` vs `MagnifyingGlassIcon`), the descriptive helper text, and the `aria-live="polite"` region text based on the active filter state. This ensures users know exactly _why_ the view is empty and _how_ to resolve it (e.g., by clearing filters).

## 2024-05-07 - Differentiating Filter-Driven vs Global Empty States

**Learning:** Screen readers and sighted users both benefit from a clear distinction between a "global" empty state (no data available at all) and a "filter-driven" empty state (data exists, but doesn't match the search criteria). Previously, the table empty state simply stated the lack of results.
**Action:** When designing empty states for data tables or lists with search/filter capabilities, dynamically swap the visual icon (e.g. `InboxIcon` vs `MagnifyingGlassIcon`), the descriptive helper text, and the `aria-live="polite"` region text based on the active filter state. This ensures users know exactly _why_ the view is empty and _how_ to resolve it (e.g., by clearing filters).
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
**Learning:** When implementing tab-like views using custom buttons (e.g., swapping between Chart and Table views), screen reader users are unaware of the active selection if the visual active state (e.g., highlighted background color) isn't paired with an accessibility attribute.
**Action:** Always add `aria-pressed={isActive}` or `aria-selected={isActive}` to toggle buttons to correctly communicate their state to assistive technologies.

## 2026-05-01 - Add missing accessibility feedback to icon-only state buttons

**Learning:** When icon-only buttons change state (e.g., from a "Copy" icon to a "Check" icon upon successful copy) without triggering a route change, screen readers receive no feedback unless explicitly provided. While visual users see the icon swap, assistive technologies need dynamic accessible labels and live regions to announce the action's success.
**Action:** Always ensure that icon-only buttons which perform stateful actions dynamically update their `aria-label` (and `title` for visual hover consistency) and apply `aria-live="polite"` so state changes are properly announced.

## 2024-05-24 - Screen Reader Double Announcements with Spinners

**Learning:** Adding `role="status"` and `aria-label` directly to generic Spinner SVGs causes double announcements when the spinner is embedded alongside actual loading text that already has `aria-live="polite"` or `role="status"`.
**Action:** Keep visual-only indicators like SVGs hidden from screen readers using `aria-hidden="true"`, and manage the accessible loading state purely through the surrounding text/container.

## 2025-02-20 - Ensure Aria-Hidden on Decorative Icons

**Learning:** Generic icon components (like `@heroicons/react`) can cause redundant screen reader announcements if used decoratively without `aria-hidden="true"`.
**Action:** Always add `aria-hidden="true"` to SVG/icon components that do not convey meaningful unique information (e.g., when wrapped in a button with a clear `aria-label`).
