import { RANK_TARGETS, coversSite, metrics, weeklyPeriods, type GoogleRow, type RankingReport } from './google-rankings';

export async function collectRankingSnapshot() {
  const key = process.env['LOVABLE_API_KEY'];
  const connection = process.env['GOOGLE_SEARCH_CONSOLE_API_KEY'];
  if (!key || !connection) throw new Error('Search Console credentials missing');
  const headers = { Authorization: `Bearer ${key}`, 'X-Connection-Api-Key': connection, 'Content-Type': 'application/json' };
  const call = async (path: string, body?: object) => {
    const response = await fetch(`https://connector-gateway.lovable.dev/google_search_console${path}`, { method: body ? 'POST' : 'GET', headers, body: body ? JSON.stringify(body) : undefined });
    if (!response.ok) { const text = await response.text(); console.error(`Search Console [${response.status}]: ${text}`); throw new Error(`Search Console [${response.status}]: ${text}`); }
    return response.json();
  };
  const sites = await call('/webmasters/v3/sites') as { siteEntry?: { siteUrl: string; permissionLevel: string }[] };
  const candidates = (sites.siteEntry ?? []).filter(s => s.permissionLevel !== 'siteUnverifiedUser' && coversSite(s.siteUrl, 'https://furiaimmobiliare.it/'));
  if (candidates.length !== 1) return { status: candidates.length ? 'selection_required' : 'no_verified_property', candidates: candidates.map(s => s.siteUrl) };
  const site = candidates[0];
  if (!site) throw new Error('No verified property');
  const periods = weeklyPeriods(new Date());
  const query = async (period: { start: string; end: string }) => {
    const result = await call(`/webmasters/v3/sites/${encodeURIComponent(site.siteUrl)}/searchAnalytics/query`, {
      startDate: period.start, endDate: period.end, dimensions: ['query', 'page'], type: 'web', dataState: 'final', rowLimit: 25000,
      dimensionFilterGroups: [{ filters: [{ dimension: 'query', operator: 'includingRegex', expression: '^(' + RANK_TARGETS.map(t => t.query).join('|') + ')$' }, { dimension: 'country', operator: 'equals', expression: 'ita' }] }],
    }) as { rows?: GoogleRow[] };
    return result.rows ?? [];
  };
  // Sequential calls stop the batch on access failures or rate limits.
  const current = await query(periods.current);
  const previous = await query(periods.previous);
  const report: RankingReport = { ...periods, collectedAt: new Date().toISOString(), rankings: RANK_TARGETS.map(t => ({ ...t, current: metrics(current, t.query, t.path), previous: metrics(previous, t.query, t.path) })) };
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { error } = await supabaseAdmin.from('google_rank_snapshots').upsert({ site_url: site.siteUrl, period_end: periods.current.end, report: JSON.parse(JSON.stringify(report)) }, { onConflict: 'site_url,period_end' });
  if (error) throw new Error(error.message);
  return { status: 'ok', periodEnd: periods.current.end };
}