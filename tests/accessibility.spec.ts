import { test, expect } from '@playwright/test';

test('chart toggle button is accessible', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Wait for the table to populate by waiting for the toggle button to be attached
  // We use first() because there are multiple buttons
  const toggleButton = page.locator('button[title="Toggle Chart"]').first();

  // Wait for it to be visible. This implicitly waits for the element to appear.
  await expect(toggleButton).toBeVisible({ timeout: 10000 });

  // Verify it has aria-expanded="false"
  await expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
  await expect(toggleButton).toHaveAttribute('aria-label', 'Expand chart');

  // Click it
  await toggleButton.click();

  // Verify aria-label changes to "Collapse chart"
  await expect(toggleButton).toHaveAttribute('aria-label', 'Collapse chart');

  // Verify aria-expanded changes to "true"
  await expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
});
