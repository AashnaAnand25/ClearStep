/* Shared with privacy regression tests. Canonical IDs only; never reads input.value. */
(function () {
  function fieldIdFor(element) {
    if (!(element instanceof Element)) return null;
    const control = element.closest("input,select,textarea");
    if (!control || control.type === "password" || control.type === "hidden") return null;
    const label = Array.from(control.labels || [])
      .map((node) => node.textContent || "")
      .join(" ")
      .toLowerCase()
      .replace(/\s+/g, " ");
    if (/multiple jobs|spouse works/.test(label)) return "multiple-jobs";
    if (/other income.*not from jobs/.test(label)) return "other-income";
    if (/extra withholding/.test(label)) return "extra-withholding";
    return null;
  }
  globalThis.clearstepFieldIdFor = fieldIdFor;
})();
