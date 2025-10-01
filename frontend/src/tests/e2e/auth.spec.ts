import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display login page for unauthenticated users', async ({ page }) => {
    // Check if redirected to login page
    await expect(page).toHaveURL(/\/auth\/login/)

    // Verify login form elements are present
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('should show validation errors for invalid login', async ({ page }) => {
    await page.goto('/auth/login')

    // Try to submit empty form
    await page.getByRole('button', { name: /sign in/i }).click()

    // Check for validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible()
    await expect(page.getByText(/password is required/i)).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login')

    // Fill in invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com')
    await page.getByLabel(/password/i).fill('wrongpassword')

    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click()

    // Check for error message
    await expect(page.getByText(/invalid credentials/i)).toBeVisible()
  })

  test('should successfully login with valid credentials', async ({ page }) => {
    await page.goto('/auth/login')

    // Mock successful login API response
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-jwt-token',
          user: {
            id: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
            role: 'engineer'
          }
        })
      })
    })

    // Fill in valid credentials
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/password/i).fill('password123')

    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click()

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('should handle logout correctly', async ({ page }) => {
    // Mock authenticated state
    await page.goto('/dashboard')
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-jwt-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User'
      }))
    })

    // Find and click logout button
    await page.getByRole('button', { name: /logout/i }).click()

    // Should redirect to login page
    await expect(page).toHaveURL(/\/auth\/login/)

    // Check that auth data is cleared
    const token = await page.evaluate(() => localStorage.getItem('authToken'))
    expect(token).toBeNull()
  })

  test('should persist authentication across page refreshes', async ({ page }) => {
    // Set up authenticated state
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-jwt-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User'
      }))
    })

    // Go to dashboard
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/dashboard/)

    // Refresh page
    await page.reload()

    // Should still be on dashboard
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('should redirect to login when token expires', async ({ page }) => {
    // Mock expired token response
    await page.route('**/api/auth/verify', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Token expired' })
      })
    })

    // Set up expired auth state
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'expired-jwt-token')
    })

    // Try to access protected route
    await page.goto('/dashboard')

    // Should redirect to login
    await expect(page).toHaveURL(/\/auth\/login/)

    // Should show token expired message
    await expect(page.getByText(/session expired/i)).toBeVisible()
  })
})