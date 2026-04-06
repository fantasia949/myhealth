import { test, expect } from '@playwright/test'

test('take screenshot of clustering chart', async ({ page }) => {
  await page.goto('http://localhost:5173')

  // Wait for 5 seconds to allow the table to render
  await page.waitForSelector('tbody tr input[type="checkbox"]')

  // Click the "Detect Phases" button
  await page.click('button:has-text("Detect Phases")')

  // Wait for the modal and chart to be rendered
  await page.waitForSelector('.echarts-for-react', { timeout: 10000 })

  // Wait for animation to finish
  await page.waitForTimeout(2000)

  // Hover over the first scatter point to trigger tooltip
  await page.locator('div[id="headlessui-portal-root"] canvas').first().hover({ position: { x: 400, y: 300 }, force: true })
  await page.waitForTimeout(1500)

  // Hover over another point
  await page.locator('div[id="headlessui-portal-root"] canvas').first().hover({ position: { x: 500, y: 400 }, force: true })
  await page.waitForTimeout(1500)

  // Close the dialog
  await page.click('button[aria-label="Close dialog"]')
  await page.waitForTimeout(1000)

  const chartExists = await page.isVisible('.echarts-for-react')
  expect(chartExists).toBe(false) // Verify it closed
})