const express = require("express");
const compression = require("compression");
const renderPage = require("./renderPage");
const fetchAsset = require("./fetchAsset");

const app = express();
const PORT = process.env.PORT || 3000;

/* gzip 圧縮 */
app.use(compression());

/* SPA ブラウザ UI */
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/browser.html");
});

/* HTML プロキシ */
app.get("/page", renderPage);

/* アセット完全中継 */
app.get("/asset", fetchAsset);

/* フォールバック */
app.use((req, res) => {
  res.status(404).send("Not Found");
});

app.listen(PORT, () => {
  console.log("light-spa-browser MAX running on port " + PORT);
});
