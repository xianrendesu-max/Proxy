const fetch = require("node-fetch");
const renderPage = require("./renderPage");
const rewrite = require("./rewrite");

module.exports = async function browser(req, res) {
  const url = req.query.url;
  if (!url) {
    res.statusCode = 400;
    res.end("URL required");
    return;
  }

  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const contentType = r.headers.get("content-type") || "text/html";
    res.setHeader("Content-Type", contentType);

    if (!contentType.includes("text/html")) {
      r.body.pipe(res);
      return;
    }

    await renderPage(r, url, res);
  } catch (e) {
    res.statusCode = 500;
    res.end("Browser fetch failed");
  }
};
