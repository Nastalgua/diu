# Issues: Multi-source cards

> Derived from [ADR 0003 — Multi-source cards with primary and context sources](../../adr/0003-multi-source-cards.md).

A card can reference multiple **sources** from different integrations. One **primary source** defines tackle identity and what opens on tackle; zero or more **context sources** explain why the card was synthesized or sequenced, each with a **context note**.

## Slices

| # | Issue | Type | Blocked by |
| --- | --- | --- | --- |
| 1 | [Primary source identity and tackle dedup](./01-primary-source-and-tackle-dedup.md) | AFK | None |
| 2 | [Context source contract](./02-context-source-contract.md) | AFK | #1 |
| 3 | [Context sources on feed card](./03-context-sources-card-ui.md) | AFK | #2 |

## Dependency order

```
#1 Primary source + tackle dedup
 └─► #2 Context source contract
      └─► #3 Context sources card UI
```

## Out of scope (other ADRs)

- Opening the primary source on tackle, Saved tab, mark done (ADR 0006)
- Real integration ingestion, source titles from connected tools (ADR 0005)
