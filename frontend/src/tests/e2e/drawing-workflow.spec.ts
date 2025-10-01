import { test, expect } from '@playwright/test'

test.describe('Drawing Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/dashboard')
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-jwt-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'engineer'
      }))
    })

    // Mock API responses for drawings
    await page.route('**/api/drawings', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          drawings: [
            {
              id: 'drawing-123',
              name: 'Test P&ID Drawing',
              nodes: [],
              edges: [],
              metadata: {
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z'
              }
            }
          ]
        })
      })
    })

    await page.goto('/dashboard/drawings')
  })

  test('should create a new drawing', async ({ page }) => {
    // Click create new drawing button
    await page.getByRole('button', { name: /create new drawing/i }).click()

    // Fill in drawing details
    await page.getByLabel(/drawing name/i).fill('Test P&ID Drawing')
    await page.getByLabel(/description/i).fill('E2E test drawing')

    // Mock create drawing API
    await page.route('**/api/drawings', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'new-drawing-123',
            name: 'Test P&ID Drawing',
            description: 'E2E test drawing',
            nodes: [],
            edges: []
          })
        })
      }
    })

    // Submit form
    await page.getByRole('button', { name: /create drawing/i }).click()

    // Should redirect to drawing editor
    await expect(page).toHaveURL(/\/dashboard\/drawings\/new-drawing-123/)
  })

  test('should open existing drawing', async ({ page }) => {
    // Find and click on existing drawing
    await page.getByText('Test P&ID Drawing').click()

    // Should navigate to drawing editor
    await expect(page).toHaveURL(/\/dashboard\/drawings\/drawing-123/)

    // Verify drawing canvas is loaded
    await expect(page.getByTestId('drawing-canvas')).toBeVisible()
    await expect(page.getByTestId('symbol-library')).toBeVisible()
    await expect(page.getByTestId('toolbar')).toBeVisible()
  })

  test('should add symbols from library to canvas', async ({ page }) => {
    await page.goto('/dashboard/drawings/drawing-123')

    // Mock symbol library API
    await page.route('**/api/symbols', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          symbols: [
            {
              id: 'valve-symbol-1',
              name: 'Gate Valve',
              category: 'Valves',
              svgContent: '<svg><rect width="50" height="50" /></svg>'
            }
          ]
        })
      })
    })

    // Open symbol library
    await page.getByTestId('symbol-library-toggle').click()
    await expect(page.getByTestId('symbol-library')).toBeVisible()

    // Select valve category
    await page.getByText('Valves').click()

    // Drag gate valve to canvas
    const gateValve = page.getByText('Gate Valve')
    const canvas = page.getByTestId('drawing-canvas')

    await gateValve.dragTo(canvas, {
      targetPosition: { x: 200, y: 200 }
    })

    // Verify node was added to canvas
    await expect(page.getByTestId('flow-node-valve')).toBeVisible()
  })

  test('should modify symbol properties', async ({ page }) => {
    await page.goto('/dashboard/drawings/drawing-123')

    // Mock canvas with existing valve
    await page.evaluate(() => {
      const canvas = document.querySelector('[data-testid="drawing-canvas"]')
      if (canvas) {
        const valve = document.createElement('div')
        valve.setAttribute('data-testid', 'flow-node-valve-1')
        valve.setAttribute('data-node-id', 'valve-1')
        valve.style.position = 'absolute'
        valve.style.left = '200px'
        valve.style.top = '200px'
        valve.style.width = '50px'
        valve.style.height = '50px'
        valve.style.backgroundColor = 'blue'
        valve.textContent = 'Valve'
        canvas.appendChild(valve)
      }
    })

    // Click on valve to select it
    await page.getByTestId('flow-node-valve-1').click()

    // Property panel should appear
    await expect(page.getByTestId('property-panel')).toBeVisible()

    // Modify valve size
    await page.getByLabel(/size/i).fill('6"')

    // Modify material
    await page.getByLabel(/material/i).selectOption('Stainless Steel')

    // Verify changes are applied
    await expect(page.getByDisplayValue('6"')).toBeVisible()
    await expect(page.getByDisplayValue('Stainless Steel')).toBeVisible()
  })

  test('should connect symbols with pipes', async ({ page }) => {
    await page.goto('/dashboard/drawings/drawing-123')

    // Mock canvas with two symbols
    await page.evaluate(() => {
      const canvas = document.querySelector('[data-testid="drawing-canvas"]')
      if (canvas) {
        // Add valve
        const valve = document.createElement('div')
        valve.setAttribute('data-testid', 'flow-node-valve-1')
        valve.style.position = 'absolute'
        valve.style.left = '100px'
        valve.style.top = '200px'
        valve.style.width = '50px'
        valve.style.height = '50px'
        valve.style.backgroundColor = 'blue'
        valve.textContent = 'Valve'
        canvas.appendChild(valve)

        // Add pump
        const pump = document.createElement('div')
        pump.setAttribute('data-testid', 'flow-node-pump-1')
        pump.style.position = 'absolute'
        pump.style.left = '300px'
        pump.style.top = '200px'
        pump.style.width = '50px'
        pump.style.height = '50px'
        pump.style.backgroundColor = 'red'
        pump.textContent = 'Pump'
        canvas.appendChild(pump)
      }
    })

    // Select pipe tool
    await page.getByRole('button', { name: /pipe tool/i }).click()

    // Click on valve outlet
    await page.getByTestId('flow-node-valve-1').click({ position: { x: 50, y: 25 } })

    // Click on pump inlet
    await page.getByTestId('flow-node-pump-1').click({ position: { x: 0, y: 25 } })

    // Verify pipe connection is created
    await expect(page.getByTestId('flow-edge-pipe')).toBeVisible()
  })

  test('should save drawing changes', async ({ page }) => {
    await page.goto('/dashboard/drawings/drawing-123')

    // Mock save API
    await page.route('**/api/drawings/drawing-123', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'drawing-123',
            name: 'Test P&ID Drawing',
            saved: true,
            lastSaved: new Date().toISOString()
          })
        })
      }
    })

    // Make some changes (add a valve)
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('drawingChanged', {
        detail: { hasUnsavedChanges: true }
      }))
    })

    // Save drawing
    await page.getByRole('button', { name: /save/i }).click()

    // Verify save success message
    await expect(page.getByText(/drawing saved successfully/i)).toBeVisible()
  })

  test('should handle auto-save functionality', async ({ page }) => {
    await page.goto('/dashboard/drawings/drawing-123')

    // Enable auto-save
    await page.getByLabel(/auto.save/i).check()

    // Mock auto-save API
    await page.route('**/api/drawings/drawing-123/auto-save', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ autoSaved: true })
      })
    })

    // Make changes to trigger auto-save
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('drawingChanged', {
        detail: { hasUnsavedChanges: true }
      }))
    })

    // Wait for auto-save indicator
    await expect(page.getByText(/auto.saved/i)).toBeVisible({ timeout: 10000 })
  })

  test('should handle zoom and pan operations', async ({ page }) => {
    await page.goto('/dashboard/drawings/drawing-123')

    // Test zoom in
    await page.getByRole('button', { name: /zoom in/i }).click()

    // Test zoom out
    await page.getByRole('button', { name: /zoom out/i }).click()

    // Test fit to view
    await page.getByRole('button', { name: /fit view/i }).click()

    // Test mouse wheel zoom
    await page.getByTestId('drawing-canvas').hover()
    await page.mouse.wheel(0, -120) // Zoom in
    await page.mouse.wheel(0, 120)  // Zoom out

    // Test pan with mouse drag
    const canvas = page.getByTestId('drawing-canvas')
    await canvas.hover()
    await page.mouse.down()
    await page.mouse.move(100, 100)
    await page.mouse.up()
  })

  test('should validate symbol connections', async ({ page }) => {
    await page.goto('/dashboard/drawings/drawing-123')

    // Mock validation API
    await page.route('**/api/drawings/validate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          valid: false,
          errors: [
            {
              type: 'invalid_connection',
              message: 'Valve outlet cannot connect to tank inlet',
              elementIds: ['valve-1', 'tank-1']
            }
          ],
          warnings: [
            {
              type: 'pressure_mismatch',
              message: 'Pressure ratings do not match',
              elementIds: ['valve-1', 'pipe-1']
            }
          ]
        })
      })
    })

    // Trigger validation
    await page.getByRole('button', { name: /validate drawing/i }).click()

    // Check validation results
    await expect(page.getByText(/validation results/i)).toBeVisible()
    await expect(page.getByText(/invalid connection/i)).toBeVisible()
    await expect(page.getByText(/pressure mismatch/i)).toBeVisible()
  })

  test('should export drawing to different formats', async ({ page }) => {
    await page.goto('/dashboard/drawings/drawing-123')

    // Open export menu
    await page.getByRole('button', { name: /export/i }).click()

    // Test PDF export
    const downloadPromise = page.waitForEvent('download')
    await page.getByText(/export as pdf/i).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/\.pdf$/)

    // Test SVG export
    const svgDownloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: /export/i }).click()
    await page.getByText(/export as svg/i).click()
    const svgDownload = await svgDownloadPromise
    expect(svgDownload.suggestedFilename()).toMatch(/\.svg$/)
  })
})