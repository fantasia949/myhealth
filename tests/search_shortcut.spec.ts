import { test, expect } from '@playwright/test';

test('Search shortcut / works and hint is visible', async ({ page }) => {
  // Navigate to the app (assuming default vite port)
  await page.goto('http://localhost:5173');

  const searchInput = page.getByRole('searchbox', { name: 'Search biomarkers' });
  const hint = page.locator('kbd', { hasText: '/' });

  // Wait for the page to be ready
  await expect(page.locator('nav')).toBeVisible();

  // Initially, search is auto-focused.
  // If auto-focused, hint should NOT be visible.
  // We use evaluate to check focus status immediately
  const isFocused = await searchInput.evaluate(el => document.activeElement === el);
  if (isFocused) {
    await expect(hint).toBeHidden();
  }

  // Click somewhere else to lose focus (e.g. body)
  await page.locator('body').click({ position: { x: 0, y: 0 } });

  // Wait for blur to happen
  await expect(searchInput).not.toBeFocused();

  // Hint should be visible when not focused and empty
  await expect(hint).toBeVisible();

  // Press '/' to focus
  await page.keyboard.press('/');
  await expect(searchInput).toBeFocused();

  // Hint should be hidden when focused
  await expect(hint).toBeHidden();

  // Type something
  await searchInput.fill('test');
  await expect(hint).toBeHidden();

  // Clear search
  await searchInput.fill('');
  await expect(hint).toBeHidden(); // Still focused

  // Click away
  await page.locator('body').click({ position: { x: 0, y: 0 } });

  // Hint should reappear
  await expect(hint).toBeVisible();
});
