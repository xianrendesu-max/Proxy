const { URL } = require("url");

module.exports = function rewriteHtml(html, baseUrl) {
  return html
    /* CSP meta のみ削除（やりすぎない） */
    .replace(
      /<meta[^>]+http-equiv=["']Content-Security-Policy["'][^>]*>/gi,
      ""
    )

    /* ナビゲーション用属性のみ書き換え */
    .replace(
      /(href|action)=["']([^"']+)["']/gi,
      (m, attr, link) => {
        if (
          link.startsWith("data:") ||
          link.startsWith("mailto:") ||
          link.startsWith("javascript:") ||
          link.startsWith("#")
        ) return m;

        try {
          const abs = new URL(link, baseUrl).href;
          return `${attr}="/page?url=${encodeURIComponent(abs)}"`;
        } catch {
          return m;
        }
      }
    )

    /* src は asset だが link rel=pre* は除外 */
    .replace(
      /<script[^>]+src=["']([^"']+)["'][^>]*>/gi,
      (m, src) => {
        try {
          const abs = new URL(src, baseUrl).href;
          return m.replace(
            src,
            `/asset?url=${encodeURIComponent(abs)}`
          );
        } catch {
          return m;
        }
      }
    )

    .replace(
      /<img[^>]+src=["']([^"']+)["'][^>]*>/gi,
      (m, src) => {
        try {
          const abs = new URL(src, baseUrl).href;
          return m.replace(
            src,
            `/asset?url=${encodeURIComponent(abs)}`
          );
        } catch {
          return m;
        }
      }
    );
};
