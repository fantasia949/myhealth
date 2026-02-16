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

test('search input has search icon', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Verify search input is present
  const searchInput = page.getByRole('searchbox', { name: 'Search biomarkers' });
  await expect(searchInput).toBeVisible();

  // Verify it has padding-left (class pl-10)
  // We can check if the class name contains pl-10
  await expect(searchInput).toHaveClass(/pl-10/);

  // Verify the icon is present (by looking for the svg with correct classes)
  // The icon is inside the same container, so we can look for it nearby
  // Or just check page for the specific svg
  const searchContainer = page.locator('div.relative:has(input[type="search"])');
  const icon = searchContainer.locator('svg.h-5.w-5').first();
  await expect(icon).toBeVisible();
});
