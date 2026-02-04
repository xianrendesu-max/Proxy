const { getBrowser } = require("./browser");

const pool = new Map();

async function getPage(url) {
  if (pool.has(url)) return pool.get(url);

  const browser = await getBrowser();
  const page = await browser.newPage();

  await page.setBypassCSP(true);
  await page.setViewport({ width: 1280, height: 800 });

  pool.set(url, page);
  return page;
}

module.exports = { getPage };
