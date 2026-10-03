import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Accessibility, CircleCheck, Contrast, Type } from "lucide-react";
import { usePlan, type AccessibilitySettings } from "@/lib/plan-store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Accessibility settings — ClearStep" },
      { name: "description", content: "Choose how ClearStep should look and move for you." },
    ],
  }),
  component: SettingsPage,
});

const tabs = [
  { id: "text", label: "Text", icon: Type },
  { id: "contrast", label: "Contrast", icon: Contrast },
  { id: "motion", label: "Motion", icon: Accessibility },
] as const;

function SettingsPage() {
  const { accessibility, setAccessibility } = usePlan();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("text");

  const update = (changes: Partial<AccessibilitySettings>) =>
    setAccessibility({ ...accessibility, ...changes });

  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow">Make ClearStep work for you</p>
      <h1 className="mt-3 text-4xl font-bold">Accessibility settings</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        Choose the display and motion preferences that make each step easier to follow. Your choices
        are saved on this device.
      </p>

      <div className="mt-10 rounded-2xl border bg-card shadow-card">
        <div
          role="tablist"
          aria-label="Accessibility settings"
          className="flex flex-wrap border-b p-2"
        >
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              id={`${id}-tab`}
              role="tab"
              aria-selected={activeTab === id}
              aria-controls={`${id}-settings`}
              onClick={() => setActiveTab(id)}
              className="inline-flex min-h-12 items-center gap-2 rounded-lg px-4 font-bold text-muted-foreground hover:bg-accent aria-selected:bg-primary-soft aria-selected:text-primary"
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </button>
          ))}
        </div>

        <div className="p-6 sm:p-8">
          {activeTab === "text" && (
            <section id="text-settings" role="tabpanel" aria-labelledby="text-tab">
              <h2 className="text-2xl font-bold">Text size</h2>
              <p className="mt-2 text-muted-foreground">
                Increase the size of text throughout ClearStep.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {(["default", "large"] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    aria-pressed={accessibility.textSize === size}
                    onClick={() => update({ textSize: size })}
                    className="flex min-h-20 items-center justify-between rounded-xl border-2 p-4 text-left font-bold aria-pressed:border-primary aria-pressed:bg-primary-soft"
                  >
                    <span className={size === "large" ? "text-xl" : "text-base"}>
                      {size === "large" ? "Larger text" : "Default text"}
                    </span>
                    {accessibility.textSize === size && (
                      <CircleCheck className="text-primary" aria-hidden />
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}
          {activeTab === "contrast" && (
            <section id="contrast-settings" role="tabpanel" aria-labelledby="contrast-tab">
              <h2 className="text-2xl font-bold">Contrast</h2>
              <p className="mt-2 text-muted-foreground">
                Use stronger borders and colors for easier reading.
              </p>
              <label className="mt-6 flex min-h-16 cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 font-bold">
                <span>High contrast</span>
                <input
                  type="checkbox"
                  checked={accessibility.highContrast}
                  onChange={(event) => update({ highContrast: event.target.checked })}
                  className="size-5 accent-primary"
                />
              </label>
            </section>
          )}
          {activeTab === "motion" && (
            <section id="motion-settings" role="tabpanel" aria-labelledby="motion-tab">
              <h2 className="text-2xl font-bold">Motion</h2>
              <p className="mt-2 text-muted-foreground">
                Reduce transitions and decorative movement.
              </p>
              <label className="mt-6 flex min-h-16 cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 font-bold">
                <span>Reduce motion</span>
                <input
                  type="checkbox"
                  checked={accessibility.reducedMotion}
                  onChange={(event) => update({ reducedMotion: event.target.checked })}
                  className="size-5 accent-primary"
                />
              </label>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
