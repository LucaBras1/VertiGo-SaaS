/**
 * ADMIN PANEL UX/UI AUDIT - Divadlo Studna
 * Opravený login flow pro NextAuth
 */

import { test, expect, Page } from '@playwright/test'
import * as fs from 'fs'

const BASE_URL = 'http://localhost:3001'
const ADMIN_URL = `${BASE_URL}/admin`
const SCREENSHOTS_DIR = './test-results/admin-audit'
const ADMIN_EMAIL = 'admin@divadlostudna.cz'
const ADMIN_PASSWORD = 'DivadloStudna2024!'

// Findings storage
interface Finding {
  id: string
  page: string
  component: string
  screenshot: string
  problem: string
  severity: 'Critical' | 'Major' | 'Minor' | 'Enhancement'
  solution: string
  priority: 'High' | 'Medium' | 'Low'
}

const findings: Finding[] = []
let findingCounter = 0

function addFinding(finding: Omit<Finding, 'id'>) {
  findingCounter++
  findings.push({ ...finding, id: `A${String(findingCounter).padStart(3, '0')}` })
}

// Viewports
const viewports = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 },
}

// Setup
test.beforeAll(async () => {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
})

// Shared login function with proper waiting
async function adminLogin(page: Page): Promise<boolean> {
  await page.goto(`${ADMIN_URL}/login`)
  await page.waitForLoadState('networkidle')

  // Fill login form
  await page.locator('#email').fill(ADMIN_EMAIL)
  await page.locator('#password').fill(ADMIN_PASSWORD)

  // Click submit and wait for navigation
  await Promise.all([
    page.waitForURL(/\/admin(?!\/login)/, { timeout: 15000 }).catch(() => null),
    page.locator('button[type="submit"]').click()
  ])

  // Wait a bit for any client-side routing
  await page.waitForTimeout(2000)

  // Check if we're logged in
  const currentUrl = page.url()
  const isLoggedIn = !currentUrl.includes('/login')

  console.log(`Login attempt - Current URL: ${currentUrl}, Logged in: ${isLoggedIn}`)

  return isLoggedIn
}

// ============================================================================
// ADMIN LOGIN TESTS
// ============================================================================

test.describe('Admin Login', () => {

  test('Login Page - Layout & Design', async ({ page }) => {
    await page.setViewportSize(viewports.desktop)
    await page.goto(`${ADMIN_URL}/login`)
    await page.waitForLoadState('networkidle')

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/01-login-page.png`,
      fullPage: true
    })

    // Check essential elements
    const emailInput = page.locator('#email')
    const passwordInput = page.locator('#password')
    const submitButton = page.locator('button[type="submit"]')
    const logo = page.locator('img[alt*="Divadlo"]')

    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(submitButton).toBeVisible()

    // Check for brand elements
    const title = page.locator('h2')
    const titleText = await title.textContent()
    console.log(`Login page title: ${titleText}`)

    // Check for password toggle (UX improvement)
    const passwordToggle = page.locator('[data-testid="password-toggle"], button[aria-label*="heslo"]')
    const hasPasswordToggle = await passwordToggle.count() > 0
    console.log(`Password visibility toggle: ${hasPasswordToggle}`)

    if (!hasPasswordToggle) {
      addFinding({
        page: 'Admin Login',
        component: 'Password Input',
        screenshot: '01-login-page.png',
        problem: 'Chybí tlačítko pro zobrazení/skrytí hesla',
        severity: 'Minor',
        solution: 'Přidat eye icon pro toggle password visibility',
        priority: 'Low'
      })
    }
  })

  test('Login - Error Handling (Wrong Credentials)', async ({ page }) => {
    await page.setViewportSize(viewports.desktop)
    await page.goto(`${ADMIN_URL}/login`)
    await page.waitForLoadState('networkidle')

    // Try wrong credentials
    await page.locator('#email').fill('wrong@email.com')
    await page.locator('#password').fill('wrongpassword')
    await page.locator('button[type="submit"]').click()

    // Wait for error response
    await page.waitForTimeout(3000)

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/02-login-error.png`
    })

    // Check for error message
    const errorMessage = page.locator('.bg-red-50, [role="alert"], .text-red-600')
    const hasError = await errorMessage.count() > 0
    console.log(`Error message displayed: ${hasError}`)

    if (hasError) {
      const errorText = await errorMessage.first().textContent()
      console.log(`Error text: ${errorText}`)
    } else {
      addFinding({
        page: 'Admin Login',
        component: 'Error Handling',
        screenshot: '02-login-error.png',
        problem: 'Nezobrazuje se chybová hláška při špatných údajích',
        severity: 'Major',
        solution: 'Ověřit že loginError state se správně nastavuje a zobrazuje',
        priority: 'High'
      })
    }
  })

  test('Login - Success Flow', async ({ page }) => {
    await page.setViewportSize(viewports.desktop)

    const isLoggedIn = await adminLogin(page)

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/03-login-success.png`,
      fullPage: true
    })

    if (!isLoggedIn) {
      addFinding({
        page: 'Admin Login',
        component: 'Authentication',
        screenshot: '03-login-success.png',
        problem: 'Přihlášení nefunguje správně',
        severity: 'Critical',
        solution: 'Zkontrolovat NextAuth konfiguraci a credentials provider',
        priority: 'High'
      })
    }

    console.log(`Login successful: ${isLoggedIn}`)
  })

  test('Login - Mobile Responsivity', async ({ page }) => {
    await page.setViewportSize(viewports.mobile)
    await page.goto(`${ADMIN_URL}/login`)
    await page.waitForLoadState('networkidle')

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/04-login-mobile.png`,
      fullPage: true
    })

    // Check form is usable on mobile
    const form = page.locator('form')
    const formBox = await form.boundingBox()

    if (formBox && formBox.width > viewports.mobile.width) {
      addFinding({
        page: 'Admin Login',
        component: 'Mobile Responsivity',
        screenshot: '04-login-mobile.png',
        problem: 'Login formulář přetéká na mobilu',
        severity: 'Major',
        solution: 'Upravit max-width a padding pro mobile',
        priority: 'High'
      })
    }
  })
})

