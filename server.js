/**
 * Puppeteer Proxy Browser Server
 * Error fallback + verbose log
 */

const express = require("express");
const puppeteer = require("puppeteer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

/* ===== 静的ファイル ===== */
app.use(express.static(path.join(__dirname, "public")));

/* ===== / は必ず index.html ===== */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

/* ===== エラーログ保存（メモリ） ===== */
let lastErrorLog = "";

/* ===== Puppeteer Singleton ===== */
let browserPromise = null;

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-zygote",
        "--single-process",
        "--disable-features=IsolateOrigins,site-per-process"
      ]
    });
  }
  return browserPromise;
}

/* ===== HTML 取得 ===== */
app.get("/page", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    lastErrorLog = "URL parameter missing";
    return res.sendFile(path.join(__dirname, "public/error.html"));
  }

  let page;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
    );

    await page.setExtraHTTPHeaders({
      "accept-language": "ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7",
      "referer": "https://www.google.com/"
    });

    await page.setBypassCSP(true);

    await page.goto(targetUrl, {
      waitUntil: "networkidle2",
      timeout: 30000
    });

    await page.waitForTimeout(1500);

    const html = await page.content();
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.send(html);

  } catch (err) {
    /* ★ 詳細ログ保存 */
    lastErrorLog =
      `URL: ${targetUrl}\n\n` +
      err.stack;

    res.sendFile(path.join(__dirname, "public/error.html"));
  } finally {
    if (page) {
      try { await page.close(); } catch {}
    }
  }
});

/* ===== エラーログ取得用 API ===== */
app.get("/__error_log__", (req, res) => {
  res.setHeader("content-type", "text/plain; charset=utf-8");
  res.send(lastErrorLog || "No error log");
});

/* ===== asset 保険 ===== */
app.get("/asset", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.sendStatus(400);

  let page;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();
    const response = await page.goto(url, { timeout: 30000 });

    const buffer = await response.buffer();
    const headers = response.headers();
    if (headers["content-type"]) {
      res.setHeader("content-type", headers["content-type"]);
    }
    res.send(buffer);
  } catch (e) {
    lastErrorLog = e.stack;
    res.sendFile(path.join(__dirname, "public/error.html"));
  } finally {
    if (page) {
      try { await page.close(); } catch {}
    }
  }
});

/* ===== 最終ガード ===== */
app.use((req, res) => {
  res.redirect("/");
});

/* ===== 起動 ===== */
app.listen(PORT, () => {
  console.log("Puppeteer Browser running on port " + PORT);
});
