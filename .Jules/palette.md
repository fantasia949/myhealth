## 2026-01-25 - Improving Accessibility and Interaction in React Components

**Learning:** Found that direct DOM manipulation (e.g., `e.target.disabled = true`) in React event handlers leads to poor UX because it doesn't trigger re-renders for visual updates (like text changes "Asking..."). Transitioning to React state (`isAsking`) not only fixes this but makes the logic more declarative and testable.
**Action:** Always prefer React state over direct DOM manipulation for interactive states. Also, icon-only buttons consistently missed `aria-label`s, which is a common pattern to watch out for in this codebase.

## 2026-02-05 - Semantic Interactive Elements

**Learning:** Found interactive `span` elements acting as buttons (e.g., chart toggles). Converting them to semantic `<button>` elements immediately improves accessibility (keyboard focus, screen reader support) without complex custom ARIA implementations.
**Action:** Scan for `onClick` handlers on non-interactive elements (div, span) and convert them to semantic buttons or links.

## 2026-01-29 - Semantic HTML for Table Actions

**Learning:** Table row actions (like chart toggles) implemented as `span` elements with `onClick` completely exclude keyboard users. Refactoring these to `<button>` elements provides immediate accessibility wins (focus, Enter/Space support) and allows for proper ARIA states like `aria-expanded`.
**Action:** When auditing tables, specifically look for "clickable spans" or divs and convert them to semantic `<button>` elements with clear `aria-label`s.

## 2025-05-21 - Form Accessibility Patterns

**Learning:** Critical configuration inputs relied solely on placeholders, causing context loss when filled. Found duplicate `name` attributes in these ad-hoc forms, likely from copy-paste coding.
**Action:** Enforce visible labels for all inputs using a vertical flex container pattern (`flex-col gap-1`) to maintain layout while improving usability. Always audit `name` and `id` attributes when cloning form fields.

## 2026-02-15 - Data Integrity in DOM-based Actions

**Learning:** Extracting data from `textContent` for actions like "Copy to Clipboard" is risky when the UI state changes (e.g., injecting a "Copied!" tooltip). This can lead to copying the tooltip text along with the data on rapid interactions.
**Action:** Pass the raw data value to the event handler instead of relying on the DOM content, especially for interactive elements with dynamic children.

## 2026-10-25 - Event Delegation on Buttons with Icons

**Learning:** When adding icons (e.g., `<XMarkIcon />`) inside a `<button>` that relies on `e.target.name` for its handler, the `e.target` often becomes the SVG icon element (which has no name), breaking the handler. Using `e.currentTarget` ensures the event listener is always attached to the button itself.
**Action:** When refactoring text-only buttons to include icons, always audit the `onClick` handler and switch `e.target` to `e.currentTarget` or pass the value directly via closure.

## 2026-11-05 - Privacy UX for Sensitive Inputs

**Learning:** API keys displayed in plain text expose users to security risks during screen sharing. Implementing a password toggle pattern (`type="password"` with show/hide button) is a standard UX expectation that balances security with usability.
**Action:** Identify sensitive inputs (keys, tokens) and wrap them in a password visibility toggle component by default.

## 2026-02-14 - Icon-only Button Accessibility

**Learning:** Icon-only buttons (like `?`) are easily missed during manual accessibility audits because they look interactive. Automated tests asserting `aria-label` presence on specific selectors (like `button:has-text("?")`) reliably catch these omissions.
**Action:** When creating icon-only buttons, always include an `aria-label` and verify it with a specific test case targeting that button.

## 2026-03-01 - Empty State Handling in Data Tables

**Learning:** Data tables using virtualization or headless libraries (like `@tanstack/react-table`) often render nothing when filters match no data, leaving users confused. Explicitly checking `table.getRowModel().rows.length === 0` and rendering a full-width row (`colSpan={table.getVisibleLeafColumns().length}`) provides immediate, helpful feedback.
**Action:** Always implement an explicit "No records found" empty state for tables, ensuring the message spans all visible columns.

## 2026-10-25 - Bulk Action Visibility

