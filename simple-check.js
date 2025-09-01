const { chromium } = require('playwright');

async function quickCheck() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Quick check of http://localhost:3002/');
    await page.goto('http://localhost:3002/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    console.log('Current URL:', page.url());
    
    // Wait for page to load
    await page.waitForTimeout(5000);
    
    // Check if we can see the body text
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('Page contains text:', bodyText.length > 0);
    console.log('First 300 characters:', bodyText.substring(0, 300));
    
    // Check for specific elements without timeout
    const hasMain = await page.locator('.main-content').count() > 0;
    const hasPlanning = await page.locator('.planning-pad').count() > 0;
    const hasChatButton = await page.locator('.chat-button').count() > 0;
    
    console.log('Elements found:');
    console.log('- Main content:', hasMain);
    console.log('- Planning pad:', hasPlanning);
    console.log('- Chat button:', hasChatButton);
    
    // Keep browser open briefly for manual check
    console.log('Keeping browser open for 5 seconds...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

quickCheck();