The goal is to fix structural code maintainability issues, focusing on Phase 1 Scan D (Weak Type Annotations) in `src/layout/Table.tsx`.
`src/layout/Table.tsx` contains numerous weak type annotations `as any` when defining columns with `createColumnHelper`. These create implicit `any` properties and weak typing in the table setup.

Specifically, around lines 317-380 of `src/layout/Table.tsx`, `columnHelper.accessor` is being called with `as any` for virtual or display-only columns that do not exist on the `DisplayedEntry` type.
For example: `columnHelper.accessor('selection' as any, ...)`
The correct `react-table` pattern for columns not tied to a specific data accessor is `columnHelper.display({ id: 'selection', ... })`.
For properties that *do* exist on `DisplayedEntry` (like `tag`, `name`, `unit`), the `as any` cast is completely unnecessary and should be removed (`columnHelper.accessor('tag', ...)`).

Fix:
- Replace `columnHelper.accessor('selection' as any, { header: '' })` with `columnHelper.display({ id: 'selection', header: '' })`.
- Remove `as any` from `columnHelper.accessor('tag' as any, ...)` -> `columnHelper.accessor('tag', ...)`
- Remove `as any` from `columnHelper.accessor('name' as any, ...)` -> `columnHelper.accessor('name', ...)`
- Replace `columnHelper.accessor('placeholder' as any, ...)` with `columnHelper.display({ id: 'placeholder', ... })`
- Replace `columnHelper.accessor('range' as any, ...)` with `columnHelper.display({ id: 'range', ... })`
- Remove `as any` from `columnHelper.accessor('unit' as any, ...)` -> `columnHelper.accessor('unit', ...)`
- Replace `columnHelper.accessor('origUnit' as any, ...)` with `columnHelper.display({ id: 'origUnit', ... })`
- Also replace `columnHelper.accessor(label as any, ...)` with `columnHelper.accessor('values', ...)` or just keep `label as any` if it refers to dynamic keys not in `DisplayedEntry`? Ah, `label` inside the map corresponds to `v0`, `v1`, `v2` etc. Those aren't in `DisplayedEntry`. Actually, `DisplayedEntry` has `values: number[]`. The virtual columns use dynamic string keys matching the label.
Wait, let me check the `columns` definition in `src/layout/Table.tsx`.
