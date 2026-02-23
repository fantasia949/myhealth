import { test, expect } from '@playwright/test';

test('Correlation results are rendered in a semantic table', async ({ page }) => {
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

  // Verify table structure
  const dialogPanel = page.locator('[role="dialog"]');
  const table = dialogPanel.locator('table');
  await expect(table).toBeVisible();

  // Verify headers
  const thead = table.locator('thead');
  await expect(thead).toBeVisible();
  await expect(thead.locator('th').nth(0)).toHaveText('Biomarker');
  await expect(thead.locator('th').nth(1)).toHaveText('P-Value');
  await expect(thead.locator('th').nth(2)).toHaveText('Coeff');

  // Verify body
  const tbody = table.locator('tbody');
  await expect(tbody).toBeVisible();

  // Check that either rows exist or the empty state exists
  const rowCount = await tbody.locator('tr').count();
  expect(rowCount).toBeGreaterThan(0);
});
