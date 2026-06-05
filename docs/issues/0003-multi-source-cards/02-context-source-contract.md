# Context source contract

**Type:** AFK

## Parent

[ADR 0003 — Multi-source cards with primary and context sources](../../adr/0003-multi-source-cards.md)

## What to build

Extend the card model so a **card** can carry zero or more **context sources** alongside its **primary source**. Each context source references a record in a connected tool and includes a **context note** — a short explanation of why that source matters to this card (e.g. "Starts in 20 min — likely discussion topic").

The session API returns context sources in the card payload when present. Cards without context sources continue to work unchanged (empty array or omitted field normalized to empty). At least one session fixture card demonstrates the ADR example: a PR review card with a calendar standup as context.

```ts
type TContextSource = {
  integration: string;
  sourceId: string;
  contextNote: string;
};

type TCard = {
  // ...existing fields...
  primarySource: TPrimarySource;
  contextSources: TContextSource[];
};
```

## Acceptance criteria

- [ ] Shared types define `TContextSource` with `integration`, `sourceId`, and `contextNote`
- [ ] `TCard` includes `contextSources` (defaults to empty for single-source cards)
- [ ] Session API fixture includes at least one multi-source card (e.g. PR primary + standup context with a context note)
- [ ] Mobile deserializes context sources from session responses without error
- [ ] Contract tests verify round-trip shape for cards with and without context sources
- [ ] No UI change required in this slice — context sources may be ignored by the renderer until slice #3

## Blocked by

[#1 — Primary source identity and tackle dedup](./01-primary-source-and-tackle-dedup.md)
