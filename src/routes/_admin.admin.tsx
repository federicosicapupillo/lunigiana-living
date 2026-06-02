import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/admin")({
  component: AdminSection,
});

function AdminSection() {
  return <Outlet />;
}