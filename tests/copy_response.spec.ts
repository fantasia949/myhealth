import { test, expect } from '@playwright/test'

test('Copy AI response to clipboard', async ({ page }) => {
  // Mock the AI API
  await page.route('https://generativelanguage.googleapis.com/**', async (route) => {
    const json = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: '# AI Analysis\nThis is a mock analysis.',
              },
            ],
          },
        },
      ],
    }
    await route.fulfill({ json })
  })

  // Set API key in localStorage
  await page.addInitScript(() => {
    localStorage.setItem('key', '"dummy-key"') // atomWithStorage stores JSON strings
  })

  await page.goto('http://localhost:5173/')

  // Select a row (checkbox)
  // Need to find a checkbox. The first one in tbody.
  const checkbox = page.locator('table tbody tr input[type="checkbox"]').first()
  // Ensure the checkbox is visible before clicking
  await expect(checkbox).toBeVisible()
  await checkbox.click()

  // Click "Ask AI"
  const askButton = page.getByRole('button', { name: 'Ask AI' })
  await expect(askButton).toBeEnabled()
  await askButton.click()

  // Wait for dialog content
  await expect(page.getByText('AI Analysis')).toBeVisible()

  // Find Copy button
  const copyButton = page.getByRole('button', { name: 'Copy Analysis' })
  await expect(copyButton).toBeVisible()

  // Click it
  // Since we can't easily verify clipboard content in headless mode without permissions,
  // we rely on the UI feedback "Copied!" text.
  await copyButton.click()

  // Check feedback
  await expect(copyButton).toHaveText(/Copied!/)
})