// ============================================================================
// ADMIN DASHBOARD TESTS
// ============================================================================

test.describe('Admin Dashboard', () => {

  test('Dashboard - Layout & Stats', async ({ page }) => {
    await page.setViewportSize(viewports.desktop)

    const isLoggedIn = await adminLogin(page)
    if (!isLoggedIn) {
      console.log('Skipping dashboard test - login failed')
      return
    }

    await page.goto(ADMIN_URL)
    await page.waitForLoadState('networkidle')

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/10-dashboard.png`,
      fullPage: true
    })

    // Check for stats cards
    const statsCards = page.locator('[class*="card"], [class*="stat"], [class*="metric"]')
    const statsCount = await statsCards.count()
    console.log(`Dashboard stats cards: ${statsCount}`)

    // Check for quick actions
    const quickActions = page.locator('a[href*="/admin/"], button[class*="action"]')
    const actionsCount = await quickActions.count()
    console.log(`Quick actions: ${actionsCount}`)

    // Check for recent activity
    const recentSection = page.locator('[class*="recent"], [class*="activity"]')
    const hasRecent = await recentSection.count() > 0
    console.log(`Recent activity section: ${hasRecent}`)

    if (statsCount < 3) {
      addFinding({
        page: 'Admin Dashboard',
        component: 'Statistics',
        screenshot: '10-dashboard.png',
        problem: `Dashboard má pouze ${statsCount} statistických karet`,
        severity: 'Minor',
        solution: 'Přidat více relevantních metrik (objednávky, tržby, návštěvnost)',
        priority: 'Medium'
      })
    }
  })

  test('Dashboard - Sidebar Navigation', async ({ page }) => {
    await page.setViewportSize(viewports.desktop)

    const isLoggedIn = await adminLogin(page)
    if (!isLoggedIn) return

    await page.goto(ADMIN_URL)
    await page.waitForLoadState('networkidle')

    const sidebar = page.locator('aside, [class*="sidebar"]')

    if (await sidebar.isVisible()) {
      await sidebar.screenshot({
        path: `${SCREENSHOTS_DIR}/11-sidebar.png`
      })

      // Check navigation structure
      const navGroups = sidebar.locator('[class*="group"], [class*="section"]')
      const groupCount = await navGroups.count()
      console.log(`Sidebar nav groups: ${groupCount}`)

      // Check for active state
      const activeItem = sidebar.locator('[class*="active"], [aria-current="page"], .bg-blue-50, .bg-gray-100')
      const hasActive = await activeItem.count() > 0
      console.log(`Active nav indicator: ${hasActive}`)

      // Check for collapse functionality
      const collapseBtn = sidebar.locator('button[class*="collapse"], [aria-label*="collapse"]')
      const hasCollapse = await collapseBtn.count() > 0
      console.log(`Sidebar collapse: ${hasCollapse}`)
    }
  })

  test('Dashboard - Mobile View', async ({ page }) => {
    await page.setViewportSize(viewports.mobile)

    const isLoggedIn = await adminLogin(page)
    if (!isLoggedIn) return

    await page.goto(ADMIN_URL)
    await page.waitForLoadState('networkidle')

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/12-dashboard-mobile.png`,
      fullPage: true
    })

    // Check mobile menu toggle
    const menuToggle = page.locator('button[class*="menu"], [aria-label*="menu" i]')
    const hasToggle = await menuToggle.count() > 0
    console.log(`Mobile menu toggle: ${hasToggle}`)

    if (hasToggle) {
      await menuToggle.first().click()
      await page.waitForTimeout(500)
      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/13-dashboard-mobile-menu.png`
      })
    }
  })
})

// ============================================================================
// ADMIN CUSTOMERS TESTS
// ============================================================================

test.describe('Admin Customers', () => {

  test('Customers - List View', async ({ page }) => {
    await page.setViewportSize(viewports.desktop)

    const isLoggedIn = await adminLogin(page)
    if (!isLoggedIn) return

    await page.goto(`${ADMIN_URL}/customers`)
    await page.waitForLoadState('networkidle')

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/20-customers-list.png`,
      fullPage: true
    })

    // Check table presence
    const table = page.locator('table')
    const hasTable = await table.count() > 0
    console.log(`Customers table: ${hasTable}`)

    // Check table headers
    if (hasTable) {
      const headers = table.locator('th')
      const headerCount = await headers.count()
      console.log(`Table headers: ${headerCount}`)

      const headerTexts: string[] = []
      for (let i = 0; i < headerCount; i++) {
        const text = await headers.nth(i).textContent()
        headerTexts.push(text || '')
      }
      console.log(`Header columns: ${headerTexts.join(', ')}`)
    }

    // Check filters
    const searchInput = page.locator('input[type="search"], input[placeholder*="hled"]')
    const hasSearch = await searchInput.count() > 0
    console.log(`Search filter: ${hasSearch}`)

    const selectFilters = page.locator('select')
    const filterCount = await selectFilters.count()
    console.log(`Select filters: ${filterCount}`)

    // Check pagination
    const pagination = page.locator('[class*="pagination"], nav[aria-label*="pagination"]')
    const hasPagination = await pagination.count() > 0
    console.log(`Pagination: ${hasPagination}`)

    // Check bulk actions
    const checkboxes = page.locator('input[type="checkbox"]')
    const hasCheckboxes = await checkboxes.count() > 1
    console.log(`Bulk select: ${hasCheckboxes}`)

    // Check export
    const exportBtn = page.locator('button:has-text("Export"), button:has-text("CSV"), a[download]')
    const hasExport = await exportBtn.count() > 0
    console.log(`Export button: ${hasExport}`)

    if (!hasExport) {
      addFinding({
        page: 'Admin Customers',
        component: 'Export',
        screenshot: '20-customers-list.png',
        problem: 'Chybí tlačítko pro export dat',
        severity: 'Minor',
        solution: 'Přidat CSV/Excel export funkci',
        priority: 'Medium'
      })
    }
  })

  test('Customers - Empty State', async ({ page }) => {
    await page.setViewportSize(viewports.desktop)

    const isLoggedIn = await adminLogin(page)
    if (!isLoggedIn) return

    // Search for non-existent customer
    await page.goto(`${ADMIN_URL}/customers`)
    await page.waitForLoadState('networkidle')

    const searchInput = page.locator('input[type="search"], input[placeholder*="hled"]').first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('neexistujici-zakaznik-xyz-123')
      await page.waitForTimeout(1000)

      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/21-customers-empty.png`
      })

      // Check empty state message
      const emptyState = page.locator('[class*="empty"], text=/žádn|nenalezen|no results/i')
      const hasEmptyState = await emptyState.count() > 0
      console.log(`Empty state: ${hasEmptyState}`)
    }
  })

  test('Customers - Mobile View', async ({ page }) => {
    await page.setViewportSize(viewports.mobile)

    const isLoggedIn = await adminLogin(page)
    if (!isLoggedIn) return

    await page.goto(`${ADMIN_URL}/customers`)
    await page.waitForLoadState('networkidle')

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/22-customers-mobile.png`,
      fullPage: true
    })

    // Check table responsivity
    const tableContainer = page.locator('[class*="overflow"], [class*="scroll"]')
    const hasScrollContainer = await tableContainer.count() > 0
    console.log(`Responsive table container: ${hasScrollContainer}`)
  })
})

