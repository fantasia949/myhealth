import { test, expect } from '@playwright/test';

test('Correlation controls appear and are functional', async ({ page }) => {
  // Go to the app
  await page.goto('http://localhost:5173/');

  // Wait for table to load
  await expect(page.locator('table')).toBeVisible();

  // Wait for data to load
  const rowLocator = page.locator('tbody tr:has(input[type="checkbox"])').first();
  await expect(rowLocator).toBeVisible({ timeout: 10000 });

  // Select the first row
  const firstCheckbox = rowLocator.locator('input[type="checkbox"]');
  await firstCheckbox.check();

  // Click "Correlation" button
  const correlationButton = page.getByRole('button', { name: 'Correlation' });
  await expect(correlationButton).toBeVisible();
  await correlationButton.click();

  // Check if Correlation view appears
  const correlationView = page.getByText('Spearman Correlation Settings');
  await expect(correlationView).toBeVisible();

  // Check for new controls - now SELECT instead of INPUT for alpha
  const alphaSelect = page.locator('select#corr-alpha');
  await expect(alphaSelect).toBeVisible();
  // Default might be 0.01 but let's check it's one of the options
  // It's persisted, so if run before it might be different, but let's assume default or current state.
  // We will set it explicitly.

  const hypothesisSelect = page.locator('select#corr-alt');
  await expect(hypothesisSelect).toBeVisible();

  // Change alpha using selectOption
  // The values are numbers in the component but strings in HTML attributes
  await alphaSelect.selectOption('0.05');

  // Change hypothesis
  await hypothesisSelect.selectOption('greater');

  // Verify persistence after reload
  await page.reload();

  // Wait for load again
  await expect(rowLocator).toBeVisible({ timeout: 10000 });

  // Re-select and open
  await firstCheckbox.check();
  await correlationButton.click();

  // Check values
  await expect(alphaSelect).toHaveValue('0.05');
  await expect(hypothesisSelect).toHaveValue('greater');
});
