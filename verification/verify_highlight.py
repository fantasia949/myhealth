from playwright.sync_api import sync_playwright

def verify_row_highlight():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        try:
            # Navigate to the app
            page.goto('http://localhost:5173/')

            # Wait for table
            page.wait_for_selector('table')

            # Select first row checkbox
            checkbox = page.locator('tbody tr:has(input[type="checkbox"])').first.locator('input[type="checkbox"]')
            checkbox.check()

            # Wait for style update (transition)
            page.wait_for_timeout(500)

            # Take screenshot of the table area
            page.locator('table').screenshot(path='verification/row_highlight.png')

        finally:
            browser.close()

if __name__ == "__main__":
    verify_row_highlight()
