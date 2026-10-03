const allowed = new Set(["multiple-jobs", "other-income", "extra-withholding"]);
chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;
  chrome.sidePanel.open({ tabId: tab.id });
  chrome.storage.session
    .set({ selection: { tabId: tab.id, fieldId: null, error: "" } })
    .then(() =>
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["detect.js", "content.js"],
      }),
    )
    .catch(() => {
      chrome.storage.session.set({
        selection: {
          tabId: tab.id,
          fieldId: null,
          error:
            "This page cannot be read. Use an HTML form; browser PDF viewers and protected pages are not supported.",
        },
      });
    });
});
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (message.type === "field-selected" && sender.tab?.id) {
    chrome.storage.session.set({
      selection: {
        tabId: sender.tab.id,
        fieldId: allowed.has(message.fieldId) ? message.fieldId : null,
        error: "",
      },
    });
  }
  if (
    message.type === "explain-field" &&
    !sender.tab &&
    allowed.has(message.fieldId) &&
    ["explain", "simpler", "find"].includes(message.mode)
  ) {
    chrome.storage.local
      .get("backend")
      .then(({ backend }) => {
        const base = backend || "http://127.0.0.1:3000";
        const url = new URL(base);
        if (url.origin !== base || (url.protocol !== "https:" && base !== "http://127.0.0.1:3000"))
          throw Error();
        return fetch(`${base}/api/field-help`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fieldId: message.fieldId, mode: message.mode }),
          signal: AbortSignal.timeout(65000),
        });
      })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(respond)
      .catch(() => respond({ error: "Start ClearStep on port 3000 and Ollama, then try again." }));
    return true;
  }
});
