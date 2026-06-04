import type { TPrimarySource } from '@diu/types';
import { Hono } from 'hono';
import { buildSessionPage } from './domain/build-page.js';
import { getLocalCalendarDay } from './domain/calendar-day.js';
import { createSession, getSession } from './domain/session-store.js';
import { recordTackle } from './domain/tackle-store.js';

function newSessionId(): string {
  return crypto.randomUUID();
}

function isPrimarySource(value: unknown): value is TPrimarySource {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.integration === 'string' &&
    record.integration.length > 0 &&
    typeof record.sourceId === 'string' &&
    record.sourceId.length > 0
  );
}

export const sessionRoutes = new Hono();

sessionRoutes.post('/session/tackle', async (c) => {
  const body: unknown = await c.req.json().catch(() => null);
  if (
    typeof body !== 'object' ||
    body === null ||
    !('primarySource' in body) ||
    !isPrimarySource((body as { primarySource: unknown }).primarySource)
  ) {
    return c.json({ error: 'primarySource required' }, 400);
  }

  const { primarySource } = body as { primarySource: TPrimarySource };
  recordTackle(primarySource, getLocalCalendarDay(c));
  return c.body(null, 204);
});

sessionRoutes.get('/session', (c) => {
  const sessionId = newSessionId();
  createSession(sessionId);
  return c.json(buildSessionPage(sessionId, 0, getLocalCalendarDay(c)));
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

  return c.json(buildSessionPage(sessionId, offset, getLocalCalendarDay(c)));
});
