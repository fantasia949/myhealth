
import { test, expect } from '@playwright/test';

test('Shows empty state when no records match filter', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Wait for table to load
  await page.waitForSelector('tbody tr');

  // Search for something that definitely doesn't exist
  const searchInput = page.getByPlaceholder('Search');
  await searchInput.click();
  await searchInput.fill('nonexistentdata123456');

  // Wait for empty state message
  const emptyMessage = page.getByText(/no records|no data|no results/i);
  await expect(emptyMessage).toBeVisible({ timeout: 10000 });

  // Check rows count
  const rows = await page.locator('tbody tr').count();
  console.log(`Rows count: ${rows}`);
  expect(rows).toBe(1); // The empty state row
});
