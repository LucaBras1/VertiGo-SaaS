/**
 * KOMPLEXNÍ UX/UI AUDIT - Divadlo Studna
 *
 * Testuje všechny aspekty dle zadání:
 * - Veřejný web (Frontend)
 * - Admin panel
 * - Celkový audit (accessibility, performance, konzistence)
 */

import { test, expect, Page, BrowserContext } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const BASE_URL = 'http://localhost:3001'
const ADMIN_URL = `${BASE_URL}/admin`
const SCREENSHOTS_DIR = './test-results/ux-audit'
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
  findings.push({ ...finding, id: `F${String(findingCounter).padStart(3, '0')}` })
}

// Viewports
const viewports = {
  desktop: { width: 1920, height: 1080 },
  laptop: { width: 1366, height: 768 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 },
}

// Setup
test.beforeAll(async () => {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
  }
  fs.mkdirSync(`${SCREENSHOTS_DIR}/public`, { recursive: true })
  fs.mkdirSync(`${SCREENSHOTS_DIR}/admin`, { recursive: true })
  fs.mkdirSync(`${SCREENSHOTS_DIR}/accessibility`, { recursive: true })
  fs.mkdirSync(`${SCREENSHOTS_DIR}/responsivity`, { recursive: true })
})

// ============================================================================
// ČÁST 1: VEŘEJNÝ WEB (Frontend)
// ============================================================================

