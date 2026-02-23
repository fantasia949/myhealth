import { test, expect } from '@playwright/test';

test('search with whitespace only should return no results', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  const searchInput = page.getByRole('searchbox', { name: 'Search biomarkers' });

  // Verify initial state (some rows exist)
  const rows = page.locator('tbody tr');
  await expect(rows.first()).toBeVisible();

  // Type whitespace
  await searchInput.fill('   ');

  // Expect empty state message
  await expect(page.getByText('No biomarkers match "   "')).toBeVisible();

  // Verify no data rows are visible (except the empty state row itself)
  await expect(rows).toHaveCount(1);
});