**Learning:** When users can select multiple items (e.g., checkboxes), providing a single "Clear All" action that appears conditionally (when > 1 item selected) significantly reduces friction compared to deselecting items individually. This pattern works well in the filter bar alongside individual item tags.
**Action:** Implement "Clear All" buttons for any multi-select filter or list interfaces, ensuring they are keyboard accessible and have clear aria-labels.

## 2026-10-25 - Scoping Checkbox Locators in Tests

**Learning:** Generic locators like `input[type="checkbox"]` often match unexpected elements (like navigation toggles) in this layout.
**Action:** Always scope checkbox locators to their container (e.g., `table input[type="checkbox"]`) to avoid false positives in tests.

## 2026-03-05 - Refactoring Text to Icons

**Learning:** Playwright tests often rely on text content (e.g., `hasText: "?"`) which breaks immediately when refactoring to icons.
**Action:** When replacing text with icons, always proactively update associated tests to use robust locators like `aria-label` or `role`, and verify the new locator works before committing.

## 2026-03-25 - Visual Feedback for Row Selection

**Learning:** Users lose context of selected items in long/wide tables if only a small checkbox indicates selection. Adding a row-level background highlight reinforces the state and aids horizontal scanning.
**Action:** Implement conditional background styling on table rows (`tr`) based on selection state, ensuring it works alongside existing striping or hover effects.

## 2025-05-22 - Improving P-Value Modal and Row Expand Accessibility

**Learning:** Found that the P-Value modal was dumping raw JSON text and lacked formatting, making it difficult to read. In addition, row expand/collapse buttons in the data table lacked `aria-label` and `focus-visible` styles, rendering them invisible to screen readers and keyboard users.
**Action:** Always verify that dynamically generated statistical objects (like `pcorrtest` outputs) include a formatted `print()` method for user-facing UI, instead of relying on `JSON.stringify`. Additionally, ensure all row-level action buttons (like expand toggles) include clear `aria-label`s and `focus-visible:ring-2` styles.

## 2026-10-26 - Dark Theme Contrast in Empty States

**Learning:** Text colored `text-gray-500` or darker can fail WCAG AA contrast ratios against very dark background colors common in modals and tables in this app. Lightening these informational texts to `text-gray-400` resolves the contrast issues while preserving the intended visual hierarchy. Also found that many dynamically injected empty states were missing `role="status" aria-live="polite"`, preventing screen readers from announcing when no data is found.
**Action:** Always verify color contrast for informational text in dark mode environments. Additionally, strictly mandate the `role="status"` and `aria-live="polite"` pattern for all empty states.

## 2025-10-25 - Search Escape and Invalid Cursor Pattern

**Learning:** `cursor: normal` is an invalid CSS value (it should be `default` or `auto`) and causes browser fallback behavior, potentially confusing hover states. Furthermore, search inputs across the app lacked the standard `Escape` key support to clear text and blur focus, which is a core expectation for keyboard users. Lastly, icon-only buttons with `aria-label`s often missed the corresponding `title` tooltips, hindering mouse users.
**Action:** Always verify CSS property values using standard definitions (e.g., `default` instead of `normal` for cursors). Bind `Escape` key down events to clear and blur search inputs for intuitive keyboard UX. Consistently pair `aria-label` with `title` on all icon-only buttons to support both screen readers and pointer devices.

## 2026-11-20 - Discoverability of Advanced Features

**Learning:** Hiding conditional advanced features (like the P-Value button, which only appears when exactly 2 items are selected) severely limits their discoverability. Users won't know the feature exists or how to trigger it unless they stumble upon the exact combination.
**Action:** Instead of conditionally rendering (`null`) action buttons based on complex selection states, render them visibly but in a `disabled` state with an explanatory `title` tooltip (e.g., "Select exactly 2 items to..."). This teaches users how to use the app proactively.

## 2026-11-25 - Standardize Copy to Clipboard Interactions

**Learning:** Raw analytical output (like ASCII correlation tables in modals) forces users to manually highlight and copy text. Additionally, clickable data cells lack explicit mouse discoverability without a `title` tooltip.
**Action:** Always provide a dedicated "Copy Analysis" or "Copy to Clipboard" button with a temporal success state ("Copied!") when presenting raw analytical text to users. Furthermore, ensure any interactive element intended for copying (like `td` data cells) explicitly uses `title="Copy to clipboard"` to complement its `aria-label`.

