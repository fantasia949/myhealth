
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Capture console messages
        messages = []
        page.on("console", lambda msg: messages.append(msg.text))

        await page.goto("http://localhost:5173")
        await page.wait_for_selector("tbody")
        await page.click("input[type=checkbox]")
        await page.wait_for_selector("select#chart-type")
        await page.select_option("select#chart-type", "scatter")
        await page.click("button:has-text('Visualize')")

        await browser.close()

        # Print captured console messages
        for msg in messages:
            print(msg)

asyncio.run(main())
