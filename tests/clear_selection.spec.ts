import { test, expect } from '@playwright/test';

test('Clear All button appears when multiple items are selected and clears selection', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Wait for table to load
  await page.waitForSelector('table');
  await page.waitForTimeout(2000);

  // Find checkboxes in the table only
  const checkboxes = page.locator('table input[type="checkbox"]');
  await expect(checkboxes.first()).toBeVisible();

  // Select first two items
  await checkboxes.nth(0).click();
  await checkboxes.nth(1).click();

  // Verify "Clear All" button appears
  // It should be in the nav
  const clearButton = page.getByRole('button', { name: 'Clear all selected items' });
  await expect(clearButton).toBeVisible();

  // Click "Clear All"
  await clearButton.click();

  // Verify "Clear All" button disappears
  await expect(clearButton).not.toBeVisible();

  // Verify checkboxes are unchecked
  await expect(checkboxes.nth(0)).not.toBeChecked();
  await expect(checkboxes.nth(1)).not.toBeChecked();
});
