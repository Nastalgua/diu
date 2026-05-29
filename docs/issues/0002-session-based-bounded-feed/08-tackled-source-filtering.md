# Server filters tackled primary sources

**Type:** AFK  
**User stories:** 2, 10

## What to build

When creating or paging a **session**, the API omits **cards** whose **primary source** matches any **primary source** the user **tackled** earlier on the same calendar day (ADR 0006). Requires tackle persistence (or a minimal tackled-source list the client sends until server-side tackle store exists). Mobile continues to render the stack returned by the API — no client-side dedup of tackled work.

## Acceptance criteria

- [ ] **Session** responses exclude **cards** sharing a **tackled** **primary source** for the rest of the local calendar day
- [ ] **New session** after explicit refresh still respects the same day-level tackle hide list
- [ ] **Saved**-only **cards** (not **tackled**) remain eligible in a **new session**
- [ ] API and types document how **primary source** identity is compared
- [ ] Tests cover omit list applied on first page and subsequent cursor pages

## Blocked by

- [01-session-types-and-api.md](./01-session-types-and-api.md)
- ADR 0006 tackle persistence (or agreed minimal tackled-source contract)
