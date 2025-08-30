import { test, expect } from '@playwright/test';

test.describe('Debug Interface', () => {
  test('debug start planning button behavior', async ({ page }) => {
    await page.goto('/writing');
    
    // Log initial state
    console.log('Initial URL:', page.url());
    
    // Take screenshot before clicking
    await page.screenshot({ path: 'before-click.png' });
    
    // Find and click the start planning button
    const startButton = page.locator('button[type="submit"]').filter({ hasText: /Start Planning/i });
    await expect(startButton).toBeVisible();
    
    console.log('Found start button');
    
    await startButton.click();
    console.log('Clicked start button');
    
    // Wait and check what happens
    await page.waitForTimeout(2000);
    
    // Take screenshot after clicking
    await page.screenshot({ path: 'after-click.png' });
    
    // Log current URL
    console.log('URL after click:', page.url());
    
    // Log current page content
    const bodyText = await page.locator('body').textContent();
    console.log('Body text contains coach:', bodyText?.includes('Coach'));
    console.log('Body text contains chat:', bodyText?.includes('chat'));
    console.log('Body text contains planning:', bodyText?.includes('planning'));
    
    // Check what elements are visible
    const allH1s = await page.locator('h1').allTextContents();
    console.log('All H1 elements:', allH1s);
    
    const allButtons = await page.locator('button').allTextContents();
    console.log('All button texts:', allButtons);
    
    // Always pass this test - it's just for debugging
    expect(true).toBe(true);
  });
});