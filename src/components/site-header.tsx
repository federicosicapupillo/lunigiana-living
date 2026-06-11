import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logoAsset from "@/assets/furia-logo.png.asset.json";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useT } from "@/lib/i18n/LanguageContext";

const NAV_ITEMS = [
  { to: "/", key: "nav.home" },
  { to: "/immobili", key: "nav.immobili" },
  { to: "/territori", key: "nav.territori" },
  { to: "/servizi", key: "nav.servizi" },
  { to: "/chi-siamo", key: "nav.chiSiamo" },
  { to: "/contatti", key: "nav.contatti" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const t = useT();
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
          {NAV_ITEMS.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="menu-link"
              activeProps={{ className: "menu-link is-active" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {t(n.key)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden lg:flex lg:items-center lg:pl-4">
          <LanguageSwitcher />
        </div>

        <button
          aria-label={t("nav.openMenu")}
          onClick={() => setOpen((v) => !v)}
          className="ml-auto rounded-md p-2 text-foreground transition-colors hover:bg-warm-ivory/70 hover:text-terracotta lg:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-warm-border/50 bg-warm-cream lg:hidden">
          <nav className="container-editorial flex flex-col py-3">
            {NAV_ITEMS.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium tracking-wide text-ink-soft transition-colors hover:bg-warm-ivory/70 hover:text-terracotta aria-[current=page]:text-terracotta aria-[current=page]:bg-warm-ivory/60"
              >
                {t(n.key)}
              </Link>
            ))}
            <div className="mt-2 border-t border-warm-border/50 px-3 pt-3">
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
