import { test, expect } from '@playwright/test'

test('Chart renders correctly', async ({ page }) => {
  await page.goto('http://localhost:5173')

  // Wait for the table to be populated
  await page.waitForSelector('tbody tr:has-text("Glucose")')

  // Select "Glucose"
  await page.check('input[name="Glucose"]')

  // Click the "Visualize" button
  await page.click('button:has-text("Visualize")')

  await page.waitForTimeout(2000)
  await page.screenshot({ path: 'chart_debug.png' })

  // Wait for the chart to be rendered
  await page.waitForSelector('.echarts-for-react', { timeout: 10000 })

  // Take a screenshot for verification
  await page.screenshot({ path: 'chart_screenshot.png' })

  // Optional: Add assertions to verify chart data or appearance
  const chartExists = await page.isVisible('.echarts-for-react')
  expect(chartExists).toBe(true)
})
