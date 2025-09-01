const { chromium } = require('playwright');

async function checkConsoleErrors() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capture console messages
  page.on('console', msg => {
    console.log(`Console ${msg.type()}: ${msg.text()}`);
  });
  
  // Capture errors
  page.on('pageerror', error => {
    console.log(`Page Error: ${error.message}`);
  });
  
  try {
    console.log('Navigating to http://localhost:3001...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    
    // Wait for React to load
    await page.waitForTimeout(3000);
    
    console.log('Page loaded. Checking DOM...');
    
    // Get the full HTML to see what's actually there
    const bodyHTML = await page.locator('body').innerHTML();
    console.log('Body HTML length:', bodyHTML.length);
    console.log('First 500 chars of body:', bodyHTML.substring(0, 500));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

checkConsoleErrors();