# Cursor prefetch near stack end

**Type:** AFK  
**User stories:** 3, 4, 16, 18, 26

## What to build

When the user pages within N **cards** of the end of the *loaded* stack and `hasMore` is true, **SessionFeed** fetches the next cursor page from the API and appends **cards** to the in-memory stack without resetting pager index. Stop prefetching once the **end card** is present. Deduplicate by **card** `id` on append. Prefetch logic is testable without **FeedPager** scroll internals.

## Acceptance criteria

- [ ] Approaching the end of the loaded stack triggers a background fetch when `hasMore` is true
- [ ] New **cards** append to the stack; user does not land on an empty page while waiting
- [ ] No further API calls after **end card** is in the stack (`hasMore: false`)
- [ ] Duplicate **card** ids from retries do not appear twice in the stack
- [ ] Unit tests assert prefetch threshold, append behavior, and stop-at-**end card** without mounting the pager

## Blocked by

- [02-mobile-first-session-batch.md](./02-mobile-first-session-batch.md)
