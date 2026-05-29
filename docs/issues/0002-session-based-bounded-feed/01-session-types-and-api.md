# Session types and cursor API

**Type:** AFK  
**User stories:** 4, 5, 6, 19, 21, 22, 23, 30

## What to build

Define shared **session** contract types and implement a minimal Hono **session** API that issues a `sessionId`, returns **cards** in cursor-based batches, enforces a fixture daily maximum, and delivers an **end card** on the final page when `hasMore` is false. Replace the flat `GET /session/cards` stub with session-scoped routes (e.g. create or fetch **session**, then fetch next page by cursor). Responses use server-authored presentation fields on each **card** (ADR 0004). No integrations or AI — deterministic fixture ordering is enough for v1.

## Acceptance criteria

- [ ] `@diu/types` exports session page types: `sessionId`, `cards`, `cursor`, `hasMore`, and **end card** shape (or discriminated stack item) consumed by API and mobile
- [ ] API creates or returns a **session** with a stable `sessionId` and a first batch of `TCard` items
- [ ] API returns further batches via cursor until daily cap is reached; final response includes **end card** and `hasMore: false`
- [ ] Client cannot request pages after the **session** is exhausted
- [ ] Vitest request tests cover first page, middle page, and terminal page with **end card**
- [ ] Flat unscoped cards endpoint is removed or redirected to the new contract

## Blocked by

None — can start immediately
