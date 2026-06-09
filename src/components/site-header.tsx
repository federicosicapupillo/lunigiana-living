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
    <header className="sticky top-0 z-40 border-b border-warm-border/70 bg-warm-cream/90 backdrop-blur-md">
      <div className="container-editorial flex h-24 items-center justify-between md:h-28">
        <Link to="/" className="group flex items-center" aria-label="Furia Immobiliare — Home">
          <img
            src={logoAsset.url}
            alt="Furia Immobiliare"
            className="h-16 w-auto object-contain sm:h-[72px] md:h-20 lg:h-[88px]"
          />
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="group relative text-sm tracking-wide text-ink/75 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary [&>span:last-child]:scale-x-100" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              <span>{n.label}</span>
              <span className="pointer-events-none absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

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
          </nav>
        </div>
      )}
    </header>
  );
}
