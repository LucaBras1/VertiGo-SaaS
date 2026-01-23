/**
 * Simple Admin Audit - Direct Cookie Authentication
 */

import { test, expect } from '@playwright/test'
import * as fs from 'fs'

const BASE_URL = 'http://localhost:3001'
const ADMIN_URL = `${BASE_URL}/admin`
const SCREENSHOTS_DIR = './test-results/admin-simple'

test.beforeAll(async () => {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
})

test.describe('Admin Panel - Cookie Auth', () => {

  test('Direct Dashboard Access Test', async ({ page, context }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    // First go to login
    await page.goto(`${ADMIN_URL}/login`)
    await page.waitForLoadState('networkidle')

    // Fill form
    await page.fill('#email', 'admin@divadlostudna.cz')
    await page.fill('#password', 'DivadloStudna2024!')

    // Submit form via JavaScript to trigger proper form submission
    await page.evaluate(() => {
      const form = document.querySelector('form')
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      }
    })

    // Wait longer for auth
    await page.waitForTimeout(5000)

    // Take screenshot of current state
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/01-after-login-attempt.png`,
      fullPage: true
    })

    console.log('Current URL after login:', page.url())

    // Get cookies
    const cookies = await context.cookies()
    console.log('Cookies after login:', cookies.map(c => c.name).join(', '))

    // Try to navigate to dashboard
    await page.goto(ADMIN_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/02-dashboard.png`,
      fullPage: true
    })

    console.log('Dashboard URL:', page.url())
  })

  test('Manual Cookie Test', async ({ page, context }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    // Go to login and authenticate via clicking
    await page.goto(`${ADMIN_URL}/login`)
    await page.waitForLoadState('networkidle')

    // Type credentials more naturally
    await page.click('#email')
    await page.keyboard.type('admin@divadlostudna.cz', { delay: 50 })

    await page.click('#password')
    await page.keyboard.type('DivadloStudna2024!', { delay: 50 })

    // Click submit button
    await page.click('button[type="submit"]')

    // Wait for potential redirect
    await page.waitForTimeout(8000)

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/03-manual-login.png`,
      fullPage: true
    })

    console.log('URL after manual login:', page.url())

    // Check if we see dashboard content
    const dashboardContent = await page.locator('h1, [class*="dashboard"]').count()
    console.log('Dashboard content elements:', dashboardContent)
  })
})
