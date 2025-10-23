from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:5173")

        # Wait for the table body to be visible
        page.wait_for_selector('tbody tr')

        # Select biomarkers by clicking their checkboxes
        page.locator("tr:has-text('CRP')").locator("input[type='checkbox']").click()
        page.locator("tr:has-text('ALB')").locator("input[type='checkbox']").click()

        # Select "Bar Chart" from the dropdown
        page.select_option('select', 'bar')

        # Click the "Visualize" button
        page.locator('button:has-text("Visualize")').click()

        # Wait for the chart canvas to be rendered
        page.wait_for_selector('canvas')

        page.screenshot(path="jules-scratch/verification/verification.png")
        browser.close()

run()
