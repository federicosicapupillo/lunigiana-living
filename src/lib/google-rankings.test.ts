import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RANK_TARGETS, weeklyPeriods, metrics, coversSite } from './google-rankings';
test('tracks the four requested searches exactly', () => {
  assert.deepEqual(RANK_TARGETS.map(t => t.query), ['furia immobiliare', 'agenzia immobiliare pontremoli', 'case in vendita lunigiana', 'case in vendita pontremoli']);
});
test('weekly periods are consecutive seven-day windows with lag', () => {
  assert.deepEqual(weeklyPeriods(new Date('2026-11-16T09:00:00Z')), { current: { start: '2026-11-07', end: '2026-11-13' }, previous: { start: '2026-10-31', end: '2026-11-06' } });
});
test('missing data never becomes a ranking', () => assert.equal(metrics([], 'furia immobiliare', '/'), null));
test('only the real target page is measured', () => {
  assert.equal(metrics([{ keys: ['furia immobiliare', 'https://other.it/'], clicks: 4, impressions: 5, position: 1 }], 'furia immobiliare', '/'), null);
});
test('domain coverage excludes similarly named domains', () => {
  assert.equal(coversSite('sc-domain:furiaimmobiliare.it', 'https://furiaimmobiliare.it/'), true);
  assert.equal(coversSite('sc-domain:furiaimmobiliare.it', 'https://notfuriaimmobiliare.it/'), false);
});