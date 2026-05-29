# Multi-source cards with primary and context sources

A card can reference multiple **sources** from different integrations — not a single origin record. Each source has a role: one **primary source** (defines what tackle opens) and zero or more **context sources** (explain why the card was synthesized or sequenced). Context sources carry a **context note** describing their relevance. The card's stable identity for tackle deduplication is the primary source; the full source set may differ across sessions as context changes. This model is domain-agnostic and supports cards like "review PR #142 before standup" without forcing a 1:1 mapping between cards and integration records.

**Considered options:** Single `sourceId` per card; fully synthesized tasks with no structured source references; multi-action cards with equal-weight buttons and no primary.

**Consequences:** Presentation copy (title, description) is independent of any single source. Context sources render as a stacked list on the card (capped at three visible). Tackle dedup keys off primary source ID for the calendar day.
