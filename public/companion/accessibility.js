// Read only display preferences. No form data is stored or transmitted.
function applyAccessibility() {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem("clearstep.accessibility") || "null") || {
      textSize: localStorage.getItem("clearstep.largeText") === "1" ? "large" : "default",
    };
  } catch {
    /* Keep defaults when storage is unavailable. */
  }
  document.documentElement.classList.toggle("text-large", saved.textSize === "large");
  document.documentElement.classList.toggle("high-contrast", saved.highContrast === true);
  document.documentElement.classList.toggle("reduce-motion", saved.reducedMotion === true);
}
applyAccessibility();
window.addEventListener("storage", applyAccessibility);
window.addEventListener("pageshow", applyAccessibility);
