const { URL } = require("url");

module.exports = function rewriteHtml(html, baseUrl) {
  return html
    /* CSP メタ削除 */
    .replace(
      /<meta[^>]+http-equiv=["']Content-Security-Policy["'][^>]*>/gi,
      ""
    )
    /* CSP ヘッダ削除対策 */
    .replace(/content-security-policy/gi, "")
    /* base 強制 */
    .replace(
      /<head>/i,
      `<head>
<base href="/asset?url=${encodeURIComponent(baseUrl)}">
<script>
window.__ORIGIN__=${JSON.stringify(baseUrl)};
</script>`
    )
    /* href/src/action 全書き換え */
    .replace(
      /(href|src|action)=["']([^"']+)["']/gi,
      (m, attr, link) => {
        if (
          link.startsWith("data:") ||
          link.startsWith("mailto:") ||
          link.startsWith("javascript:")
        ) return m;
        try {
          const abs = new URL(link, baseUrl).href;
          return `${attr}="/asset?url=${encodeURIComponent(abs)}"`;
        } catch {
          return m;
        }
      }
    );
};
