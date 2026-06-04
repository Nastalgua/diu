# Context sources on feed card

**Type:** AFK

## Parent

[ADR 0003 — Multi-source cards with primary and context sources](../../adr/0003-multi-source-cards.md)

## What to build

When a **card** includes **context sources**, render them on the feed card as a stacked list below the title and description. Each row shows the **context note** prominently, with enough integration identity to distinguish sources when multiple are present. Cap visible rows at three; when there are more, show the first three plus an overflow indicator (e.g. "+2 more"). Cards with no context sources render unchanged.

The UI reads context sources from the server payload — not hardcoded fake-data alone — so multi-source cards from the session API display correctly in the feed.

## Acceptance criteria

- [ ] Feed card renders a stacked list of context sources when `contextSources` is non-empty
- [ ] Each row displays the context note; integration is distinguishable across rows
- [ ] At most three context source rows are visible; overflow count shown when more exist
- [ ] Cards with zero context sources have no empty list or layout shift
- [ ] Component test covers: no sources, one source, three sources, and overflow (>3)
- [ ] Multi-source fixture card from the session API is visibly correct in the feed

## Blocked by

[#2 — Context source contract](./02-context-source-contract.md)
