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
});
