from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('http://localhost:5173')

        # Wait for table
        page.wait_for_selector('table')

        # Scroll to bottom to ensure footer is loaded/visible
        # (Although footer is tfoot, it might be visible)
        # But wait, the table body can be long.
        # Let's locate the button first.
        button = page.locator('button[aria-label="View supplements"]').first

        # Scroll into view if needed
        button.scroll_into_view_if_needed()

        # Click
        button.click()

        # Wait for transition (200ms + buffer)
        page.wait_for_timeout(500)

        # Take screenshot of the area around the button/popover
        # Since popover is absolute/fixed, full page screenshot or viewport screenshot is safer.
        page.screenshot(path='verification/popover_open.png')

        browser.close()

if __name__ == '__main__':
    run()
