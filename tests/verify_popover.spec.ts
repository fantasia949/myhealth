import { test, expect } from '@playwright/test';

test('verify supplements popover functionality', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Wait for table to load
  await page.waitForSelector('table');

  // Locate the first supplements popover button (beaker icon) in the footer
  // It's in the tfoot > tr > th > button
  // We can select by aria-label "View supplements"
  const popoverButton = page.locator('button[aria-label="View supplements"]').first();

  await expect(popoverButton).toBeVisible();

  // Click to open
  await popoverButton.click();

  // Locate the panel
  // The panel has role="dialog" or similar depending on implementation, but it contains text "Supplements"
  const panelHeading = page.getByRole('heading', { name: 'Supplements' });
  await expect(panelHeading).toBeVisible();

  // Verify list items exist
  const listItems = page.locator('ul.list-disc li');
  await expect(listItems.first()).toBeVisible();

  // Press Escape to close
  await page.keyboard.press('Escape');

  // Verify panel is hidden
  await expect(panelHeading).toBeHidden();
});
