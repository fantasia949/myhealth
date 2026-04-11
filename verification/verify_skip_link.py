from playwright.sync_api import sync_playwright, expect
import time

def verify_skip_to_content():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5173")

        # Give enough time for the app to load fully
        page.wait_for_selector("a[href='#main-content']")

        # Focus the skip link directly
        page.locator("a[href='#main-content']").focus()

        # Verify the skip link is focused and visible
        skip_link = page.locator("a[href='#main-content']")
        expect(skip_link).to_be_focused()

        # Wait a moment for UI to settle
        time.sleep(1)

        page.screenshot(path="/app/verification/skip-link.png")

        browser.close()

if __name__ == "__main__":
    verify_skip_to_content()
