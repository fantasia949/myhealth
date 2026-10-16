from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:5173')

    # Wait for the app to load
    page.wait_for_selector('table')

    # Wait for the table rows to appear
    page.wait_for_selector('tr')

    # Click the first ChartBarIcon equivalent (it expands the line chart for the first marker)
    # The ChartBarIcon is an svg inside a button in the second column usually
    # Let's find buttons with the ChartBarIcon
    chart_button = page.locator('button').filter(has=page.locator('svg')).nth(1)

    # Or more robustly, let's just click the first row's ChartBarIcon based on the class or finding an svg with h-5 w-5
    chart_button = page.locator('td button').filter(has=page.locator('svg')).nth(1)

    page.locator('.h-5.w-5').nth(0).click(force=True)
    page.locator('.h-5.w-5').nth(1).click(force=True)
    page.locator('.h-5.w-5').nth(2).click(force=True)
    page.locator('.h-5.w-5').nth(3).click(force=True)

    # Wait for the echarts-for-react div to appear
    try:
        page.wait_for_selector('.echarts-for-react', timeout=5000)
    except Exception as e:
        print("Timeout waiting for echarts-for-react")

    page.screenshot(path='after-svg-click-2.png')
    browser.close()
