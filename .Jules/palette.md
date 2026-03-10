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
