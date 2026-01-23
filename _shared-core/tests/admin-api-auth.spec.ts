/**
 * Admin Audit with API-based authentication
 */

import { test, expect, Page } from '@playwright/test'
import * as fs from 'fs'

const BASE_URL = 'http://localhost:3001'
const ADMIN_URL = `${BASE_URL}/admin`
const SCREENSHOTS_DIR = './test-results/admin-final'

test.beforeAll(async () => {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
})

// Authenticate via NextAuth CSRF + credentials POST
async function authenticateViaAPI(page: Page): Promise<boolean> {
  try {
    // Get CSRF token first
    const csrfResponse = await page.request.get(`${BASE_URL}/api/auth/csrf`)
    const csrfData = await csrfResponse.json()
    const csrfToken = csrfData.csrfToken

    console.log('CSRF Token:', csrfToken ? 'obtained' : 'missing')

    if (!csrfToken) return false

    // POST to credentials endpoint
    const authResponse = await page.request.post(`${BASE_URL}/api/auth/callback/credentials`, {
      form: {
        csrfToken,
        email: 'admin@divadlostudna.cz',
        password: 'DivadloStudna2024!',
        callbackUrl: '/admin',
        json: 'true'
      }
    })

    console.log('Auth response status:', authResponse.status())

    // Check if auth was successful
    const cookies = await page.context().cookies()
    const sessionCookie = cookies.find(c => c.name.includes('session') || c.name.includes('token'))
    console.log('Session cookie:', sessionCookie ? 'present' : 'missing')

    return authResponse.status() === 200 || !!sessionCookie

  } catch (error) {
    console.error('Auth error:', error)
    return false
  }
}

test.describe('Admin Panel Audit', () => {

  test('Full Admin Audit with API Auth', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    // Try API authentication
    const authSuccess = await authenticateViaAPI(page)
    console.log('API Auth success:', authSuccess)

    // Navigate to admin
    await page.goto(ADMIN_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const currentUrl = page.url()
    console.log('Current URL:', currentUrl)

    // Screenshot current state
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/01-admin-state.png`,
      fullPage: true
    })

    // If redirected to login, try form submit
    if (currentUrl.includes('login') || currentUrl.includes('signin')) {
      console.log('Redirected to login, trying form...')

      await page.goto(`${ADMIN_URL}/login`)
      await page.waitForLoadState('networkidle')

      // Screenshot login page issues
      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/02-login-page-issues.png`,
        fullPage: true
      })

      // Document the login page issues
      console.log('=== LOGIN PAGE ANALYSIS ===')

      // Check if sidebar is visible (shouldn't be on login)
      const sidebar = page.locator('aside, [class*="sidebar"]')
      const sidebarVisible = await sidebar.isVisible().catch(() => false)
      console.log('Sidebar visible on login page:', sidebarVisible)

      // Check if main header is visible
      const mainHeader = page.locator('header nav a[href="/program"]')
      const mainHeaderVisible = await mainHeader.isVisible().catch(() => false)
      console.log('Main website header visible:', mainHeaderVisible)

      // Check login form
      const loginForm = page.locator('form')
      const formVisible = await loginForm.isVisible()
      console.log('Login form visible:', formVisible)

      // Check logo
      const logo = page.locator('form img, [class*="logo"] img')
      const logoVisible = await logo.isVisible().catch(() => false)
      console.log('Logo visible:', logoVisible)
    }
  })

  test('Login Page UX Issues Analysis', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    await page.goto(`${ADMIN_URL}/login`)
    await page.waitForLoadState('networkidle')

    // Full page screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/10-login-full.png`,
      fullPage: true
    })

    // Check layout issues
    const issues: string[] = []

    // Issue 1: Sidebar visible?
    const sidebar = await page.locator('aside').isVisible().catch(() => false)
    if (sidebar) {
      issues.push('MAJOR: Sidebar viditelný na login stránce pro nepřihlášené')
    }

    // Issue 2: Main header visible?
    const mainNav = await page.locator('header a[href="/program"]').isVisible().catch(() => false)
    if (mainNav) {
      issues.push('MAJOR: Hlavní navigace webu viditelná na admin login')
    }

    // Issue 3: Footer visible?
    const footer = await page.locator('footer').isVisible().catch(() => false)
    if (footer) {
      issues.push('MINOR: Veřejný footer viditelný na admin login')
    }

    // Issue 4: Logo loaded?
    const logoImg = page.locator('.rounded-full img, [class*="logo"] img').first()
    if (await logoImg.isVisible().catch(() => false)) {
      const naturalWidth = await logoImg.evaluate((el: HTMLImageElement) => el.naturalWidth)
      if (naturalWidth === 0) {
        issues.push('MINOR: Logo se nenačetlo')
      }
    }

    // Issue 5: Password toggle?
    const passwordToggle = await page.locator('button[aria-label*="heslo"], [class*="eye"]').count()
    if (passwordToggle === 0) {
      issues.push('MINOR: Chybí tlačítko pro zobrazení hesla')
    }

    // Issue 6: Error state test
    await page.fill('#email', 'wrong@test.com')
    await page.fill('#password', 'wrongpass')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(2000)

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/11-login-error.png`
    })

    const errorMsg = await page.locator('.bg-red-50, [class*="error"], [role="alert"]').isVisible().catch(() => false)
    if (!errorMsg) {
      issues.push('MAJOR: Chybí zobrazení chybové hlášky při špatných údajích')
    }

    console.log('\n=== LOGIN PAGE ISSUES ===')
    issues.forEach(issue => console.log(issue))
    console.log('=========================\n')

    // Save issues to file
    fs.writeFileSync(
      `${SCREENSHOTS_DIR}/login-issues.txt`,
      issues.join('\n')
    )
  })

  test('Login Mobile View', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })

    await page.goto(`${ADMIN_URL}/login`)
    await page.waitForLoadState('networkidle')

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/12-login-mobile.png`,
      fullPage: true
    })
  })
})
