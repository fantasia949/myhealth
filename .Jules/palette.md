## 2024-05-31 - Add Select All Checkbox to Data Table

**Learning:** For data-dense tables powered by Headless UI/TanStack Table where bulk actions are frequent, relying solely on single-row selections forces users into repetitive workflows. Utilizing the table library's native `getIsAllRowsSelected` state within a simple column header improves macro interactions significantly while staying within accessibility guidelines (provided an `aria-label` is applied to the checkbox).
**Action:** Next time working on a table component with row-level selection, proactively investigate if a "Select All" header toggle is missing, and if so, wire it up using the table's existing selection state manager.
