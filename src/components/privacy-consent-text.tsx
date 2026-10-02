import { Fragment } from "react";

const PHRASE = /(trattamento dei (?:miei )?dati personali|processing of (?:my )?personal data)/i;

/**
 * Renders a consent sentence turning the "trattamento dei dati personali"
 * phrase into a link to /privacy (new tab). Falls back to an appended link.
 */
export function PrivacyConsentText({ text }: { text: string }) {
  const linkCls = "font-medium text-primary underline underline-offset-2";
  const parts = text.split(PHRASE);
  if (parts.length < 3) {
    return (
      <>
        {text}{" "}
        <a href="/privacy" target="_blank" rel="noopener" className={linkCls}>
          Leggi l'informativa
        </a>
      </>
    );
  }
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <a key={i} href="/privacy" target="_blank" rel="noopener" className={linkCls}>
            {p}
          </a>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}
