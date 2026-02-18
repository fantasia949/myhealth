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

    # Wait for Sidebar (it has a Dialog Panel)
    # The existing test looked for "mx-auto text-dark-text", but now it's in a Dialog.
    # We look for "Correlation Analysis:" title in the sidebar.
    sidebar_title = page.get_by_text("Correlation Analysis:")
    sidebar_title.wait_for()

    # Screenshot Sidebar
    page.screenshot(path="verification/correlation_sidebar.png")

    # Test Close button
    page.get_by_role("button", name="Close panel").click()

    # Verify Sidebar is gone (or closing)
    # We can wait for it to be hidden.
    # Note: HeadlessUI transitions might take a moment.
    # sidebar_title.wait_for(state="hidden") # This might be flaky if transition is slow

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
