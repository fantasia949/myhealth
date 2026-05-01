import { test, expect } from '@playwright/test'

test('Parallel Status chart renders correctly', async ({ page }) => {
  await page.goto('http://localhost:5173')

  // Click on a tag to show the Parallel Status toggle
  // The tags use the full string, e.g., "1-RBC", "2-Metabolic", etc.
  // We can just click the button with the visible text "Metabolic"
  await page.click('button:has-text("Metabolic")')

  // Wait a moment for state updates
  await page.waitForTimeout(500)

  // Ensure the toggle button is visible and click it
  const showParallelBtn = page.locator('button', { hasText: 'Show Parallel' })
  await expect(showParallelBtn).toBeVisible()
  await showParallelBtn.click()

  // Wait for the chart to render
  const chartLocator = page.locator(".echarts-for-react").last()
  await expect(chartLocator).toBeVisible({ timeout: 10000 })

  // Screenshot for verification
  await page.screenshot({ path: '/home/jules/verification/parallel-chart.png' })
})
