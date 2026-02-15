import { test, expect } from '@playwright/test';

test.describe('Search UX', () => {
  test('should show clear button when typing and clear text when clicked', async ({ page }) => {
    // Navigate to the page
    await page.goto('http://localhost:5173/');

    // Locate the search input
    const searchInput = page.getByRole('searchbox', { name: 'Search biomarkers' });
    await expect(searchInput).toBeVisible();

    // Verify clear button is hidden initially
    const clearButton = page.getByRole('button', { name: 'Clear search' });
    await expect(clearButton).toBeHidden();

    // Type into the search box
    await searchInput.fill('Vitamin');

    // Verify clear button becomes visible
    await expect(clearButton).toBeVisible();

    // Click the clear button
    await clearButton.click();

    // Verify search box is empty
    await expect(searchInput).toHaveValue('');

    // Verify search box has focus
    await expect(searchInput).toBeFocused();
  });
});
