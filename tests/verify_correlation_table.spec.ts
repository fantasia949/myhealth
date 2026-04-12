import { test, expect } from '@playwright/test'

test('Correlation results are rendered in a semantic table', async ({ page }) => {
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
  const correlationButton = page.getByRole('button', { name: 'Correlate RBC with supplements' })
  await expect(correlationButton).toBeVisible()
  await correlationButton.click()

  // Check if Correlation view appears
  const dialogPanel = page.locator('div[role="dialog"]').first()

  // Verify table structure
  const table = dialogPanel.locator('table').first()
  await expect(table).toBeVisible()

  // Verify headers
  const thead = table.locator('thead')
  await expect(thead).toBeVisible()
  await expect(thead.locator('th').nth(0)).toHaveText('Supplement')
  await expect(thead.locator('th').nth(1)).toHaveText('Freq')
  await expect(thead.locator('th').nth(2)).toHaveText('P-Value')
  await expect(thead.locator('th').nth(3)).toHaveText('Rho')

  // Verify body
  const tbody = table.locator('tbody')
  await expect(tbody).toBeVisible()

  // Check that either rows exist or the empty state exists
  const rowCount = await tbody.locator('tr').count()
  expect(rowCount).toBeGreaterThan(0)
})
