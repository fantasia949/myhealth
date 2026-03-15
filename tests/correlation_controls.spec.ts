import { test, expect } from '@playwright/test'

test('Correlation controls appear and are functional', async ({ page }) => {
  // Go to the app
  await page.goto('http://localhost:5173/')

  // Wait for table to load
  await expect(page.locator('table')).toBeVisible()

  // Wait for data to load
  const rowLocator = page.locator('tbody tr:has(input[type="checkbox"])').first()
  await expect(rowLocator).toBeVisible({ timeout: 10000 })

  // Locate the new button in the first row
  const correlationButton = rowLocator.locator('button[aria-label="Correlation Analysis"]')
  await expect(correlationButton).toBeVisible()

  // Click it
  await correlationButton.click()

  // Check if Correlation view appears
  // Use a more generic locator that is sure to be there.
  // Wait for the panel to slide in
  await page.waitForTimeout(2000)

  // Check for the Close button using a specific locator
  // Button with class containing "relative rounded-md text-gray-400 hover:text-white"
  // Or just by the XMarkIcon inside it
  const closeButton = page
    .locator('button')
    .filter({ has: page.locator('svg') })
    .filter({ hasText: 'Close panel' })
  await expect(closeButton).toBeVisible()

  // Check for new controls - now SELECT instead of INPUT for alpha
  const alphaSelect = page.locator('select#corr-alpha')
  await expect(alphaSelect).toBeVisible()

  const hypothesisSelect = page.locator('select#corr-alt')
  await expect(hypothesisSelect).toBeVisible()

  // Change alpha using selectOption
  await alphaSelect.selectOption('0.05')

  // Change hypothesis
  await hypothesisSelect.selectOption('greater')

  // Verify persistence after reload
  await page.reload()

  // Wait for load again
  await expect(rowLocator).toBeVisible({ timeout: 10000 })

  // Re-open using the row button
  const newRowLocator = page.locator('tbody tr:has(input[type="checkbox"])').first()
  await newRowLocator.locator('button[aria-label="Correlation Analysis"]').click()

  // Check values
  await expect(alphaSelect).toHaveValue('0.05')
  await expect(hypothesisSelect).toHaveValue('greater')
})
