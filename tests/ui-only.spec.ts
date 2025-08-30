import { test, expect } from '@playwright/test';

test.describe('UI Interface Tests (No Backend Required)', () => {
  test('welcome screen renders correctly', async ({ page }) => {
    await page.goto('/writing');
    
    // Check main elements are present
    await expect(page.locator('h1')).toContainText('AI IELTS Writing Coach');
    await expect(page.locator('h2')).toContainText('Choose Your Essay Question');
    
    // Check mode selection buttons
    await expect(page.locator('button').filter({ hasText: /Choose from Presets/i })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /Write Your Own/i })).toBeVisible();
    
    // Check preset questions are displayed
    const questionElements = page.locator('.p-4.rounded-xl.border-2');
    await expect(questionElements).toHaveCount(4);
    
    // Check start button exists and is enabled
    const startButton = page.locator('button[type="submit"]').filter({ hasText: /Start Planning/i });
    await expect(startButton).toBeVisible();
    await expect(startButton).toBeEnabled();
  });

  test('question selection changes visual state', async ({ page }) => {
    await page.goto('/writing');
    
    // Get all question cards
    const questionElements = page.locator('.p-4.rounded-xl.border-2');
    await expect(questionElements).toHaveCount(4);
    
    // First question should be selected by default (index 0) - has border-indigo-500
    await expect(questionElements.nth(0)).toHaveClass(/border-indigo-500/);
    
    // Click on second question
    await questionElements.nth(1).click();
    
    // Second question should now be selected
    await expect(questionElements.nth(1)).toHaveClass(/border-indigo-500/);
    
    // First question should no longer be selected (should have border-gray-200)
    await expect(questionElements.nth(0)).toHaveClass(/border-gray-200/);
  });

  test('mode switching works', async ({ page }) => {
    await page.goto('/writing');
    
    // Start in preset mode (default)
    const presetButton = page.locator('button').filter({ hasText: /Choose from Presets/i });
    const customButton = page.locator('button').filter({ hasText: /Write Your Own/i });
    
    // Preset mode should be active initially
    await expect(presetButton).toHaveClass(/bg-indigo-600/);
    await expect(customButton).not.toHaveClass(/bg-indigo-600/);
    
    // Click custom mode
    await customButton.click();
    
    // Custom mode should now be active
    await expect(customButton).toHaveClass(/bg-indigo-600/);
    await expect(presetButton).not.toHaveClass(/bg-indigo-600/);
    
    // Custom textarea should be visible
    await expect(page.locator('textarea')).toBeVisible();
    
    // Switch back to preset mode
    await presetButton.click();
    
    // Preset questions should be visible again
    await expect(page.locator('.p-4.rounded-xl.border-2')).toHaveCount(4);
  });

  test('custom question input works', async ({ page }) => {
    await page.goto('/writing');
    
    // Switch to custom mode
    const customButton = page.locator('button').filter({ hasText: /Write Your Own/i });
    await customButton.click();
    
    // Find textarea and enter custom question
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
    
    const customQuestion = "This is a custom IELTS question for testing purposes.";
    await textarea.fill(customQuestion);
    
    // Verify the question appears in the selected question display
    await expect(page.locator('.p-6.bg-gray-50')).toContainText(customQuestion);
    
    // Start button should be enabled
    const startButton = page.locator('button[type="submit"]');
    await expect(startButton).toBeEnabled();
  });

  test('selected question display updates correctly', async ({ page }) => {
    await page.goto('/writing');
    
    // Check initial selected question display
    const selectedQuestionDisplay = page.locator('.p-6.bg-gray-50');
    await expect(selectedQuestionDisplay).toBeVisible();
    await expect(selectedQuestionDisplay).toContainText('Selected Question:');
    
    // Click on different preset questions and verify display updates
    const questionElements = page.locator('.p-4.rounded-xl.border-2');
    
    // Click second question
    await questionElements.nth(1).click();
    
    // The selected question display should contain the second question text
    const secondQuestionText = await questionElements.nth(1).textContent();
    await expect(selectedQuestionDisplay).toContainText(secondQuestionText!);
  });

  test('form validation works', async ({ page }) => {
    await page.goto('/writing');
    
    // Switch to custom mode
    const customButton = page.locator('button').filter({ hasText: /Write Your Own/i });
    await customButton.click();
    
    // Clear the textarea
    const textarea = page.locator('textarea');
    await textarea.fill('');
    
    // Start button should be disabled when no question is entered
    const startButton = page.locator('button[type="submit"]');
    await expect(startButton).toBeDisabled();
    
    // Add some text
    await textarea.fill('Test question');
    
    // Start button should now be enabled
    await expect(startButton).toBeEnabled();
  });

  test('responsive design elements work', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/writing');
    
    // All essential elements should still be visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Mode buttons should stack vertically on mobile (flex-col)
    const modeContainer = page.locator('.flex.flex-col.sm\\:flex-row');
    await expect(modeContainer).toBeVisible();
    
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.reload();
    
    // Should work on desktop too
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});