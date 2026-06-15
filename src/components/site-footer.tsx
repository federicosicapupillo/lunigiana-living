import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/furia-logo.png.asset.json";
import { useT } from "@/lib/i18n/LanguageContext";

export function SiteFooter() {
  const t = useT();
  return (
    <footer className="mt-24 border-t border-border bg-ink text-cream">
      <div className="container-editorial grid gap-12 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="footer-logo-badge">
            <img
              src={logoAsset.url}
              alt="Furia Immobiliare"
              className="h-auto w-[130px] object-contain md:w-[160px]"
            />
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/70">
            {t("footer.intro")}
          </p>
        </div>

        <div>
          <div className="eyebrow text-cream/60">{t("footer.contacts")}</div>
          <ul className="mt-4 space-y-2 text-sm text-cream/85">
            <li>Via Pirandello 7</li>
            <li>54027 Pontremoli (MS)</li>
            <li className="pt-2">Tel. 0187 830229</li>
            <li>Cell. 320 7019985</li>
            <li>furiaimmobiliare@libero.it</li>
          </ul>
        </div>

        <div>
          <div className="eyebrow text-cream/60">{t("footer.navigate")}</div>
          <ul className="mt-4 space-y-2 text-sm text-cream/85">
            <li><Link to="/" className="hover:text-cream">{t("nav.home")}</Link></li>
            <li><Link to="/immobili" className="hover:text-cream">{t("nav.immobili")}</Link></li>
            <li><Link to="/case-in-vendita-lunigiana" className="hover:text-cream">{t("footer.byType")}</Link></li>
            <li><Link to="/trova-casa-lunigiana" className="hover:text-cream">{t("footer.guided")}</Link></li>
            <li><Link to="/territori" className="hover:text-cream">{t("nav.territori")}</Link></li>
            <li><Link to="/servizi" className="hover:text-cream">{t("nav.servizi")}</Link></li>
            <li><Link to="/chi-siamo" className="hover:text-cream">{t("nav.chiSiamo")}</Link></li>
            <li><Link to="/contatti" className="hover:text-cream">{t("nav.contatti")}</Link></li>
            <li><Link to="/admin/login" className="hover:text-cream">{t("footer.adminArea")}</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-editorial flex flex-col gap-2 py-6 text-xs text-cream/55 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} Furia Immobiliare di Furia Elena. {t("footer.rights")}</span>
          <span>Pontremoli · Lunigiana</span>
        </div>
      </div>
    </footer>
  );
}
