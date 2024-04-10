/*
 * Guidde Extractor
 *
 * Copyright 2024 Conrad Noack
 *
 * Apr 10 2024
 *
 * this software relies on:
 *
 *   JSZip v3.10.1 - A JavaScript class for generating and reading zip files
 *   Copyright (c) 2009-2016 Stuart Knightley, David Duponchel, Franz Buchinger, António Afonso
 *   <http://stuartk.com/jszip>
 *
 *   FileSaver.js
 *   A saveAs() FileSaver implementation.
 *   By Eli Grey, http://eligrey.com
 *
 *   Tiny Slider
 *   https://github.com/ganlanyuan/tiny-slider
 *   Copyright (c) 2021 William Lin
 *
 * All MIT licensed
 *
 */


const G_DOMAIN = new RegExp('guidde.com');

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) return;
  const url = new URL(tab.url);
  // Enables the side panel on guidde.com
  if (G_DOMAIN.test(url.origin)) {
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



