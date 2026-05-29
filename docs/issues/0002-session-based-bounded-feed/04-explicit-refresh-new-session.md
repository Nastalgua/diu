# Explicit refresh starts new session

**Type:** AFK  
**User stories:** 7, 8, 9, 28

## What to build

Explicit refresh (re-tap Feed tab while focused, existing **useFeedTabRefresh** behavior) requests a **new session** from the API: new `sessionId`, fresh first batch, pager index reset to 0, and the existing loading overlay while the request runs. Prior in-memory stack is discarded. **Saved** **cards** may appear again in the new stack; **tackled** filtering is out of scope until slice 08 / ADR 0006.

## Acceptance criteria

- [ ] Re-tapping Feed while on Feed triggers refresh and fetches a new **session** from the API
- [ ] Loading overlay blocks interaction during refresh; pager remounts at index 0 with new `sessionId`
- [ ] After refresh, stack content reflects the new **session** (not merged with the old stack)
- [ ] Pull-to-refresh is not introduced
- [ ] Tests cover refresh clearing prior `sessionId` and resetting index

## Blocked by

- [02-mobile-first-session-batch.md](./02-mobile-first-session-batch.md)
