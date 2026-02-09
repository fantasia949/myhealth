import { test, expect } from '@playwright/test';

test('table has accessible chart toggle buttons', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Wait for table to load
  await page.waitForSelector('table');
  await page.waitForTimeout(2000);

  // Look for ANY chart toggle button.
  // Since rows might be grouped, the first row might be a group header.
  // We want to find the specific button we refactored.
  // We added aria-label="Toggle chart for ..."

  const toggleButton = page.locator('button[aria-label^="Toggle chart for"]').first();

  // Check if it's visible
  await expect(toggleButton).toBeVisible();

  // Check ARIA attributes
  await expect(toggleButton).toHaveAttribute('aria-label', /^Toggle chart for/);
  await expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

  // Test interaction
  await toggleButton.click();
  await expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
});
