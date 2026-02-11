import os
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1280, 'height': 720})
    page = context.new_page()

    # Navigate to the app
    page.goto("http://localhost:5173")

    # Wait for table
    page.wait_for_selector('table')
    page.wait_for_selector('tbody tr')

    # Select first two checkboxes
    checkboxes = page.locator('tbody tr input[type="checkbox"]')
    checkboxes.nth(0).click()
    checkboxes.nth(1).click()

    # Wait for chips to appear in nav
    page.wait_for_selector('nav button svg.h-4.w-4')

    # Take screenshot of the nav bar
    nav = page.locator('nav')
    if not os.path.exists("verification"):
        os.makedirs("verification")
    nav.screenshot(path="verification/nav_chips.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
