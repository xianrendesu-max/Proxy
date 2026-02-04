const puppeteer = require("puppeteer");

let browser;

async function getBrowser() {
  if (browser) return browser;

  browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process"
    ]
  });

  return browser;
}

module.exports = { getBrowser };
