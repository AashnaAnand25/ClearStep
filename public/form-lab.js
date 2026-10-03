const frame = document.getElementById("companion");
let selected = null;
function select(id) {
  selected = id;
  document
    .querySelectorAll(".field-card")
    .forEach((card) => card.classList.toggle("active", card.dataset.field === id));
  frame.contentWindow.postMessage({ type: "clearstep-field", fieldId: id }, location.origin);
}
document
  .querySelectorAll("input,select")
  .forEach((input) => input.addEventListener("focus", () => select(input.id)));
document.querySelectorAll("[data-help]").forEach((button) =>
  button.addEventListener("click", () => {
    document.getElementById(button.dataset.help).focus();
    if (window.innerWidth < 850 && !document.body.classList.contains("extension-mode"))
      frame.scrollIntoView({ block: "start", behavior: "auto" });
  }),
);
window.addEventListener("message", (event) => {
  if (
    event.origin === location.origin &&
    event.source === frame.contentWindow &&
    event.data?.type === "clearstep-ready" &&
    selected
  )
    select(selected);
});
document.getElementById("extension-link").addEventListener("click", (event) => {
  event.preventDefault();
  document.getElementById("setup").showModal();
});
document
  .getElementById("close-setup")
  .addEventListener("click", () => document.getElementById("setup").close());
document.getElementById("extension-mode").addEventListener("click", (event) => {
  const active = document.body.classList.toggle("extension-mode");
  event.target.textContent = active ? "Show built-in companion" : "Use installed extension instead";
});
