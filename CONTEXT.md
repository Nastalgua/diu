# Diu

Diu intercepts the morning doom-scroll habit and redirects it toward meaningful work. Users connect their tools, state their goals, and scroll a personalized feed of work items drawn from real context — sized and sequenced to match the cognitive energy they have in the moment.

## Language

### Feed

**Feed**:
The primary scroll surface where a user triages work items one at a time.
_Avoid_: Timeline, stream, inbox

**Session**:
A bounded, curated stack of cards generated for a period of use — not an endless scroll.
_Avoid_: Batch, page, queue (when meaning the whole feed)

**End card**:
A terminal card shown when the user has reached the end of the session stack for the day.
_Avoid_: Empty state (when the feed never started), error screen

### Cards

**Card**:
A single work item presented for triage — one decision at a time.
_Avoid_: Task, todo, item (in user-facing copy)

**Source**:
A reference to a record in an connected tool (e.g. a pull request, calendar event, issue).
_Avoid_: Integration, link, resource

**Primary source**:
The source that defines what tackling this card means — the main action opens here.
_Avoid_: Main link, target, hero source

**Context source**:
A source that influenced why the card exists or how it was sequenced, but is not the primary action.
_Avoid_: Related item, attachment, metadata source

**Context note**:
A short explanation of why a context source matters to this card (e.g. "Starts in 20 min — likely discussion topic").
_Avoid_: Reason, provenance, because-line

**Focus required**:
How much cognitive attention a card demands — low, medium, or high.
_Avoid_: Energy, difficulty, complexity (when describing the card itself)

**Duration**:
Estimated time to complete the work on a card.
_Avoid_: ETA, time estimate, length

**Card class**:
The broad domain a card belongs to (e.g. general, software engineering). Keeps the model extensible beyond a single profession.
_Avoid_: Category, type (alone — collides with class type)

**Class type**:
The specific kind of work within a card class (e.g. meeting, pull request review).
_Avoid_: Subtype, kind, tag

### User actions

**Triage**:
The act of scrolling the feed and deciding what to save, tackle, or pass on — not completing the work itself.
_Avoid_: Processing, sorting, reviewing (when meaning doing the work)

**Save**:
Bookmark a card for later without committing to work on it now. The card remains in the feed.
_Avoid_: Star, favorite, pin

**Saved**:
Cards the user has bookmarked — a reference list, not a commitment to act.
_Avoid_: Bookmarks, backlog, later list

**Tackle**:
Commit to working on a card now. Opens the primary source and removes the card from the forward feed for the rest of the day.
_Avoid_: Open, start, do (without the commitment semantics)

**Tackling**:
Cards the user has committed to but not yet finished — active work in progress.
_Avoid_: In progress (in user-facing copy), active, doing now

**Mark done**:
The user confirms they have finished the work on a tackling card. Removes it from tackling.
_Avoid_: Complete, close, finish (alone — use "mark done" as the canonical phrase)

**Seen**:
A card the user has scrolled past in the current session. Used for scroll-back history within a session, not a permanent completion state.
_Avoid_: Viewed, read, skipped (when implying dismissal)

### Integrations and goals

**Integration**:
A connected external tool that supplies sources (e.g. GitHub, Google Calendar).
_Avoid_: Connector, plugin, service (when meaning the user's tool)

**Goal**:
A weekly intention the user states explicitly. The app never decides goals — it uses them to sequence and synthesize cards.
_Avoid_: Objective, OKR, priority (when the user sets it)

### Flagged ambiguities

**"Task" / "todo"**: Used colloquially in conversation but not in product language. A **card** is what the user sees; a **source** is where the underlying record lives.

**"In progress"**: Internal state name only. User-facing copy uses **tackling**.

**"Infinite scroll"**: The feed feels continuous through prefetch, but a **session** is intentionally bounded per day — Diu is anti-doom-scroll, not an endless feed.

## Example dialogue

**Dev**: When the user taps tackle on a card with a PR as primary source and a standup as context source, what happens?

**Expert**: **Tackle** opens the pull request — that's the **primary source**. The standup is a **context source** with a **context note** explaining why it surfaced now. The card leaves the **feed** for the rest of the day and appears under **Tackling** on the Saved tab. It's still **tackling**, not done — the user **marks done** when finished.

**Dev**: What if they saved it earlier?

**Expert**: **Save** and **tackle** are independent. A **saved** card stays in the **feed**. If they later **tackle** it, it also moves to **Tackling**. Saved is "I want this on my list"; tackling is "I'm doing this now."

**Dev**: They refresh the feed mid-morning. Does the PR come back?

**Expert**: Not if they **tackled** it — we hide any card whose **primary source** matches for the rest of the calendar day. If they only **saved** it, it can appear again in a new **session**. **Seen** only matters for scrolling back within the current session.

**Dev**: Who writes the card title?

**Expert**: The server — copy is authored for the moment, often synthesizing multiple **sources**. The mobile app renders what it receives; **fake-data** in the app is just for visual testing.
