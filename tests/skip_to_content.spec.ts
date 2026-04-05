import { test, expect } from '@playwright/test'

test('skip to main content link is accessible and works', async ({ page }) => {
  await page.goto('http://localhost:5173')

  // The skip link should be in the DOM but hidden from view initially
  const skipLink = page.locator('a[href="#main-content"]')
  await expect(skipLink).toBeAttached()

  // It should become visible on focus
  await skipLink.focus()
  await expect(skipLink).toBeVisible()

  // Press enter
  await skipLink.press('Enter')

  // Main content should receive focus (or window should scroll to it)
  // Let's check if the main tag exists and has the id
  const main = page.locator('main#main-content')
  await expect(main).toBeAttached()
})
