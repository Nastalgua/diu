# New session on calendar day and stale window

**Type:** AFK  
**User stories:** 12, 13, 24

## What to build

Centralize **session** lifecycle in **SessionFeed**: start a **new session** when the local calendar day changes or when the persisted **session** is older than a documented stale constant (e.g. 4–8 hours since last activity — pick one value and document it in code). Otherwise **resume** per slice 05. Rules live in one module so **FeedScreen** stays thin orchestration.

## Acceptance criteria

- [ ] Opening the app on a new local calendar day discards the prior snapshot and loads a **new session**
- [ ] Opening after the stale window elapsed discards the prior snapshot and loads a **new session**
- [ ] Same day and within stale window continues the persisted **session** without API recreate unless user refreshes
- [ ] Stale duration is a single named constant with a short comment explaining product intent
- [ ] Tests simulate day rollover and stale elapsed time without real clocks where possible (injected clock or timestamps)

## Blocked by

- [05-persist-and-resume.md](./05-persist-and-resume.md)
