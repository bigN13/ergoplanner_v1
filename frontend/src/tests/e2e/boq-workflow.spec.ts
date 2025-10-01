import { test, expect } from '@playwright/test'

test.describe('BoQ Workflow', () => {
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

    // Mock BoQ API responses
    await page.route('**/api/projects/*/boq', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              id: 'boq-1',
              category: 'Valves',
              description: 'Gate Valve 6" Carbon Steel 150#',
              quantity: 2,
              unit: 'EA',
              unitPrice: 250.0,
              totalPrice: 500.0,
              linkedElements: ['valve-1', 'valve-2']
            },
            {
              id: 'boq-2',
              category: 'Pumps',
              description: 'Centrifugal Pump 100 GPM',
              quantity: 1,
              unit: 'EA',
              unitPrice: 1500.0,
              totalPrice: 1500.0,
              linkedElements: ['pump-1']
            }
          ],
          summary: {
            totalItems: 2,
            totalCost: 2000.0,
            categories: {
              'Valves': 500.0,
              'Pumps': 1500.0
            }
          }
        })
      })
    })

    await page.goto('/dashboard/projects/project-123/boq')
  })

  test('should display BoQ items and summary', async ({ page }) => {
    // Verify BoQ table is visible
    await expect(page.getByTestId('boq-table')).toBeVisible()

    // Check BoQ items are displayed
    await expect(page.getByText('Gate Valve 6" Carbon Steel 150#')).toBeVisible()
    await expect(page.getByText('Centrifugal Pump 100 GPM')).toBeVisible()

    // Verify quantities and prices
    await expect(page.getByText('2')).toBeVisible() // Valve quantity
    await expect(page.getByText('$250.00')).toBeVisible() // Valve unit price
    await expect(page.getByText('$500.00')).toBeVisible() // Valve total price
    await expect(page.getByText('$1,500.00')).toBeVisible() // Pump unit price

    // Check summary section
    await expect(page.getByTestId('boq-summary')).toBeVisible()
    await expect(page.getByText('Total Items: 2')).toBeVisible()
    await expect(page.getByText('Total Cost: $2,000.00')).toBeVisible()
  })

  test('should edit BoQ item quantities', async ({ page }) => {
    // Mock update API
    await page.route('**/api/projects/*/boq/*', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'boq-1',
            category: 'Valves',
            description: 'Gate Valve 6" Carbon Steel 150#',
            quantity: 3, // Updated quantity
            unit: 'EA',
            unitPrice: 250.0,
            totalPrice: 750.0, // Updated total
            linkedElements: ['valve-1', 'valve-2']
          })
        })
      }
    })

    // Click on quantity cell for valve
    const quantityCell = page.getByRole('cell', { name: '2' }).first()
    await quantityCell.dblclick()

    // Edit quantity
    const quantityInput = page.getByRole('textbox').filter({ hasText: '2' })
    await quantityInput.fill('3')
    await quantityInput.press('Enter')

    // Verify updated values
    await expect(page.getByText('3')).toBeVisible()
    await expect(page.getByText('$750.00')).toBeVisible()

    // Check that total cost is recalculated
    await expect(page.getByText('Total Cost: $2,250.00')).toBeVisible()
  })

  test('should add new BoQ item manually', async ({ page }) => {
    // Mock create API
    await page.route('**/api/projects/*/boq', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'boq-3',
            category: 'Piping',
            description: '4" Carbon Steel Pipe',
            quantity: 100,
            unit: 'FT',
            unitPrice: 15.0,
            totalPrice: 1500.0,
            linkedElements: []
          })
        })
      }
    })

    // Click add new item button
    await page.getByRole('button', { name: /add item/i }).click()

    // Fill in new item details
    await page.getByLabel(/category/i).selectOption('Piping')
    await page.getByLabel(/description/i).fill('4" Carbon Steel Pipe')
    await page.getByLabel(/quantity/i).fill('100')
    await page.getByLabel(/unit/i).selectOption('FT')
    await page.getByLabel(/unit price/i).fill('15.00')

    // Submit form
    await page.getByRole('button', { name: /save item/i }).click()

    // Verify new item appears in table
    await expect(page.getByText('4" Carbon Steel Pipe')).toBeVisible()
    await expect(page.getByText('100')).toBeVisible()
    await expect(page.getByText('FT')).toBeVisible()
    await expect(page.getByText('$15.00')).toBeVisible()
  })

  test('should delete BoQ item', async ({ page }) => {
    // Mock delete API
    await page.route('**/api/projects/*/boq/boq-2', async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({ status: 204 })
      }
    })

    // Find pump item row and click delete button
    const pumpRow = page.getByText('Centrifugal Pump 100 GPM').locator('..').locator('..')
    await pumpRow.getByRole('button', { name: /delete/i }).click()

    // Confirm deletion
    await page.getByRole('button', { name: /confirm/i }).click()

    // Verify item is removed
    await expect(page.getByText('Centrifugal Pump 100 GPM')).not.toBeVisible()

    // Check updated total
    await expect(page.getByText('Total Cost: $500.00')).toBeVisible()
  })

  test('should filter BoQ items by category', async ({ page }) => {
    // Open category filter
    await page.getByTestId('category-filter').click()

    // Select only Valves
    await page.getByLabel('Valves').check()
    await page.getByLabel('Pumps').uncheck()

    // Apply filter
    await page.getByRole('button', { name: /apply filter/i }).click()

    // Verify only valve items are visible
    await expect(page.getByText('Gate Valve 6" Carbon Steel 150#')).toBeVisible()
    await expect(page.getByText('Centrifugal Pump 100 GPM')).not.toBeVisible()

    // Check filtered summary
    await expect(page.getByText('Showing 1 of 2 items')).toBeVisible()
  })

  test('should search BoQ items', async ({ page }) => {
    // Use search box
    await page.getByPlaceholder(/search items/i).fill('Centrifugal')

    // Verify search results
    await expect(page.getByText('Centrifugal Pump 100 GPM')).toBeVisible()
    await expect(page.getByText('Gate Valve 6" Carbon Steel 150#')).not.toBeVisible()

    // Clear search
    await page.getByPlaceholder(/search items/i).clear()

    // Verify all items are visible again
    await expect(page.getByText('Gate Valve 6" Carbon Steel 150#')).toBeVisible()
    await expect(page.getByText('Centrifugal Pump 100 GPM')).toBeVisible()
  })

  test('should perform bulk operations', async ({ page }) => {
    // Select multiple items
    await page.getByRole('checkbox').first().check() // Select valve
    await page.getByRole('checkbox').nth(1).check() // Select pump

    // Open bulk actions menu
    await page.getByRole('button', { name: /bulk actions/i }).click()

    // Apply bulk price adjustment
    await page.getByText(/adjust prices/i).click()
    await page.getByLabel(/adjustment percentage/i).fill('10')
    await page.getByRole('button', { name: /apply/i }).click()

    // Verify prices are updated
    await expect(page.getByText('$275.00')).toBeVisible() // Valve price +10%
    await expect(page.getByText('$1,650.00')).toBeVisible() // Pump price +10%
  })

  test('should export BoQ to different formats', async ({ page }) => {
    // Click export button
    await page.getByRole('button', { name: /export/i }).click()

    // Test Excel export
    const excelDownloadPromise = page.waitForEvent('download')
    await page.getByText(/export to excel/i).click()
    const excelDownload = await excelDownloadPromise
    expect(excelDownload.suggestedFilename()).toMatch(/\.xlsx?$/)

    // Test CSV export
    await page.getByRole('button', { name: /export/i }).click()
    const csvDownloadPromise = page.waitForEvent('download')
    await page.getByText(/export to csv/i).click()
    const csvDownload = await csvDownloadPromise
    expect(csvDownload.suggestedFilename()).toMatch(/\.csv$/)

    // Test PDF export
    await page.getByRole('button', { name: /export/i }).click()
    const pdfDownloadPromise = page.waitForEvent('download')
    await page.getByText(/export to pdf/i).click()
    const pdfDownload = await pdfDownloadPromise
    expect(pdfDownload.suggestedFilename()).toMatch(/\.pdf$/)
  })

  test('should sync BoQ with drawing changes', async ({ page }) => {
    // Navigate to drawing page
    await page.goto('/dashboard/drawings/drawing-123')

    // Mock drawing API with BoQ sync
    await page.route('**/api/drawings/*/sync-boq', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          syncedItems: 3,
          newItems: 1,
          updatedItems: 1,
          removedItems: 0
        })
      })
    })

    // Simulate adding a new valve to drawing
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('nodeAdded', {
        detail: {
          id: 'valve-3',
          type: 'valve',
          data: {
            size: '4"',
            material: 'Stainless Steel',
            pressure: '300#'
          }
        }
      }))
    })

    // Trigger BoQ sync
    await page.getByRole('button', { name: /sync boq/i }).click()

    // Verify sync success message
    await expect(page.getByText(/boq synchronized successfully/i)).toBeVisible()
    await expect(page.getByText(/1 new item added/i)).toBeVisible()
  })

  test('should show cost optimization suggestions', async ({ page }) => {
    // Mock optimization API
    await page.route('**/api/projects/*/boq/optimize', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          suggestions: [
            {
              id: 'opt-1',
              type: 'bulk_discount',
              description: 'Consider bulk purchase for gate valves (5+ units)',
              potentialSavings: 125.0,
              confidence: 0.85,
              items: ['boq-1']
            },
            {
              id: 'opt-2',
              type: 'alternative_material',
              description: 'Alternative material could reduce costs by 15%',
              potentialSavings: 200.0,
              confidence: 0.70,
              items: ['boq-2']
            }
          ],
          totalPotentialSavings: 325.0
        })
      })
    })

    // Click optimization button
    await page.getByRole('button', { name: /optimize costs/i }).click()

    // Verify optimization suggestions appear
    await expect(page.getByTestId('optimization-panel')).toBeVisible()
    await expect(page.getByText(/bulk purchase for gate valves/i)).toBeVisible()
    await expect(page.getByText(/alternative material/i)).toBeVisible()
    await expect(page.getByText(/Total Potential Savings: \$325\.00/i)).toBeVisible()

    // Apply optimization suggestion
    await page.getByText(/bulk purchase for gate valves/i).click()
    await page.getByRole('button', { name: /apply suggestion/i }).click()

    // Verify optimization is applied
    await expect(page.getByText(/optimization applied/i)).toBeVisible()
  })

  test('should handle offline/online sync states', async ({ page }) => {
    // Simulate offline state
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      })
      window.dispatchEvent(new Event('offline'))
    })

    // Try to make changes while offline
    const quantityCell = page.getByRole('cell', { name: '2' }).first()
    await quantityCell.dblclick()
    const quantityInput = page.getByRole('textbox').filter({ hasText: '2' })
    await quantityInput.fill('3')
    await quantityInput.press('Enter')

    // Verify offline indicator
    await expect(page.getByText(/offline - changes will sync when online/i)).toBeVisible()

    // Simulate coming back online
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      })
      window.dispatchEvent(new Event('online'))
    })

    // Verify sync notification
    await expect(page.getByText(/syncing offline changes/i)).toBeVisible()
    await expect(page.getByText(/all changes synced/i)).toBeVisible()
  })
})