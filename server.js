const express = require("express");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

/* ===============================
   基本設定
================================ */
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

/* ===============================
   Puppeteer 起動（安全構成）
================================ */
let browser;

async function getBrowser() {
  if (browser) return browser;

  browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-zygote",
      "--single-process"
    ]
  });

  return browser;
}

/* ===============================
   HTML エスケープ
================================ */
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, s => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[s]));
}

/* ===============================
   Puppeteer レンダリング
================================ */
async function renderWithPuppeteer(url) {
  const browser = await getBrowser();
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/127 Safari/537.36"
  );

  await page.setExtraHTTPHeaders({
    "accept-language": "ja,en-US;q=0.9,en;q=0.8"
  });

  await page.setBypassCSP(true);
  await page.setJavaScriptEnabled(true);

  page.setDefaultNavigationTimeout(15000);
  page.setDefaultTimeout(10000);

  try {
    await page.goto(url, {
      waitUntil: "networkidle2"
    });

    const html = await page.content();
    await page.close();
    return html;

  } catch (err) {
    await page.close();
    throw err;
  }
}

/* ===============================
   ページ取得 API
================================ */
app.get("/page", async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.sendFile(path.join(__dirname, "public/error.html"));
  }

  try {
    const html = await renderWithPuppeteer(url);
    res.setHeader("Content-Type", "text/html; charset=UTF-8");
    res.send(html);
  } catch (e) {
    console.error("Puppeteer error:", e.message);
    res.redirect("/error.html");
  }
});

/* ===============================
   home / error 明示ルート
================================ */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/home.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public/home.html"));
});

app.get("/error.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public/error.html"));
});

/* ===============================
   Cannot GET 完全防止
================================ */
app.use((req, res) => {
  res.redirect("/error.html");
});

/* ===============================
   起動
================================ */
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

/* ===============================
   終了処理
================================ */
process.on("SIGINT", async () => {
  if (browser) await browser.close();
  process.exit();
});
