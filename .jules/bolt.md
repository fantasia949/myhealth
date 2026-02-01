## 2024-05-23 - Missing Test Infrastructure
**Learning:** The project lacks standard `test` scripts and Playwright browsers are not installed in the environment, making E2E verification difficult without setup overhead.
**Action:** When working on this repo, assume tests need environment setup (installing browsers) or rely on `tsc` and manual verification for logic-only changes.
