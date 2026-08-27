import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/admin")({
  // noindex centralizzato per tutta l'area /admin (dashboard, dati-live,
  // idealista, anteprima immobile incluse). Nessun impatto su auth o UX.
  head: () => ({
    meta: [{ name: "robots", content: "noindex,nofollow" }],
  }),
  component: AdminSection,
});

function AdminSection() {
  return <Outlet />;
}
