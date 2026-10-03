(function () {
  if (globalThis.clearstepListening) {
    chrome.runtime
      .sendMessage({
        type: "field-selected",
        fieldId: globalThis.clearstepFieldIdFor(document.activeElement),
      })
      .catch(() => {});
    return;
  }
  globalThis.clearstepListening = true;
  // Only a canonical field ID leaves this page. No URL, label text, or answers.
  document.addEventListener("focusin", (event) => {
    const fieldId = globalThis.clearstepFieldIdFor(event.target);
    chrome.runtime.sendMessage({ type: "field-selected", fieldId }).catch(() => {});
  });
  const fieldId = globalThis.clearstepFieldIdFor(document.activeElement);
  chrome.runtime.sendMessage({ type: "field-selected", fieldId }).catch(() => {});
})();
