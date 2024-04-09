const G_DOMAIN = new RegExp('guidde.com');

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) return;
  const url = new URL(tab.url);
  // Enables the side panel on guidde.com
  if (G_DOMAIN.test(url.origin)) {
    console.log("origin: "+url.origin);
    await chrome.sidePanel.setOptions({
      tabId,
      path: 'sidepanel.html',
      enabled: true
    });
  } else {
    // Disables the side panel on all other sites
    await chrome.sidePanel.setOptions({
      tabId,
      enabled: false
    });
  }
});

//receives the copied quickguidde.json and stores it locally for later processing
chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    if (request.type == "quickguidde"){
      chrome.storage.local.set(request.data);
    }
});



