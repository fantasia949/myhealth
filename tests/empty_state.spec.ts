import { test, expect } from '@playwright/test';

test('Shows dynamic empty state and allows clearing filters', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Wait for table to load
  await page.waitForSelector('tbody tr');

  // Search for something that definitely doesn't exist
  const searchInput = page.getByPlaceholder('Search');
  await searchInput.click();
  await searchInput.fill('nonexistentdata123456');

  // Wait for dynamic empty state message
  // Note: The message logic is: `No biomarkers match "${filterText}"`
  const emptyMessage = page.getByText('No biomarkers match "nonexistentdata123456"');
  await expect(emptyMessage).toBeVisible({ timeout: 10000 });

  // Check rows count
  const rows = await page.locator('tbody tr').count();
  console.log(`Rows count: ${rows}`);
  expect(rows).toBe(1); // The empty state row

  // Click Clear Filters button
  const clearButton = page.getByRole('button', { name: 'Clear all filters' });
  await expect(clearButton).toBeVisible();
  await clearButton.click();

  // Verify search input is empty
  await expect(searchInput).toBeEmpty();

  // Verify data is back (more than 1 row)
  await expect(async () => {
    const rowCount = await page.locator('tbody tr').count();
    expect(rowCount).toBeGreaterThan(1);
  }).toPass();
});
