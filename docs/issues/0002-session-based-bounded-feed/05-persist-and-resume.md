# Persist session and resume on cold start

**Type:** AFK  
**User stories:** 11, 14, 15, 25, 29

## What to build

Persist **session** snapshot on device: `sessionId`, loaded stack (work **cards** + **end card** if already fetched), cursor, `hasMore`, resume index, and last-active timestamp. On cold start within the same calendar day and before stale rules (slice 06), restore the stack and open the pager on the last viewed **card** without requiring a full refetch of every batch. Clearing snapshot happens on explicit refresh (slice 04). Device-local only — no cross-device sync.

## Acceptance criteria

- [ ] Killing and reopening the app same day resumes the same `sessionId`, stack, and pager index
- [ ] Switching tabs away and back preserves pager index for the same `sessionId` (unchanged from ADR 0001; verify with persisted state)
- [ ] Explicit refresh clears persisted snapshot before loading the new **session**
- [ ] **Seen** / swipe-back bounds still follow **FeedScrollPosition** for the restored index
- [ ] Tests round-trip persistence load/save/clear without asserting storage key names

## Blocked by

- [03-cursor-prefetch.md](./03-cursor-prefetch.md)
- [04-explicit-refresh-new-session.md](./04-explicit-refresh-new-session.md)