// ============================================================================
// ADMIN ORDERS TESTS
// ============================================================================

test.describe('Admin Orders', () => {

  test('Orders - List View', async ({ page }) => {
    await page.setViewportSize(viewports.desktop)

    const isLoggedIn = await adminLogin(page)
    if (!isLoggedIn) return

    await page.goto(`${ADMIN_URL}/orders`)
    await page.waitForLoadState('networkidle')

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/30-orders-list.png`,
      fullPage: true
    })

    // Check status badges
    const statusBadges = page.locator('[class*="badge"], [class*="status"], [class*="chip"]')
    const badgeCount = await statusBadges.count()
    console.log(`Status badges: ${badgeCount}`)

    // Check date filters
    const dateFilters = page.locator('input[type="date"], [class*="datepicker"]')
    const hasDateFilter = await dateFilters.count() > 0
    console.log(`Date filters: ${hasDateFilter}`)

    // Check status filter
    const statusFilter = page.locator('select[name*="status"], [class*="status-filter"]')
    const hasStatusFilter = await statusFilter.count() > 0
    console.log(`Status filter: ${hasStatusFilter}`)
  })
})

// ============================================================================
// ADMIN INVOICES TESTS
// ============================================================================

test.describe('Admin Invoices', () => {

  test('Invoices - List View', async ({ page }) => {
    await page.setViewportSize(viewports.desktop)

    const isLoggedIn = await adminLogin(page)
    if (!isLoggedIn) return

    await page.goto(`${ADMIN_URL}/invoices`)
    await page.waitForLoadState('networkidle')

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/40-invoices-list.png`,
      fullPage: true
    })

    // Check for PDF generation
    const pdfButtons = page.locator('button:has-text("PDF"), a[href*=".pdf"], [class*="pdf"]')
    const hasPdf = await pdfButtons.count() > 0
    console.log(`PDF generation: ${hasPdf}`)

    // Check for payment status
    const paymentStatus = page.locator('[class*="paid"], [class*="unpaid"], [class*="payment"]')
    const hasPaymentStatus = await paymentStatus.count() > 0
    console.log(`Payment status indicators: ${hasPaymentStatus}`)
  })
})

