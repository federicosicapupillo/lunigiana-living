import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-ink text-cream">
      <div className="container-editorial grid gap-12 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-serif text-3xl">Furia Immobiliare</div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/70">
            Da Pontremoli, accompagniamo chi cerca una casa di carattere in Lunigiana.
            Conosciamo i borghi, le pietre, le valli — e il loro modo di vivere.
          </p>
        </div>

        <div>
          <div className="eyebrow text-cream/60">Contatti</div>
          <ul className="mt-4 space-y-2 text-sm text-cream/85">
            <li>Piazza della Repubblica</li>
            <li>54027 Pontremoli (MS)</li>
            <li className="pt-2">+39 0187 000 000</li>
            <li>info@furiaimmobiliare.it</li>
          </ul>
        </div>

        <div>
          <div className="eyebrow text-cream/60">Naviga</div>
          <ul className="mt-4 space-y-2 text-sm text-cream/85">
            <li><Link to="/immobili" className="hover:text-cream">Immobili</Link></li>
            <li><Link to="/territori" className="hover:text-cream">Vivere in Lunigiana</Link></li>
            <li><Link to="/servizi" className="hover:text-cream">Servizi</Link></li>
            <li><Link to="/chi-siamo" className="hover:text-cream">Chi siamo</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-editorial flex flex-col gap-2 py-6 text-xs text-cream/55 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} Furia Immobiliare. Tutti i diritti riservati.</span>
          <span>P.IVA 00000000000 · Pontremoli, Lunigiana</span>
        </div>
      </div>
    </footer>
  );
}