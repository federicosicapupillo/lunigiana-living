import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import type { RankingReport } from './google-rankings';

export const readRankingHistory = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: admin, error: roleError } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  if (roleError || !admin) throw new Error('Forbidden');
  const { data, error } = await context.supabase.from('google_rank_snapshots').select('period_end, report, created_at').order('period_end', { ascending: false }).limit(52);
  if (error) throw new Error(error.message);
  return (data ?? []).map(row => ({ ...row, report: row.report as unknown as RankingReport }));
});

