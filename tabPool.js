let nextId = 1;
const tabs = {};

function createTab(initialUrl) {
  const id = nextId++;
  tabs[id] = {
    id,
    url: initialUrl || null,
    createdAt: Date.now()
  };
  return tabs[id];
}

function getTab(id) {
  return tabs[id] || null;
}

function updateTab(id, url) {
  if (!tabs[id]) return null;
  tabs[id].url = url;
  return tabs[id];
}

function closeTab(id) {
  if (!tabs[id]) return false;
  delete tabs[id];
  return true;
}

function listTabs() {
  return Object.values(tabs);
}

module.exports = {
  createTab,
  getTab,
  updateTab,
  closeTab,
  listTabs
};