## 2026-12-10 - Keyboard Navigation in Custom Selects and Modals

**Learning:** Found that `<select>` elements and secondary action buttons (like "Copy Analysis" or "Save to Gist") in modals often lose their default browser focus rings when styled with Tailwind (e.g., using `outline-none` or custom borders). This renders them completely inaccessible to keyboard users navigating via Tab.
**Action:** Always ensure that custom-styled form inputs and interactive elements explicitly include `focus-visible:ring-2 focus-visible:ring-blue-500` to restore clear keyboard focus indicators without adding unintended visual outlines for mouse clicks.

## 2025-05-24 - Enhance clarity and accessibility of repeating table buttons

**Learning:** Repeating icon-only buttons in table rows (like 'Expand chart' or 'Correlation Analysis') create a highly ambiguous experience for screen reader users and those reliant on tooltips, as they lack row-specific context.
**Action:** When rendering lists or tables with repeated action buttons, inject dynamic row-specific context into the `aria-label` and `title` attributes (e.g., `aria-label="Expand chart for ${itemName}"`) to eliminate ambiguity and provide clearer tooltips. Update corresponding Playwright tests using CSS prefix/suffix selectors (e.g., `locator('button[title^="Expand chart for"]')`) to ensure robust validation.

## 2026-12-11 - Static ARIA Labels Hiding Dynamic Text States

**Learning:** Static `aria-label`s on buttons with dynamic text content (like "Copy" changing to "Copied!", or "Save" changing to "Saving...") completely hide the state change from screen readers. This is because the `aria-label` attribute takes precedence in the accessible name calculation, overriding any visible text changes.
**Action:** Remove redundant `aria-label`s from buttons that have clear visible text, allowing the screen reader to announce the actual text content and any dynamic changes to it naturally.

## 2026-03-30 - Stateful Button Announcements

**Learning:** Dynamic text changes on buttons (like 'Copy' -> 'Copied!' or 'Save' -> 'Saving...') are not automatically announced by screen readers. This leaves visually impaired users without feedback that an async action has started or succeeded.
**Action:** Add `aria-live="polite"` directly to these buttons. This simple attribute ensures that assistive technologies announce the new text state as soon as it updates, drastically improving UX for these interactions.

## 2026-04-10 - Accessible Suspense Loading States

**Learning:** Lazy-loaded visual components (like charts) using React `Suspense` often fallback to unstyled static text (e.g., "Loading chart..."). This lacks visual polish and, more importantly, is completely ignored by screen readers because the text is simply rendered into the DOM without semantic meaning.
**Action:** Always replace plain text Suspense fallbacks with a styled loading container that includes a visual indicator (like `<Spinner />`) and an accessible text node with `role="status"` and `aria-live="polite"`. This ensures the loading state is announced immediately to assistive technologies.

## 2026-05-01 - Silent failures in conditional dialogs

**Learning:** Using computed results (like `!!text`) instead of intentional state (like `!!comparedSourceTarget`) to control dialog visibility causes silent failures when the computation yields no result. The user receives no feedback that their action was processed.
**Action:** Always bind dialog visibility to the intentional state triggering it, and handle empty/error states inside the dialog content.

## 2026-05-02 - Moved Origin Values Toggle to Table Header

**Learning:** The 'Origin values' toggle switch in the top navigation bar was too far removed from the data it controlled, breaking proximity principles. Furthermore, placing table-specific toggles in global navigation clutters the UI.
**Action:** Always place controls that toggle table columns (like 'Origin values') directly inside the table header itself (e.g., inside the 'Unit' column) using TanStack Table's `table.options.meta` pattern, preserving proximity and cleaning up global navigation.

## 2024-05-08 - Redundant Screen Reader Announcements for Decorative SVG Icons

