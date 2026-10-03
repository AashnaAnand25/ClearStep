import type { ReactNode } from "react";
import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { routeTree } from "@/routeTree.gen";
import { Route as rootRoute } from "@/routes/__root";
import { initialPlan } from "@/lib/plan-store";

// Test actual routes inside jsdom; the document shell is exercised by the production build.
Object.assign(rootRoute.options, {
  shellComponent: ({ children }: { children: ReactNode }) => <>{children}</>,
});

function renderAt(path: string) {
  const router = createRouter({
    routeTree,
    isServer: false,
    context: { queryClient: new QueryClient() },
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  return render(<RouterProvider router={router} />);
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.classList.remove("text-large");
  vi.restoreAllMocks();
});

describe("ClearStep journeys", () => {
  it("renders the starting journey and an empty plan", async () => {
    renderAt("/");
    expect(
      await screen.findByRole("heading", { name: "Get help with my taxes" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "My plan" }));
    expect(
      await screen.findByRole("heading", { name: "You don't have a plan yet" }),
    ).toBeInTheDocument();
  });

  it("provides a way home from an unknown route", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    renderAt("/this-route-does-not-exist");
    expect(await screen.findByRole("heading", { name: "Page not found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to start" })).toHaveAttribute("href", "/");
  });

  it.each([
    ["Someone to help me", "Free tax return preparation for qualifying taxpayers"],
    ["An online filing option", "IRS Free File"],
  ])("routes %s to the appropriate official starting point", async (choice, title) => {
    renderAt("/intake");
    fireEvent.click(await screen.findByRole("button", { name: "Continue" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Choose an option");
    fireEvent.click(screen.getByRole("radio", { name: choice }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(await screen.findByRole("radio", { name: "Yes" }));
    fireEvent.click(screen.getByRole("button", { name: "See my plan" }));
    expect(await screen.findByRole("heading", { name: title })).toBeInTheDocument();
    expect(screen.getByText("0 of 3 stages done")).toBeInTheDocument();
  });

  it("prioritizes help, explains the item, and lets optional items be skipped", async () => {
    localStorage.setItem(
      "clearstep.plan.v1",
      JSON.stringify({
        ...initialPlan(),
        intakeComplete: true,
        answers: { help: "person", firstTime: "yes" },
        stagesDone: { start: true, provider: false },
      }),
    );
    renderAt("/plan");
    const income = await screen.findByRole("group", {
      name: "Status for Income forms, such as a W-2 or 1099",
    });
    fireEvent.click(within(income).getByRole("button", { name: "Need help" }));
    const next = screen.getByRole("region", { name: "Your next step" });
    expect(next).toHaveTextContent("Get help with: Income forms");
    fireEvent.click(within(next).getByRole("button", { name: "Explain this" }));
    expect(
      await within(screen.getByRole("dialog")).findByText(/A W-2 comes from an employer/),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    for (const group of screen.getAllByRole("group", { name: /^Status for/ }).slice(0, 3)) {
      fireEvent.click(within(group).getByRole("button", { name: "Ready" }));
    }
    for (const skip of screen.getAllByRole("button", { name: "This doesn’t apply to me" }))
      fireEvent.click(skip);
    fireEvent.click(screen.getByRole("button", { name: "I've completed this step" }));
    expect(screen.getByText("Preparation complete")).toBeInTheDocument();
  });

  it("keeps a personal plan intact while exploring and resetting a sample", async () => {
    const personal = {
      ...initialPlan(),
      intakeComplete: true,
      answers: { help: "online", firstTime: "no" },
      reminderDate: "2026-10-20",
    };
    localStorage.setItem("clearstep.plan.v1", JSON.stringify(personal));
    renderAt("/");
    fireEvent.click(await screen.findByRole("button", { name: "Take a look at a sample plan" }));
    expect(await screen.findByText(/Sample plan — a fictional demo/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reset sample" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(JSON.parse(localStorage.getItem("clearstep.plan.v1")!).answers.help).toBe("online");
    fireEvent.click(screen.getByRole("button", { name: "Leave sample" }));
    fireEvent.click(await screen.findByRole("link", { name: "Continue my plan" }));
    expect(await screen.findByRole("heading", { name: "IRS Free File" })).toBeInTheDocument();
    expect(screen.getByLabelText("Reminder date")).toHaveValue("2026-10-20");
  });

  it("blocks unsupported calendar dates and recovers after a valid selection", async () => {
    localStorage.setItem(
      "clearstep.plan.v1",
      JSON.stringify({
        ...initialPlan(),
        intakeComplete: true,
        answers: { help: "online", firstTime: "yes" },
      }),
    );
    renderAt("/plan");
    const date = await screen.findByLabelText("Reminder date");
    const download = screen.getByRole("button", { name: /Add to calendar/ });
    expect(download).toBeDisabled();
    fireEvent.change(date, { target: { value: "9999-12-31" } });
    expect(download).toBeDisabled();
    expect(date).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText(/Choose a valid date between/)).toBeInTheDocument();
    fireEvent.change(date, { target: { value: "2028-02-29" } });
    expect(download).toBeEnabled();
    expect(date).toHaveAttribute("aria-invalid", "false");
  });

  it("persists the date and unfinished action across a route remount", async () => {
    localStorage.setItem(
      "clearstep.plan.v1",
      JSON.stringify({
        ...initialPlan(),
        intakeComplete: true,
        answers: { help: "person", firstTime: "yes" },
        stagesDone: { start: true, provider: false },
      }),
    );
    const view = renderAt("/plan");
    const income = await screen.findByRole("group", {
      name: "Status for Income forms, such as a W-2 or 1099",
    });
    fireEvent.click(within(income).getByRole("button", { name: "Need help" }));
    fireEvent.change(screen.getByLabelText("Reminder date"), { target: { value: "2028-02-29" } });
    view.unmount();
    renderAt("/plan");
    expect(await screen.findByText("Welcome back. Here's where you left off.")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Your next step" })).toHaveTextContent(
      "Get help with: Income forms",
    );
    expect(screen.getByLabelText("Reminder date")).toHaveValue("2028-02-29");
  });

  it("does not complete a step on external navigation and supports reset cancellation", async () => {
    localStorage.setItem(
      "clearstep.plan.v1",
      JSON.stringify({
        ...initialPlan(),
        intakeComplete: true,
        answers: { help: "person", firstTime: "yes" },
      }),
    );
    renderAt("/plan");
    const next = await screen.findByRole("region", { name: "Your next step" });
    const link = within(next).getByRole("link", { name: /Open IRS.gov/ });
    link.addEventListener("click", (event) => event.preventDefault());
    const before = localStorage.getItem("clearstep.plan.v1");
    fireEvent.click(link);
    expect(localStorage.getItem("clearstep.plan.v1")).toBe(before);
    expect(screen.getByText("0 of 3 stages done")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reset my plan" }));
    fireEvent.click(screen.getByRole("button", { name: "Keep my plan" }));
    expect(localStorage.getItem("clearstep.plan.v1")).toBe(before);
    fireEvent.click(screen.getByRole("button", { name: "Reset my plan" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(
      await screen.findByRole("heading", { name: "Get help with my taxes" }),
    ).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("clearstep.plan.v1")!).intakeComplete).toBe(false);
  });

  it("restores larger text and allows it to be switched off", async () => {
    localStorage.setItem("clearstep.largeText", "1");
    renderAt("/");
    const toggle = await screen.findByRole("button", { name: "Larger text" });
    await waitFor(() => expect(toggle).toHaveAttribute("aria-pressed", "true"));
    expect(document.documentElement).toHaveClass("text-large");
    fireEvent.click(toggle);
    expect(document.documentElement).not.toHaveClass("text-large");
  });
});
