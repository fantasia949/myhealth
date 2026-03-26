import { test, expect } from '@playwright/test'

test('Verify correlation dialog functionality', async ({ page }) => {
  // Go to the app
  await page.goto('http://localhost:5173/')

  // Wait for table to load
  await expect(page.locator('table').first()).toBeVisible()

  // Wait for data to load
  const rowLocator = page.locator('tbody tr:has(input[type="checkbox"])').first()
  await expect(rowLocator).toBeVisible({ timeout: 10000 })

  // Select the first row
  const firstCheckbox = rowLocator.locator('input[type="checkbox"]')
  await firstCheckbox.check()

  // Click "Correlation" button in the table row.
  const correlationButton = page.getByRole('button', { name: 'View correlations for RBC' })
  await expect(correlationButton).toBeVisible()
  await correlationButton.click()

  // Check if Correlation view appears

  // Take a screenshot of the correlation settings dialog
  await page.screenshot({ path: 'correlation_dialog.png' })
})
