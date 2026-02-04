import { TabPool } from "./tabPool.js";

const pool = new TabPool(
  document.getElementById("tabs"),
  document.getElementById("frames")
);

function normalize(v) {
  if (v.startsWith("http")) return v;
  if (v.includes(".") && !v.includes(" "))
    return "https://" + v;
  return "https://www.google.com/search?q=" + encodeURIComponent(v);
}

export function go(value) {
  const input = value || address.value;
  pool.navigate(normalize(input));
}

window.addEventListener("message", e => {
  if (e.data?.type === "navigate") go(e.data.value);
});

document.getElementById("newTab").onclick = () => pool.newTab();
address.addEventListener("keydown", e => {
  if (e.key === "Enter") go();
});