// ============================================================================
// ADMIN FORMS & CRUD TESTS
// ============================================================================

test.describe('Admin Forms & CRUD', () => {

  test('New Customer Form', async ({ page }) => {
    await page.setViewportSize(viewports.desktop)

    const isLoggedIn = await adminLogin(page)
    if (!isLoggedIn) return

    // Try to find new customer link/button
    await page.goto(`${ADMIN_URL}/customers`)
    await page.waitForLoadState('networkidle')

    const newBtn = page.locator('a:has-text("Nový"), a:has-text("Přidat"), button:has-text("Nový")')
    if (await newBtn.count() > 0) {
      await newBtn.first().click()
      await page.waitForLoadState('networkidle')

      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/50-customer-form.png`,
        fullPage: true
      })

      // Check form fields
      const inputs = page.locator('input, textarea, select')
      const inputCount = await inputs.count()
      console.log(`Form inputs: ${inputCount}`)

      // Check for validation
      const requiredFields = page.locator('[required], [aria-required="true"]')
      const requiredCount = await requiredFields.count()
      console.log(`Required fields: ${requiredCount}`)

      // Check for cancel/save buttons
      const saveBtn = page.locator('button[type="submit"], button:has-text("Uložit")')
      const cancelBtn = page.locator('a:has-text("Zrušit"), button:has-text("Zrušit")')

      console.log(`Save button: ${await saveBtn.count() > 0}`)
      console.log(`Cancel button: ${await cancelBtn.count() > 0}`)
    }
  })
})

// ============================================================================
// ADMIN NOTIFICATIONS & FEEDBACK
// ============================================================================

test.describe('Admin Notifications', () => {

  test('Toast Messages', async ({ page }) => {
    await page.setViewportSize(viewports.desktop)

    const isLoggedIn = await adminLogin(page)
    if (!isLoggedIn) return

    await page.goto(ADMIN_URL)
    await page.waitForLoadState('networkidle')

    // Check for toast container
    const toastContainer = page.locator('[class*="toast"], [class*="notification"], [role="alert"]')
    const hasToastSystem = await toastContainer.count() > 0
    console.log(`Toast notification system: ${hasToastSystem}`)
  })
})

// ============================================================================
// GENERATE FINAL REPORT
// ============================================================================

test.afterAll(async () => {
  const report = {
    timestamp: new Date().toISOString(),
    totalFindings: findings.length,
    bySeverity: {
      Critical: findings.filter(f => f.severity === 'Critical').length,
      Major: findings.filter(f => f.severity === 'Major').length,
      Minor: findings.filter(f => f.severity === 'Minor').length,
      Enhancement: findings.filter(f => f.severity === 'Enhancement').length
    },
    findings: findings
  }

  fs.writeFileSync(
    `${SCREENSHOTS_DIR}/admin-audit-report.json`,
    JSON.stringify(report, null, 2)
  )

  console.log('\n========================================')
  console.log('ADMIN AUDIT COMPLETE')
  console.log('========================================')
  console.log(`Total findings: ${findings.length}`)
  console.log(`Critical: ${report.bySeverity.Critical}`)
  console.log(`Major: ${report.bySeverity.Major}`)
  console.log(`Minor: ${report.bySeverity.Minor}`)
  console.log(`Enhancement: ${report.bySeverity.Enhancement}`)
  console.log(`\nScreenshots: ${SCREENSHOTS_DIR}/`)
  console.log('========================================\n')
})
