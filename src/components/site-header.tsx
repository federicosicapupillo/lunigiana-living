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
    <header className="sticky top-0 z-40 border-b border-warm-border/50 bg-warm-cream/85 backdrop-blur-md">
      <div className="container-editorial flex h-20 items-center sm:h-[84px] md:h-[88px] lg:h-[96px]">
        <Link to="/" className="group flex shrink-0 items-center" aria-label="Furia Immobiliare — Home">
          <img
            src={logoAsset.url}
            alt="Furia Immobiliare"
            className="h-16 w-auto object-contain sm:h-[72px] md:h-[76px] lg:h-[82px]"
          />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="menu-link"
              activeProps={{ className: "menu-link is-active" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <button
          aria-label="Apri menu"
          onClick={() => setOpen((v) => !v)}
          className="ml-auto rounded-md p-2 text-foreground transition-colors hover:bg-warm-ivory/70 hover:text-terracotta lg:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-warm-border/50 bg-warm-cream lg:hidden">
          <nav className="container-editorial flex flex-col py-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium tracking-wide text-ink-soft transition-colors hover:bg-warm-ivory/70 hover:text-terracotta aria-[current=page]:text-terracotta aria-[current=page]:bg-warm-ivory/60"
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
