from playwright.sync_api import sync_playwright

def verify_search():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        # Navigate to the app
        page.goto("http://localhost:5173/")

        # Wait for hydration
        page.wait_for_timeout(2000)

        # Type in search
        search_input = page.get_by_role("searchbox", name="Search biomarkers")
        search_input.fill("Glucose")

        # Wait for clear button to appear
        clear_button = page.get_by_role("button", name="Clear search")
        clear_button.wait_for(state="visible")

        # Take screenshot of the nav area
        nav = page.locator("nav")
        nav.screenshot(path="search_verification.png")

        browser.close()

if __name__ == "__main__":
    verify_search()
