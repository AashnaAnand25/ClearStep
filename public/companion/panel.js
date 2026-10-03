const fields = {
  "multiple-jobs": ["Multiple jobs or spouse works", "W-4 · Step 2"],
  "other-income": ["Other income (not from jobs)", "W-4 · Step 4(a)"],
  "extra-withholding": ["Extra withholding", "W-4 · Step 4(c)"],
};
const $ = (id) => document.getElementById(id);
const extension = location.protocol === "chrome-extension:";
let fieldId = null;
let mode = "explain";
let sequence = 0;
async function selectField(id, error = "") {
  fieldId = Object.hasOwn(fields, id) ? id : null;
  stopSpeaking();
  sequence++;
  $("field-label").textContent = fieldId ? fields[fieldId][0] : "Choose a supported field";
  $("field-step").textContent = fieldId
    ? fields[fieldId][1]
    : "Supports Step 2, Step 4(a), and Step 4(c).";
  if (!fieldId) {
    document.querySelector(".answer").setAttribute("aria-busy", "false");
    $("answer-badge").textContent = "WAITING FOR A FIELD";
    $("answer-text").textContent =
      error ||
      "Click a supported W-4 field. We do not read names, identification numbers, or your typed answers.";
    $("source").hidden = true;
    $("retry").hidden = true;
    return;
  }
  await explain();
}
async function explain() {
  if (!fieldId) return;
  stopSpeaking();
  $("listen").hidden = true;
  const ticket = ++sequence;
  const selected = fieldId;
  $("answer-badge").textContent = "READING THE INSTRUCTIONS";
  $("answer-text").textContent =
    "Reading the reviewed instructions… The first explanation may take a little longer while the model loads.";
  $("source").hidden = true;
  $("retry").hidden = true;
  document.querySelector(".answer").setAttribute("aria-busy", "true");
  try {
    const result = extension
      ? await chrome.runtime.sendMessage({ type: "explain-field", fieldId: selected, mode })
      : await fetch("/api/field-help", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fieldId: selected, mode }),
          signal: AbortSignal.timeout(65000),
        }).then((r) => {
          if (!r.ok) throw Error();
          return r.json();
        });
    if (ticket !== sequence) return;
    if (result.error || result.fieldId !== selected || typeof result.explanation !== "string")
      throw Error();
    $("answer-badge").textContent = result.isAI
      ? result.provider === "openai"
        ? "AI EXPLANATION · OPENAI"
        : result.provider === "gemini"
          ? "AI EXPLANATION · GEMINI"
          : "LOCAL AI · QWEN 2.5"
      : "REVIEWED GUIDE · AI UNAVAILABLE";
    $("answer-text").textContent = result.explanation;
    $("listen").hidden = !("speechSynthesis" in window);
    $("source").hidden = false;
    $("retry").hidden = result.isAI;
    if (result.status === "busy") $("answer-badge").textContent = "REVIEWED GUIDE · AI IS BUSY";
  } catch {
    if (ticket !== sequence) return;
    $("answer-badge").textContent = "LET’S RECONNECT";
    $("answer-text").textContent =
      "We couldn’t reach the explanation service. Please try again in a moment. You can still read the official instructions below.";
    $("source").hidden = false;
    $("retry").hidden = false;
  } finally {
    if (ticket === sequence) document.querySelector(".answer").setAttribute("aria-busy", "false");
  }
}
document.querySelectorAll("[data-mode]").forEach((button) =>
  button.addEventListener("click", () => {
    mode = button.dataset.mode;
    document
      .querySelectorAll("[data-mode]")
      .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    explain();
  }),
);
$("retry").addEventListener("click", explain);
if (extension) {
  async function sync() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const { selection } = await chrome.storage.session.get("selection");
    await selectField(
      selection?.tabId === tab?.id ? selection.fieldId : null,
      selection?.tabId === tab?.id ? selection.error : "",
    );
  }
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "session" && changes.selection) sync();
  });
  chrome.tabs.onActivated.addListener(sync);
  sync();
} else {
  window.addEventListener("message", (event) => {
    if (
      event.origin === location.origin &&
      event.source === parent &&
      event.data?.type === "clearstep-field"
    )
      selectField(event.data.fieldId);
  });
  parent.postMessage({ type: "clearstep-ready" }, location.origin);
}

function stopSpeaking() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  $("listen").textContent = "Listen to this explanation";
}
$("listen").addEventListener("click", () => {
  if (window.speechSynthesis.speaking) {
    stopSpeaking();
    return;
  }
  const utterance = new SpeechSynthesisUtterance($("answer-text").textContent);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  utterance.onend = stopSpeaking;
  utterance.onerror = stopSpeaking;
  $("listen").textContent = "Stop reading";
  window.speechSynthesis.speak(utterance);
});
window.addEventListener("pagehide", stopSpeaking);
