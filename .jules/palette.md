## 2025-05-20 - Ensure tab toggles reflect state to screen readers

**Learning:** When implementing tab-like views using custom buttons (e.g., swapping between Chart and Table views), screen reader users are unaware of the active selection if the visual active state (e.g., highlighted background color) isn't paired with an accessibility attribute.
**Action:** Always add `aria-pressed={isActive}` or `aria-selected={isActive}` to toggle buttons to correctly communicate their state to assistive technologies.
