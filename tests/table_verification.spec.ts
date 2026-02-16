import { test, expect } from '@playwright/test';

test('verify table columns based on show records', async ({ page }) => {
  // Go to the page
  await page.goto('http://localhost:5173');

  // Wait for table to load
  await page.waitForSelector('table');

  // Verify default state (Show 5 records)
  // Check the number of data cells in the first row
  // We need to find a row that has data. most rows should have data.

  // Wait for data to load
  await page.waitForTimeout(2000); // Wait for data fetching

  // Select "Last 5 records" in the dropdown if not already selected
  // The select is in the nav bar.
  const recordsSelect = page.getByLabel('Select number of records to show');
  await expect(recordsSelect).toBeVisible();
  await expect(recordsSelect).toHaveValue('5');

  // Count data cells in the first data row.
  // The first row might be a group header if grouping is enabled.
  // We need to find a tr that is not a group header.
  // Group headers have class "bg-dark-accent font-bold" and colspan.

  // Let's target a specific row if possible, or just the first tr with td that has checkboxes.
  const dataRow = page.locator('tbody tr:has(input[type="checkbox"])').first();
  await expect(dataRow).toBeVisible();

  // Count the number of data cells.
  // Data cells have class "text-right" and are not hidden.
  // Note: The implementation uses "hidden sm:table-cell" etc based on index.
  // We should count the visible ones.

  // Wait, let's look at the structure again.
  // The cells are rendered with DataCell component.
  // They have "text-right" class.

  // Let's count td elements in the row that are NOT the checkbox, NOT the expand button, NOT the name, NOT the average, NOT range, NOT unit.
  // This is tricky.

  // Alternatively, we can check the header columns.
  // The headers for data columns have specific class?
  // They are generated from `labels`.

  // Let's count the number of visible th elements in the thead that correspond to data.
  // Data headers have `meta: { isRecord: true }` which adds `text-right` class.

  const dataHeaders = page.locator('thead th.text-right:visible');
  // Default is 5 records.
  await expect(dataHeaders).toHaveCount(5);

  // Change to "All" (value "0")
  await recordsSelect.selectOption('0');

  // Wait for update
  await page.waitForTimeout(500);

  // Verify more columns are shown.
  // The exact number depends on data, but should be > 5.
  const allDataHeaders = page.locator('thead th.text-right:visible');
  const count = await allDataHeaders.count();
  expect(count).toBeGreaterThan(5);

  // Change back to 3
  await recordsSelect.selectOption('3');
  await page.waitForTimeout(500);

  await expect(page.locator('thead th.text-right:visible')).toHaveCount(3);
});
