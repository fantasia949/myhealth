from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:5173")

    # Wait for table
    page.locator("table").wait_for()

    # Wait for rows
    row = page.locator("tbody tr:has(input[type='checkbox'])").first
    row.wait_for(timeout=10000)

    # Select first row
    row.locator("input[type='checkbox']").check()

    # Click Correlation
    page.get_by_role("button", name="Correlation").click()

    # Wait for Sidebar Title
    sidebar_title = page.get_by_text("Correlation Analysis:")
    sidebar_title.wait_for()

    # Screenshot showing the offcanvas/sidebar
    page.screenshot(path="verification/correlation_offcanvas.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
