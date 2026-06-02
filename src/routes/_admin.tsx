import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useAdmin } from "@/hooks/use-admin";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, LayoutDashboard, Home } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/_admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { loading, session, isAdmin } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!session || !isAdmin)) {
      navigate({ to: "/admin/login" });
    }
  }, [loading, session, isAdmin, navigate]);

  if (loading || !session || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link to="/admin" className="font-serif text-xl text-ink">
              Furia <span className="text-primary">·</span> Admin
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link
                to="/admin"
                className="flex items-center gap-2 text-muted-foreground transition hover:text-ink"
                activeProps={{ className: "text-ink" }}
                activeOptions={{ exact: true }}
              >
                <LayoutDashboard size={15} /> Immobili
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-ink">
              <Home size={14} /> Vai al sito
            </Link>
            <span className="text-xs text-muted-foreground">{session.user.email}</span>
            <button
              onClick={signOut}
              className="flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-xs hover:border-primary/50"
            >
              <LogOut size={13} /> Esci
            </button>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}