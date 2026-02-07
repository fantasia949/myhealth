import { test, expect } from '@playwright/test';

test('table has accessible chart toggle buttons', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Wait for table to load
  await page.waitForSelector('table');
  await page.waitForTimeout(2000);

  // Look for ANY chart toggle button using title which is stable
  const toggleButton = page.locator('button[title="Toggle Chart"]').first();

  // Check if it's visible
  await expect(toggleButton).toBeVisible();

  // Check ARIA attributes (initial state)
  // It should be expanded false initially
  await expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
  await expect(toggleButton).toHaveAttribute('aria-label', "Expand chart");

  // Test interaction
  await toggleButton.click();

  // After click, it should be expanded true and label should change
  await expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
  await expect(toggleButton).toHaveAttribute('aria-label', "Collapse chart");
});

test('data cells show copied feedback on click', async ({ context, page }) => {
  // Grant clipboard permissions
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  await page.goto('http://localhost:5173');

  // Wait for table to load
  await page.waitForSelector('table');
  await page.waitForTimeout(2000);

  // Find a data cell.
  const dataCell = page.locator('td.cursor-pointer').first();
  await expect(dataCell).toBeVisible();

  // Click it
  await dataCell.click();

  // Expect "Copied!" span to appear
  // We use .locator to find inside the cell, or page.locator with text
  // The span is absolute positioned inside the td
  const feedback = dataCell.locator('text=Copied!');
  await expect(feedback).toBeVisible();

  // Expect it to disappear after 1.5s
  await expect(feedback).not.toBeVisible({ timeout: 5000 });
});
