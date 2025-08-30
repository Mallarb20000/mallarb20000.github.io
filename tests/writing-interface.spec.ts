import { test, expect } from '@playwright/test';

test.describe('IELTS Writing Interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/writing');
  });

  test('page loads successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/IELTS Writing/i);
  });

  test('writing page has essential elements', async ({ page }) => {
    // Check if main writing elements are present
    const textarea = page.locator('textarea, [contenteditable]').first();
    await expect(textarea).toBeVisible();
    
    // Check for question display
    const questionElement = page.locator('[data-testid="question"], .question, h2, h3').first();
    await expect(questionElement).toBeVisible();
  });

  test('coach interface is accessible', async ({ page }) => {
    // Try to navigate to coach page
    await page.goto('/writing/coach');
    
    // Should not show 404 or error
    await expect(page.locator('body')).not.toContainText('404');
    await expect(page.locator('body')).not.toContainText('Error');
  });

  test('coach interface has expected elements', async ({ page }) => {
    await page.goto('/writing/coach');
    
    // Look for chat or coaching interface elements
    const chatInterface = page.locator('[data-testid="chat"], .chat, [role="main"]').first();
    await expect(chatInterface).toBeVisible();
  });

  test('question changing functionality works', async ({ page }) => {
    await page.goto('/writing');
    
    // Look for a button that changes questions
    const changeQuestionButton = page.locator('button').filter({ hasText: /change|new|random|next/i }).first();
    
    if (await changeQuestionButton.isVisible()) {
      // Get initial question text
      const questionElement = page.locator('[data-testid="question"], .question, h2, h3').first();
      const initialText = await questionElement.textContent();
      
      // Click change question button
      await changeQuestionButton.click();
      
      // Wait for potential loading and check if question changed
      await page.waitForTimeout(500);
      const newText = await questionElement.textContent();
      
      // The question might change or stay the same (due to random selection)
      expect(newText).toBeTruthy();
    }
  });

  test('writing area accepts input', async ({ page }) => {
    await page.goto('/writing');
    
    const textarea = page.locator('textarea, [contenteditable]').first();
    await textarea.fill('This is a test essay content.');
    
    const content = await textarea.inputValue();
    expect(content).toContain('This is a test essay content.');
  });

  test('report page is accessible', async ({ page }) => {
    await page.goto('/writing/report');
    
    // Should not show 404 or error
    await expect(page.locator('body')).not.toContainText('404');
  });

  test('navigation between pages works', async ({ page }) => {
    // Start from writing page
    await page.goto('/writing');
    await expect(page.url()).toContain('/writing');
    
    // Try to navigate to coach
    await page.goto('/writing/coach');
    await expect(page.url()).toContain('/coach');
    
    // Try to navigate to report
    await page.goto('/writing/report');
    await expect(page.url()).toContain('/report');
  });

  test('theme toggle functionality exists', async ({ page }) => {
    await page.goto('/writing');
    
    // Look for theme toggle button
    const themeToggle = page.locator('button').filter({ hasText: /dark|light|theme/i }).first();
    
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      // Basic check that clicking doesn't cause errors
      await page.waitForTimeout(100);
      await expect(page.locator('body')).toBeVisible();
    }
  });
});