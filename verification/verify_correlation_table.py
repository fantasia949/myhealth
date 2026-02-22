from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            print("Navigating...")
            page.goto("http://localhost:5173")

            print("Waiting for table...")
            page.wait_for_selector("table tbody tr")

            print("Selecting checkbox...")
            checkbox = page.locator('table input[type="checkbox"]').first
            checkbox.click()

            print("Clicking Correlations...")
            page.get_by_role("button", name="Correlations").click()

            print("Waiting for dialog...")
            # Use specific text
            page.wait_for_selector("text=Correlation Analysis")

            print("Taking screenshot...")
            page.screenshot(path="verification/correlation_table.png")
            print("Screenshot saved to verification/correlation_table.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            print("Error screenshot saved to verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
