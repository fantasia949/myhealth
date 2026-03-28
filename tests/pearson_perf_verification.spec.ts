import { test, expect } from '@playwright/test'

test('Verify Pearson correlation functionality and performance', async ({ page }) => {
  // 1. Go to the app
  await page.goto('http://localhost:5173/')

  // 2. Wait for table to load
  const rowLocator = page.locator('tbody tr:has(input[type="checkbox"])').first()
  await expect(rowLocator).toBeVisible({ timeout: 15000 })

  // 3. Click "Correlation Analysis" on the first row
  const correlationButton = rowLocator.locator('button[title^="Correlate "][title$=" other biomarkers"]')
  await expect(correlationButton).toBeVisible()
  await correlationButton.click()

  // 4. Wait for dialog to open and locate the method select
  const methodSelect = page.locator('select#corr-method')
  await expect(methodSelect).toBeVisible()

  // 5. Select "Pearson" method
  await methodSelect.selectOption('pearson')

  // 6. Verify table structure in dialog
  const dialogTable = page.locator('[role="dialog"] table')
  await expect(dialogTable).toBeVisible()

  const tbody = dialogTable.locator('tbody')
  await expect(tbody).toBeVisible()

  // 7. Check if results are populated
  // Wait for rows to appear or "No significant correlations" message
  const rows = tbody.locator('tr')
  await expect(rows.first()).toBeVisible({ timeout: 5000 })

  const rowCount = await rows.count()
  console.log(`Found ${rowCount} rows in Pearson correlation table.`)

  // Basic validation: ensure at least one row exists (either data or "No significant correlations")
  expect(rowCount).toBeGreaterThan(0)

  // If there are data rows, verify structure
  const firstRowText = await rows.first().textContent()
  if (rowCount > 1 || (rowCount === 1 && !firstRowText?.includes('No significant correlations'))) {
    const pValueCell = rows.first().locator('td').nth(1)
    const coeffCell = rows.first().locator('td').nth(2)

    await expect(pValueCell).toBeVisible()
    await expect(coeffCell).toBeVisible()

    const pValue = await pValueCell.textContent()
    const coeff = await coeffCell.textContent()

    console.log(`First Pearson result: P=${pValue}, Coeff=${coeff}`)

    // Verify values are numeric
    expect(parseFloat(pValue!)).not.toBeNaN()
    expect(parseFloat(coeff!)).not.toBeNaN()
  } else {
    console.log('No significant correlations found with default alpha.')
  }
})
