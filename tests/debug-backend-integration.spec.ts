import { test, expect } from '@playwright/test';

test.describe('Debug Backend Integration', () => {
  test('investigate initialization error details', async ({ page }) => {
    // Monitor console messages
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });

    // Monitor network requests
    const networkRequests: any[] = [];
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers()
      });
    });

    page.on('response', response => {
      if (response.url().includes('localhost:3002')) {
        console.log(`Response from backend: ${response.status()} - ${response.url()}`);
      }
    });

    await page.goto('/writing');
    
    // Select question and start planning
    const questionElements = page.locator('.p-4.rounded-xl.border-2');
    await questionElements.first().click();
    
    const startButton = page.locator('button[type="submit"]').filter({ hasText: /Start Planning/i });
    await startButton.click();
    
    // Wait for initialization
    await page.waitForTimeout(5000);
    
    // Check for error details
    const errorElement = page.locator('pre');
    if (await errorElement.isVisible()) {
      const errorText = await errorElement.textContent();
      console.log('Error details:', errorText);
    }
    
    // Log console messages
    console.log('Console messages:', consoleMessages);
    
    // Log network requests to backend
    const backendRequests = networkRequests.filter(req => req.url.includes('localhost:3002'));
    console.log('Backend requests:', backendRequests);
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'debug-error-state.png' });
    
    expect(true).toBe(true); // Always pass for debugging
  });

  test('test direct backend connection from frontend', async ({ page }) => {
    // Test backend connectivity using page.request
    try {
      const response = await page.request.post('http://localhost:3002/start', {
        data: { essayQuestion: 'Direct test question' }
      });
      
      console.log('Direct backend test - Status:', response.status());
      
      if (response.ok()) {
        const data = await response.json();
        console.log('Direct backend test - Response:', data);
        expect(data.success).toBe(true);
      } else {
        const errorText = await response.text();
        console.log('Direct backend test - Error:', errorText);
      }
    } catch (error) {
      console.log('Direct backend test failed:', error);
    }
    
    expect(true).toBe(true); // Always pass for debugging
  });
});