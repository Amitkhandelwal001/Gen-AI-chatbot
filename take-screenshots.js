import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    console.log("Capturing Auth Page...");
    await page.goto('http://localhost:3000/auth.html', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'public/screenshot-auth.png' });

    console.log("Setting dummy token...");
    await page.evaluate(() => {
      localStorage.setItem('personaToken', 'test_user');
    });

    console.log("Capturing Chat Page...");
    await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'public/screenshot-chat.png' });

    await browser.close();
    console.log("✅ Screenshots captured successfully.");
  } catch (error) {
    console.error("❌ Error capturing screenshots:", error);
    process.exit(1);
  }
})();
