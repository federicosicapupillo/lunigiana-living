import { createFileRoute } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useQuery } from '@tanstack/react-query';
import { readRankingHistory } from '@/lib/google-rankings.functions';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export const Route = createFileRoute('/_admin/admin/google-ranking')({
  head: () => ({ meta: [
    { title: 'Posizioni Google settimanali | Furia Immobiliare' },
    { name: 'description', content: 'Storico riservato delle posizioni Google di Furia Immobiliare, Lunigiana e Pontremoli.' },
    { property: 'og:title', content: 'Posizioni Google | Furia Immobiliare' },
    { property: 'og:description', content: 'Confronto settimanale delle quattro ricerche monitorate.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
    { name: 'robots', content: 'noindex,nofollow' },
  ] }), component: RankingPage,
});
function RankingPage() {
  const read = useServerFn(readRankingHistory);
  // The existing admin layout resolves the session before mounting this page.
  const history = useQuery({ queryKey: ['google-ranking-history'], queryFn: () => read(), staleTime: 60000 });
  return <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
    <header className="flex items-center justify-between gap-4"><h1 className="font-serif text-3xl text-ink">Posizioni Google</h1><Button variant="outline" size="icon" title="Rileggi storico" aria-label="Rileggi storico" disabled={history.isFetching} onClick={() => void history.refetch()}><RefreshCw size={16} /></Button></header>
    <p className="text-sm text-muted-foreground">Italia · Google Search Console · Posizioni medie osservate, non posizioni istantanee.</p>
    <p className="border-l-2 border-primary pl-4 text-sm text-ink">Pianificazione settimanale non ancora attiva.</p>
    {history.isLoading && <p>Caricamento…</p>}
    {history.isError && <p role="alert">Impossibile leggere lo storico. Riprova.</p>}
    {history.data?.length === 0 && <p className="text-muted-foreground">Nessuna rilevazione salvata.</p>}
    {history.data?.map(snapshot => <section key={snapshot.period_end} className="space-y-3">
      <h2 className="font-serif text-xl text-ink">{snapshot.report.current.start} — {snapshot.report.current.end}</h2>
      <p className="text-xs text-muted-foreground">Confronto: {snapshot.report.previous.start} — {snapshot.report.previous.end}</p>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-border">{['Ricerca', 'Posizione', 'Precedente', 'Variazione', 'Clic', 'Impressioni'].map(label => <th key={label} className="px-3 py-3 font-medium">{label}</th>)}</tr></thead><tbody>
        {snapshot.report.rankings.map(row => { const delta = row.current && row.previous ? row.previous.position - row.current.position : null; return <tr key={row.query} className="border-b border-border"><td className="min-w-48 px-3 py-3">{row.query}</td><td className="px-3 py-3">{row.current?.position.toFixed(1) ?? 'Nessun dato'}</td><td className="px-3 py-3">{row.previous?.position.toFixed(1) ?? '—'}</td><td className="px-3 py-3">{delta === null ? '—' : delta === 0 ? 'Stabile' : `${delta > 0 ? '+' : ''}${delta.toFixed(1)}`}</td><td className="px-3 py-3">{row.current?.clicks ?? '—'}</td><td className="px-3 py-3">{row.current?.impressions ?? '—'}</td></tr>; })}
      </tbody></table></div>
    </section>)}
  </div>;
}