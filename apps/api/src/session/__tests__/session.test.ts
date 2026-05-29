import { beforeEach, describe, expect, it } from 'vitest';
import { app } from '../../app.js';
import { clearSessions } from '../domain/session-store.js';

describe('session API', () => {
  beforeEach(() => {
    clearSessions();
  });

  it('GET /session returns first batch with sessionId and cursor', async () => {
    const res = await app.request('/session');

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.sessionId).toEqual(expect.any(String));
    expect(body.cards).toHaveLength(2);
    expect(body.cards[0]).toMatchObject({
      id: '1',
      title: 'Review PR #142',
      class: 'software-engineering',
      classType: 'pr-review-request',
    });
    expect(body.hasMore).toBe(true);
    expect(body.cursor).toBe('2');
    expect(body.endCard).toBeUndefined();
  });

  it('GET /session/:sessionId/cards returns middle batch via cursor', async () => {
    const created = await app.request('/session');
    const { sessionId, cursor } = await created.json();

    const res = await app.request(
      `/session/${sessionId}/cards?cursor=${cursor}`
    );

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.sessionId).toBe(sessionId);
    expect(body.cards).toHaveLength(2);
    expect(body.cards[0].id).toBe('3');
    expect(body.hasMore).toBe(true);
    expect(body.cursor).toBe('4');
    expect(body.endCard).toBeUndefined();
  });

  it('GET /session/:sessionId/cards returns terminal batch with end card', async () => {
    const created = await app.request('/session');
    const { sessionId } = await created.json();

    const middle = await app.request(`/session/${sessionId}/cards?cursor=2`);
    const { cursor } = await middle.json();

    const res = await app.request(
      `/session/${sessionId}/cards?cursor=${cursor}`
    );

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.cards).toHaveLength(1);
    expect(body.cards[0].id).toBe('5');
    expect(body.hasMore).toBe(false);
    expect(body.cursor).toBeNull();
    expect(body.endCard).toEqual({
      kind: 'end',
      id: 'end',
      title: 'Caught up',
      description: "You're through today's stack.",
    });
  });

  it('GET /session/cards is removed', async () => {
    const res = await app.request('/session/cards');

    expect(res.status).toBe(404);
  });

  it('rotates fixture deck on each new session so refresh is visually distinct', async () => {
    const first = await app.request('/session');
    const second = await app.request('/session');

    const firstBody = await first.json();
    const secondBody = await second.json();

    expect(firstBody.sessionId).not.toBe(secondBody.sessionId);
    expect(firstBody.cards[0].title).toBe('Review PR #142');
    expect(secondBody.cards[0].title).toBe('Draft Q2 roadmap');
  });

  it('rejects further pages after session is exhausted', async () => {
    const created = await app.request('/session');
    const { sessionId } = await created.json();

    await app.request(`/session/${sessionId}/cards?cursor=2`);
    await app.request(`/session/${sessionId}/cards?cursor=4`);

    const res = await app.request(`/session/${sessionId}/cards?cursor=4`);

    expect(res.status).toBe(410);
    expect(await res.json()).toEqual({ error: 'session exhausted' });
  });
});
