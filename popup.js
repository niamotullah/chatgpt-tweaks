// popup.js
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggle");
  const statusDiv = document.getElementById("status");

  // Load current state
  chrome.storage.local.get(["featureEnabled"], (result) => {
    const enabled = result.featureEnabled !== false;
    toggle.checked = enabled;
    updateButtonStatus();
  });

  // Toggle change handler
  toggle.addEventListener("change", () => {
    const enabled = toggle.checked;
    chrome.storage.local.set({ featureEnabled: enabled });

    // Send to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "toggle", enabled });
      }
    });
    updateButtonStatus();
  });

  function updateButtonStatus() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: () => {
            const selectors = [
              'button[data-testid="send-button"]',
              'button[aria-label="Send message"]',
              'button[class*="composer"]',
              'form button[type="submit"]',
            ];
            for (const sel of selectors) {
              const btn = document.querySelector(sel);
              if (btn) return btn.disabled ? "Disabled" : "Enabled";
            }
            return "Not found";
          },
        },
        (results) => {
          if (chrome.runtime.lastError || !results[0]) {
            statusDiv.textContent = "No access";
          } else {
            statusDiv.textContent = `Button: ${results[0].result}`;
          }
        },
      );
    });
  }
});
