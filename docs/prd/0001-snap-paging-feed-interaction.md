# PRD: Snap-paging feed interaction

> Derived from [ADR 0001 — Snap-paging feed interaction](../adr/0001-snap-paging-feed-interaction.md).

## Problem Statement

Traditional feeds show multiple cards at once and encourage continuous scrolling — the doom-scroll habit Diu exists to interrupt. Users need a feed where each card is a single, full-screen moment of "what next?" without the visual noise of a partially visible list. Without a deliberate paging interaction, card layouts, triage actions, and session navigation will drift toward list patterns that undermine Diu's core promise.

## Solution

The Feed tab uses **full-screen vertical snap paging**: one card fills the viewport above the tab bar, one swipe advances or retreats one decision, and each page carries its own triage actions. Scrolling back within the current **session** is supported; the feed does not behave like Twitter or Instagram continuous scroll. Refresh is explicit — not pull-to-refresh from deep in the stack — because the user may be many cards into a bounded **session**.

## User Stories

1. As a user opening the Feed tab, I want to see exactly one card filling the screen, so that I focus on a single work item at a time.
2. As a user triaging my morning, I want to swipe up to move to the next card, so that each gesture corresponds to one deliberate decision.
3. As a user who swiped past a card too quickly, I want to swipe down to return to the previous card in my current session, so that I can reconsider without losing context.
4. As a user on any card in the stack, I want the card content area sized consistently above the tab bar, so that nothing is clipped or hidden behind chrome.
5. As a user on any card, I want save, tackle, and pass actions attached to that card's page, so that I never hunt for actions in a persistent list row.
6. As a user deciding to save a card, I want to tap Save on the current page and immediately advance to the next card, so that triage stays fast and forward-moving.
7. As a user deciding to tackle a card, I want to tap Tackle on the current page, have the primary source open, and advance past that card for the rest of the day, so that commitment and forward motion happen in one gesture.
8. As a user passing on a card, I want to tap Pass (or swipe forward without saving), so that the card is marked **seen** in this session and I move on.
9. As a user several cards into my session, I want scrolling back to show cards I already saw in order, so that session history feels like a stack I can review.
10. As a user deep in my session stack, I want an explicit refresh control — not pull-to-refresh — so that I can request a new session without accidentally triggering refresh while paging.
11. As a user refreshing the feed, I want clear feedback that a new session is loading, so that I understand why my position reset.
12. As a user reaching the last card in my session, I want the pager to land cleanly on the **end card**, so that the bounded session feels complete rather than broken.
13. As a user returning to the app mid-session, I want to resume on the last card I was viewing, so that I pick up triage where I left off.
14. As a user with different screen sizes and safe areas, I want each card page to use the full available height between the status area and tab bar, so that the experience feels immersive on all devices.
15. As a user swiping between cards, I want snap animation to settle exactly one card per viewport — never stopping between two cards — so that the one-card-one-decision metaphor stays crisp.
16. As a user performing a quick flick, I want the pager to advance at most one card per gesture, so that I cannot accidentally skip multiple items.
17. As a user reading a long card title or description, I want card content to scroll internally if needed while the page itself still snaps as a unit, so that text is never truncated without recourse.
18. As a user with VoiceOver enabled, I want each card page announced as a single screen with actions reachable in order, so that snap paging remains accessible.
19. As a user on the Feed tab, I want the tab bar to remain visible and stable, so that I can switch to Saved, Goals, or Profile without leaving the pager in an ambiguous state.
20. As a user switching away from Feed and back, I want my pager position preserved within the current session, so that tab navigation does not reset my place.
21. As a user viewing a card, I want focus required and duration visible on the card page, so that I can judge whether I have the cognitive energy for this item before deciding.
22. As a user triaging quickly, I want haptic or visual feedback when a page snap completes, so that I feel the discrete step between cards.
23. As a user who saved a card earlier in the session, I want to scroll back and still see it in the session stack until the session ends, so that **seen** history matches what I actually viewed.
24. As a user who tackled a card, I want that card absent from forward paging for the rest of the day, so that the forward stack only shows work still available to triage.
25. As a developer maintaining the feed, I want the pager module isolated from card rendering and triage side effects, so that layout and interaction can be tested without real integrations.
26. As a developer, I want fake-data cards to render inside the pager for visual testing, so that we can iterate on layout before the session API exists.
27. As a user on a slow network, I want the current card to remain stable while the next batch prefetches, so that snap paging never stutters on an empty page.
28. As a user at the first card of my session, I want downward swipe to do nothing (or rubber-band), so that I understand there is no earlier card in this session.
29. As a user, I want the feed to never show two cards partially visible at rest, so that the anti-doom-scroll intent is obvious on first open.
30. As a user, I want card actions in a bottom action bar on each page — separate from card content — so that action targets stay consistent across card classes.

## Implementation Decisions

### Deep modules

The following modules encapsulate most of the complexity behind small interfaces. They are intended to be testable in isolation.

| Module | Responsibility | Interface (conceptual) |
| --- | --- | --- |
| **FeedScreen** | The Feed tab route/screen — orchestrates pager, layout, per-page composition, and triage callbacks | Composes FeedPager, FeedPage, FeedScrollPosition, FeedRefreshControl |
| **FeedPage** | One snap page: card body + bottom action bar, rendered inside the pager | `card`, `onSave`, `onTackle` |
| **FeedPager** | Vertical snap-paging container; enforces one card per viewport, one index change per gesture, snap-to-index on settle | `cards`, `initialIndex`, `onIndexChange(index)`, `renderPage(card, index)` |
| **FeedViewportLayout** | Computes pager viewport height above tab bar and safe areas | `children` (receives `pageHeight`) |
| **FeedScrollPosition** | Tracks current index and **seen** indices within the active **session**; supports resume and swipe-back bounds | `sessionId`, `getIndex()`, `markSeen(index)`, `canGoBack()` |
| **FeedRefreshControl** | Explicit refresh affordance (header button or dedicated control); triggers new **session** fetch — never pull-to-refresh from mid-stack | `onRefresh`, `isRefreshing` |

