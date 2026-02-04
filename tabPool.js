export class TabPool {
  constructor(tabsEl, framesEl) {
    this.tabsEl = tabsEl;
    this.framesEl = framesEl;
    this.tabs = {};
    this.active = null;
    this.id = 0;
    this.newTab();
  }

  newTab() {
    const id = this.id++;
    const tab = document.createElement("div");
    tab.className = "tab";
    tab.textContent = "New Tab";
    tab.onclick = () => this.activate(id);

    const iframe = document.createElement("iframe");
    iframe.src = "/page?url=https://example.com";

    this.tabs[id] = { tab, iframe };
    this.tabsEl.insertBefore(tab, newTab);
    this.framesEl.appendChild(iframe);
    this.activate(id);
  }

  activate(id) {
    this.active = id;
    Object.values(this.tabs).forEach(t => {
      t.tab.classList.remove("active");
      t.iframe.classList.remove("active");
    });
    this.tabs[id].tab.classList.add("active");
    this.tabs[id].iframe.classList.add("active");
  }

  navigate(url) {
    const t = this.tabs[this.active];
    t.iframe.src = "/page?url=" + encodeURIComponent(url);
    t.tab.textContent = new URL(url).hostname;
  }
}
