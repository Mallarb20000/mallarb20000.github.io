import { test, expect } from '@playwright/test';

test.describe('Backend Response Debug', () => {
  test('check what backend returns after question type selection', async ({ page }) => {
    // First, start a chat session
    const startResponse = await page.request.post('http://localhost:3002/start', {
      data: { essayQuestion: 'Some people believe that unpaid community service should be a compulsory part of high school programmes. To what extent do you agree or disagree?' }
    });
    
    const startData = await startResponse.json();
    console.log('Start response:', startData);
    
    const chatId = startData.data.chatId;
    
    // Now send a question type selection
    const messageResponse = await page.request.post(`http://localhost:3002/${chatId}/message`, {
      data: { message: 'Opinion (Agree or Disagree)' }
    });
    
    const messageData = await messageResponse.json();
    console.log('Message response:', JSON.stringify(messageData, null, 2));
    
    // Check if response contains the expected format tags
    const responseText = messageData.data.response;
    console.log('Response text:', responseText);
    console.log('Contains PLAN_UPDATE:', responseText.includes('[PLAN_UPDATE:'));
    console.log('Contains STATE_UPDATE:', responseText.includes('[STATE_UPDATE:'));
    console.log('Plan updates:', messageData.data.planUpdates);
    console.log('Next state:', messageData.data.nextState);
    
    expect(messageData.success).toBe(true);
  });
});