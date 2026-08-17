import { useState } from "react";
import { Share2, MessageCircle, Mail, Send, Facebook, Link2, Check } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/lib/i18n/LanguageContext";
import { trackClick } from "@/lib/analytics";
import {
  isPricePublic,
  propertyCanonicalUrl,
  propertyShareFacebookUrl,
  propertyShareMailtoUrl,
  propertyShareTelegramUrl,
  propertyShareWhatsappUrl,
  type ShareableProperty,
} from "@/lib/property-share";

export type ShareMethod =
  | "native"
  | "whatsapp"
  | "email"
  | "facebook"
  | "telegram"
  | "copy_link";

type Props = {
  property: ShareableProperty;
  priceLabel?: string | null;
  /** Contesto del pulsante (hero, contact_card...) — nessun dato personale. */
  source: string;
  className?: string;
  iconSize?: number;
};

/**
 * Condivisione universale della scheda immobile.
 *
 * - Usa prioritariamente `navigator.share()`: su mobile compatibile si apre
 *   il menu nativo di sistema (WhatsApp, Mail, Messaggi, Telegram, ecc.).
 * - L'annullamento volontario (AbortError) NON è un errore: nessun toast,
 *   nessun fallback, nessun log in console.
 * - Fallback (desktop / browser senza Web Share API / errore tecnico reale):
 *   piccolo modal accessibile con WhatsApp, Email, Facebook, Telegram e
 *   Copia link. Nessuno SDK o script esterno.
 */
export function PropertyShareButton({
  property,
  priceLabel,
  source,
  className,
  iconSize = 14,
}: Props) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const labels = { intro: t("share.wa.intro"), outro: t("share.wa.outro") };
  const canonical = propertyCanonicalUrl(property);

  const track = (method: ShareMethod) =>
    trackClick("property_share", {
      source,
      method,
      property_code: property.reference ?? "",
      slug: property.slug ?? "",
      price_public: isPricePublic(property),
    });

  const handleClick = async () => {
    const nav = typeof navigator !== "undefined" ? navigator : undefined;
    if (nav && typeof nav.share === "function") {
      try {
        await nav.share({
          title: property.title,
          text: t("share.nativeText"),
          url: canonical,
        });
        track("native");
        return;
      } catch (err) {
        // Annullamento volontario: nessun errore, nessun fallback.
        const name = (err as { name?: string } | null)?.name;
        if (name === "AbortError" || name === "NotAllowedError") return;
        // Errore tecnico reale → fallback.
      }
    }
    setOpen(true);
  };

  const copyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(canonical);
      } else {
        const el = document.createElement("textarea");
        el.value = canonical;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        el.remove();
      }
      setCopied(true);
      toast.success(t("share.copied"));
      track("copy_link");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("share.copyFailed"));
    }
  };

  const options: {
    key: Exclude<ShareMethod, "native" | "copy_link">;
    label: string;
    href: string;
    icon: typeof MessageCircle;
  }[] = [
    {
      key: "whatsapp",
      label: t("share.opt.whatsapp"),
      href: propertyShareWhatsappUrl(property, labels, priceLabel),
      icon: MessageCircle,
    },
    {
      key: "email",
      label: t("share.opt.email"),
      href: propertyShareMailtoUrl(property, labels, priceLabel, property.title),
      icon: Mail,
    },
    {
      key: "facebook",
      label: t("share.opt.facebook"),
      href: propertyShareFacebookUrl(property),
      icon: Facebook,
    },
    {
      key: "telegram",
      label: t("share.opt.telegram"),
      href: propertyShareTelegramUrl(property, labels, priceLabel),
      icon: Send,
    },
  ];

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={t("detail.shareAria")}
        aria-haspopup="dialog"
        data-track="property_share"
        className={className}
      >
        <Share2 size={iconSize} aria-hidden="true" /> {t("detail.share")}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{t("detail.share")}</DialogTitle>
            <DialogDescription className="text-sm">{t("detail.shareHint")}</DialogDescription>
          </DialogHeader>
          <ul className="mt-2 space-y-2">
            {options.map((o) => (
              <li key={o.key}>
                <a
                  href={o.href}
                  {...(o.key === "email"
                    ? {}
                    : { target: "_blank", rel: "nofollow noopener noreferrer" })}
                  onClick={() => {
                    track(o.key);
                    setOpen(false);
                  }}
                  className="flex min-h-11 w-full items-center gap-3 rounded-sm border border-border px-4 py-3 text-sm text-foreground transition hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <o.icon size={18} aria-hidden="true" />
                  {o.label}
                </a>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={copyLink}
                className="flex min-h-11 w-full items-center gap-3 rounded-sm border border-border px-4 py-3 text-sm text-foreground transition hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {copied ? <Check size={18} aria-hidden="true" /> : <Link2 size={18} aria-hidden="true" />}
                {copied ? t("share.copied") : t("share.opt.copy")}
              </button>
            </li>
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
