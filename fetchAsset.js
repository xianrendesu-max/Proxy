const fetch = require("node-fetch");

async function fetchAsset(url) {
  const r = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122",
      "Accept": "*/*",
      "Accept-Language": "ja,en;q=0.9",
      "Referer": url,
      "Origin": new URL(url).origin
    }
  });

  const type = r.headers.get("content-type") || "application/octet-stream";
  const body = await r.buffer();

  return { type, body };
}

module.exports = { fetchAsset };
