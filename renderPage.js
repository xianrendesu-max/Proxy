const rewrite = require("./rewrite");

module.exports = async function renderPage(fetchRes, baseUrl, res) {
  let html = "";

  try {
    html = await fetchRes.text();
  } catch (e) {
    res.statusCode = 500;
    res.end("Failed to read HTML");
    return;
  }

  try {
    html = rewrite(html, baseUrl);
  } catch (e) {
    // rewrite 失敗しても素HTMLは返す
  }

  res.end(html);
};
