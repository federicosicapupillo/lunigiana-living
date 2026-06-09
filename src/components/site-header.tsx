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
    <header className="sticky top-0 z-40 border-b border-warm-border/60 bg-warm-cream/90 backdrop-blur-md">
      <div className="container-editorial flex h-20 items-center sm:h-[84px] md:h-[92px] lg:h-[108px]">
        <Link to="/" className="group flex shrink-0 items-center" aria-label="Furia Immobiliare — Home">
          <img
            src={logoAsset.url}
            alt="Furia Immobiliare"
            className="h-16 w-auto object-contain sm:h-[72px] md:h-20 lg:h-[88px]"
          />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1.5 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="group relative rounded-lg px-5 py-2.5 text-[0.95rem] font-medium tracking-wide text-ink-soft/80 transition-all duration-200 hover:bg-warm-ivory/70 hover:text-terracotta lg:text-[1.06rem]"
              activeProps={{ className: "text-terracotta bg-warm-ivory/50 [&>span:last-child]:scale-x-100" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              <span>{n.label}</span>
              <span className="pointer-events-none absolute bottom-1 left-1/2 h-[2px] w-6 -translate-x-1/2 scale-x-0 rounded-full bg-terracotta/70 transition-transform duration-200 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <button
          aria-label="Apri menu"
          onClick={() => setOpen((v) => !v)}
          className="ml-auto rounded-sm p-2 text-foreground transition-colors hover:text-terracotta lg:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-warm-border/60 bg-warm-cream lg:hidden">
          <nav className="container-editorial flex flex-col py-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-sm px-2 py-2.5 text-sm font-medium tracking-wide text-ink-soft/80 transition-colors hover:bg-warm-ivory/60 hover:text-terracotta aria-[current=page]:text-terracotta"
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
