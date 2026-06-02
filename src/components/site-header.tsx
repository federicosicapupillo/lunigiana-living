import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logoAsset from "@/assets/furia-logo.png.asset.json";

const nav = [
  { to: "/", label: "Home" },
  { to: "/immobili", label: "Immobili" },
  { to: "/territori", label: "Vivere in Lunigiana" },
  { to: "/servizi", label: "Servizi" },
  { to: "/chi-siamo", label: "Chi siamo" },
  { to: "/contatti", label: "Contatti" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container-editorial flex h-20 items-center justify-between">
        <Link to="/" className="group flex items-center" aria-label="Furia Immobiliare — Home">
          <img
            src={logoAsset.url}
            alt="Furia Immobiliare"
            className="h-12 w-auto md:h-14"
          />
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm tracking-wide text-foreground/75 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/contatti"
          className="hidden rounded-sm bg-primary px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:bg-primary/90 lg:inline-block"
        >
          Parla con noi
        </Link>

        <button
          aria-label="Apri menu"
          onClick={() => setOpen((v) => !v)}
          className="rounded-sm p-2 text-foreground lg:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="container-editorial flex flex-col py-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-3 text-sm tracking-wide text-foreground/80"
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/contatti"
              onClick={() => setOpen(false)}
              className="mt-3 rounded-sm bg-primary px-5 py-3 text-center text-xs uppercase tracking-[0.18em] text-primary-foreground"
            >
              Parla con noi
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}