**Learning:** Decorative icons (like `<CheckIcon />` or `<MinusIcon />` from `@heroicons/react`) placed inside buttons that already have an explicit `aria-label` or `title` can cause double announcements by screen readers. While `<Spinner />` had `aria-hidden="true"`, many other action-button icons in components like `Table.tsx` and `Correlation.tsx` were missing this attribute.
**Action:** Always add `aria-hidden="true"` to generic/decorative SVGs when they are placed alongside explicit descriptive text or when wrapped in interactive elements with a clear `aria-label`.
## 2026-05-17 - Suspense Loading Fallbacks
**Learning:** When using loading states like React Suspense fallbacks that contain both text and a generic spinner icon, applying `aria-live="polite"` and `role="status"` to the container wrapper alongside `aria-busy="true"` improves screen reader announcements instead of isolating the announcement to a single inner span while leaving the spinner and container attributes unassociated.
**Action:** Always group loading indicators and their descriptive text holistically at the container level by putting `aria-busy`, `role="status"`, and `aria-live` on the wrapper element to provide clear, unified context to assistive technologies.

## 2026-12-18 - Jarring Modals and Suspense Overlays

**Learning:** When using `React.Suspense` for lazy-loaded modals, utilizing a full-screen, semi-transparent background overlay as the fallback loading state causes a jarring screen flash for the user because the loading state often appears for only a fraction of a second.
**Action:** Always use a subtle, localized loading indicator (e.g., a floating bottom-right notification) instead of a full-screen overlay for `React.Suspense` fallbacks on modals. This ensures an accessible loading state is communicated to screen readers (via `aria-busy="true"`, `role="status"`, `aria-live="polite"`) without causing visual disruption.
## 2024-05-20 - Correlation Network Graph Edges
**Learning:** Dense correlation network graphs in ECharts can render edges weirdly (as chunky polygons instead of distinct lines) if thickness scales excessively and `type: 'solid'` is omitted on curved connections.
**Action:** When visualizing network edges mapping to weight/value, explicitly set `lineStyle.type: 'solid'`, increase `force.repulsion`, and constrain edge widths (e.g. `0.5 + Math.pow(rho, 2) * 2`) to ensure visually clean distinct paths rather than massive overlapping visual artifacts.
## 2024-05-20 - Correlation Network Node Spacing
**Learning:** ECharts force graph nodes tend to cluster tightly in the center if default settings are used, creating tangles.
**Action:** When working with ECharts force layouts, use a combination of low `gravity` (e.g. 0.05), high range arrays for `repulsion` (e.g. `[3000, 5000]`), and `initLayout: 'circular'` combined with `layoutAnimation: true` to help ECharts evenly distribute the nodes before the physics simulation settles.
## 2024-05-20 - ECharts Graph Roam & Drag Context
**Learning:** In ECharts graph layouts, allowing nodes to be dynamically draggable (`draggable: true`, or default on some layouts) severely interferes with canvas camera panning/roaming (`roam: true`). Furthermore, system-level wheel events may be absorbed.
**Action:** Always add an explicit ECharts `toolbox` configuration with `dataZoom`, `restore`, and `saveAsImage` when using `roam: true` so the user has guaranteed visible UI controls if the mouse wheel fails. Additionally, explicitly set `draggable: false` inside the `series` config if dragging the canvas is the primary interactive priority over moving individual nodes.
## 2026-05-21 - ECharts Graph Roam Hit Area

**Learning:** ECharts graph `roam: true` panning and zooming only captures events within the bounding box of the graph's nodes. If nodes are clumped in the center, panning and zooming on the edges of the canvas will completely fail. Adding `top/bottom/left/right: 0` or `width: 100%` does NOT expand the internal node bounding box.
**Action:** When using `roam: true` on an ECharts graph that may clump or leave empty margins, explicitly add invisible dummy nodes with `fixed: true` coordinates at the extreme boundaries (e.g., `x: 0, y: 0` and `x: 2000, y: 2000`) and `symbolSize: 0` to forcefully stretch the event capture bounding box across the entire canvas. Additionally, update your tooltip formatter to explicitly ignore these dummy nodes.

## 2026-05-21 - ECharts Graph Roam Continued
**Learning:** Adding dummy corner nodes with `fixed: true` is not always enough to fix `roam: true` panning in ECharts if the graph series height/width collapses dynamically to the computed force layout bounding box.
**Action:** When attempting to force the `roam` hit area to expand across the entire canvas for a force-directed graph, you must explicitly declare `width: '100%'` and `height: '100%'` on the `series` configuration itself, in addition to placing the dummy coordinates.
