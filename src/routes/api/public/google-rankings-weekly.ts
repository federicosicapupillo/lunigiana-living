import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/api/public/google-rankings-weekly')({
  server: { handlers: { POST: async ({ request }) => {
    const { authenticateCronRequest } = await import('@/integrations/supabase/cron-auth');
    const denied = await authenticateCronRequest(request);
    if (denied) return denied;
    try {
      const { collectRankingSnapshot } = await import('@/lib/google-rankings.server');
      const result = await collectRankingSnapshot();
      return Response.json(result, { status: result.status === 'ok' ? 200 : 409, headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
      console.error('Weekly ranking collection failed', error);
      return Response.json({ status: 'failed', message: 'Raccolta Google non completata' }, { status: 502 });
    }
  } } },
});