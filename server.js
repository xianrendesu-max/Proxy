const express = require("express");
const compression = require("compression");
const morgan = require("morgan");
const puppeteer = require("puppeteer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

let maintenance = false;
const logs = [];

// Middleware
app.use(compression());
app.use(morgan("combined"));
app.use(express.static("public"));
app.use(express.json());

// 管理者ログインチェック
function isAdmin(req) {
  return req.query.admin === "sennin";
}

// Maintenance middleware
app.use((req, res, next) => {
  if (maintenance && !isAdmin(req) && !req.path.startsWith("/error")) {
    return res.redirect("/error.html");
  }
  next();
});

// Puppeteer browser pool
let browserPromise = puppeteer.launch({
  headless: "new",
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-web-security",
    "--disable-features=IsolateOrigins,site-per-process"
  ]
});

// Render a page with Puppeteer
app.get("/page", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.sendFile(path.join(__dirname, "public/error.html"));

  logs.push({ time: new Date(), url, ip: req.ip });

  try {
    const browser = await browserPromise;
    const page = await browser.newPage();

    // Bot回避用
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
    );
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    });

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    const content = await page.content();
    await page.close();

    res.send(content);
  } catch (e) {
    console.error("Page fetch error:", e);
    res.sendFile(path.join(__dirname, "public/error.html"));
  }
});

// Admin log page
app.get("/admin", (req, res) => {
  if (!isAdmin(req)) return res.status(403).send("Forbidden");

  let html = `<h1>Admin Logs</h1>
  <button onclick="toggleMaintenance()">${maintenance ? "Disable" : "Enable"} Maintenance</button>
  <ul>`;
  logs.forEach(l => {
    html += `<li>${l.time.toISOString()} - ${l.url} - ${l.ip}</li>`;
  });
  html += `</ul>
  <script>
    async function toggleMaintenance() {
      await fetch('/maintenance', { method:'POST' });
      location.reload();
    }
  </script>`;
  res.send(html);
});

// Toggle maintenance mode
app.post("/maintenance", (req, res) => {
  maintenance = !maintenance;
  res.json({ maintenance });
});

// Start server
app.listen(PORT, () => {
  console.log(`Sennin Puppeteer Browser running on port ${PORT}`);
});
