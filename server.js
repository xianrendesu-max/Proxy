const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

/* ===== 静的ファイル ===== */
app.use(express.static("public"));

/* ===== ページ取得 ===== */
app.get("/page", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("no url");

  try {
    const r = await fetch(url, { redirect: "follow" });
    const html = await r.text();

    res.set("Content-Type", "text/html; charset=UTF-8");
    res.send(html);
  } catch (e) {
    res.status(500).send(String(e));
  }
});

/* ===== アセット取得 ===== */
app.get("/asset", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("no url");

  try {
    const r = await fetch(url, { redirect: "follow" });

    res.set("Content-Type", r.headers.get("content-type") || "application/octet-stream");
    r.body.pipe(res);
  } catch (e) {
    res.status(500).send(String(e));
  }
});

/* ===== ★核心：相対パス完全吸収 ===== */
app.get("/*", async (req, res) => {
  const referer = req.headers.referer;
  if (!referer) return res.status(404).send("no referer");

  try {
    const base = new URL(referer);
    const target = new URL(req.originalUrl, base).toString();

    const r = await fetch(target, { redirect: "follow" });

    res.set("Content-Type", r.headers.get("content-type") || "text/html");
    r.body.pipe(res);
  } catch (e) {
    res.status(500).send(String(e));
  }
});

app.listen(PORT, () => {
  console.log("running on", PORT);
});
