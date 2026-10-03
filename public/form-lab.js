const frame = document.getElementById("companion");
let selected = null;
function select(id) {
  selected = id;
  document
    .querySelectorAll(".field-card")
    .forEach((card) => card.classList.toggle("active", card.dataset.field === id));
  frame.contentWindow.postMessage({ type: "clearstep-field", fieldId: id }, location.origin);
}
const forms = await fetch("/companion/forms.json").then((r) => r.json());
const options = document.getElementById("form-options");
function chooseForm(form) {
  select(null);
  options
    .querySelectorAll("button")
    .forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.form === form.id)));
  document.getElementById("form-title").textContent = `Let’s unpack a ${form.name}.`;
  document.getElementById("form-context").textContent = form.title;
  const link = document.getElementById("official-form");
  link.href = form.source.url;
  link.textContent = `Get the official ${form.name} ↗`;
  const container = document.getElementById("practice-fields");
  container.replaceChildren();
  for (const field of form.fields) {
    const card = document.createElement("div");
    card.className = "field-card";
    card.dataset.field = field.id;
    const meta = document.createElement("div");
    meta.className = "field-meta";
    const step = document.createElement("span");
    step.textContent = field.step;
    const help = document.createElement("button");
    help.type = "button";
    help.textContent = "✦ Explain this field";
    const label = document.createElement("label");
    label.htmlFor = field.id;
    label.textContent = field.label;
    const hint = document.createElement("p");
    hint.textContent = "Explore what this means before completing the official form.";
    const input = document.createElement("select");
    input.id = field.id;
    for (const text of [
      "Select a practice response",
      "I need to review the instructions",
      "I understand what this section asks",
    ]) {
      const option = document.createElement("option");
      option.textContent = text;
      input.append(option);
    }
    input.addEventListener("focus", () => select(field.id));
    help.addEventListener("click", () => {
      input.focus();
      if (window.innerWidth < 850) frame.scrollIntoView({ block: "start" });
    });
    meta.append(step, help);
    card.append(meta, label, hint, input);
    container.append(card);
  }
}
for (const form of forms) {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.form = form.id;
  const name = document.createElement("strong");
  name.textContent = `${form.name} · ${form.title}`;
  const description = document.createElement("span");
  description.textContent = form.description;
  button.append(name, description);
  button.addEventListener("click", () => chooseForm(form));
  options.append(button);
}
chooseForm(forms[0]);
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
