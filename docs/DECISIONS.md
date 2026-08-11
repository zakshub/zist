# Architecture Decisions

## ADR-001: pnpm workspace

Separate web, worker, domain, and persistence packages without introducing microservices.

## ADR-002: built-in SQLite

Use Node 24's `node:sqlite` API locally. This avoids a native add-on while repository interfaces
isolate database-specific behavior.

