import { test, expect } from '@playwright/test';

test.describe('Chat Interface Debug', () => {
  test('debug chat progression through question types', async ({ page }) => {
    // Monitor console for errors
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });

    // Monitor network requests
    page.on('request', request => {
      if (request.url().includes('localhost:3002')) {
        console.log('Request to backend:', request.method(), request.url());
      }
    });

    page.on('response', response => {
      if (response.url().includes('localhost:3002')) {
        console.log('Response from backend:', response.status(), response.url());
      }
    });

    await page.goto('/writing');
    
    // 1. Start the coaching process
    const startButton = page.locator('button[type="submit"]').filter({ hasText: /Start Planning/i });
    await startButton.click();
    
    // 2. Wait for coaching interface to load
    await page.waitForTimeout(3000);
    
    // 3. Take screenshot to see current state
    await page.screenshot({ path: 'chat-state-1.png' });
    
    // 4. Look for question type options
    const bodyText = await page.locator('body').textContent();
    console.log('Page contains "Opinion":', bodyText?.includes('Opinion'));
    console.log('Page contains "Discussion":', bodyText?.includes('Discussion'));
    console.log('Page contains "Problem":', bodyText?.includes('Problem'));
    
    // 5. Look for any input fields or buttons to interact with
    const allButtons = await page.locator('button').allTextContents();
    console.log('Available buttons:', allButtons);
    
    const allInputs = await page.locator('input, textarea').count();
    console.log('Number of input fields:', allInputs);
    
    // 6. Try to find and click a question type option
    const optionButtons = page.locator('button').filter({ hasText: /Opinion|Discussion|Problem|Advantage/i });
    const optionCount = await optionButtons.count();
    console.log('Found question type option buttons:', optionCount);
    
    if (optionCount > 0) {
      console.log('Clicking first option button...');
      await optionButtons.first().click();
      
      // Wait for response
      await page.waitForTimeout(2000);
      
      // Take another screenshot
      await page.screenshot({ path: 'chat-state-2.png' });
      
      // Check if interface progressed
      const newBodyText = await page.locator('body').textContent();
      console.log('After clicking option - contains "hook":', newBodyText?.includes('hook'));
      console.log('After clicking option - contains "thesis":', newBodyText?.includes('thesis'));
    }
    
    // 7. Try typing in any available text input
    const textInputs = page.locator('input[type="text"], textarea');
    const inputCount = await textInputs.count();
    
    if (inputCount > 0) {
      console.log('Found text input, trying to type...');
      await textInputs.first().fill('Opinion');
      
      // Look for send button
      const sendButton = page.locator('button').filter({ hasText: /Send|Submit/i });
      if (await sendButton.isVisible()) {
        await sendButton.click();
        await page.waitForTimeout(2000);
        
        console.log('Sent message via text input');
        await page.screenshot({ path: 'chat-state-3.png' });
      }
    }
    
    // Log any console errors
    const errors = consoleMessages.filter(msg => msg.includes('error:'));
    if (errors.length > 0) {
      console.log('Console errors found:', errors);
    }
    
    expect(true).toBe(true); // Always pass for debugging
  });
});