`FeedCardItem` remains a presentational component for card body content (title, description, focus required, duration) — rendered by **FeedPage** above that page's action bar, not a module boundary itself.

### Interaction model

- **Paging axis:** Vertical only on the Feed tab.
- **Snap behavior:** `pagingEnabled` / snap-to-offset semantics so the resting state always shows exactly one full card page. No partial cards at rest.
- **One step per gesture:** Flick velocity may not skip multiple cards; maximum index delta per user gesture is ±1.
- **Swipe-back scope:** Back navigation is limited to cards already **seen** in the current **session** (see ADR 0002). The first card does not page backward.
- **Forward after action:** Save, tackle, and pass all advance the pager forward after the action resolves (tackle additionally opens primary source per ADR 0006 — orchestrated outside FeedPager).

### Layout model

- Card content occupies the area between the top safe inset and the tab bar.
- Each pager page includes its own **bottom action bar** (save / tackle) as part of the snap unit — card body above, actions below. The bar is not a shared footer fixed outside the pager; it scrolls away with the page.
- The tab bar remains visible during feed triage (ADR 0001 rejected immersive full-bleed with hidden chrome).
- Card inner content may scroll vertically if copy overflows; the outer page still snaps as a single unit.

### Refresh model

- Pull-to-refresh is **not** used — it is incompatible with vertical snap paging deep in a **session** stack (ADR 0001 consequence).
- An explicit refresh affordance (e.g. toolbar control) starts a new **session** per ADR 0002 rules.
- While refreshing, the pager shows a loading state rather than an empty broken stack.

### Relationship to other ADRs

- **Session bounds (ADR 0002):** FeedPager renders the session's card list including the **end card**; prefetch near the end is orchestrated by the session layer, not the pager itself.
- **Card presentation (ADR 0004):** FeedScreen renders server-authored content via FeedCardItem; the pager does not interpret card class.
- **Triage actions (ADR 0006):** Save, tackle, and pass handlers live in FeedScreen. The Saved tab uses compact list rows — not snap paging — and is out of scope here.
- **Rejected alternative — continuous scroll:** No FlatList-style partial visibility, no momentum scroll through multiple cards at rest.

### Technology direction

- Implement paging with React Native's scroll primitives (`ScrollView` or `FlatList` with `pagingEnabled` and explicit `snapToInterval` / `getItemLayout`) sized to the computed viewport height — no new dependency required for v1 unless profiling shows insufficient snap fidelity.
- Viewport height must be measured once per layout (tab bar + safe area) and passed to the pager so each page is exactly one screen tall.

### Current codebase starting point

- `FeedScreen` orchestrates FeedPager + FeedViewportLayout; each page is a **FeedPage** (FeedCardItem + FeedActionBar), still using fake-data until the session API exists.
- `FeedCardItem` fills the flex region above the action bar within each page; the action bar sits at the bottom of that page's layout inside the pager.

## Testing Decisions

### What makes a good test

- Assert **observable behavior**: resting index after swipe, whether two cards are visible at rest, whether back swipe is blocked at index 0, whether refresh control exists and pull-to-refresh does not.
- Do **not** assert internal scroll offset math, Reanimated shared values, or specific RN component tree shape unless stabilizing a known regression.

### Modules to test

| Module | Priority | Example behaviors |
| --- | --- | --- |
| **FeedPager** | High | Snap settles on exactly one index; ±1 index change per gesture; `onIndexChange` fires with correct index |
| **FeedScrollPosition** | High | `markSeen` accumulates; `canGoBack` false at index 0; resume restores index for same `sessionId` |
| **FeedRefreshControl** | Medium | Refresh callback invoked; loading state blocks interaction |
| **FeedViewportLayout** | Medium | Pager viewport height excludes tab bar (layout assertion) |
| **FeedPage** | Medium | Card body and action bar composed; Save/Tackle present per page |
| **FeedScreen** | Lower | Integration-level — action callbacks wired, pager + layout composed; unit-test only if orchestration logic grows beyond composition |

No prior art for component tests exists in the mobile app yet; first tests will establish the pattern (likely React Native Testing Library + jest).

## Out of Scope

- Session API, cursor prefetch, and end-card copy (ADR 0002 — separate PRD).
- Save / tackle / pass persistence, primary source deep links, and Saved tab list UI (ADR 0006).
- Server-authored card fields beyond what `FeedCardItem` already renders (ADR 0004).
- Horizontal paging, stories-style tap-to-advance, or TikTok-style infinite generation.
- Pull-to-refresh from any position in the stack.
- Immersive mode that hides the tab bar during triage.
- Snap paging on the Saved tab (explicitly list rows per ADR 0006).
- Web-specific feed interaction (mobile-first).

## Further Notes

- This interaction choice is **costly to reverse** once card layouts and user habits form around full-screen pages — treat pager contracts as stable.
- Fake-data in the mobile app remains valid for visual QA inside FeedPager until the session pipeline ships.
- When implementing, read Expo SDK 54 / React Native 0.81 docs for scroll snapping behavior on both iOS and Android before adding dependencies.
