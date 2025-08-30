import { test, expect } from '@playwright/test';

test.describe('AI Format Debug', () => {
  test('test multiple AI responses for format compliance', async ({ page }) => {
    // Start a chat session
    const startResponse = await page.request.post('http://localhost:3002/start', {
      data: { essayQuestion: 'Some people believe that unpaid community service should be a compulsory part of high school programmes. To what extent do you agree or disagree?' }
    });
    
    const startData = await startResponse.json();
    const chatId = startData.data.chatId;
    
    console.log('Initial AI message:', startData.data.initialMessage);
    
    // Test different question type selections
    const questionTypes = [
      'Opinion (Agree or Disagree)',
      'Discussion (Discuss both views and give your opinion)',
      'Problem and Solution'
    ];
    
    for (const questionType of questionTypes) {
      // Send question type
      const response = await page.request.post(`http://localhost:3002/${chatId}/message`, {
        data: { message: questionType }
      });
      
      const data = await response.json();
      console.log(`\n=== Testing: ${questionType} ===`);
      console.log('AI Response:', data.data.response);
      console.log('Contains [PLAN_UPDATE:', data.data.response.includes('[PLAN_UPDATE:'));
      console.log('Plan Updates:', data.data.planUpdates);
      console.log('Next State:', data.data.nextState);
      
      // Check if response follows expected format
      if (data.data.response.includes('[PLAN_UPDATE:questionType]')) {
        console.log('✅ Correct format found!');
        break;
      } else {
        console.log('❌ Missing [PLAN_UPDATE:questionType] tag');
      }
      
      // Try confirming with "Yes" to see if that triggers state change
      const confirmResponse = await page.request.post(`http://localhost:3002/${chatId}/message`, {
        data: { message: 'Yes' }
      });
      
      const confirmData = await confirmResponse.json();
      console.log('Confirmation response:', confirmData.data.response);
      console.log('Contains [STATE_UPDATE:', confirmData.data.response.includes('[STATE_UPDATE:'));
      console.log('Next State after confirmation:', confirmData.data.nextState);
    }
    
    expect(true).toBe(true); // Always pass for debugging
  });
});