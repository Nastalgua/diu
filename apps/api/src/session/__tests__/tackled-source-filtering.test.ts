import { beforeEach, describe, expect, it } from 'vitest';
import { app } from '../../app.js';
import { clearSessions } from '../domain/session-store.js';
import { clearTackles } from '../domain/tackle-store.js';

const CALENDAR_DAY = '2026-06-03';
const sessionHeaders = { 'X-Local-Calendar-Day': CALENDAR_DAY };

const pr142 = { integration: 'github', sourceId: 'pr-142' };

describe('tackled primary source filtering', () => {
  beforeEach(() => {
    clearSessions();
    clearTackles();
  });

  it('omits cards sharing a tackled primary source on the first session page', async () => {
    const tackleRes = await app.request('/session/tackle', {
      method: 'POST',
      headers: {
        ...sessionHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ primarySource: pr142 }),
    });
    expect(tackleRes.status).toBe(204);

    const res = await app.request('/session', { headers: sessionHeaders });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.cards.map((c: { id: string }) => c.id)).toEqual(['2', '3']);
    expect(
      body.cards.every(
        (c: { primarySource: { sourceId: string } }) =>
          c.primarySource.sourceId !== 'pr-142'
      )
    ).toBe(true);
  });

  it('omits tackled primary sources on cursor pages', async () => {
    await app.request('/session/tackle', {
      method: 'POST',
      headers: {
        ...sessionHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ primarySource: pr142 }),
    });

    const created = await app.request('/session', { headers: sessionHeaders });
    const { sessionId, cursor } = await created.json();

    const res = await app.request(
      `/session/${sessionId}/cards?cursor=${cursor}`,
      { headers: sessionHeaders }
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cards.map((c: { id: string }) => c.id)).toEqual(['5']);
    expect(body.hasMore).toBe(false);
    expect(body.endCard).toMatchObject({ kind: 'end' });
  });

  it('applies the same day-level hide list on a new session', async () => {
    await app.request('/session/tackle', {
      method: 'POST',
      headers: {
        ...sessionHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ primarySource: pr142 }),
    });

    const first = await app.request('/session', { headers: sessionHeaders });
    const second = await app.request('/session', { headers: sessionHeaders });

    const firstBody = await first.json();
    const secondBody = await second.json();

    expect(firstBody.sessionId).not.toBe(secondBody.sessionId);
    expect(
      secondBody.cards.every(
        (c: { primarySource: { sourceId: string } }) =>
          c.primarySource.sourceId !== 'pr-142'
      )
    ).toBe(true);
  });

  it('does not hide cards when only other actions occurred (no tackle recorded)', async () => {
    const res = await app.request('/session', { headers: sessionHeaders });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cards.map((c: { id: string }) => c.id)).toEqual(['1', '2']);
  });

  it('resets the hide list on a new calendar day', async () => {
    await app.request('/session/tackle', {
      method: 'POST',
      headers: {
        ...sessionHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ primarySource: pr142 }),
    });

    const hidden = await app.request('/session', { headers: sessionHeaders });
    expect((await hidden.json()).cards[0].id).toBe('2');

    clearSessions();

    const nextDay = await app.request('/session', {
      headers: { 'X-Local-Calendar-Day': '2026-06-04' },
    });
    expect((await nextDay.json()).cards[0].id).toBe('1');
  });
});
