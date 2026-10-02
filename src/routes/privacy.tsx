import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { siteUrl } from "@/lib/site-url";

const TITLE = "Informativa privacy e cookie — Furia Immobiliare";
const DESC =
  "Come Furia Immobiliare di Pontremoli tratta i dati personali di chi usa il sito: moduli di contatto, statistiche proprie, archiviazione locale, diritti e cancellazione dei dati.";

export const Route = createFileRoute("/privacy")({
  head: () => {
    const url = siteUrl("/privacy");
    return {
      meta: [
        { title: TITLE },
        { name: "description", content: DESC },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: DESC },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: PrivacyPage,
});

const EMAIL = "furiaimmobiliare@libero.it";

function Section({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-border pt-8">
      <h2 className="font-serif text-3xl leading-tight text-ink">{title}</h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-foreground/80">{children}</div>
    </section>
  );
}

function Mail() {
  return (
    <a href={`mailto:${EMAIL}`} className="text-primary underline underline-offset-2">
      {EMAIL}
    </a>
  );
}

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
      {children}
    </a>
  );
}

function PrivacyPage() {
  return (
    <article className="container-editorial max-w-3xl pb-24 pt-28 md:pt-36">
      <span className="eyebrow">Privacy</span>
      <h1 className="mt-3 font-serif text-5xl leading-tight text-ink md:text-6xl">
        Informativa privacy e cookie
      </h1>
      <p className="mt-4 text-sm text-foreground/60">Ultimo aggiornamento: 2 ottobre 2026</p>
      <p className="mt-6 text-base leading-relaxed text-foreground/80">
        Questa informativa spiega quali dati personali raccoglie il sito furiaimmobiliare.it, perché
        li usiamo e quali sono i tuoi diritti, ai sensi del Regolamento UE 2016/679 (GDPR) e del
        D.Lgs. 196/2003 (Codice privacy), come modificato dal D.Lgs. 101/2018.
      </p>

      <div className="mt-12 space-y-10">
        <Section title="Titolare del trattamento">
          <ul className="space-y-1">
            <li><strong>Titolare del trattamento:</strong> Furia Immobiliare di Furia Elena</li>
            <li><strong>P.IVA:</strong> 011161140452</li>
            <li><strong>Sede:</strong> Via Pirandello 7, 54027 Pontremoli (MS)</li>
            <li><strong>Email per richieste privacy:</strong> <Mail /></li>
          </ul>
        </Section>

        <Section title="Quali dati raccogliamo">
          <p>
            <strong>Dati che inserisci nei moduli.</strong> Quando compili un modulo di contatto,
            di richiesta informazioni su un immobile, di valutazione, della ricerca guidata, della
            guida gratuita o dell'area off-market, raccogliamo i dati che scegli di indicare: nome,
            email, telefono, messaggio e le preferenze sull'immobile (ad esempio tipologia, zona,
            budget, tempi). Insieme alla richiesta registriamo la pagina da cui è stata inviata e
            l'eventuale provenienza della visita (ad esempio il nome di una campagna).
          </p>
          <p>
            <strong>Dati di navigazione e statistiche proprie.</strong> Il sito raccoglie in proprio,
            senza strumenti di terze parti, informazioni sull'uso delle pagine: pagine e annunci
            visti, clic sui pulsanti WhatsApp e telefono, condivisioni di un annuncio, lingua e
            provenienza della visita (parametri della campagna). Questi dati sono legati a un
            identificativo di sessione tecnico casuale, valido solo per la scheda del browser
            aperta. Non registriamo indirizzo IP, nome, email o telefono in queste statistiche.
          </p>
          <p>
            <strong>Dati di chi ci contatta via WhatsApp o telefono.</strong> Se ci scrivi su
            WhatsApp o ci chiami, trattiamo il tuo numero e il contenuto della conversazione per
            risponderti.
          </p>
        </Section>

        <Section title="Finalità e base giuridica">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Rispondere alle tue richieste</strong> e svolgere attività precontrattuali
              (informazioni, visite, valutazioni, proposte): art. 6.1.b GDPR.
            </li>
            <li>
              <strong>Statistiche aggregate</strong> per migliorare il sito e gli annunci: legittimo
              interesse del titolare, art. 6.1.f GDPR. Puoi opporti in qualsiasi momento.
            </li>
            <li>
              <strong>Adempiere a obblighi di legge</strong> (ad esempio fiscali e antiriciclaggio
              in caso di incarico): art. 6.1.c GDPR.
            </li>
            <li>
              <strong>Aggiornamenti su immobili e novità</strong>, solo se hai spuntato l'apposita
              casella facoltativa: consenso, art. 6.1.a GDPR, revocabile in ogni momento.
            </li>
          </ul>
        </Section>

        <Section title="Per quanto tempo conserviamo i dati">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Richieste di contatto: fino a 24 mesi dall'ultimo contatto, salvo un rapporto
              contrattuale in corso. In quel caso i dati sono conservati per la durata del rapporto
              e per i tempi previsti dalla legge.
            </li>
            <li>Statistiche di navigazione: fino a 26 mesi.</li>
          </ul>
        </Section>

        <Section title="A chi comunichiamo i dati">
          <p>I dati sono trattati dal titolare e possono essere trattati, come responsabili del trattamento, da:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              fornitori tecnici di hosting e database che ospitano il sito e conservano le
              richieste (infrastruttura Lovable Cloud / Supabase);
            </li>
            <li>
              strumenti interni di notifica, che avvisano il titolare dell'arrivo di una nuova
              richiesta o di un clic su un annuncio. Questi strumenti <strong>non ricevono</strong>{" "}
              nome, email, telefono, messaggio o altri dati personali, ma solo l'annuncio
              interessato e la provenienza della visita.
            </li>
          </ul>
          <p>
            Non vendiamo né cediamo i dati a terzi per finalità di marketing. I caratteri
            tipografici del sito sono ospitati direttamente sul nostro sito: il tuo browser non
            si collega a servizi esterni per caricarli.
          </p>
        </Section>

        <Section title="Trasferimenti fuori dall'Unione europea">
          <p>
            Se un fornitore tratta i dati fuori dall'Unione europea, il trasferimento avviene con
            le garanzie previste dal GDPR: clausole contrattuali standard approvate dalla
            Commissione europea oppure adesione al Data Privacy Framework UE-USA.
          </p>
        </Section>

        <Section title="Cookie e archiviazione locale">
          <p>
            Il sito <strong>non usa cookie di profilazione né cookie pubblicitari</strong> e{" "}
            <strong>non usa cookie di terze parti</strong>. Non sono presenti strumenti di
            statistica esterni, pixel social o mappe di terze parti. Per questo non ti chiediamo un
            consenso ai cookie.
          </p>
          <p>Usiamo solo strumenti tecnici di archiviazione del browser:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>sessionStorage</strong> (cancellato quando chiudi la scheda): un
              identificativo di sessione casuale per le statistiche proprie, la provenienza della
              visita (parametri della campagna) e la prima pagina visitata.
            </li>
            <li>
              <strong>localStorage</strong>: la lingua che hai scelto (italiano o inglese), per
              mostrarti il sito nella stessa lingua alla visita successiva.
            </li>
            <li>
              Solo nell'area riservata allo staff: gli strumenti tecnici necessari a mantenere
              l'accesso. I visitatori del sito non li usano.
            </li>
          </ul>
          <p>Puoi cancellare questi dati in qualsiasi momento dalle impostazioni del browser.</p>
        </Section>

        <Section title="I tuoi diritti">
          <p>
            In base agli articoli 15-22 del GDPR puoi chiedere in qualsiasi momento: accesso ai tuoi
            dati, rettifica, cancellazione, limitazione del trattamento, portabilità e opposizione
            al trattamento, compreso quello basato sul legittimo interesse. Puoi anche revocare un
            consenso dato. Per esercitare i tuoi diritti scrivi a <Mail />.
          </p>
          <p>
            Hai inoltre diritto di proporre reclamo al Garante per la protezione dei dati personali
            (<Ext href="https://www.garanteprivacy.it">garanteprivacy.it</Ext>).
          </p>
        </Section>

        <Section id="cancellazione-dati" title="Come chiedere la cancellazione dei tuoi dati">
          <p>
            Basta scrivere a <Mail /> con oggetto <strong>"Cancellazione dati"</strong>, indicando
            l'email o il numero di telefono con cui ci hai contattato. Ti rispondiamo entro 30
            giorni.
          </p>
          <p>
            Lo stesso vale per i dati di chi ci scrive o commenta su Instagram e che gestiamo con i
            nostri strumenti di risposta.
          </p>
        </Section>

        <Section title="Instagram e WhatsApp">
          <p>
            Il sito contiene link al nostro profilo Instagram e pulsanti per scriverci su WhatsApp.
            Questi servizi si attivano solo se ci clicchi. Su quelle piattaforme valgono anche le
            loro informative:{" "}
            <Ext href="https://privacycenter.instagram.com/policy">privacy di Instagram</Ext> e{" "}
            <Ext href="https://www.whatsapp.com/legal/privacy-policy-eea">privacy di WhatsApp</Ext>.
          </p>
        </Section>
      </div>
    </article>
  );
}
