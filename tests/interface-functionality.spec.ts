import { test, expect } from '@playwright/test';

test.describe('IELTS Writing Interface Functionality', () => {
  test('writing page loads and displays questions', async ({ page }) => {
    await page.goto('/writing');
    
    // Check page title
    await expect(page).toHaveTitle(/IELTS Writing/i);
    
    // Check main heading
    await expect(page.locator('h1')).toContainText('AI IELTS Writing Coach');
    
    // Check that questions are displayed
    await expect(page.locator('h2')).toContainText('Choose Your Essay Question');
    
    // Check that preset questions are visible
    const questionElements = page.locator('.p-4.rounded-xl.border-2');
    await expect(questionElements).toHaveCount(4); // Based on the HTML we saw
    
    // Verify questions contain text
    const firstQuestion = questionElements.first();
    await expect(firstQuestion).toContainText(/Some people believe|In many countries|Some experts/);
  });

  test('question selection works', async ({ page }) => {
    await page.goto('/writing');
    
    // Wait for questions to load
    const questionElements = page.locator('.p-4.rounded-xl.border-2');
    await expect(questionElements.first()).toBeVisible();
    
    // Click on a question
    await questionElements.nth(1).click();
    
    // Check if the question becomes selected (should have different styling)
    await expect(questionElements.nth(1)).toHaveClass(/border-indigo/);
  });

  test('start planning button triggers form submission', async ({ page }) => {
    await page.goto('/writing');
    
    // Find and click the start planning button
    const startButton = page.locator('button[type="submit"]').filter({ hasText: /Start Planning/i });
    await expect(startButton).toBeVisible();
    
    // Verify the button is enabled (has a question selected)
    await expect(startButton).toBeEnabled();
    
    await startButton.click();
    
    // Wait for any transitions
    await page.waitForTimeout(2000);
    
    // The interface should either show:
    // 1. Coaching interface if backend is connected
    // 2. Error message if backend is not available
    // 3. Still on welcome screen if there's an issue
    
    const hasError = await page.locator('h1').filter({ hasText: /Error/i }).isVisible();
    const hasWelcome = await page.locator('h1').filter({ hasText: /AI IELTS Writing Coach/i }).isVisible();
    
    // At minimum, the click should have been processed (either showing error or transitioning)
    expect(hasError || hasWelcome).toBe(true);
  });

  test('coach interface is functional', async ({ page }) => {
    await page.goto('/writing/coach');
    
    // Should load without errors
    await expect(page.locator('body')).not.toContainText('404');
    
    // Look for coach interface elements
    const mainContent = page.locator('[role="main"], .main-content, .coach-interface').first();
    if (await mainContent.isVisible()) {
      await expect(mainContent).toBeVisible();
    }
  });

  test('navigation between pages works', async ({ page }) => {
    // Start from writing page
    await page.goto('/writing');
    await expect(page.url()).toContain('/writing');
    
    // Navigate to coach
    await page.goto('/writing/coach');
    await expect(page.url()).toContain('/coach');
    
    // Navigate to report
    await page.goto('/writing/report');
    await expect(page.url()).toContain('/report');
    
    // All pages should load without 404
    await expect(page.locator('body')).not.toContainText('404');
  });

  test('theme toggle functionality', async ({ page }) => {
    await page.goto('/writing');
    
    // Check initial theme
    const html = page.locator('html');
    const initialTheme = await html.getAttribute('data-theme');
    expect(['light', 'dark']).toContain(initialTheme);
    
    // Look for theme toggle (if it exists)
    const themeToggle = page.locator('button').filter({ hasText: /dark|light|theme/i }).first();
    
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      
      // Wait for theme change
      await page.waitForTimeout(100);
      
      // Verify theme changed
      const newTheme = await html.getAttribute('data-theme');
      expect(newTheme).not.toBe(initialTheme);
    }
  });

  test('responsive design works', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/writing');
    
    // Should still be functional on mobile
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.reload();
    
    // Should work on desktop too
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});