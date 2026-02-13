import { test, expect } from '@playwright/test';

test('supplements popover functionality', async ({ page }) => {
  // Navigate to the app
  await page.goto('http://localhost:5173');

  // Wait for table to be present
  const table = page.locator('table');
  await expect(table).toBeVisible({ timeout: 10000 });

  // Wait a bit for data hydration
  await page.waitForTimeout(2000);

  // Locate the "?" button in the footer
  // Use a specific locator to avoid confusion with other "?"
  const popoverButton = page.locator('tfoot button:has-text("?")').first();

  // Ensure it exists
  const count = await popoverButton.count();
  if (count === 0) {
    console.log('No popover button found in tfoot. Maybe no supplements data for visible columns?');
    // If no button, we can't test. But based on the image, there should be one.
    // Let's fail if not found.
    expect(count).toBeGreaterThan(0);
  }

  // Scroll to it
  await popoverButton.scrollIntoViewIfNeeded();
  await expect(popoverButton).toBeVisible();

  // Click the button
  await popoverButton.click();

  // Check for the Popover content
  // We added a heading "Supplements"
  const popoverContent = page.getByText('Supplements', { exact: true });
  await expect(popoverContent).toBeVisible();

  // Check for list items
  // The popover contains a ul with class list-disc
  const list = page.locator('.list-disc');
  await expect(list).toBeVisible();

  // Check that there is at least one item
  const items = list.locator('li');
  await expect(items.first()).toBeVisible();

  // Optional: Click somewhere else to close (Headless UI popover behavior)
  await page.locator('body').click({ position: { x: 0, y: 0 } });

  // Verify it closes (might need a small wait or retry)
  await expect(popoverContent).not.toBeVisible();
});
