import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-jwt-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'engineer'
      }))
    })

    // Mock dashboard API responses
    await page.route('**/api/dashboard/stats', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalProjects: 15,
          activeDrawings: 8,
          totalBoQItems: 1247,
          recentActivity: [
            {
              id: '1',
              type: 'drawing_created',
              message: 'New P&ID drawing created: Pump Station A',
              timestamp: '2024-01-15T10:30:00Z',
              user: 'John Doe'
            },
            {
              id: '2',
              type: 'boq_updated',
              message: 'BoQ updated for Project Alpha',
              timestamp: '2024-01-15T09:15:00Z',
              user: 'Jane Smith'
            }
          ]
        })
      })
    })

    await page.route('**/api/projects', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          projects: [
            {
              id: 'project-1',
              name: 'Water Treatment Plant A',
              status: 'active',
              progress: 75,
              lastModified: '2024-01-15T14:30:00Z',
              drawingsCount: 5,
              boqValue: 125000
            },
            {
              id: 'project-2',
              name: 'Pump Station B',
              status: 'draft',
              progress: 25,
              lastModified: '2024-01-14T16:45:00Z',
              drawingsCount: 2,
              boqValue: 45000
            }
          ]
        })
      })
    })

    await page.goto('/dashboard')
  })

  test('should display dashboard overview with statistics', async ({ page }) => {
    // Verify main dashboard elements
    await expect(page.getByTestId('dashboard-header')).toBeVisible()
    await expect(page.getByText('Welcome back, Test User')).toBeVisible()

    // Check statistics cards
    await expect(page.getByText('Total Projects')).toBeVisible()
    await expect(page.getByText('15')).toBeVisible()

    await expect(page.getByText('Active Drawings')).toBeVisible()
    await expect(page.getByText('8')).toBeVisible()

    await expect(page.getByText('Total BoQ Items')).toBeVisible()
    await expect(page.getByText('1,247')).toBeVisible()
  })

  test('should display recent projects', async ({ page }) => {
    // Verify projects section
    await expect(page.getByTestId('recent-projects')).toBeVisible()
    await expect(page.getByText('Recent Projects')).toBeVisible()

    // Check project cards
    await expect(page.getByText('Water Treatment Plant A')).toBeVisible()
    await expect(page.getByText('75%')).toBeVisible() // Progress
    await expect(page.getByText('5 drawings')).toBeVisible()
    await expect(page.getByText('$125,000')).toBeVisible() // BoQ value

    await expect(page.getByText('Pump Station B')).toBeVisible()
    await expect(page.getByText('25%')).toBeVisible()
    await expect(page.getByText('2 drawings')).toBeVisible()
    await expect(page.getByText('$45,000')).toBeVisible()
  })

  test('should display recent activity feed', async ({ page }) => {
    // Verify activity section
    await expect(page.getByTestId('recent-activity')).toBeVisible()
    await expect(page.getByText('Recent Activity')).toBeVisible()

    // Check activity items
    await expect(page.getByText('New P&ID drawing created: Pump Station A')).toBeVisible()
    await expect(page.getByText('John Doe')).toBeVisible()

    await expect(page.getByText('BoQ updated for Project Alpha')).toBeVisible()
    await expect(page.getByText('Jane Smith')).toBeVisible()
  })

  test('should navigate to project details', async ({ page }) => {
    // Click on a project card
    await page.getByText('Water Treatment Plant A').click()

    // Should navigate to project page
    await expect(page).toHaveURL(/\/dashboard\/projects\/project-1/)
  })

  test('should create new project', async ({ page }) => {
    // Mock create project API
    await page.route('**/api/projects', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'project-new',
            name: 'New Project',
            status: 'draft',
            progress: 0
          })
        })
      }
    })

    // Click create new project button
    await page.getByRole('button', { name: /create new project/i }).click()

    // Fill in project details
    await page.getByLabel(/project name/i).fill('New Test Project')
    await page.getByLabel(/description/i).fill('E2E test project')
    await page.getByLabel(/client/i).fill('Test Client')

    // Submit form
    await page.getByRole('button', { name: /create project/i }).click()

    // Should redirect to new project
    await expect(page).toHaveURL(/\/dashboard\/projects\/project-new/)
  })

  test('should search projects', async ({ page }) => {
    // Use search box
    await page.getByPlaceholder(/search projects/i).fill('Water Treatment')

    // Verify search results
    await expect(page.getByText('Water Treatment Plant A')).toBeVisible()
    await expect(page.getByText('Pump Station B')).not.toBeVisible()

    // Clear search
    await page.getByPlaceholder(/search projects/i).clear()

    // Verify all projects are visible again
    await expect(page.getByText('Water Treatment Plant A')).toBeVisible()
    await expect(page.getByText('Pump Station B')).toBeVisible()
  })

  test('should filter projects by status', async ({ page }) => {
    // Open status filter
    await page.getByTestId('status-filter').click()

    // Select only active projects
    await page.getByLabel('Active').check()
    await page.getByLabel('Draft').uncheck()

    // Apply filter
    await page.getByRole('button', { name: /apply filter/i }).click()

    // Verify only active projects are visible
    await expect(page.getByText('Water Treatment Plant A')).toBeVisible()
    await expect(page.getByText('Pump Station B')).not.toBeVisible()
  })

  test('should access quick actions', async ({ page }) => {
    // Verify quick action buttons
    await expect(page.getByRole('button', { name: /create new project/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /new drawing/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /import drawing/i })).toBeVisible()

    // Test quick new drawing action
    await page.getByRole('button', { name: /new drawing/i }).click()
    await expect(page).toHaveURL(/\/dashboard\/drawings\/new/)
  })

  test('should display user profile menu', async ({ page }) => {
    // Click on user avatar
    await page.getByTestId('user-avatar').click()

    // Verify profile menu
    await expect(page.getByText('Test User')).toBeVisible()
    await expect(page.getByText('test@example.com')).toBeVisible()
    await expect(page.getByRole('menuitem', { name: /profile settings/i })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: /logout/i })).toBeVisible()

    // Test profile settings navigation
    await page.getByRole('menuitem', { name: /profile settings/i }).click()
    await expect(page).toHaveURL(/\/dashboard\/profile/)
  })

  test('should handle notifications', async ({ page }) => {
    // Mock notifications API
    await page.route('**/api/notifications', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          notifications: [
            {
              id: 'notif-1',
              type: 'drawing_shared',
              message: 'New drawing shared with you: Pump Station C',
              timestamp: '2024-01-15T11:00:00Z',
              read: false
            },
            {
              id: 'notif-2',
              type: 'boq_updated',
              message: 'BoQ costs updated for Project Beta',
              timestamp: '2024-01-15T10:30:00Z',
              read: true
            }
          ],
          unreadCount: 1
        })
      })
    })

    // Click notifications bell
    await page.getByTestId('notifications-bell').click()

    // Verify notifications panel
    await expect(page.getByTestId('notifications-panel')).toBeVisible()
    await expect(page.getByText('New drawing shared with you')).toBeVisible()
    await expect(page.getByText('BoQ costs updated')).toBeVisible()

    // Verify unread indicator
    await expect(page.getByTestId('unread-indicator')).toHaveText('1')

    // Mark notification as read
    await page.getByText('New drawing shared with you').click()
    await expect(page.getByTestId('unread-indicator')).not.toBeVisible()
  })

  test('should handle responsive layout', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Verify mobile navigation
    await expect(page.getByTestId('mobile-menu-button')).toBeVisible()
    await page.getByTestId('mobile-menu-button').click()
    await expect(page.getByTestId('mobile-menu')).toBeVisible()

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })

    // Verify tablet layout adjustments
    await expect(page.getByTestId('dashboard-grid')).toHaveClass(/tablet-layout/)

    // Back to desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.getByTestId('dashboard-grid')).toHaveClass(/desktop-layout/)
  })

  test('should handle data refresh', async ({ page }) => {
    // Click refresh button
    await page.getByTestId('refresh-dashboard').click()

    // Verify loading state
    await expect(page.getByTestId('loading-indicator')).toBeVisible()

    // Wait for data to reload
    await expect(page.getByTestId('loading-indicator')).not.toBeVisible()

    // Verify data is still displayed
    await expect(page.getByText('15')).toBeVisible() // Total projects
  })

  test('should handle error states gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/dashboard/stats', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      })
    })

    // Reload page
    await page.reload()

    // Verify error message is displayed
    await expect(page.getByText(/failed to load dashboard data/i)).toBeVisible()

    // Verify retry button
    await page.getByRole('button', { name: /retry/i }).click()
  })

  test('should handle real-time updates', async ({ page }) => {
    // Simulate real-time update via WebSocket
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('realtime-update', {
        detail: {
          type: 'project_status_changed',
          projectId: 'project-1',
          newStatus: 'completed',
          progress: 100
        }
      }))
    })

    // Verify update is reflected in UI
    await expect(page.getByText('100%')).toBeVisible()
    await expect(page.getByText('completed')).toBeVisible()
  })
})