const { URL } = require("url");

module.exports = function rewrite(html, baseUrl) {
  let out = html;

  /* href / src / action */
  out = out.replace(
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

        if (
          attr.toLowerCase() === "href" &&
          (abs.endsWith(".html") || abs.endsWith("/") || !abs.match(/\.[a-z0-9]+$/i))
        ) {
          return `${attr}="/page?url=${encodeURIComponent(abs)}"`;
        }

        return `${attr}="/asset?url=${encodeURIComponent(abs)}"`;
      } catch {
        return m;
      }
    }
  );

  /* frame / iframe */
  out = out.replace(
    /<(frame|iframe)([^>]+)src=["']([^"']+)["']/gi,
    (m, tag, rest, src) => {
      try {
        const abs = new URL(src, baseUrl).href;
        return `<${tag}${rest}src="/page?url=${encodeURIComponent(abs)}"`;
      } catch {
        return m;
      }
    }
  );

  /* form target blank対策（安全側） */
  out = out.replace(
    /<form([^>]+)action=["']([^"']+)["']/gi,
    (m, rest, action) => {
      try {
        const abs = new URL(action, baseUrl).href;
        return `<form${rest}action="/page?url=${encodeURIComponent(abs)}"`;
      } catch {
        return m;
      }
    }
  );

  return out;
};
