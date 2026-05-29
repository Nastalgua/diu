# Session-based bounded feed

The feed is organized as a **session** — a curated, intentionally bounded stack of cards per calendar day — not a truly infinite scroll. Cards are loaded in batches with prefetch near the end, capped at a daily maximum, and the feed ends with an end card ("Caught up"). A new session starts on a new calendar day, after a stale time window, or on explicit user refresh; otherwise the app resumes the same session at the last card. This trades the engagement mechanics of infinite feeds for Diu's core promise: redirect morning scroll toward a finite set of meaningful work.

**Considered options:** True infinite scroll with continuous AI generation (TikTok-style); single upfront payload with client-side slicing; manual refresh only.

**Consequences:** The API is session- and cursor-based, not a flat paginated list. "Infinite" in conversation means prefetch within a session, not unbounded content.
