const express = require("express");
const path = require("path");
const { renderPage } = require("./renderPage");
const { fetchAsset } = require("./fetchAsset");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/page", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("URL required");

  try {
    const html = await renderPage(url);
    res.send(html);
  } catch (e) {
    res.status(500).send(`<pre>${e.toString()}</pre>`);
  }
});

app.get("/asset", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.sendStatus(400);

  try {
    const { type, body } = await fetchAsset(url);
    res.set("Content-Type", type);
    res.send(body);
  } catch {
    res.sendStatus(500);
  }
});

app.use((_, res) => {
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log("Ultra SPA Browser running on port " + PORT);
});
