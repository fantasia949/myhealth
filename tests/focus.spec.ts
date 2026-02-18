import { test, expect } from '@playwright/test';

test('interactive elements should have visible focus styles', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Wait for at least one visible button
  await page.waitForSelector('button:visible');

  const failures = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const visibleButtons = buttons.filter(b => {
        // Simple visibility check
        return b.offsetWidth > 0 && b.offsetHeight > 0 &&
               window.getComputedStyle(b).visibility !== 'hidden';
    });

    const failed = [];
    for (const button of visibleButtons) {
        // Check class list string
        // Note: SVG className is an object, so we handle that
        const className = (typeof button.className === 'string' ? button.className : button.getAttribute('class')) || '';
        const ariaLabel = button.getAttribute('aria-label') || button.textContent || 'No Label';

        if (className.includes('focus:outline-none')) {
            const hasRing = className.includes('focus:ring') ||
                            className.includes('focus-visible:ring') ||
                            className.includes('focus:border');
            if (!hasRing) {
                failed.push(ariaLabel);
            }
        }
    }
    return failed;
  });

  expect(failures, `Buttons with focus:outline-none but no replacement: ${failures.join(', ')}`).toHaveLength(0);
});
