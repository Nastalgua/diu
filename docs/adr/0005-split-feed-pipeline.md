# Split feed pipeline: normalize, sequence, then AI

Feed generation is a split pipeline, domain-agnostic from day one. Integrations are normalized into shared card primitives (`class`, `classType`, sources). A sequencing step orders cards using deterministic inputs (calendar windows, duration, focus required, stated goals). AI layers on top for ordering refinement and copy — it is not the sole source of truth for what appears in the feed. Software engineering (GitHub) is the first domain because it provides the clearest structured work primitives; product, design, and research follow by adding new card classes, not new pipelines.

**Considered options:** Server-side AI-only generation on every open; client-side assembly from synced integration data; flat paginated list with client-side dedup.

**Consequences:** A Hono backend can ship ingestion and sequencing before AI is ready. The shared `@diu/types` package is the contract between normalization and all clients.
