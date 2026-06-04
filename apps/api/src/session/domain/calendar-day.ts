import type { Context } from 'hono';

export function getLocalCalendarDay(c: Context): string {
  return c.req.header('X-Local-Calendar-Day') ?? utcCalendarDay();
}

export function utcCalendarDay(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}
