const fetch = require("node-fetch");
const rewriteHtml = require("./rewriteHtml");

module.exports = async function renderPage(req, res) {
  const url = req.query.url;
  if (!url) return res.status(400).send("URL required");

  try {
    const r = await fetch(url, {
      redirect: "follow",
      headers: {
        "user-agent": "Mozilla/5.0",
        "accept": "text/html,*/*"
      }
    });

    const html = await r.text();
    const rewritten = rewriteHtml(html, url);

    res.set("content-type", "text/html; charset=utf-8");
    res.send(rewritten);
  } catch (e) {
    res.status(500).send(
      `<h1>Page Load Failed</h1><pre>${e.toString()}</pre>`
    );
  }
};
