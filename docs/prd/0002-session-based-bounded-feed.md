# PRD: Session-based bounded feed

> Derived from [ADR 0002 — Session-based bounded feed](../adr/0002-session-based-bounded-feed.md).

## Problem Statement

Infinite feeds train users to keep scrolling with no natural stopping point — the habit Diu exists to replace. Users need a **feed** that feels purposeful and finite: a curated stack of **cards** sized for a morning triage window, not an endless stream of generated content. Without an explicit **session** model, the product cannot enforce a daily cap, deliver a meaningful **end card**, prefetch without pretending to be infinite, or resume triage where the user left off. The snap-paging interaction (ADR 0001) is built; it still runs on static fixture data and a client-generated `sessionId`, so the bounded-session promise is not yet real end-to-end.

## Solution

The **feed** is backed by a **session** — a server-issued, intentionally bounded stack of **cards** for the current calendar day (or until refresh). **Cards** arrive in cursor-based batches with prefetch near the end of the loaded stack; the server enforces a daily maximum and appends an **end card** when the stack is exhausted. A **new session** starts on a new calendar day, after a configurable stale time window, or on explicit user refresh; otherwise the app **resumes** the same session at the last viewed **card**. The mobile client orchestrates loading and prefetch; the API owns session identity, cursor pagination, and what belongs in today's stack. Fixture data remains available for UI-only work, but the Feed tab's primary path loads from the session API.

## User Stories

1. As a user opening the Feed tab for the first time today, I want the app to load or create today's **session**, so that I see a curated stack rather than an empty or static demo list.
2. As a user triaging my morning, I want the forward stack to contain only **cards** still available to triage today, so that I am not shown work I already **tackled** (per ADR 0006, when tackle persistence exists).
3. As a user scrolling toward the end of the loaded stack, I want the next batch of **cards** to load before I run out, so that snap paging never lands on a blank page while waiting.
4. As a user approaching the true end of today's **session**, I want prefetch to stop and the **end card** to appear, so that I understand I am **caught up** rather than hitting a loading spinner forever.
5. As a user on the **end card**, I want clear copy that today's stack is complete, so that the bounded **session** feels intentional, not broken.
6. As a user who has reached the **end card**, I want not to receive more **cards** in that **session**, so that the daily cap is respected.
7. As a user refreshing the feed explicitly, I want a **new session** with a fresh stack, so that I can get a new ordering or set of **cards** without waiting until tomorrow.
8. As a user refreshing mid-stack, I want a loading state and then my pager position reset to the start of the **new session**, so that I understand the stack replaced the old one.
9. As a user who only **saved** a **card** earlier, I want that **card** to be eligible again in a **new session** after refresh, so that bookmarking does not permanently remove work from the feed.
10. As a user who **tackled** a **card**, I want **cards** sharing that **primary source** hidden from forward paging for the rest of the calendar day, so that the forward stack only shows work still available (ADR 0006).
11. As a user returning to the app within the same calendar day without refreshing, I want to **resume** on the last **card** I was viewing in the same **session**, so that I pick up triage where I left off.
12. As a user returning after midnight (local calendar day), I want a **new session** automatically, so that each day gets its own bounded stack.
13. As a user returning after the **session** has been idle past a stale time window, I want a **new session**, so that outdated morning stacks do not linger indefinitely.
14. As a user deep in a **session**, I want **seen** history and swipe-back within the current **session** unchanged (ADR 0001), so that session loading does not break pager semantics.
15. As a user switching to another tab and back, I want my pager position preserved for the same **sessionId**, so that tab navigation does not reset my place.
16. As a user on a slow network, I want the current **card** to remain visible while the next batch prefetches, so that triage never flashes empty content.
17. As a user on a failed network request, I want a recoverable error state with retry, so that a transient failure does not corrupt **session** state.
18. As a user, I want "infinite scroll" language in the product to mean prefetch within a **session**, not unbounded content, so that Diu's anti-doom-scroll promise stays honest.
19. As a user viewing a **card**, I want **title** and **description** as the server authored them (ADR 0004), so that copy reflects the moment rather than client templates.
20. As a user viewing a multi-source **card** (ADR 0003), I want **primary** and **context sources** reflected in server payload when the pipeline supplies them, so that tackle and context UI can render correctly in a later slice.
21. As a developer, I want session request and response shapes defined in the shared types package, so that mobile and API stay in sync.
22. As a developer, I want the session API to be cursor-based (not offset/limit on a global list), so that batches are stable as the stack mutates.
23. As a developer, I want a minimal Hono endpoint that returns fixture **cards** in session shape before the full feed pipeline (ADR 0005), so that mobile integration can ship incrementally.
24. As a developer, I want session lifecycle rules (new day, stale window, explicit refresh) centralized in one client module, so that FeedScreen stays thin orchestration.
25. As a developer, I want persisted **sessionId**, cursor, loaded stack, and resume index on device, so that cold start resume works without round-trips for every field.
26. As a developer maintaining tests, I want session loading and prefetch testable without the real pager scroll physics, so that session logic does not depend on FeedPager internals.
27. As a developer, I want fake-data still usable when the API is disabled or in tests, so that UI work is not blocked on backend availability.
28. As a user re-tapping the Feed tab while already on Feed, I want that gesture to trigger explicit refresh (existing behavior), so that **new session** remains discoverable without pull-to-refresh.
29. As a user at the first **card** of a **session**, I want no earlier **cards** beyond **seen** history, so that backward bounds stay consistent with ADR 0001.
30. As a user who has not exhausted today's cap, I want the forward stack to grow only via server batches, so that the client cannot invent extra **cards** beyond the **session** contract.

