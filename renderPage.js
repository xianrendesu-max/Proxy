const { getPage } = require("./tabPool");
const { rewriteHtml } = require("./rewriteHtml");

async function renderPage(url) {
  const page = await getPage(url);

  await page.goto(url, {
    waitUntil: "networkidle2",
    timeout: 60000
  });

  const html = await page.content();
  return rewriteHtml(html, url);
}

module.exports = { renderPage };
