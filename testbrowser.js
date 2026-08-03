const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Show browser
    defaultViewport: null,
    args: ['--start-maximized'],
  });

  const page = await browser.newPage();
  await page.goto('https://example.com', { waitUntil: 'load' });

  console.log("🟢 Page loaded. Browser should stay open.");

  // Prevent browser from closing
  await new Promise(() => {});
})();
