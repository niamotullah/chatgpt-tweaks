// content.js
(function () {
  let enabled = true; // default

  // Load initial state
  chrome.storage.local.get(["featureEnabled"], (result) => {
    enabled = result.featureEnabled !== false;
    if (enabled) startWatching();
  });

  // Listen for toggle changes
  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "toggle") {
      enabled = request.enabled;
      if (enabled) {
        startWatching();
        enableButton(); // immediate check
      } else {
        stopWatching();
      }
    }
  });

  let observer = null;
  const SELECTORS = [
    'button[data-testid="send-button"]',
    'button[aria-label="Send message"]',
    'button[class*="composer"]',
    'form button[type="submit"]',
  ];

  function enableButton() {
    if (!enabled) return;
    for (const sel of SELECTORS) {
      const btn = document.querySelector(sel);
      if (btn && btn.disabled) {
        btn.disabled = false;
        btn.removeAttribute("disabled");
        break;
      }
    }
  }

  function startWatching() {
    if (observer) return;
    observer = new MutationObserver(() => enableButton());
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["disabled", "class"],
    });
    enableButton(); // initial
  }

  function stopWatching() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }
})();
