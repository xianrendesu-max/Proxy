const express = require("express");
const fetch = require("node-fetch");
const { URL } = require("url");

const app = express();
const PORT = process.env.PORT || 3000;

/* 静的ファイル */
app.use(express.static("public"));

/* ===== HTMLページ（JSONにしない / 加工しない） ===== */
app.get("/page", async (req, res) => {
  const target = req.query.url;
  if (!target) {
    res.status(400).end("url required");
    return;
  }

  let url;
  try {
    url = new URL(target);
  } catch {
    res.status(400).end("invalid url");
    return;
  }

  try {
    const r = await fetch(url.href, {
      redirect: "follow",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "accept": "*/*"
      }
    });

    /* ステータス維持 */
    res.status(r.status);

    /* 危険・邪魔なヘッダだけ除去 */
    r.headers.forEach((value, key) => {
      if (
        key.toLowerCase() === "content-encoding" ||
        key.toLowerCase() === "content-security-policy" ||
        key.toLowerCase() === "x-frame-options"
      ) {
        return;
      }
      res.setHeader(key, value);
    });

    /* ★最重要：HTMLをJSONにしない／そのまま流す */
    r.body.pipe(res);
  } catch (e) {
    res.status(502).end("fetch failed");
  }
});

/* ===== CSS / JS / 画像 ===== */
app.get("/asset", async (req, res) => {
  const target = req.query.url;
  if (!target) {
    res.status(400).end();
    return;
  }

  try {
    const r = await fetch(target, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
      }
    });

    res.status(r.status);

    r.headers.forEach((value, key) => {
      if (
        key.toLowerCase() === "content-encoding" ||
        key.toLowerCase() === "content-security-policy"
      ) {
        return;
      }
      res.setHeader(key, value);
    });

    r.body.pipe(res);
  } catch {
    res.status(502).end();
  }
});

app.listen(PORT, () => {
  console.log("Light SPA Browser running on " + PORT);
});
