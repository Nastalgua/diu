# Session fetch error and retry

**Type:** AFK  
**User stories:** 17

## What to build

When initial **session** load, prefetch, or refresh fails, show a recoverable error state on the Feed tab with retry. Failed requests must not corrupt in-memory or persisted **session** state (no partial duplicate **cards**, no orphan `sessionId` without stack).

## Acceptance criteria

- [ ] Network or API failure on first load shows an error UI with retry that re-attempts **session** fetch
- [ ] Prefetch failure leaves the current stack and index unchanged; retry can resume prefetch
- [ ] Refresh failure leaves the prior **session** usable (or clear error without blanking to a broken empty pager)
- [ ] Tests assert state unchanged after failed fetch and successful retry

## Blocked by

- [02-mobile-first-session-batch.md](./02-mobile-first-session-batch.md)
