const express = require("express");
const fetch = require("node-fetch");
const compression = require("compression");
const rewriteHtml = require("./rewriteHtml");
const fetchAsset = require("./fetchAsset");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());
app.use(express.static("public"));

/* ===== HTML ページ ===== */
app.get("/page", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.sendStatus(400);

  try {
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const ct = r.headers.get("content-type") || "text/html";
    res.set("Content-Type", ct);

    if (!ct.includes("text/html")) {
      r.body.pipe(res);
      return;
    }

    let html = await r.text();
    html = rewriteHtml(html, url);

    res.send(html);
  } catch (e) {
    res.status(500).send("Fetch failed");
  }
});

/* ===== CSS / JS / 画像 ===== */
app.get("/asset", fetchAsset);

app.listen(PORT, () => {
  console.log("Light SPA Browser running on port " + PORT);
});
