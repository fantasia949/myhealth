import { test, expect } from '@playwright/test';

test('take screenshot of chart', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Wait for 5 seconds to allow the table to render
  await page.waitForTimeout(5000);

  // Select the first biomarker, skipping group headers
  await page.locator('tbody tr input[type="checkbox"]').first().check();

  // Click the "Visualize" button
  await page.click('button:has-text("Visualize")');

  // Wait for the chart to be rendered
  await page.waitForSelector('.echarts-for-react');

  // Take a screenshot for verification
  await page.screenshot({ path: 'final_chart_screenshot.png' });

  const chartExists = await page.isVisible('.echarts-for-react');
  expect(chartExists).toBe(true);
});
