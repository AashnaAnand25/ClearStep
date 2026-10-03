import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { CHECKLIST } from "@/data/checklist";

export type HelpChoice = "person" | "online" | "unsure";
export type FirstTime = "yes" | "no" | "unsure";
export type ItemStatus = "todo" | "ready" | "help";

/** Only non-sensitive task progress is stored. */
export interface PlanState {
  version: 1;
  isSample: boolean;
  answers: { help: HelpChoice | null; firstTime: FirstTime | null };
  intakeComplete: boolean;
  checklist: Record<string, ItemStatus>;
  stagesDone: { start: boolean; provider: boolean };
  reminderDate: string | null;
}

const KEY = "clearstep.plan.v1";
const SESSION_KEY = "clearstep.session";
const TEXT_KEY = "clearstep.largeText";

const emptyChecklist = () => Object.fromEntries(CHECKLIST.map((i) => [i.id, "todo" as ItemStatus]));

export const initialPlan = (): PlanState => ({
  version: 1,
  isSample: false,
  answers: { help: null, firstTime: null },
  intakeComplete: false,
  checklist: emptyChecklist(),
  stagesDone: { start: false, provider: false },
  reminderDate: null,
});

const samplePlan = (): PlanState => ({
  ...initialPlan(),
  isSample: true,
  answers: { help: "person", firstTime: "yes" },
  intakeComplete: true,
  checklist: { ...emptyChecklist(), "photo-id": "ready", "income-forms": "help" },
  stagesDone: { start: true, provider: false },
});

interface Ctx {
  plan: PlanState;
  hydrated: boolean;
  welcomeBack: boolean;
  dismissWelcome: () => void;
  update: (fn: (p: PlanState) => PlanState) => void;
  startFresh: () => void;
  loadSample: () => void;
  reset: () => void;
  largeText: boolean;
  setLargeText: (v: boolean) => void;
}

const PlanContext = createContext<Ctx | null>(null);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<PlanState>(initialPlan);
  const [hydrated, setHydrated] = useState(false);
  const [welcomeBack, setWelcomeBack] = useState(false);
  const [largeText, setLargeTextState] = useState(false);
  const skipSave = useRef(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PlanState;
        if (parsed.version === 1) {
          setPlan({ ...initialPlan(), ...parsed, checklist: { ...emptyChecklist(), ...parsed.checklist } });
          if (parsed.intakeComplete && !sessionStorage.getItem(SESSION_KEY)) setWelcomeBack(true);
        }
      }
      sessionStorage.setItem(SESSION_KEY, "1");
      setLargeTextState(localStorage.getItem(TEXT_KEY) === "1");
    } catch {
      /* storage unavailable: continue without persistence */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(plan));
    } catch {
      /* ignore */
    }
  }, [plan, hydrated]);

  useEffect(() => {
    document.documentElement.classList.toggle("text-large", largeText);
  }, [largeText]);

  const setLargeText = useCallback((v: boolean) => {
    setLargeTextState(v);
    try {
      localStorage.setItem(TEXT_KEY, v ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const update = useCallback((fn: (p: PlanState) => PlanState) => setPlan(fn), []);
  const startFresh = useCallback(() => {
    setWelcomeBack(false);
    setPlan(initialPlan());
  }, []);
  const loadSample = useCallback(() => {
    setWelcomeBack(false);
    setPlan(samplePlan());
  }, []);
  const reset = useCallback(() => {
    setWelcomeBack(false);
    setPlan(initialPlan());
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <PlanContext.Provider
      value={{
        plan,
        hydrated,
        welcomeBack,
        dismissWelcome: () => setWelcomeBack(false),
        update,
        startFresh,
        loadSample,
        reset,
        largeText,
        setLargeText,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}
