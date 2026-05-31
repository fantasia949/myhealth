from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:5173")  # Assuming the vite dev server is running on 5173
    page.wait_for_timeout(2000) # Wait for page load

    # 1. Look for the "Select all rows" checkbox
    select_all_checkbox = page.get_by_role("checkbox", name="Select all rows")
    select_all_checkbox.wait_for(state="visible")

    # Take initial screenshot showing the unchecked state
    page.screenshot(path="/app/verification/screenshots/verification.png")
    page.wait_for_timeout(500)

    # 2. Click the "Select all rows" checkbox
    select_all_checkbox.click()
    page.wait_for_timeout(1000)

    # Take a screenshot showing the checked state and rows selected
    page.screenshot(path="/app/verification/screenshots/verification_selected.png")
    page.wait_for_timeout(1000)

    # 3. Click again to unselect
    select_all_checkbox.click()
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/app/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
