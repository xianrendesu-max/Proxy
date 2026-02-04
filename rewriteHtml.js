const { URL } = require("url");

module.exports = function rewriteHtml(html, baseUrl) {
  return html
    .replace(
      /(href|src|action)=["']([^"']+)["']/gi,
      (m, attr, link) => {
        if (
          link.startsWith("data:") ||
          link.startsWith("mailto:") ||
          link.startsWith("javascript:")
        ) {
          return m;
        }

        try {
          const abs = new URL(link, baseUrl).href;
          const lower = attr.toLowerCase();

          if (lower === "href" && abs.match(/\.html?$|\/$/)) {
            return `${attr}="/page?url=${encodeURIComponent(abs)}"`;
          }

          return `${attr}="/asset?url=${encodeURIComponent(abs)}"`;
        } catch {
          return m;
        }
      }
    )
    .replace(
      /<frame([^>]+)src=["']([^"']+)["']/gi,
      (m, pre, src) => {
        try {
          const abs = new URL(src, baseUrl).href;
          return `<frame${pre}src="/page?url=${encodeURIComponent(abs)}"`;
        } catch {
          return m;
        }
      }
    );
};