## Implementation Decisions

### Deep modules

The following modules encapsulate most of the complexity behind small interfaces. They are intended to be testable in isolation.

| Module | Responsibility | Interface (conceptual) |
| --- | --- | --- |
| **SessionFeed** | Owns active **session** state: `sessionId`, loaded stack (work **cards** + **end card**), cursor, `hasMore`, resume index; decides when to start a **new session** (calendar day, stale window, explicit refresh) | `getStack()`, `getResumeIndex()`, `refresh()`, `ensureLoaded()`, `prefetchIfNeeded(currentIndex)` |
| **SessionClient** | HTTP client for session API: fetch initial page, fetch next cursor page | `getSession()`, `getNextPage(sessionId, cursor)` |
| **SessionPersistence** | Persists `sessionId`, cursor, loaded items, resume index, and last-active timestamp across app restarts | `load()`, `save(snapshot)`, `clear()` |
| **Session API (Hono)** | Issues **session** identity, returns cursor-paginated **card** batches and terminal **end card** metadata | `GET /session` (or equivalent), `GET /session/:id/cards?cursor=` |
| **FeedScreen** | Composes FeedPager with stack from **SessionFeed** instead of static fake-data; wires refresh and index callbacks | Unchanged pager contract; data source swaps |
| **@diu/types (session contract)** | Shared types for session responses: `sessionId`, `cards`, `cursor`, `hasMore`, `endCard` (or discriminated stack items) | Consumed by API and mobile |

`FeedPager`, `FeedScrollPosition`, and `useFeedTabRefresh` remain as in ADR 0001 — the **session** layer feeds `items` and `sessionId` into existing pager contracts.

### Session lifecycle

- **New session** when: (a) no persisted **session** or calendar day changed (user local timezone), (b) persisted **session** older than stale window (configurable constant, e.g. hours since last activity), (c) user explicit refresh (re-tap Feed tab while focused, or dedicated control if added later).
- **Resume** when: same calendar day, same `sessionId` from server (or valid persisted snapshot), within stale window — restore loaded stack and pager index from persistence; reconcile with server if etag/version is added later (out of v1).
- **Explicit refresh** clears persisted snapshot, requests **new session** from API, resets pager index to 0, shows loading overlay (existing `isRefreshing` pattern).

### API contract (v1)

- **Not** a flat `GET /session/cards` returning the full day — evolve toward session-scoped, cursor-based responses aligned with ADR 0002 consequences.
- Initial response includes: `sessionId`, first batch of `TCard` items, `cursor` for next page (nullable when done), `hasMore`, and whether **end card** is included in this batch or only after `hasMore: false`.
- **End card** is a terminal stack item (client already discriminates `TEndCard` with `kind: 'end'` in fixtures); server may author **end card** copy (ADR 0004) or API returns structured end payload merged client-side in v1.
- Daily maximum enforced server-side; client does not append **cards** after `hasMore: false`.
- v1 backend may return deterministic fixture sequencing (no integrations, no AI) — satisfies ADR 0002 transport and bounds before ADR 0005 pipeline is complete.

### Prefetch model

- Prefetch threshold: when user's index is within N **cards** of the end of the *loaded* stack (e.g. 2), and `hasMore`, fetch next cursor page and append to stack.
- Deduplicate by **card** `id` on append; ignore duplicate pages on retry.
- Do not prefetch past **end card**; once **end card** is in stack, `hasMore` is false.

