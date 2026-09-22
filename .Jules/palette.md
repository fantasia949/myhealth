
## 2023-10-25 - Missing ARIA labels on dynamic pill/chip remove buttons
**Learning:** Found an accessibility issue pattern specific to this app's components where dynamically generated "pill" or "chip" elements (like the selected biomarkers list) use icon-only `XMarkIcon` buttons for removal. These small, repetitive UI elements often lack `aria-label`, `title`, and `focus-visible` styles compared to more prominent standalone icon buttons.
**Action:** Always check dynamically mapped tag/chip lists for icon-only remove buttons and ensure they receive proper accessible labels (`Remove {item}`) and focus outline styles (`focus:outline-none focus-visible:ring-2`).
