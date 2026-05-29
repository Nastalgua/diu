# Server-authored card presentation

Card **title** and **description** are authored by the server (AI or rules), not derived on the client from templates. The mobile app renders presentation fields as received. Fixture data in the mobile codebase exists only to test UI against the expected data shape — it is not a copy-generation layer. Multi-source cards require synthesized narrative ("Prep for standup: review PR #142 before 9:30") that client-side templates from a primary source alone cannot produce reliably.

**Considered options:** Client templates from primary source; hybrid with client fallback; structured fields assembled by the client.

**Consequences:** Backend owns narrative quality and moment-aware copy. Mobile stays a thin rendering and interaction layer. Changing copy strategy does not require an app release.
