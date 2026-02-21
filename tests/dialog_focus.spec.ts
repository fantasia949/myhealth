import { test, expect } from '@playwright/test';

test('dialog close buttons should have visible focus styles', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Wait for table
  await page.waitForSelector('table');

  // 1. Test "Correlations" Dialog (needs 1 selection)
  // Select first checkbox
  const firstCheckbox = page.locator('table input[type="checkbox"]').first();
  await firstCheckbox.check();

  // Click "Correlations" button in Nav
  await page.getByRole('button', { name: 'Correlations' }).click();

  // Wait for button (this implies dialog is open)
  const closeCorrelation = page.getByRole('button', { name: 'Close panel' });
  await expect(closeCorrelation).toBeVisible();

  // Check for focus styles (failure condition: has outline-none but no ring)
  const closeClass = await closeCorrelation.getAttribute('class');

  // It should have focus:ring or focus-visible:ring or focus:border
  const hasFocusRing = /focus(-visible)?:(ring|border)/.test(closeClass || '');
  expect(hasFocusRing, `Correlation Close Button missing focus ring: ${closeClass}`).toBeTruthy();

  // Close it
  await closeCorrelation.click();
  await expect(closeCorrelation).not.toBeVisible();

  // 2. Test "P-Value" Dialog (needs 2 selections)
  // Select second checkbox
  const secondCheckbox = page.locator('table input[type="checkbox"]').nth(1);
  await secondCheckbox.check();

  // Click "P-Value" button in Nav
  await page.getByRole('button', { name: 'P-Value' }).click();

  // Wait for button
  const closePValue = page.getByRole('button', { name: 'Close dialog' });
  await expect(closePValue).toBeVisible();

  // Check for focus styles
  const closePValueClass = await closePValue.getAttribute('class');
  const hasPValueFocusRing = /focus(-visible)?:(ring|border)/.test(closePValueClass || '');
  expect(hasPValueFocusRing, `P-Value Close Button missing focus ring: ${closePValueClass}`).toBeTruthy();

  // Close it
  await closePValue.click();
  await expect(closePValue).not.toBeVisible();
});
