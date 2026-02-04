const { URL } = require("url");

function abs(u, base) {
  try {
    return new URL(u, base).toString();
  } catch {
    return u;
  }
}

function rewriteHtml(html, baseUrl) {
  return html
    .replace(/<base[^>]*>/gi, "")
    .replace(/<meta[^>]+Content-Security-Policy[^>]*>/gi, "")
    .replace(/<a\s+[^>]*href=["']([^"']+)["']/gi, (m, u) => {
      if (u.startsWith("javascript:")) return m;
      const url = abs(u, baseUrl);
      return m.replace(u, `/page?url=${encodeURIComponent(url)}`);
    })
    .replace(/<form\s+[^>]*action=["']([^"']+)["']/gi, (m, u) => {
      const url = abs(u, baseUrl);
      return m.replace(u, `/page?url=${encodeURIComponent(url)}`);
    });
}

module.exports = { rewriteHtml };
