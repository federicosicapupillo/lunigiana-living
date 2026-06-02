import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/use-admin";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Accesso area riservata — Furia Immobiliare" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const { session, isAdmin, loading } = useAdmin();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session && isAdmin) {
      navigate({ to: "/admin" });
    }
  }, [session, isAdmin, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Account creato. Controlla l'email per confermare.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Accesso effettuato.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Errore di autenticazione");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-24">
      <div className="w-full max-w-md rounded-sm border border-border bg-card p-10 shadow-sm">
        <Link to="/" className="eyebrow text-muted-foreground hover:text-primary">
          ← Torna al sito
        </Link>
        <h1 className="mt-6 font-serif text-3xl text-ink">Area riservata</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Accesso esclusivo allo staff Furia Immobiliare.
        </p>

        <div className="mt-8 flex gap-2 text-xs uppercase tracking-[0.15em]">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-sm border px-3 py-2 transition ${
              mode === "signin"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            Accedi
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-sm border px-3 py-2 transition ${
              mode === "signup"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            Crea account
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-sm border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-sm border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-sm bg-primary px-6 py-3.5 text-xs uppercase tracking-[0.2em] text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? "Attendere..." : mode === "signup" ? "Crea account" : "Accedi"}
          </button>
        </form>

        {session && !isAdmin && (
          <div className="mt-6 rounded-sm border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            Sei autenticato ma il tuo account non ha ancora i permessi di
            amministratore. Contatta l'amministratore del sistema per essere
            promosso (user id: <code className="text-xs">{session.user.id}</code>).
          </div>
        )}
      </div>
    </div>
  );
}