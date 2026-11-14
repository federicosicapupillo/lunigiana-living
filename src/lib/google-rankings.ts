export const RANK_TARGETS = [
  { query: 'furia immobiliare', path: '/' },
  { query: 'agenzia immobiliare pontremoli', path: '/' },
  { query: 'case in vendita lunigiana', path: '/case-in-vendita-lunigiana' },
  { query: 'case in vendita pontremoli', path: '/case-in-vendita/pontremoli' },
] as const;
export type GoogleRow = { keys: string[]; clicks: number; impressions: number; position: number };
export function weeklyPeriods(now: Date) {
  const day = new Date(now.toISOString().slice(0, 10) + 'T00:00:00Z');
  // Last completed Monday-anchored reporting cycle, with a three-day data lag.
  const daysSinceMonday = (day.getUTCDay() + 6) % 7;
  day.setUTCDate(day.getUTCDate() - daysSinceMonday - 3);
  const date = (offset: number) => new Date(day.getTime() + offset * 86400000).toISOString().slice(0, 10);
  return { current: { start: date(-6), end: date(0) }, previous: { start: date(-13), end: date(-7) } };
}
export function coversSite(site: string, target: string) {
  const url = new URL(target);
  if (site.startsWith('sc-domain:')) {
    const domain = site.slice(10).toLowerCase();
    return url.hostname === domain || url.hostname.endsWith('.' + domain);
  }
  try { return url.href.startsWith(new URL(site).href); } catch { return false; }
}
export function metrics(rows: GoogleRow[], query: string, path: string) {
  const row = rows.find(r => r.keys[0] === query && r.keys[1] === `https://furiaimmobiliare.it${path}`);
  return row && row.impressions > 0 ? { position: row.position, clicks: row.clicks, impressions: row.impressions } : null;
}
export type RankingReport = ReturnType<typeof weeklyPeriods> & {
  collectedAt: string;
  rankings: { query: string; path: string; current: ReturnType<typeof metrics>; previous: ReturnType<typeof metrics> }[];
};