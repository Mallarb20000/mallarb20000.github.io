import { test, expect } from '@playwright/test';

test.describe('Simple Workflow Check', () => {
  test('check what happens after start button click', async ({ page }) => {
    await page.goto('/writing');
    
    console.log('1. On welcome page');
    await page.screenshot({ path: 'step1-welcome.png' });
    
    // Click start button
    const startButton = page.locator('button[type="submit"]').filter({ hasText: /Start Planning/i });
    await expect(startButton).toBeVisible();
    await startButton.click();
    
    console.log('2. Clicked start button, waiting...');
    await page.waitForTimeout(5000); // Wait longer
    
    await page.screenshot({ path: 'step2-after-start.png' });
    
    // Log what's on the page now
    const allH1s = await page.locator('h1').allTextContents();
    const allH2s = await page.locator('h2').allTextContents();
    const allButtons = await page.locator('button').allTextContents();
    
    console.log('H1 elements:', allH1s);
    console.log('H2 elements:', allH2s);
    console.log('Button elements:', allButtons);
    
    // Check URL
    console.log('Current URL:', page.url());
    
    // Check for error messages
    const errorElements = await page.locator('h1').filter({ hasText: /Error/i }).count();
    console.log('Error elements found:', errorElements);
    
    if (errorElements > 0) {
      const errorText = await page.locator('pre').textContent();
      console.log('Error details:', errorText);
    }
    
    expect(true).toBe(true);
  });
});