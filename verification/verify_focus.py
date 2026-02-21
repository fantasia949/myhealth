from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    context = browser.new_context()
    page = context.new_page()

    try:
        page.goto('http://localhost:5173')

        # Wait for table
        page.wait_for_selector('table')

        # 1. Open Correlation Dialog
        # Select first checkbox
        page.locator('table input[type="checkbox"]').first.check()

        # Click Correlations
        page.get_by_role('button', name='Correlations').click()

        # Wait for Close button
        close_btn = page.get_by_role('button', name='Close panel')
        close_btn.wait_for(state='visible')

        # Focus the close button
        close_btn.focus()

        # Take screenshot of Correlation Dialog Close Button
        page.screenshot(path='verification/correlation_focus.png')
        print("Screenshot saved to verification/correlation_focus.png")

        # Close dialog
        close_btn.click()

        # 2. Open P-Value Dialog
        # Select second checkbox
        page.locator('table input[type="checkbox"]').nth(1).check()

        # Click P-Value
        page.get_by_role('button', name='P-Value').click()

        # Wait for Close button
        close_p_btn = page.get_by_role('button', name='Close dialog')
        close_p_btn.wait_for(state='visible')

        # Focus the close button
        close_p_btn.focus()

        # Take screenshot of P-Value Dialog Close Button
        page.screenshot(path='verification/pvalue_focus.png')
        print("Screenshot saved to verification/pvalue_focus.png")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
