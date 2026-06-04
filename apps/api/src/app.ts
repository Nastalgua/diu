import { Hono } from 'hono';
import { sessionRoutes } from './session/routes.js';

export type ApiEnv = {
  Variables: Record<string, never>;
};

export const app = new Hono<ApiEnv>();

app.get('/', (c) =>
  c.json({
    name: 'diu-api',
    version: '0.0.0',
  }),
);

app.get('/health', (c) => c.json({ ok: true }));

app.route('/', sessionRoutes);
