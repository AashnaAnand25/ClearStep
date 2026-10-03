const status = document.getElementById("status");
if (location.protocol !== "chrome-extension:") {
  status.textContent =
    "The website uses its own server. For local AI, run Ollama and pull qwen2.5:7b. Connection settings apply only to the Chrome extension.";
  document.getElementById("save").disabled = true;
} else {
  document.getElementById("id").textContent = chrome.runtime.id;
  chrome.storage.local.get("backend").then(({ backend }) => {
    if (backend) document.getElementById("backend").value = backend;
  });
  document.getElementById("save").addEventListener("click", async () => {
    try {
      const value = document.getElementById("backend").value.trim().replace(/\/$/, "");
      const url = new URL(value);
      if (url.origin !== value || (url.protocol !== "https:" && value !== "http://127.0.0.1:3000"))
        throw Error();
      const allowed = await chrome.permissions.request({ origins: [`${url.origin}/*`] });
      if (!allowed) {
        status.textContent = "Connection permission was not granted.";
        return;
      }
      await chrome.storage.local.set({ backend: url.origin });
      status.textContent = "Connection saved. Reopen the companion to use it.";
    } catch {
      status.textContent = "Use an HTTPS origin, or http://127.0.0.1:3000 for local mode.";
    }
  });
}
