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
