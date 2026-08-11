# Zak Content Engine

Local-first Urdu content intelligence and publishing system. Phase 1 provides the dashboard,
worker, SQLite foundation, mock-provider contracts, and development tooling. Blogger, Facebook,
and live AI calls are intentionally not connected yet.

Target Blogger site: https://mehfilz.blogspot.com/. API access remains disabled until the Blogger
integration phase and will require OAuth credentials plus the numeric Blog ID.

## Start locally

Requires Node.js 24+ and pnpm 11+.

```powershell
Copy-Item .env.example .env
pnpm.cmd install
pnpm.cmd db:migrate
pnpm.cmd dev
```

Open http://localhost:3000. Run `pnpm.cmd doctor` for a redacted environment report.

## Quality checks

```powershell
pnpm.cmd lint
pnpm.cmd typecheck
pnpm.cmd test
pnpm.cmd build
```

Private archive data belongs in `data/private/`; local databases and generated files belong in
`storage/`. Both locations are ignored by Git.
