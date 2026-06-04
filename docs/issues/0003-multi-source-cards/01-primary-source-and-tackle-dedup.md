# Primary source identity and tackle dedup

**Type:** AFK

## Parent

[ADR 0003 — Multi-source cards with primary and context sources](../../adr/0003-multi-source-cards.md)

## What to build

Each **card** carries a **primary source** — a stable `{ integration, sourceId }` pair that identifies the record tackle opens and deduplicates against. When a user **tackles** a card, the client records its primary source; the session API filters out any other cards sharing that primary source for the rest of the calendar day. Presentation copy (title, description) remains independent of the source reference.

Two primary sources match when both `integration` and `sourceId` are equal.

## Acceptance criteria

- [ ] Shared types define `TPrimarySource` with `integration` and `sourceId`, plus an equality helper
- [ ] `TCard` includes a required `primarySource` field
- [ ] Session API accepts tackle POST with a primary source and persists it per calendar day
- [ ] Session stack omits cards whose primary source was tackled today (including across cursor pages and session refresh within the same day)
- [ ] Mobile records tackle using `card.primarySource` when the user taps Tackle
- [ ] API and mobile tests cover dedup: tackling one card hides others with the same primary source for the day

## Blocked by

None — can start immediately
