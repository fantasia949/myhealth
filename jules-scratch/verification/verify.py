from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:5173")
        page.wait_for_timeout(5000)
        page.locator('tbody tr:first-child input[type="checkbox"]').check()
        page.click('button:has-text("Visualize")')
        page.wait_for_selector('.echarts-for-react')
        page.screenshot(path="jules-scratch/verification/verification.png")
        browser.close()

run()
