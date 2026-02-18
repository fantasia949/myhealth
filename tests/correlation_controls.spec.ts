import { test, expect } from '@playwright/test';

test('Correlation controls appear and are functional', async ({ page }) => {
  // Go to the app
  await page.goto('http://localhost:5173/');

  // Wait for table to load
  await expect(page.locator('table')).toBeVisible();

  // Wait for data to load (important as rows are rendered after data fetch)
  // We wait for at least one row with a checkbox
  const rowLocator = page.locator('tbody tr:has(input[type="checkbox"])').first();
  await expect(rowLocator).toBeVisible({ timeout: 10000 });

  // Select the first row
  const firstCheckbox = rowLocator.locator('input[type="checkbox"]');
  await firstCheckbox.check();

  // Click "Correlation" button in the nav
  // The button is likely just text "Correlation" or similar.
  // In App.tsx it's passed as onCorrelation. In Nav.tsx it's likely a button.
  // Let's try finding it by text.
  const correlationButton = page.getByRole('button', { name: 'Correlation' });
  await expect(correlationButton).toBeVisible();
  await correlationButton.click();

  // Check if Correlation view appears
  // The view has class "mx-auto text-dark-text" and likely contains the target name.
  // It also now has "Spearman Correlation Settings" text.
  const correlationView = page.getByText('Spearman Correlation Settings');
  await expect(correlationView).toBeVisible();

  // Check for new controls
  const alphaInput = page.locator('input#corr-alpha');
  await expect(alphaInput).toBeVisible();
  await expect(alphaInput).toHaveValue('0.01'); // Default

  const hypothesisSelect = page.locator('select#corr-alt');
  await expect(hypothesisSelect).toBeVisible();
  await expect(hypothesisSelect).toHaveValue('two-sided'); // Default

  // Change alpha
  await alphaInput.fill('0.05');

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
  await expect(alphaInput).toHaveValue('0.05');
  await expect(hypothesisSelect).toHaveValue('greater');
});
