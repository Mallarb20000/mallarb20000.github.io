import { test, expect } from '@playwright/test';

test.describe('UI Interface Tests (No Backend Required)', () => {
  test('welcome screen renders correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check main elements are present
    await expect(page.locator('h2')).toContainText('IELTS WRITING TASK 2');
    
    // Check main UI elements exist
    await expect(page.locator('.prompt-box')).toBeVisible();
    await expect(page.locator('.editor-container')).toBeVisible();
    await expect(page.locator('.planning-pad')).toBeVisible();
    
    // Check essential buttons
    await expect(page.locator('button').filter({ hasText: /Change Question/i })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /Analyze/i })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /Clear/i })).toBeVisible();
  });

  test('question display works', async ({ page }) => {
    await page.goto('/');
    
    // Check that the question prompt box is visible
    const promptBox = page.locator('.prompt-box');
    await expect(promptBox).toBeVisible();
    
    // Check that the question text is displayed
    const questionText = page.locator('.prompt-text p');
    await expect(questionText).toBeVisible();
    
    // Verify the question is not the default loading text
    await expect(questionText).not.toContainText('Loading question...');
  });

  test('planning pad functionality works', async ({ page }) => {
    await page.goto('/');
    
    // Check planning pad is visible
    const planningPad = page.locator('.planning-pad');
    await expect(planningPad).toBeVisible();
    
    // Check planning questions exist
    const planningQuestions = page.locator('.planning-question');
    await expect(planningQuestions).toHaveCount(6); // 6 planning questions
    
    // Test that we can type in the first planning textarea
    const firstTextarea = page.locator('.answer-textarea').first();
    await firstTextarea.fill('Opinion essay');
    await expect(firstTextarea).toHaveValue('Opinion essay');
  });

  test('essay editor functionality works', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the structured essay editor to load
    await page.waitForSelector('.structured-essay-editor', { timeout: 10000 });
    
    // Check that the introduction section exists
    const introSection = page.locator('[data-section="introduction"]');
    await expect(introSection).toBeVisible();
    
    // Test writing in the introduction
    const introTextarea = introSection.locator('textarea');
    await introTextarea.fill('This is my introduction paragraph.');
    await expect(introTextarea).toHaveValue('This is my introduction paragraph.');
  });

  test('button interactions work', async ({ page }) => {
    await page.goto('/');
    
    // Test Change Question button
    const changeQuestionBtn = page.locator('button').filter({ hasText: /Change Question/i });
    await expect(changeQuestionBtn).toBeEnabled();
    
    // Test Clear button
    const clearBtn = page.locator('button').filter({ hasText: /Clear/i });
    await expect(clearBtn).toBeEnabled();
    
    // Test Analyze button (should be disabled initially with no content)
    const analyzeBtn = page.locator('button').filter({ hasText: /Analyze/i });
    await expect(analyzeBtn).toBeDisabled();
  });

  test('chat interface toggle works', async ({ page }) => {
    await page.goto('/');
    
    // Find and click the chat button
    const chatButton = page.locator('button').filter({ hasText: /Chat with AI Coach/i });
    await expect(chatButton).toBeVisible();
    await chatButton.click();
    
    // Chat panel should be visible
    await expect(page.locator('.fixed.right-4.bottom-4')).toBeVisible();
    
    // Check chat header
    await expect(page.locator('h3')).toContainText('AI IELTS Coach');
  });

  test('responsive design elements work', async ({ page }) => {
    await page.goto('/');
    
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Main content should still be visible
    await expect(page.locator('.main-content')).toBeVisible();
    
    // Planning toggle button should be visible on mobile
    const planningToggle = page.locator('.planning-toggle-btn');
    // Note: might be hidden initially on mobile, but button should exist
    await expect(planningToggle).toBeVisible();
  });
});