test.describe('ČÁST 1: VEŘEJNÝ WEB', () => {

  // ---------------------------------------------------------------------------
  // 1.1 Homepage (/)
  // ---------------------------------------------------------------------------
  test.describe('Homepage (/)', () => {

    test('1.1.1 First Impression - Desktop', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      // Full page screenshot
      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/public/01-homepage-desktop-full.png`,
        fullPage: true
      })

      // Above the fold
      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/public/01-homepage-desktop-above-fold.png`
      })

      // Check hero section exists
      const heroSection = page.locator('section').first()
      await expect(heroSection).toBeVisible()

      // Check main heading
      const h1 = page.locator('h1')
      await expect(h1).toBeVisible()
      const h1Text = await h1.textContent()
      console.log(`Homepage H1: ${h1Text}`)

      // Check brand colors are present
      const primaryColorElements = await page.locator('[class*="primary"], [class*="text-primary"]').count()
      console.log(`Elements with primary color: ${primaryColorElements}`)
    })

    test('1.1.2 Navigation - Header', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      // Check header is sticky
      const header = page.locator('header')
      await expect(header).toBeVisible()

      // Check logo
      const logo = page.locator('header a[href="/"]').first()
      await expect(logo).toBeVisible()

      // Check navigation links
      const navLinks = page.locator('header nav a, header a[href^="/"]')
      const navCount = await navLinks.count()
      console.log(`Navigation links: ${navCount}`)

      // Screenshot header
      await header.screenshot({
        path: `${SCREENSHOTS_DIR}/public/02-header-desktop.png`
      })

      // Check dropdown menus if any
      const dropdowns = page.locator('header [class*="dropdown"], header [class*="submenu"]')
      const dropdownCount = await dropdowns.count()
      console.log(`Dropdown menus: ${dropdownCount}`)
    })

    test('1.1.3 Navigation - Mobile Menu', async ({ page }) => {
      await page.setViewportSize(viewports.mobile)
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      // Screenshot closed state
      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/responsivity/03-mobile-menu-closed.png`
      })

      // Find mobile menu button
      const menuButton = page.locator('button[aria-label*="menu" i], button[aria-label*="Menu" i], header button').first()

      if (await menuButton.isVisible()) {
        await menuButton.click()
        await page.waitForTimeout(500)

        // Screenshot open state
        await page.screenshot({
          path: `${SCREENSHOTS_DIR}/responsivity/04-mobile-menu-open.png`
        })

        // Check menu items are accessible
        const mobileNavLinks = page.locator('nav a, [role="navigation"] a')
        const mobileNavCount = await mobileNavLinks.count()
        console.log(`Mobile navigation links: ${mobileNavCount}`)
      } else {
        addFinding({
          page: 'Homepage',
          component: 'Mobile Navigation',
          screenshot: '03-mobile-menu-closed.png',
          problem: 'Mobile menu button not found or not properly labeled',
          severity: 'Major',
          solution: 'Add aria-label="Menu" to mobile menu toggle button',
          priority: 'High'
        })
      }
    })

    test('1.1.4 Typography', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      // Check heading hierarchy
      const h1Count = await page.locator('h1').count()
      const h2Count = await page.locator('h2').count()
      const h3Count = await page.locator('h3').count()
      const h4Count = await page.locator('h4').count()

      console.log(`Heading hierarchy: H1=${h1Count}, H2=${h2Count}, H3=${h3Count}, H4=${h4Count}`)

      if (h1Count !== 1) {
        addFinding({
          page: 'Homepage',
          component: 'Typography',
          screenshot: '01-homepage-desktop-full.png',
          problem: `Page has ${h1Count} H1 tags instead of exactly 1`,
          severity: 'Major',
          solution: 'Ensure only one H1 per page for proper SEO and accessibility',
          priority: 'High'
        })
      }

      // Check font loading
      await page.waitForFunction(() => document.fonts.ready)
      console.log('Fonts loaded successfully')
    })

    test('1.1.5 CTA Buttons', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      // Find all CTA buttons
      const ctaButtons = page.locator('a[href="/kontakt"], a[href="/repertoar"], button[class*="primary"]')
      const ctaCount = await ctaButtons.count()
      console.log(`CTA buttons found: ${ctaCount}`)

      // Screenshot hero CTAs
      const heroCtas = page.locator('section').first().locator('a, button')
      if (await heroCtas.count() > 0) {
        await heroCtas.first().screenshot({
          path: `${SCREENSHOTS_DIR}/public/05-cta-buttons.png`
        })
      }

      // Check CTA visibility and contrast
      for (let i = 0; i < Math.min(await ctaButtons.count(), 3); i++) {
        const cta = ctaButtons.nth(i)
        const isVisible = await cta.isVisible()
        const text = await cta.textContent()
        console.log(`CTA ${i + 1}: "${text?.trim()}" - Visible: ${isVisible}`)
      }
    })

    test('1.1.6 Footer', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      // Scroll to footer
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(500)

      const footer = page.locator('footer')
      await expect(footer).toBeVisible()

      // Screenshot footer
      await footer.screenshot({
        path: `${SCREENSHOTS_DIR}/public/06-footer.png`
      })

      // Check footer content
      const socialLinks = await footer.locator('a[href*="facebook"], a[href*="instagram"], a[href*="youtube"]').count()
      const contactInfo = await footer.locator('[class*="contact"], address').count()
      const copyright = await footer.locator('text=/©|copyright/i').count()

      console.log(`Footer - Social links: ${socialLinks}, Contact info: ${contactInfo}, Copyright: ${copyright}`)

      if (socialLinks === 0) {
        addFinding({
          page: 'Homepage',
          component: 'Footer',
          screenshot: '06-footer.png',
          problem: 'No social media links in footer',
          severity: 'Minor',
          solution: 'Add social media icons with links to Facebook, Instagram, YouTube',
          priority: 'Low'
        })
      }
    })

    test('1.1.7 Images - Alt Text & Lazy Loading', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      // Check all images
      const images = page.locator('img')
      const imageCount = await images.count()

      let missingAlt = 0
      let emptyAlt = 0
      let lazyLoaded = 0

      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i)
        const alt = await img.getAttribute('alt')
        const loading = await img.getAttribute('loading')

        if (alt === null) missingAlt++
        if (alt === '') emptyAlt++
        if (loading === 'lazy') lazyLoaded++
      }

      console.log(`Images - Total: ${imageCount}, Missing alt: ${missingAlt}, Empty alt: ${emptyAlt}, Lazy loaded: ${lazyLoaded}`)

      if (missingAlt > 0) {
        addFinding({
          page: 'Homepage',
          component: 'Images',
          screenshot: '01-homepage-desktop-full.png',
          problem: `${missingAlt} images missing alt attribute`,
          severity: 'Major',
          solution: 'Add descriptive alt text to all images for accessibility',
          priority: 'High'
        })
      }
    })

    test('1.1.8 SEO Elements', async ({ page }) => {
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      // Check meta tags
      const title = await page.title()
      const metaDescription = await page.locator('meta[name="description"]').getAttribute('content')
      const metaViewport = await page.locator('meta[name="viewport"]').getAttribute('content')
      const canonicalUrl = await page.locator('link[rel="canonical"]').getAttribute('href')
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
      const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content')
      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content')

      console.log(`SEO - Title: ${title}`)
      console.log(`SEO - Description: ${metaDescription}`)
      console.log(`SEO - Viewport: ${metaViewport}`)
      console.log(`SEO - Canonical: ${canonicalUrl}`)
      console.log(`SEO - OG Title: ${ogTitle}`)
      console.log(`SEO - OG Image: ${ogImage}`)

      if (!metaDescription) {
        addFinding({
          page: 'Homepage',
          component: 'SEO',
          screenshot: 'N/A',
          problem: 'Missing meta description',
          severity: 'Major',
          solution: 'Add meta description tag with compelling 150-160 character description',
          priority: 'High'
        })
      }

      if (!ogImage) {
        addFinding({
          page: 'Homepage',
          component: 'SEO',
          screenshot: 'N/A',
          problem: 'Missing Open Graph image',
          severity: 'Minor',
          solution: 'Add og:image meta tag for better social media sharing',
          priority: 'Medium'
        })
      }
    })
  })

  // ---------------------------------------------------------------------------
  // 1.2 Repertoár / Představení
  // ---------------------------------------------------------------------------
  test.describe('Repertoár (/repertoar)', () => {

    test('1.2.1 Page Layout', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await page.goto(`${BASE_URL}/repertoar`)
      await page.waitForLoadState('networkidle')

      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/public/10-repertoar-desktop.png`,
        fullPage: true
      })

      // Check page title
      const h1 = page.locator('h1')
      await expect(h1).toBeVisible()

      // Check performance cards
      const cards = page.locator('[class*="card"], article')
      const cardCount = await cards.count()
      console.log(`Performance cards: ${cardCount}`)

      if (cardCount === 0) {
        addFinding({
          page: 'Repertoár',
          component: 'Content',
          screenshot: '10-repertoar-desktop.png',
          problem: 'No performance cards visible on page',
          severity: 'Critical',
          solution: 'Check data loading and ensure performances are displayed',
          priority: 'High'
        })
      }
    })

    test('1.2.2 Mobile View', async ({ page }) => {
      await page.setViewportSize(viewports.mobile)
      await page.goto(`${BASE_URL}/repertoar`)
      await page.waitForLoadState('networkidle')

      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/responsivity/11-repertoar-mobile.png`,
        fullPage: true
      })
    })

    test('1.2.3 Category Filters', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await page.goto(`${BASE_URL}/repertoar`)
      await page.waitForLoadState('networkidle')

      // Check for filter buttons/tabs
      const filters = page.locator('button[class*="filter"], [class*="tab"], a[href*="category"]')
      const filterCount = await filters.count()
      console.log(`Category filters: ${filterCount}`)

      if (filterCount > 0) {
        await page.screenshot({
          path: `${SCREENSHOTS_DIR}/public/12-repertoar-filters.png`
        })
      }
    })
  })

  // ---------------------------------------------------------------------------
  // 1.3 Detail představení
  // ---------------------------------------------------------------------------
  test.describe('Detail představení', () => {

    test('1.3.1 Performance Detail Page', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)

      // First get a performance slug from repertoar
      await page.goto(`${BASE_URL}/repertoar`)
      await page.waitForLoadState('networkidle')

      const performanceLink = page.locator('a[href*="/repertoar/"]').first()

      if (await performanceLink.isVisible()) {
        await performanceLink.click()
        await page.waitForLoadState('networkidle')

        await page.screenshot({
          path: `${SCREENSHOTS_DIR}/public/13-performance-detail.png`,
          fullPage: true
        })

        // Check content structure
        const title = page.locator('h1')
        await expect(title).toBeVisible()

        // Check for gallery/images
        const gallery = page.locator('[class*="gallery"], [class*="slider"], img')
        const galleryCount = await gallery.count()
        console.log(`Gallery images: ${galleryCount}`)

        // Check for metadata (duration, age range, etc.)
        const metadata = page.locator('[class*="meta"], [class*="info"], [class*="detail"]')
        const metaCount = await metadata.count()
        console.log(`Metadata sections: ${metaCount}`)

        // Check CTA for booking
        const bookingCta = page.locator('a[href*="kontakt"], button[class*="book"]')
        const ctaVisible = await bookingCta.count() > 0
        console.log(`Booking CTA visible: ${ctaVisible}`)

        if (!ctaVisible) {
          addFinding({
            page: 'Detail představení',
            component: 'CTA',
            screenshot: '13-performance-detail.png',
            problem: 'Missing booking/contact CTA button',
            severity: 'Major',
            solution: 'Add prominent CTA button linking to contact form',
            priority: 'High'
          })
        }
      }
    })
  })

  // ---------------------------------------------------------------------------
  // 1.4 Hry a služby
  // ---------------------------------------------------------------------------
  test.describe('Hry a služby', () => {

    test('1.4.1 Games Page', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await page.goto(`${BASE_URL}/hry`)
      await page.waitForLoadState('networkidle')

      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/public/14-hry-desktop.png`,
        fullPage: true
      })

      const h1 = page.locator('h1')
      await expect(h1).toBeVisible()
    })

    test('1.4.2 Services Page', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      // Try different URL patterns
      const urls = [`${BASE_URL}/sluzby`, `${BASE_URL}/hry-a-sluzby`, `${BASE_URL}/pro-poradatele`]

      for (const url of urls) {
        const response = await page.goto(url)
        if (response?.status() === 200) {
          await page.waitForLoadState('networkidle')
          await page.screenshot({
            path: `${SCREENSHOTS_DIR}/public/15-sluzby-desktop.png`,
            fullPage: true
          })
          console.log(`Services page found at: ${url}`)
          break
        }
      }
    })
  })

  // ---------------------------------------------------------------------------
  // 1.5 O nás
  // ---------------------------------------------------------------------------
  test.describe('O nás', () => {

    test('1.5.1 About Page', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)

      // Try different URL patterns
      const urls = [`${BASE_URL}/o-nas`, `${BASE_URL}/nas-pribeh`, `${BASE_URL}/soubor`]

      for (const url of urls) {
        const response = await page.goto(url)
        if (response?.status() === 200) {
          await page.waitForLoadState('networkidle')
          await page.screenshot({
            path: `${SCREENSHOTS_DIR}/public/16-o-nas-desktop.png`,
            fullPage: true
          })
          console.log(`About page found at: ${url}`)

          // Check for team section
          const teamSection = page.locator('[class*="team"], [class*="member"]')
          const teamCount = await teamSection.count()
          console.log(`Team members/sections: ${teamCount}`)
          break
        }
      }
    })
  })

  // ---------------------------------------------------------------------------
  // 1.6 Kontakt
  // ---------------------------------------------------------------------------
  test.describe('Kontakt (/kontakt)', () => {

    test('1.6.1 Contact Page Layout', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await page.goto(`${BASE_URL}/kontakt`)
      await page.waitForLoadState('networkidle')

      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/public/17-kontakt-desktop.png`,
        fullPage: true
      })

      // Check contact info
      const contactInfo = page.locator('[class*="contact"], address, a[href^="tel:"], a[href^="mailto:"]')
      const contactCount = await contactInfo.count()
      console.log(`Contact elements: ${contactCount}`)
    })

    test('1.6.2 Contact Form - Input Visibility', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await page.goto(`${BASE_URL}/kontakt`)
      await page.waitForLoadState('networkidle')

      const form = page.locator('form')

      if (await form.isVisible()) {
        // Check all form inputs
        const inputs = form.locator('input, textarea, select')
        const inputCount = await inputs.count()
        console.log(`Form inputs: ${inputCount}`)

        // Screenshot form
        await form.screenshot({
          path: `${SCREENSHOTS_DIR}/public/18-kontakt-form.png`
        })

        // Check input visibility on dark background
        const nameInput = form.locator('input[name="name"]')
        if (await nameInput.isVisible()) {
          await nameInput.focus()
          await page.screenshot({
            path: `${SCREENSHOTS_DIR}/public/19-kontakt-form-focus.png`
          })
        }

        // Check labels visibility
        const labels = form.locator('label')
        const labelCount = await labels.count()
        console.log(`Form labels: ${labelCount}`)

        if (labelCount < inputCount) {
          addFinding({
            page: 'Kontakt',
            component: 'Form Labels',
            screenshot: '18-kontakt-form.png',
            problem: `Some form inputs missing labels (${inputCount} inputs, ${labelCount} labels)`,
            severity: 'Major',
            solution: 'Add visible labels for all form inputs',
            priority: 'High'
          })
        }
      }
    })

    test('1.6.3 Contact Form - Validation', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await page.goto(`${BASE_URL}/kontakt`)
      await page.waitForLoadState('networkidle')

      const form = page.locator('form')
      const submitButton = form.locator('button[type="submit"]')

      if (await submitButton.isVisible()) {
        // Try to submit empty form
        await submitButton.click()
        await page.waitForTimeout(1000)

        await page.screenshot({
          path: `${SCREENSHOTS_DIR}/public/20-kontakt-validation.png`
        })

        // Check for validation messages
        const validationErrors = page.locator('[class*="error"], [class*="invalid"], :invalid')
        const errorCount = await validationErrors.count()
        console.log(`Validation errors shown: ${errorCount}`)

        if (errorCount === 0) {
          addFinding({
            page: 'Kontakt',
            component: 'Form Validation',
            screenshot: '20-kontakt-validation.png',
            problem: 'No validation feedback when submitting empty form',
            severity: 'Major',
            solution: 'Add client-side validation with clear error messages',
            priority: 'High'
          })
        }
      }
    })

    test('1.6.4 Contact Form - Mobile', async ({ page }) => {
      await page.setViewportSize(viewports.mobile)
      await page.goto(`${BASE_URL}/kontakt`)
      await page.waitForLoadState('networkidle')

      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/responsivity/21-kontakt-mobile.png`,
        fullPage: true
      })
    })
  })

  // ---------------------------------------------------------------------------
  // 1.7 Error States
  // ---------------------------------------------------------------------------
  test.describe('Error States', () => {

    test('1.7.1 404 Page', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await page.goto(`${BASE_URL}/neexistujici-stranka-xyz`)
      await page.waitForLoadState('networkidle')

      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/public/22-404-page.png`,
        fullPage: true
      })

      // Check for 404 indication
      const notFound = page.locator('text=/404|nenalezena|not found/i')
      const hasNotFound = await notFound.count() > 0
      console.log(`404 indication visible: ${hasNotFound}`)

      // Check for navigation back
      const homeLink = page.locator('a[href="/"]')
      const hasHomeLink = await homeLink.count() > 0
      console.log(`Link back to home: ${hasHomeLink}`)

      if (!hasHomeLink) {
        addFinding({
          page: '404',
          component: 'Navigation',
          screenshot: '22-404-page.png',
          problem: 'No link back to homepage on 404 page',
          severity: 'Minor',
          solution: 'Add prominent link back to homepage',
          priority: 'Medium'
        })
      }
    })
  })
})

// ============================================================================
// ČÁST 2: ADMIN PANEL
// ============================================================================

test.describe('ČÁST 2: ADMIN PANEL', () => {

  // Helper to login
  async function adminLogin(page: Page) {
    await page.goto(`${ADMIN_URL}/login`)
    await page.waitForLoadState('networkidle')
    await page.fill('input[type="email"], input[name="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)
  }

  // ---------------------------------------------------------------------------
  // 2.1 Login
  // ---------------------------------------------------------------------------
  test.describe('Login (/admin/login)', () => {

    test('2.1.1 Login Page Layout', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await page.goto(`${ADMIN_URL}/login`)
      await page.waitForLoadState('networkidle')

      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/admin/30-login-page.png`,
        fullPage: true
      })

      // Check form elements
      const emailInput = page.locator('input[type="email"], input[name="email"]')
      const passwordInput = page.locator('input[type="password"]')
      const submitButton = page.locator('button[type="submit"]')

      await expect(emailInput).toBeVisible()
      await expect(passwordInput).toBeVisible()
      await expect(submitButton).toBeVisible()

      // Check for password visibility toggle
      const passwordToggle = page.locator('button[class*="password"], [class*="eye"]')
      const hasPasswordToggle = await passwordToggle.count() > 0
      console.log(`Password visibility toggle: ${hasPasswordToggle}`)
    })

    test('2.1.2 Login - Error Handling', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await page.goto(`${ADMIN_URL}/login`)
      await page.waitForLoadState('networkidle')

      // Try wrong credentials
      await page.fill('input[type="email"], input[name="email"]', 'wrong@email.com')
      await page.fill('input[type="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')
      await page.waitForTimeout(2000)

      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/admin/31-login-error.png`
      })

      // Check for error message
      const errorMessage = page.locator('[class*="error"], [class*="alert"], [role="alert"]')
      const hasError = await errorMessage.count() > 0
      console.log(`Error message displayed: ${hasError}`)

      if (!hasError) {
        addFinding({
          page: 'Admin Login',
          component: 'Error Handling',
          screenshot: '31-login-error.png',
          problem: 'No error message shown for invalid credentials',
          severity: 'Major',
          solution: 'Display clear error message for failed login attempts',
          priority: 'High'
        })
      }
    })

    test('2.1.3 Login - Success Flow', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await adminLogin(page)

      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/admin/32-login-success-redirect.png`,
        fullPage: true
      })

      // Verify redirect to dashboard
      const currentUrl = page.url()
      console.log(`After login URL: ${currentUrl}`)
    })

    test('2.1.4 Login - Mobile', async ({ page }) => {
      await page.setViewportSize(viewports.mobile)
      await page.goto(`${ADMIN_URL}/login`)
      await page.waitForLoadState('networkidle')

      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/responsivity/33-login-mobile.png`,
        fullPage: true
      })
    })
  })

  // ---------------------------------------------------------------------------
  // 2.2 Dashboard
  // ---------------------------------------------------------------------------
  test.describe('Dashboard (/admin)', () => {

    test('2.2.1 Dashboard Layout', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await adminLogin(page)
      await page.goto(ADMIN_URL)
      await page.waitForLoadState('networkidle')

      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/admin/34-dashboard.png`,
        fullPage: true
      })

      // Check for stats cards
      const statsCards = page.locator('[class*="stat"], [class*="card"], [class*="metric"]')
      const statsCount = await statsCards.count()
      console.log(`Dashboard stats/cards: ${statsCount}`)

      // Check for quick actions
      const quickActions = page.locator('[class*="quick"], [class*="action"], a[href*="/admin/"]')
      const actionsCount = await quickActions.count()
      console.log(`Quick actions: ${actionsCount}`)
    })

    test('2.2.2 Sidebar Navigation', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await adminLogin(page)
      await page.goto(ADMIN_URL)
      await page.waitForLoadState('networkidle')

      const sidebar = page.locator('aside, [class*="sidebar"]')

      if (await sidebar.isVisible()) {
        await sidebar.screenshot({
          path: `${SCREENSHOTS_DIR}/admin/35-sidebar.png`
        })

        // Check navigation items
        const navItems = sidebar.locator('a, button')
        const navCount = await navItems.count()
        console.log(`Sidebar navigation items: ${navCount}`)

        // Check for active state indication
        const activeItem = sidebar.locator('[class*="active"], [aria-current="page"]')
        const hasActiveIndicator = await activeItem.count() > 0
        console.log(`Active nav indicator: ${hasActiveIndicator}`)
      }
    })
  })

  // ---------------------------------------------------------------------------
  // 2.3 Customers
  // ---------------------------------------------------------------------------
  test.describe('Customers (/admin/customers)', () => {

    test('2.3.1 Customers List', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await adminLogin(page)
      await page.goto(`${ADMIN_URL}/customers`)
      await page.waitForLoadState('networkidle')

      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/admin/36-customers-list.png`,
        fullPage: true
      })

      // Check table
      const table = page.locator('table')
      const hasTable = await table.count() > 0
      console.log(`Customers table: ${hasTable}`)

      // Check filters
      const filters = page.locator('[class*="filter"], input[type="search"], select')
      const filterCount = await filters.count()
      console.log(`Filter elements: ${filterCount}`)

      // Check pagination
      const pagination = page.locator('[class*="pagination"], [class*="pager"]')
      const hasPagination = await pagination.count() > 0
      console.log(`Pagination: ${hasPagination}`)

      // Check bulk selection
      const checkboxes = page.locator('input[type="checkbox"]')
      const hasCheckboxes = await checkboxes.count() > 0
      console.log(`Bulk select checkboxes: ${hasCheckboxes}`)

      // Check export button
      const exportButton = page.locator('button:has-text("Export"), button:has-text("CSV"), a[download]')
      const hasExport = await exportButton.count() > 0
      console.log(`Export functionality: ${hasExport}`)

      if (!hasExport) {
        addFinding({
          page: 'Admin Customers',
          component: 'Export',
          screenshot: '36-customers-list.png',
          problem: 'No visible export functionality',
          severity: 'Minor',
          solution: 'Add CSV/Excel export button for customer data',
          priority: 'Medium'
        })
      }
    })

    test('2.3.2 Customers - Empty State', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await adminLogin(page)

      // Try to filter to get empty results
      await page.goto(`${ADMIN_URL}/customers?search=nonexistentcustomer12345`)
      await page.waitForLoadState('networkidle')

      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/admin/37-customers-empty.png`
      })

      // Check for empty state message
      const emptyState = page.locator('[class*="empty"], text=/žádn/i, text=/no /i')
      const hasEmptyState = await emptyState.count() > 0
      console.log(`Empty state message: ${hasEmptyState}`)
    })

    test('2.3.3 Customers - Loading State', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await adminLogin(page)

      // Navigate and catch loading state
      await page.goto(`${ADMIN_URL}/customers`)

      // Take screenshot immediately to catch loading
      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/admin/38-customers-loading.png`
      })
    })
  })

  // ---------------------------------------------------------------------------
  // 2.4 Orders
  // ---------------------------------------------------------------------------
  test.describe('Orders (/admin/orders)', () => {

    test('2.4.1 Orders List', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await adminLogin(page)
      await page.goto(`${ADMIN_URL}/orders`)
      await page.waitForLoadState('networkidle')

      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/admin/39-orders-list.png`,
        fullPage: true
      })

      // Check order status badges
      const statusBadges = page.locator('[class*="badge"], [class*="status"], [class*="chip"]')
      const badgeCount = await statusBadges.count()
      console.log(`Status badges: ${badgeCount}`)

      // Check date filters
      const dateFilters = page.locator('input[type="date"], [class*="datepicker"]')
      const hasDateFilter = await dateFilters.count() > 0
      console.log(`Date filters: ${hasDateFilter}`)
    })
  })

  // ---------------------------------------------------------------------------
  // 2.5 Invoices
  // ---------------------------------------------------------------------------
  test.describe('Invoices (/admin/invoices)', () => {

    test('2.5.1 Invoices List', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await adminLogin(page)
      await page.goto(`${ADMIN_URL}/invoices`)
      await page.waitForLoadState('networkidle')

      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/admin/40-invoices-list.png`,
        fullPage: true
      })

      // Check for PDF download
      const pdfDownload = page.locator('a[href*=".pdf"], button:has-text("PDF"), [class*="download"]')
      const hasPdfDownload = await pdfDownload.count() > 0
      console.log(`PDF download: ${hasPdfDownload}`)
    })
  })

  // ---------------------------------------------------------------------------
  // 2.6 Admin Mobile Responsivity
  // ---------------------------------------------------------------------------
  test.describe('Admin Mobile', () => {

    test('2.6.1 Dashboard Mobile', async ({ page }) => {
      await page.setViewportSize(viewports.mobile)
      await adminLogin(page)
      await page.goto(ADMIN_URL)
      await page.waitForLoadState('networkidle')

      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/responsivity/41-admin-dashboard-mobile.png`,
        fullPage: true
      })

      // Check mobile sidebar toggle
      const sidebarToggle = page.locator('button[class*="menu"], button[aria-label*="menu" i]')
      const hasToggle = await sidebarToggle.count() > 0
      console.log(`Mobile sidebar toggle: ${hasToggle}`)
    })

    test('2.6.2 Customers Mobile', async ({ page }) => {
      await page.setViewportSize(viewports.mobile)
      await adminLogin(page)
      await page.goto(`${ADMIN_URL}/customers`)
      await page.waitForLoadState('networkidle')

      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/responsivity/42-admin-customers-mobile.png`,
        fullPage: true
      })

      // Check table horizontal scroll
      const table = page.locator('table')
      if (await table.isVisible()) {
        const tableBox = await table.boundingBox()
        const viewportWidth = viewports.mobile.width
        console.log(`Table width: ${tableBox?.width}, Viewport: ${viewportWidth}`)

        if (tableBox && tableBox.width > viewportWidth) {
          addFinding({
            page: 'Admin Customers',
            component: 'Table Responsivity',
            screenshot: '42-admin-customers-mobile.png',
            problem: 'Table overflows on mobile devices',
            severity: 'Major',
            solution: 'Add horizontal scroll container or responsive table design',
            priority: 'High'
          })
        }
      }
    })
  })
})

// ============================================================================
// ČÁST 3: CELKOVÝ AUDIT
// ============================================================================

test.describe('ČÁST 3: CELKOVÝ AUDIT', () => {

  // ---------------------------------------------------------------------------
  // 3.1 Accessibility
  // ---------------------------------------------------------------------------
  test.describe('Accessibility', () => {

    test('3.1.1 ARIA Labels', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      // Check buttons without accessible names
      const buttonsWithoutName = await page.locator('button:not([aria-label]):not(:has(text)):not([aria-labelledby])').count()
      console.log(`Buttons without accessible name: ${buttonsWithoutName}`)

      // Check links without accessible names
      const linksWithoutName = await page.locator('a:not([aria-label]):not(:has(text)):not([aria-labelledby])').count()
      console.log(`Links without accessible name: ${linksWithoutName}`)

      // Check images without alt
      const imagesWithoutAlt = await page.locator('img:not([alt])').count()
      console.log(`Images without alt: ${imagesWithoutAlt}`)

      if (buttonsWithoutName > 0) {
        addFinding({
          page: 'Global',
          component: 'Accessibility',
          screenshot: 'N/A',
          problem: `${buttonsWithoutName} buttons without accessible name`,
          severity: 'Major',
          solution: 'Add aria-label or visible text to all interactive buttons',
          priority: 'High'
        })
      }
    })

    test('3.1.2 Keyboard Navigation', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      // Test Tab navigation
      const focusableElements: string[] = []

      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab')
        const focused = await page.evaluate(() => {
          const el = document.activeElement
          return el ? `${el.tagName}${el.id ? '#' + el.id : ''}${el.className ? '.' + el.className.split(' ')[0] : ''}` : 'none'
        })
        focusableElements.push(focused)
      }

      console.log('Focus order:', focusableElements.join(' -> '))

      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/accessibility/50-keyboard-focus.png`
      })
    })

    test('3.1.3 Skip Link', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      // Focus on skip link
      await page.keyboard.press('Tab')

      const skipLink = page.locator('a[href="#main-content"], a[class*="skip"]')
      const hasSkipLink = await skipLink.count() > 0
      console.log(`Skip link present: ${hasSkipLink}`)

      if (!hasSkipLink) {
        addFinding({
          page: 'Global',
          component: 'Accessibility',
          screenshot: 'N/A',
          problem: 'Missing skip link for keyboard users',
          severity: 'Minor',
          solution: 'Add "Skip to main content" link at the beginning of the page',
          priority: 'Medium'
        })
      }
    })

    test('3.1.4 Focus Visibility', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      // Tab to interactive elements and check focus visibility
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/accessibility/51-focus-visible.png`
      })
    })
  })

  // ---------------------------------------------------------------------------
  // 3.2 Performance
  // ---------------------------------------------------------------------------
  test.describe('Performance', () => {

    test('3.2.1 Page Load Time', async ({ page }) => {
      const startTime = Date.now()
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime

      console.log(`Page load time: ${loadTime}ms`)

      if (loadTime > 3000) {
        addFinding({
          page: 'Homepage',
          component: 'Performance',
          screenshot: 'N/A',
          problem: `Page load time is ${loadTime}ms (should be under 3s)`,
          severity: 'Major',
          solution: 'Optimize images, implement lazy loading, reduce bundle size',
          priority: 'High'
        })
      }
    })

    test('3.2.2 Core Web Vitals', async ({ page }) => {
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          const results: Record<string, number> = {}

          // First Contentful Paint
          const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0]
          if (fcpEntry) results.FCP = fcpEntry.startTime

          // Largest Contentful Paint
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const lastEntry = entries[entries.length - 1]
            results.LCP = lastEntry.startTime
          })
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

          // Cumulative Layout Shift
          let clsValue = 0
          const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value
              }
            }
            results.CLS = clsValue
          })
          clsObserver.observe({ type: 'layout-shift', buffered: true })

          setTimeout(() => resolve(results), 2000)
        })
      })

      console.log('Core Web Vitals:', metrics)
    })

    test('3.2.3 Resource Count', async ({ page }) => {
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      const resourceCounts = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource')
        return {
          total: resources.length,
          scripts: resources.filter(r => r.name.endsWith('.js')).length,
          styles: resources.filter(r => r.name.endsWith('.css')).length,
          images: resources.filter(r => r.name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)).length,
          fonts: resources.filter(r => r.name.match(/\.(woff|woff2|ttf|otf)$/i)).length,
        }
      })

      console.log('Resource counts:', resourceCounts)
    })
  })

  // ---------------------------------------------------------------------------
  // 3.3 Micro-interactions
  // ---------------------------------------------------------------------------
  test.describe('Micro-interactions', () => {

    test('3.3.1 Hover States', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      // Find buttons and links
      const button = page.locator('a[href="/kontakt"], button').first()

      if (await button.isVisible()) {
        // Screenshot before hover
        await page.screenshot({
          path: `${SCREENSHOTS_DIR}/accessibility/52-button-normal.png`
        })

        // Hover and screenshot
        await button.hover()
        await page.waitForTimeout(300)
        await page.screenshot({
          path: `${SCREENSHOTS_DIR}/accessibility/53-button-hover.png`
        })
      }
    })

    test('3.3.2 Card Hover Effects', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await page.goto(`${BASE_URL}/repertoar`)
      await page.waitForLoadState('networkidle')

      const card = page.locator('[class*="card"], article').first()

      if (await card.isVisible()) {
        await card.hover()
        await page.waitForTimeout(300)
        await page.screenshot({
          path: `${SCREENSHOTS_DIR}/accessibility/54-card-hover.png`
        })
      }
    })
  })

  // ---------------------------------------------------------------------------
  // 3.4 Consistency
  // ---------------------------------------------------------------------------
  test.describe('Consistency', () => {

    test('3.4.1 Button Styles', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      // Collect button styles
      const buttons = page.locator('button, a[class*="button"], a[class*="btn"]')
      const buttonCount = await buttons.count()

      const buttonStyles: string[] = []
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const btn = buttons.nth(i)
        const className = await btn.getAttribute('class')
        buttonStyles.push(className || 'no-class')
      }

      console.log('Button classes:', buttonStyles)
    })

    test('3.4.2 Color Consistency', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      // Check primary color usage
      const primaryElements = await page.locator('[class*="primary"]').count()
      const secondaryElements = await page.locator('[class*="secondary"]').count()

      console.log(`Primary color elements: ${primaryElements}`)
      console.log(`Secondary color elements: ${secondaryElements}`)
    })

    test('3.4.3 Spacing Consistency', async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      // Check section paddings
      const sections = page.locator('section')
      const sectionCount = await sections.count()

      for (let i = 0; i < Math.min(sectionCount, 3); i++) {
        const section = sections.nth(i)
        const padding = await section.evaluate((el) => {
          const style = window.getComputedStyle(el)
          return {
            top: style.paddingTop,
            bottom: style.paddingBottom
          }
        })
        console.log(`Section ${i + 1} padding:`, padding)
      }
    })
  })
})

// ============================================================================
// GENERATE FINAL REPORT
// ============================================================================

test.afterAll(async () => {
  // Generate findings report
  const report = {
    timestamp: new Date().toISOString(),
    totalFindings: findings.length,
    bySeverity: {
      Critical: findings.filter(f => f.severity === 'Critical').length,
      Major: findings.filter(f => f.severity === 'Major').length,
      Minor: findings.filter(f => f.severity === 'Minor').length,
      Enhancement: findings.filter(f => f.severity === 'Enhancement').length
    },
    byPriority: {
      High: findings.filter(f => f.priority === 'High').length,
      Medium: findings.filter(f => f.priority === 'Medium').length,
      Low: findings.filter(f => f.priority === 'Low').length
    },
    findings: findings
  }

  fs.writeFileSync(
    `${SCREENSHOTS_DIR}/audit-report.json`,
    JSON.stringify(report, null, 2)
  )

  // Generate markdown report
  let markdown = `# UX/UI Audit Report - Divadlo Studna\n\n`
  markdown += `**Generated:** ${new Date().toISOString()}\n\n`
  markdown += `## Summary\n\n`
  markdown += `| Severity | Count |\n|----------|-------|\n`
  markdown += `| Critical | ${report.bySeverity.Critical} |\n`
  markdown += `| Major | ${report.bySeverity.Major} |\n`
  markdown += `| Minor | ${report.bySeverity.Minor} |\n`
  markdown += `| Enhancement | ${report.bySeverity.Enhancement} |\n\n`
  markdown += `## Findings\n\n`

  for (const finding of findings) {
    markdown += `### ${finding.id}: ${finding.component} (${finding.page})\n\n`
    markdown += `- **Severity:** ${finding.severity}\n`
    markdown += `- **Priority:** ${finding.priority}\n`
    markdown += `- **Screenshot:** ${finding.screenshot}\n`
    markdown += `- **Problem:** ${finding.problem}\n`
    markdown += `- **Solution:** ${finding.solution}\n\n`
  }

  fs.writeFileSync(
    `${SCREENSHOTS_DIR}/audit-report.md`,
    markdown
  )

  console.log('\n========================================')
  console.log('AUDIT COMPLETE')
  console.log('========================================')
  console.log(`Total findings: ${findings.length}`)
  console.log(`Critical: ${report.bySeverity.Critical}`)
  console.log(`Major: ${report.bySeverity.Major}`)
  console.log(`Minor: ${report.bySeverity.Minor}`)
  console.log(`Enhancement: ${report.bySeverity.Enhancement}`)
  console.log(`\nReports saved to: ${SCREENSHOTS_DIR}/`)
  console.log('========================================\n')
})
