# Snap-paging feed interaction

The feed uses full-screen vertical snap paging — one card per viewport, one swipe per decision — rather than a continuous scroll where multiple cards are partially visible. Diu replaces doom-scroll with deliberate triage: each card is a single moment of "what next?" without the visual noise of a traditional list. This shapes the entire mobile layout (content area above the tab bar, bottom action bar per card, swipe-back within the session stack) and is costly to reverse once interaction patterns and card layouts are built around it.

**Considered options:** Continuous scroll (Twitter/Instagram-style); immersive full-bleed with hidden chrome.

**Consequences:** Refresh cannot rely on pull-to-refresh from deep in the stack — explicit refresh affordances are required. Card actions live on each page, not in a persistent list row.

**Status:** Implemented in the mobile app (v1, fake-data).

## Implementation (mobile v1)

- **FeedPager** — vertical `FlatList` with `pagingEnabled`, `snapToInterval`, and `getItemLayout`; at most ±1 index change per gesture; swipe-back bounded by **seen** indices via `minimumIndex`.
- **FeedViewportLayout** — measures viewport height above the tab bar and safe areas; each page is exactly one screen tall.
- **FeedPage** — one snap unit: `FeedCardItem` (card body) above a per-page **FeedActionBar** (Save / Tackle). The tab bar stays visible; actions are not in a shared footer outside the pager.
- **End card** — terminal page in the pager stack when the session list is exhausted.
- **Refresh** — no pull-to-refresh; explicit refresh via re-tapping the Feed tab (new session loading overlay).
- **Overflow scroll** — long title or description scrolls inside `FeedCardItem` via a nested `ScrollView` (`nestedScrollEnabled`); the outer page still snaps as a single unit. Scroll content carries top padding so overflow copy is not flush against the viewport edge.
- **Swipe feedback** — light haptic (`expo-haptics`) when the user **starts** dragging the pager (`onScrollBeginDrag`), once per gesture. Programmatic advance (Save / Tackle) does not trigger haptic.

**Out of scope for v1:** Screen reader discrete-page announcements; tackle persistence and primary-source open (ADR 0006); session API and prefetch (ADR 0002).
