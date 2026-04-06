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

  // Take a screenshot for verification
  await page.screenshot({ path: 'clustering_chart_screenshot_v2.png' })

  const chartExists = await page.isVisible('.echarts-for-react')
  expect(chartExists).toBe(true)
})