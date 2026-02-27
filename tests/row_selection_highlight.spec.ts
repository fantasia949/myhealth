import { test, expect } from '@playwright/test';

test('Selected row receives visual highlight class', async ({ page }) => {
  // Navigate to the app
  await page.goto('http://localhost:5173/');

  // Wait for table to load
  const table = page.locator('table').first();
  await expect(table).toBeVisible();

  // Wait for data to load
  const firstRow = page.locator('tbody tr:has(input[type="checkbox"])').first();
  await expect(firstRow).toBeVisible({ timeout: 10000 });

  // Select the checkbox
  const checkbox = firstRow.locator('input[type="checkbox"]');
  await checkbox.check();

  // Check if the row has a background color distinct from the default striping
  // The expected class is bg-blue-900/40 as implemented
  await expect(firstRow).toHaveClass(/bg-blue-900\/40/);
});
