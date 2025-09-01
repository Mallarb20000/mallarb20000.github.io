const { chromium } = require('playwright');

async function forceRootNavigation() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Clear any existing data
  await context.clearCookies();
  
  // Capture console messages
  page.on('console', msg => {
    console.log(`Console ${msg.type()}: ${msg.text()}`);
  });
  
  // Capture errors
  page.on('pageerror', error => {
    console.log(`Page Error: ${error.message}`);
  });
  
  try {
    console.log('Navigating directly to http://localhost:3001/ (root)');
    
    // Force navigation to root with no-cache
    await page.goto('http://localhost:3001/', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    
    // Force reload to bypass any caching
    await page.reload({ waitUntil: 'networkidle' });
    
    console.log('Current URL:', page.url());
    
    // Wait for React to load
    await page.waitForTimeout(3000);
    
    // Check what we have
    const title = await page.title();
    console.log('Page title:', title);
    
    const bodyText = await page.locator('body').textContent();
    console.log('Page text (first 200 chars):', bodyText.substring(0, 200));
    
    // Look specifically for our components
    const mainContent = await page.locator('.main-content').count();
    console.log('main-content elements:', mainContent);
    
    const planningPad = await page.locator('.planning-pad').count();
    console.log('planning-pad elements:', planningPad);
    
    const appMain = await page.locator('.app-main').count();
    console.log('app-main elements:', appMain);
    
    // Keep browser open for manual inspection
    console.log('Browser will stay open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

forceRootNavigation();