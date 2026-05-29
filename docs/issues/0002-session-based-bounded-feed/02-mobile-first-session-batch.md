# Mobile loads first session batch

**Type:** AFK  
**User stories:** 1, 16, 19, 27

## What to build

Wire the Feed tab to load today's **session** from the API on open: a **SessionClient** fetches the initial page, a **SessionFeed** (or equivalent hook/module) holds `sessionId` and the loaded stack, and **FeedScreen** passes that stack into the existing **FeedPager** instead of static fake-data. The current **card** stays visible while later slices add prefetch. Retain fake-data for unit tests and offline UI so developers are not blocked when the API is down.

## Acceptance criteria

- [ ] Opening Feed with API available shows server-authored **cards** (title, description, focus required, duration) in the pager
- [ ] `sessionId` from the API drives pager `key` / scroll-position scope (replacing client-random id for the happy path)
- [ ] Fake-data path still works in tests or behind a dev flag
- [ ] **FeedPager** and **seen** / swipe-back behavior unchanged (ADR 0001)
- [ ] Tests cover SessionClient parsing and FeedScreen rendering with a mocked session response (no scroll physics assertions)

## Blocked by

- [01-session-types-and-api.md](./01-session-types-and-api.md)
