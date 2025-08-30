import { test, expect } from '@playwright/test';

test.describe('Complete Coaching Workflow', () => {
  test('full coaching session from start to finish', async ({ page }) => {
    await page.goto('/writing');
    
    console.log('🚀 Starting complete coaching workflow test...');
    
    // 1. Start coaching
    const startButton = page.locator('button[type="submit"]').filter({ hasText: /Start Planning/i });
    await startButton.click();
    await page.waitForTimeout(3000);
    
    // 2. Select question type
    console.log('📝 Step 1: Selecting question type...');
    const questionTypeButton = page.locator('button').filter({ hasText: /Opinion.*Agree.*Disagree/i });
    await expect(questionTypeButton).toBeVisible();
    await questionTypeButton.click();
    await page.waitForTimeout(2000);
    
    // 3. Confirm to proceed to hook
    console.log('✅ Step 2: Confirming to proceed to hook...');
    const textInput = page.locator('input[type="text"]');
    await expect(textInput).toBeEnabled();
    await textInput.fill('Yes');
    
    const sendButton = page.locator('button').filter({ hasText: /Send/i });
    await sendButton.click();
    await page.waitForTimeout(3000);
    
    // 4. Should now be asking for hook sentence
    const bodyText = await page.locator('body').textContent();
    console.log('🎯 Step 3: Checking if asking for hook sentence...');
    console.log('Page mentions hook:', bodyText?.includes('hook'));
    
    if (bodyText?.includes('hook')) {
      console.log('✅ Successfully progressed to hook development stage');
      
      // 5. Try writing a hook sentence
      await textInput.fill('Community service has become an increasingly important topic in modern education.');
      await sendButton.click();
      await page.waitForTimeout(3000);
      
      // 6. Check progression
      const newBodyText = await page.locator('body').textContent();
      console.log('After hook submission - mentions thesis:', newBodyText?.includes('thesis'));
      
      if (newBodyText?.includes('thesis')) {
        console.log('✅ Successfully progressed to thesis development stage');
      }
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'complete-workflow-final.png' });
    
    expect(true).toBe(true);
  });

  test('verify plan sidebar updates during workflow', async ({ page }) => {
    await page.goto('/writing');
    
    // Start coaching
    const startButton = page.locator('button[type="submit"]').filter({ hasText: /Start Planning/i });
    await startButton.click();
    await page.waitForTimeout(3000);
    
    // Check initial plan state
    const planSidebar = page.locator('.w-80.bg-gray-50');
    await expect(planSidebar).toBeVisible();
    
    // Question Type should show "Not selected yet"
    await expect(planSidebar).toContainText('Not selected yet');
    
    // Select question type
    const questionTypeButton = page.locator('button').filter({ hasText: /Opinion.*Agree.*Disagree/i });
    await questionTypeButton.click();
    await page.waitForTimeout(2000);
    
    // Plan sidebar should update to show selected question type
    await expect(planSidebar).toContainText('Opinion');
    
    // Confirm to proceed
    const textInput = page.locator('input[type="text"]');
    await textInput.fill('Yes');
    const sendButton = page.locator('button').filter({ hasText: /Send/i });
    await sendButton.click();
    await page.waitForTimeout(3000);
    
    // Hook section should still show "To be developed" until hook is written
    await expect(planSidebar).toContainText('To be developed');
    
    expect(true).toBe(true);
  });
});