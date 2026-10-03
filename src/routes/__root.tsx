import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { PlanProvider } from "@/lib/plan-store";
import { SiteFooter, SiteHeader } from "@/components/clearstep/SiteChrome";

function NotFoundComponent() {
  return (
    <div className="mx-auto max-w-[1080px] px-5 py-20">
      <h1 className="text-4xl font-bold">Page not found</h1>
      <p className="mt-3 text-muted-foreground">This page doesn't exist or has moved.</p>
      <Link to="/" className="mt-6 inline-flex min-h-12 items-center rounded-md bg-primary px-5 font-bold text-primary-foreground">
        Go to start
      </Link>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="mx-auto max-w-[1080px] px-5 py-20">
      <h1 className="text-3xl font-bold">This page didn't load</h1>
      <p className="mt-3 text-muted-foreground">Something went wrong. You can try again.</p>
      <button
        onClick={() => {
          router.invalidate();
          reset();
        }}
        className="mt-6 inline-flex min-h-12 items-center rounded-md bg-primary px-5 font-bold text-primary-foreground"
      >
        Try again
      </button>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ClearStep" },
      { name: "description", content: "Find the official starting point and keep your place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <PlanProvider>
        <div className="flex min-h-screen flex-col">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:p-3"
          >
            Skip to main content
          </a>
          <SiteHeader />
          <main id="main" className="mx-auto w-full max-w-[1080px] flex-1 px-5 py-10 sm:py-16">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
      </PlanProvider>
    </QueryClientProvider>
  );
}
