import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type OAuthDetails = {
  client?: { name?: string | null } | null;
  redirect_url?: string | null;
  redirect_to?: string | null;
};

type OAuthResult = { data: OAuthDetails | null; error: { message: string } | null };

type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<OAuthResult>;
  approveAuthorization: (id: string) => Promise<OAuthResult>;
  denyAuthorization: (id: string) => Promise<OAuthResult>;
};

const oauthApi = () => (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export const Route = createFileRoute("/.lovable/oauth/consent")({
  // Browser-only: the Supabase client reads its session from localStorage.
  ssr: false,
  head: () => ({
    meta: [
      { title: "Autorizza l'accesso — Furia Immobiliare" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    const next = location.pathname + location.searchStr;
    if (!data.session) throw redirect({ to: "/admin/login", search: { next } });
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="flex min-h-screen items-center justify-center px-4 py-24">
      <p className="max-w-md text-sm text-muted-foreground">
        Non è stato possibile caricare questa richiesta di autorizzazione:{" "}
        {String((error as Error)?.message ?? error)}
      </p>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientName = details?.client?.name ?? "un'applicazione";

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const api = oauthApi();
    const { data, error: err } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);
    if (err) {
      setBusy(false);
      setError(err.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("Il server di autorizzazione non ha restituito un indirizzo di ritorno.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-24">
      <div className="w-full max-w-md rounded-sm border border-border bg-card p-10 shadow-sm">
        <h1 className="font-serif text-2xl text-ink">
          Collega {clientName} al tuo account
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {clientName} potrà usare gli strumenti del sito Furia Immobiliare a tuo nome, con gli
          stessi permessi del tuo account.
        </p>
        {error && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="mt-8 flex gap-3">
          <button
            disabled={busy}
            onClick={() => decide(true)}
            className="flex-1 rounded-sm bg-primary px-6 py-3 text-xs uppercase tracking-[0.2em] text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            Autorizza
          </button>
          <button
            disabled={busy}
            onClick={() => decide(false)}
            className="flex-1 rounded-sm border border-border px-6 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground transition hover:border-primary/50 disabled:opacity-50"
          >
            Rifiuta
          </button>
        </div>
      </div>
    </main>
  );
}
