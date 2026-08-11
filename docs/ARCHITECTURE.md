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
