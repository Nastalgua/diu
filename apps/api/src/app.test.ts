import { describe, expect, it } from 'vitest';
import { app } from './app.js';

describe('app', () => {
  it('GET / returns service metadata', async () => {
    const res = await app.request('/');

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      name: 'diu-api',
      version: '0.0.0',
    });
  });

  it('GET /health returns ok', async () => {
    const res = await app.request('/health');

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('GET /session/cards returns server-authored cards', async () => {
    const res = await app.request('/session/cards');

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.cards).toHaveLength(2);
    expect(body.cards[0]).toMatchObject({
      id: '1',
      title: 'Review PR #142',
      class: 'software-engineering',
      classType: 'pr-review-request',
    });
  });
});