### Relationship to other ADRs

- **ADR 0001 (snap paging):** **SessionFeed** supplies `items` and `sessionId`; pager does not implement cursor or day rules.
- **ADR 0003 (multi-source):** v1 types may omit **sources** on `TCard`; a follow-up slice extends payload when tackle dedup needs **primary source** ids.
- **ADR 0004 (server-authored):** API returns presentation fields; mobile does not synthesize title/description.
- **ADR 0005 (pipeline):** Full normalize → sequence → AI is out of scope; fixture or rule-based ordering on API is acceptable for v1.
- **ADR 0006 (tackle):** Hiding **tackled** **primary sources** from forward stack may be stubbed (server omits from fixture) until tackle persistence ships; contract should reserve server-side filtering.

### Technology direction

- **API:** Hono app (`apps/api`) — extend beyond current stub `GET /session/cards` toward session + cursor shape; keep Vitest request tests.
- **Types:** Extend `@diu/types` with session response types shared by API and mobile.
- **Mobile:** Replace `feedStack` / `loadFeedCards` as primary Feed path with **SessionFeed** + **SessionClient**; retain fake-data export for tests and offline UI.
- **Persistence:** AsyncStorage or equivalent — session snapshot keyed by calendar day + `sessionId`.

### Current codebase starting point

- Feed tab snap paging, **seen** tracking, tab re-press refresh, and **end card** rendering exist (ADR 0001 PRD).
- `useFeedScrollPosition` generates client-only `sessionId` and simulates refresh via `loadFeedCards()`.
- `apps/api` exposes `GET /session/cards` with a static two-**card** array — no `sessionId`, cursor, or **end card**.
- `@diu/types` defines `TCard` only; no session DTOs yet.

## Testing Decisions

### What makes a good test

- Assert **observable behavior**: stack length after batches, **end card** present when exhausted, `hasMore` gates further prefetch, resume index after reload, **new session** after refresh or day rollover, error + retry does not duplicate **cards**.
- Do **not** assert specific HTTP client library, AsyncStorage key names, or internal cursor string format unless stabilizing a regression.

### Modules to test

| Module | Priority | Example behaviors |
| --- | --- | --- |
| **SessionFeed** | High | Prefetch at threshold; append batch; stop at **end card**; refresh clears and reloads; day change triggers **new session** |
| **SessionPersistence** | High | Round-trip snapshot; clear on refresh |
| **Session API** | High | Returns valid session shape; cursor pages are stable; daily cap + **end card** in final page |
| **SessionClient** | Medium | Maps API errors; parses shared types |
| **FeedScreen** | Lower | Integration — renders API-backed stack when session loaded; loading overlay on refresh |
| **FeedPager / FeedScrollPosition** | — | Already covered by ADR 0001 PRD; only extend if session-driven stack edge cases appear |

Prior art: Vitest + `app.request()` in `apps/api`; Jest + RNTL in `apps/mobile` for pager and FeedScreen.

## Out of Scope

- Full integration ingestion, normalization, sequencing, and AI copy (ADR 0005).
- **Save**, **tackle**, **pass** persistence, Saved tab lists, **mark done**, primary-source deep links (ADR 0006 — separate PRD; server may stub omit list).
- **Multi-source** UI on **cards** until types and API include **sources** (ADR 0003 — can follow session v1).
- Pull-to-refresh anywhere in the stack.
- Cross-device **session** sync (device-local persistence only in v1).
- Web client consumption of session API.
- Replacing snap-paging interaction (ADR 0001).
- Authentication and per-user **session** isolation (single demo user / open API until auth exists).
- Real-time **session** mutation while user is mid-stack (e.g. new GitHub PR arrives) — v1 stack is fixed at **session** creation plus explicit refresh.

## Further Notes

- ADR 0002 rejected true infinite scroll and single upfront payload with client slicing; the cursor batch model is the intended middle ground.
- "Stale time window" duration should be chosen for product feel (e.g. 4–8 hours) and documented as a constant; not user-configurable in v1.
- Thin tracer bullets: (1) types + API fixture session with cursor + **end card**, (2) mobile **SessionFeed** wired to FeedScreen, (3) persistence + resume, (4) day/stale rules, (5) tackle-aware filtering when ADR 0006 lands.
- Keep fake-data path for component tests and visual QA per CONTEXT.md — server is authoritative for production feed path only.
