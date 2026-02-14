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

test('group header toggle button is accessible', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Wait for table to load
  await page.waitForSelector('table');

  // Locate the first group header button
  // It's inside a tr with specific classes and td
  const groupButton = page.locator('tr.bg-dark-accent.font-bold button').first();

  await expect(groupButton).toBeVisible();

  // Check initial state (expanded by default)
  await expect(groupButton).toHaveAttribute('aria-expanded', 'true');

  // Click to collapse
  await groupButton.click();

  // Check collapsed state
  await expect(groupButton).toHaveAttribute('aria-expanded', 'false');

  // Click to expand again
  await groupButton.click();
  await expect(groupButton).toHaveAttribute('aria-expanded', 'true');
});

test('p-value dialog close button has aria-label', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Wait for table to load
  await page.waitForSelector('table');
  await page.waitForSelector('tbody tr');

  // Select two checkboxes from the table
  const tableCheckboxes = page.locator('tbody tr input[type="checkbox"]');
  const count = await tableCheckboxes.count();

  if (count < 2) {
      throw new Error(`Not enough checkboxes found in table: ${count}`);
  }

  // Click the first two
  await tableCheckboxes.nth(0).click();
  await tableCheckboxes.nth(1).click();

  // Wait for P-Value button to appear
  const pValueButton = page.getByRole('button', { name: 'P-Value' });
  await expect(pValueButton).toBeVisible();
  await pValueButton.click();

  // Find the dialog title
  const dialogTitle = page.locator('div.text-lg.font-medium').first();
  await expect(dialogTitle).toBeVisible();

  const titleText = await dialogTitle.innerText();
  if (!titleText.includes('P-Value')) {
      throw new Error(`Expected dialog title to contain "P-Value", but found: "${titleText}"`);
  }

  // Find the close button inside that title container
  const closeButton = dialogTitle.locator('button');

  // Check visible
  await expect(closeButton).toBeVisible();

  // Check aria-label
  const ariaLabel = await closeButton.getAttribute('aria-label');

  if (ariaLabel !== 'Close dialog') {
      throw new Error(`FAIL: aria-label is missing or incorrect. Found: "${ariaLabel}"`);
  }
});

test('selected item chips in nav are accessible and removable', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Wait for table to load
  await page.waitForSelector('table');
  await page.waitForSelector('tbody tr');

  // Select the first checkbox
  const firstCheckbox = page.locator('tbody tr input[type="checkbox"]').first();
  const name = await firstCheckbox.getAttribute('name');
  if (!name) throw new Error('Checkbox does not have a name attribute');

  await firstCheckbox.click();

  // Verify the chip appears in the nav
  // The chip button has name={name}
  const chip = page.locator(`nav button[name="${name}"]`);
  await expect(chip).toBeVisible();

  // Verify aria-label
  await expect(chip).toHaveAttribute('aria-label', `Remove ${name} from selection`);

  // Verify it contains the X icon (by class or SVG presence)
  const icon = chip.locator('svg.h-4.w-4');
  await expect(icon).toBeVisible();

  // Click to remove
  await chip.click();

  // Verify chip is gone
  await expect(chip).toBeHidden();

  // Verify checkbox is unchecked
  await expect(firstCheckbox).not.toBeChecked();
});

test('supplements popover button has accessible label', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Wait for table to load
  await page.waitForSelector('table');

  // Find the button with visible text "?"
  // We use filter hasText to find the button element containing "?"
  const popoverButton = page.locator('button').filter({ hasText: '?' }).first();

  // Verify it's visible
  await expect(popoverButton).toBeVisible();

  // Verify it has the expected aria-label
  await expect(popoverButton).toHaveAttribute('aria-label', 'View supplements');
});
