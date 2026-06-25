## 2024-05-31 - Add Select All Checkbox to Data Table

**Learning:** For data-dense tables powered by Headless UI/TanStack Table where bulk actions are frequent, relying solely on single-row selections forces users into repetitive workflows. Utilizing the table library's native `getIsAllRowsSelected` state within a simple column header improves macro interactions significantly while staying within accessibility guidelines (provided an `aria-label` is applied to the checkbox).
**Action:** Next time working on a table component with row-level selection, proactively investigate if a "Select All" header toggle is missing, and if so, wire it up using the table's existing selection state manager.

## 2024-06-22 - Add aria-controls to aria-expanded toggles

**Learning:** When using `aria-expanded` on toggle buttons (like mobile menus), it is not enough to just announce the expanded state. Screen readers also need to know *what* container is being expanded. Always pair `aria-expanded` with `aria-controls="[container-id]"` and ensure the target container has a matching `id`.
**Action:** Next time implementing or auditing a toggle button with `aria-expanded`, ensure `aria-controls` is present and correctly linked to the target element's `id`.
