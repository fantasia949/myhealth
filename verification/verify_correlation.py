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

    # Wait for view
    page.get_by_text("Spearman Correlation Settings").wait_for()

    # Screenshot Correlation View
    page.screenshot(path="verification/correlation_view.png")

    # Change settings
    page.locator("input#corr-alpha").fill("0.05")
    page.locator("select#corr-alt").select_option("greater")

    # Screenshot with changed settings
    page.screenshot(path="verification/correlation_view_changed.png")

    # Now test P-Value view
    # Select second row
    rows = page.locator("tbody tr:has(input[type='checkbox'])")
    rows.nth(1).locator("input[type='checkbox']").check()

    # Click P-Value
    page.get_by_role("button", name="P-Value").click()

    # Wait for modal title
    page.get_by_text("Spearman Rank Correlation").wait_for()

    # Screenshot Modal
    page.screenshot(path="verification/pvalue_modal.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
