import { test, expect } from '@playwright/test';

test('Ask AI button shows spinner when clicked', async ({ page }) => {
  // Mock the API call to delay it so we can see the spinner
  await page.route('https://generativelanguage.googleapis.com/**', async (route) => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
    // Mock a successful response
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ candidates: [{ content: { parts: [{ text: "Analysis result" }] } }] })
    });
  });

  await page.goto('http://localhost:5173');

  // Wait for table to load
  await page.waitForSelector('table');

  // Set AI Key
  const keyInput = page.locator('#gemini-key');
  await keyInput.fill('dummy-key');

  // Find a checkbox in the first data row (tbody tr)
  const firstCheckbox = page.locator('tbody tr input[type="checkbox"]').first();
  await expect(firstCheckbox).toBeVisible();
  await firstCheckbox.click();

  // Find the "Ask AI" button
  const askButton = page.getByRole('button', { name: 'Ask AI' });
  await expect(askButton).toBeVisible();
  await expect(askButton).toBeEnabled();

  // Click the button
  await askButton.click();

  // Verify the button text changes to "Asking..."
  // The name of the button changes, so we need to find it by the new name
  const askingButton = page.getByRole('button', { name: /Asking.../ });
  await expect(askingButton).toBeVisible();

  // Verify the spinner SVG is present inside the button
  const spinner = askingButton.locator('svg.animate-spin');
  await expect(spinner).toBeVisible();

  // Verify aria-busy is true
  await expect(askingButton).toHaveAttribute('aria-busy', 'true');
});
