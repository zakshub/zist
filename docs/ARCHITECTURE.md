# Architecture

This is a local-first pnpm workspace. `apps/web` owns the human review UI, `apps/worker` owns
background execution, `packages/core` owns provider-neutral domain contracts, and `packages/db`
owns persistence and migrations. External APIs will be adapters; domain code does not depend on
vendor SDKs.

SQLite uses Node's built-in `node:sqlite` module. Repositories form the portability boundary for a
later PostgreSQL migration. The app binds to localhost; publishing is disabled and providers are
mocked by default.

`SourcePostRepository` is the only Phase 2 persistence entry point for content memory. It normalizes
Unicode and whitespace, calculates a SHA-256 content hash, and enforces both content-level and
source/external-ID uniqueness before archive data can enter the system.

`@zak/importer` parses archive formats but never writes directly to SQLite. Every record passes
through `SourcePostRepository`, so CLI, future dashboard uploads, and the eventual private archive
adapter share exactly the same normalization and duplicate rules. Import reports omit post bodies.

Content analysis is provider-neutral. `MockContentAnalyzer` supplies deterministic local results;
`source_post_analyses` stores versioned output separately from immutable source text. Batch selection
uses the absence of an analysis row, making interrupted and repeated runs naturally resumable.

Topic ranking version `memory-v1` uses 30% novelty, 25% relevance/evergreen value, 30% source
quality, and 15% diversity. Every candidate links to its supporting source posts. Refreshes upsert
scores transactionally and do not duplicate candidates or provenance links.

Article generation is a review-only pipeline. `@zak/ai` creates an angle, structured Urdu draft,
SEO package, labels, similarity score, and editorial notes. `ArticleRepository` atomically stores the
draft, immutable version 1, and source provenance. Repeated generation creates a new record and
collision-safe slug; it never overwrites a human-editable draft.

Image direction and rendering are separate. The director persists concept, mood, composition,
prompt, and negative restrictions before rendering. The local mock renderer produces a real 1600×900
text-free SVG under ignored storage. `generated_images` retains article association and review state;
future OpenAI image output will use the same repository contract.
