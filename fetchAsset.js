const fetch = require("node-fetch");

module.exports = async function fetchAsset(req, res) {
  const url = req.query.url;
  if (!url) return res.sendStatus(400);

  try {
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const ct = r.headers.get("content-type");
    if (ct) res.set("Content-Type", ct);

    r.body.pipe(res);
  } catch {
    res.sendStatus(500);
  }
};
