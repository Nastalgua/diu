# Issues: Session-based bounded feed

Tracer bullets for [PRD 0002 — Session-based bounded feed](../../prd/0002-session-based-bounded-feed.md) / [ADR 0002](../../adr/0002-session-based-bounded-feed.md).

| # | Title | Type | Blocked by |
| --- | --- | --- | --- |
| 01 | [Session types and cursor API](./01-session-types-and-api.md) | AFK | — |
| 02 | [Mobile loads first session batch](./02-mobile-first-session-batch.md) | AFK | 01 |
| 03 | [Cursor prefetch near stack end](./03-cursor-prefetch.md) | AFK | 02 |
| 04 | [Explicit refresh starts new session](./04-explicit-refresh-new-session.md) | AFK | 02 |
| 05 | [Persist session and resume on cold start](./05-persist-and-resume.md) | AFK | 03, 04 |
| 06 | [New session on calendar day and stale window](./06-day-and-stale-lifecycle.md) | AFK | 05 |
| 07 | [Session fetch error and retry](./07-session-fetch-error-retry.md) | AFK | 02 |
| 08 | [Server filters tackled primary sources](./08-tackled-source-filtering.md) | AFK | 01, ADR 0006 tackle persistence |

## Dependency order

```
01 → 02 → 03 ─┐
         └→ 04 ─┴→ 05 → 06
         └→ 07
01 → 08 (after tackle persistence exists)
```

## Out of PRD scope (no issues here)

- Full feed pipeline (ADR 0005)
- Multi-source payload on cards (ADR 0003) — follow-on after session v1
- Save / tackle / pass persistence and Saved tab (ADR 0006) — except slice 08 server filter once tackle exists
