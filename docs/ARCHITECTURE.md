# Architecture

This is a local-first pnpm workspace. `apps/web` owns the human review UI, `apps/worker` owns
background execution, `packages/core` owns provider-neutral domain contracts, and `packages/db`
owns persistence and migrations. External APIs will be adapters; domain code does not depend on
vendor SDKs.

SQLite uses Node's built-in `node:sqlite` module. Repositories form the portability boundary for a
later PostgreSQL migration. The app binds to localhost; publishing is disabled and providers are
mocked by default.

