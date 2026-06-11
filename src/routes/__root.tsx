import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { Toaster } from "../components/ui/sonner";
import { WhatsAppFloat } from "../components/whatsapp-float";
import { LanguageProvider } from "../lib/i18n/LanguageContext";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Furia Immobiliare — Case e immobili in Lunigiana" },
      { name: "description", content: "Agenzia immobiliare a Pontremoli. Case, ville e immobili di carattere in Lunigiana: Pontremoli, Villafranca, Filattiera, Mulazzo, Bagnone, Zeri." },
      { name: "author", content: "Furia Immobiliare" },
      { property: "og:site_name", content: "Furia Immobiliare" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:title", content: "Furia Immobiliare — Case e immobili in Lunigiana" },
      { name: "twitter:title", content: "Furia Immobiliare — Case e immobili in Lunigiana" },
      { property: "og:description", content: "Agenzia immobiliare a Pontremoli. Case, ville e immobili di carattere in Lunigiana: Pontremoli, Villafranca, Filattiera, Mulazzo, Bagnone, Zeri." },
      { name: "twitter:description", content: "Agenzia immobiliare a Pontremoli. Case, ville e immobili di carattere in Lunigiana: Pontremoli, Villafranca, Filattiera, Mulazzo, Bagnone, Zeri." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/bf226b38-5d96-49e7-874e-d424fe5f9557/id-preview-ecef9743--c4e1d01b-1e1d-4552-90f5-6a8dbe4cbb6d.lovable.app-1781012892011.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/bf226b38-5d96-49e7-874e-d424fe5f9557/id-preview-ecef9743--c4e1d01b-1e1d-4552-90f5-6a8dbe4cbb6d.lovable.app-1781012892011.png" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap" },
      {
        rel: "stylesheet",
        href: appCss,
      },
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
  // Admin area renders its own chrome (header/sidebar). Skip the public
  // SiteHeader/SiteFooter for any /admin* URL so the back-office isn't wrapped
  // by the marketing layout.
  const isAdminArea =
    typeof window !== "undefined" && window.location.pathname.startsWith("/admin");

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <div className="flex min-h-screen flex-col bg-background text-foreground">
          {!isAdminArea && <SiteHeader />}
          <main className="flex-1">
            <Outlet />
          </main>
          {!isAdminArea && <SiteFooter />}
          {!isAdminArea && <WhatsAppFloat />}
        </div>
        <Toaster />
      </LanguageProvider>
    </QueryClientProvider>
  );
}
