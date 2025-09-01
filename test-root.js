const { chromium } = require('playwright');

async function testRootPage() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to http://localhost:3001...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    
    // Wait a moment for React to render
    await page.waitForTimeout(2000);
    
    // Check what's on the page
    const title = await page.title();
    console.log('Page title:', title);
    
    const h1Text = await page.locator('h1').first().textContent().catch(() => 'No H1 found');
    console.log('H1 text:', h1Text);
    
    const h2Text = await page.locator('h2').first().textContent().catch(() => 'No H2 found');
    console.log('H2 text:', h2Text);
    
    // Check for planning pad
    const planningPad = await page.locator('.planning-pad').count();
    console.log('Planning pad elements found:', planningPad);
    
    // Check for chat button
    const chatButton = await page.locator('.chat-button').count();
    console.log('Chat button elements found:', chatButton);
    
    // Check for structured essay editor
    const essayEditor = await page.locator('textarea').count();
    console.log('Textarea elements found:', essayEditor);
    
    // Take a screenshot
    await page.screenshot({ path: 'root-page-screenshot.png', fullPage: true });
    console.log('Screenshot saved as root-page-screenshot.png');
    
    // Wait 5 seconds so you can see the page
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testRootPage();