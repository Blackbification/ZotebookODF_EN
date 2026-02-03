// NotebookLM ↔ Zotero Sync - Background Service Worker

// Handle installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Zotero Sync] Extension installed', details.reason);
  
  // Set default settings
  chrome.storage.local.get(['settings'], (result) => {
    if (!result.settings) {
      chrome.storage.local.set({
        settings: {
          zoteroPort: 23119,
          autoMapOnLoad: true,
          includeAbstract: false,
          citekeyPrefix: ''
        }
      });
    }
  });
});

// Handle messages between popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Zotero Sync] Background received:', message.type);
  
  switch (message.type) {
    case 'NOTEBOOK_SOURCES':
      // Store sources for later use
      chrome.storage.session.set({ currentSources: message.sources });
      // Forward to popup if open
      forwardToPopup(message);
      break;
      
    case 'NOTEBOOK_RESPONSE':
      // Store response for later use
      chrome.storage.session.set({ currentResponse: message.response });
      // Forward to popup if open
      forwardToPopup(message);
      break;
      
    case 'ZOTERO_STATUS':
      // Forward Zotero connection status
      forwardToPopup(message);
      break;
  }
  
  return true;
});

// Forward message to popup (if open)
function forwardToPopup(message) {
  chrome.runtime.sendMessage(message).catch(() => {
    // Popup not open, ignore error
  });
}

// Check if we're on NotebookLM when tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('notebooklm.google.com')) {
    // Inject content script if needed
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['src/content.js']
    }).catch(() => {
      // Already injected or error
    });
  }
});

// Context menu for quick actions
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'zotero-sync-export',
    title: 'Exportar con citas Zotero',
    contexts: ['selection'],
    documentUrlPatterns: ['https://notebooklm.google.com/*']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'zotero-sync-export') {
    // Send selected text to content script for processing
    chrome.tabs.sendMessage(tab.id, {
      type: 'EXPORT_SELECTION',
      text: info.selectionText
    });
  }
});
