const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
const { URL } = require("url");

const app = express();
const PORT = process.env.PORT || 3000;

// 静的HTML
app.use(express.static(__dirname));

/**
 * HTML内のURLを書き換える関数
 */
function rewriteHtml(html, baseUrl) {
  return html.replace(
    /(href|src)=["']([^"']+)["']/gi,
    (match, attr, link) => {
      // data:, mailto:, javascript: は無視
      if (
        link.startsWith("data:") ||
        link.startsWith("mailto:") ||
        link.startsWith("javascript:")
      ) {
        return match;
      }

      try {
        const absoluteUrl = new URL(link, baseUrl).href;
        return `${attr}="/proxy?url=${encodeURIComponent(absoluteUrl)}"`;
      } catch {
        return match;
      }
    }
  );
}

// プロキシ本体
app.get("/proxy", async (req, res) => {
  const target = req.query.url;
  if (!target) {
    res.status(400).send("URLが指定されていません");
    return;
  }

  let response;
  try {
    response = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });
  } catch {
    res.status(500).send("取得エラー");
    return;
  }

  const contentType = response.headers.get("content-type") || "";

  // HTML → 書き換え
  if (contentType.includes("text/html")) {
    const html = await response.text();
    const rewritten = rewriteHtml(html, target);
    res.set("content-type", "text/html; charset=utf-8");
    res.send(rewritten);
    return;
  }

  // CSS / JS / 画像 / フォント → そのまま転送
  res.set("content-type", contentType);
  response.body.pipe(res);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
