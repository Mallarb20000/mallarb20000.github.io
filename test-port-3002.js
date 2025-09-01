const { chromium } = require('playwright');

async function testPort3002() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Clear any existing data
  await context.clearCookies();
  
  try {
    console.log('Navigating to http://localhost:3002/ (root on new port)');
    
    await page.goto('http://localhost:3002/', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    
    console.log('Current URL:', page.url());
    
    // Wait for React to load
    await page.waitForTimeout(2000);
    
    // Check what we have
    const title = await page.title();
    console.log('Page title:', title);
    
    const h1Text = await page.locator('h1').first().textContent();
    console.log('H1 text:', h1Text);
    
    const bodyText = await page.locator('body').textContent();
    console.log('Page text (first 200 chars):', bodyText.substring(0, 200));
    
    // Look for our components
    const textarea = await page.locator('textarea').count();
    console.log('Textarea count:', textarea);
    
    // Keep browser open for inspection
    console.log('Success! Browser will stay open for 10 seconds for inspection...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testPort3002();