import { Hono } from 'hono';
import { buildSessionPage } from './domain/build-page.js';
import { createSession, getSession } from './domain/session-store.js';

function newSessionId(): string {
  return crypto.randomUUID();
}

export const sessionRoutes = new Hono();

sessionRoutes.get('/session', (c) => {
  const sessionId = newSessionId();
  createSession(sessionId);
  return c.json(buildSessionPage(sessionId, 0));
});

sessionRoutes.get('/session/:sessionId/cards', (c) => {
  const sessionId = c.req.param('sessionId');
  const record = getSession(sessionId);

  if (!record) {
    return c.json({ error: 'session not found' }, 404);
  }

  if (record.exhausted) {
    return c.json({ error: 'session exhausted' }, 410);
  }

  const cursor = c.req.query('cursor');
  if (cursor === undefined) {
    return c.json({ error: 'cursor required' }, 400);
  }

  const offset = Number(cursor);
  if (!Number.isInteger(offset) || offset < 0) {
    return c.json({ error: 'invalid cursor' }, 400);
  }

  return c.json(buildSessionPage(sessionId, offset));
});
