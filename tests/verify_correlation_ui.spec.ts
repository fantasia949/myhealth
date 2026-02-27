import { test, expect } from '@playwright/test';

test('Verify correlation dialog functionality', async ({ page }) => {
  // Go to the app
  await page.goto('http://localhost:5173/');

  // Wait for table to load
  await expect(page.locator('table').first()).toBeVisible();

  // Wait for data to load
  const rowLocator = page.locator('tbody tr:has(input[type="checkbox"])').first();
  await expect(rowLocator).toBeVisible({ timeout: 10000 });

  // Select the first row
  const firstCheckbox = rowLocator.locator('input[type="checkbox"]');
  await firstCheckbox.check();

  // Click "Correlation" button in the nav. Strict match to avoid matching row buttons.
  const correlationButton = page.getByRole('button', { name: 'Correlations', exact: true });
  await expect(correlationButton).toBeVisible();
  await correlationButton.click();

  // Check if Correlation view appears
  const correlationView = page.getByText('Spearman Correlation Settings');
  await expect(correlationView).toBeVisible();

  // Take a screenshot of the correlation settings dialog
  await page.screenshot({ path: 'correlation_dialog.png' });
});
