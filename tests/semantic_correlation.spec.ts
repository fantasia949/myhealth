import { test, expect } from '@playwright/test';

test('correlation dialog uses semantic table', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Wait for table to load
  await page.waitForSelector('table tbody tr');

  // Select the first checkbox
  const firstCheckbox = page.locator('table input[type="checkbox"]').first();
  await firstCheckbox.click();

  // Click "Correlations" button
  const correlationButton = page.getByRole('button', { name: 'Correlations' });
  await correlationButton.click();

  // Wait for dialog title to be visible
  await expect(page.getByText('Correlation Analysis')).toBeVisible();

  // Check for table structure
  // This should FAIL initially as it is currently a div soup
  const dialog = page.locator('div[role="dialog"]');
  const table = dialog.locator('table');
  await expect(table).toBeVisible();

  // Check headers
  await expect(table.locator('th').filter({ hasText: 'Biomarker' })).toBeVisible();
  await expect(table.locator('th').filter({ hasText: 'P-Value' })).toBeVisible();
  await expect(table.locator('th').filter({ hasText: 'Coeff' })).toBeVisible();
});
