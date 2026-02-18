import { test, expect } from '@playwright/test';

test('PValue view shows Spearman details', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Wait for table to load
  await expect(page.locator('table')).toBeVisible();

  // Find rows with checkboxes
  const rows = page.locator('tbody tr:has(input[type="checkbox"])');
  await rows.first().waitFor({ state: 'visible', timeout: 10000 });
  const rowCount = await rows.count();

  // Need at least 2 rows
  if (rowCount < 2) {
    console.log('Not enough rows to test P-Value view');
    return;
  }

  // Select first two rows
  await rows.nth(0).locator('input[type="checkbox"]').check();
  await rows.nth(1).locator('input[type="checkbox"]').check();

  // Click "P-Value" button (Assuming there is one)
  const pValueButton = page.getByRole('button', { name: 'P-Value' });
  await expect(pValueButton).toBeVisible();

  // Wait for button to be enabled (might be disabled if selection logic is slow)
  await expect(pValueButton).toBeEnabled();
  await pValueButton.click();

  // Check if modal appears
  // HeadlessUI often puts the dialog at the end of body.
  // We look for text "Spearman Rank Correlation" which is unique to this modal now.
  const title = page.getByText('Spearman Rank Correlation');
  await expect(title).toBeVisible({ timeout: 10000 });

  // Check if content is populated (not empty)
  // The content is in a div with whitespace-pre-wrap
  // But wait, the content might be loading.
  // It's synchronous though.

  // Verify content contains "pValue"
  const content = page.locator('.whitespace-pre-wrap');
  await expect(content).toContainText('pValue');
});
