# VPS preparation

This phase prepares deployment artifacts; it does not authorize or perform deployment.

## Baseline

- Ubuntu LTS, Node.js 24 LTS, Corepack-enabled pnpm, PM2, Nginx, and TLS via Certbot.
- Run the app as an unprivileged service user. Only Nginx exposes ports 80/443.
- Keep the repository, `.env`, SQLite database, backups, and PM2 logs outside the public web root.
- Never copy the raw archive or API keys into Git.

## Environment

Copy `.env.example` to `.env`, set `NODE_ENV=production`, use an absolute `DATABASE_URL`, and keep
all mock flags enabled until each live provider is deliberately commissioned. Leave
`AUTOMATION_ENABLED=false`; Phase 14 does not authorize autonomous publication.

Required runtime values:

```dotenv
NODE_ENV=production
PORT=3000
APP_URL=https://content.example.com
APP_TIMEZONE=Asia/Karachi
DATABASE_URL=/srv/zak-content/shared/content-engine.sqlite
DRY_RUN=true
USE_MOCK_AI=true
USE_MOCK_BLOGGER=true
USE_MOCK_FACEBOOK=true
AUTOMATION_ENABLED=false
BACKUP_RETENTION=14
```

Provider credentials remain optional while mock flags are true. Store production secrets in a
root-readable or service-user-readable environment file with mode `0600`; never in PM2 config.

## Release and migration order

1. Fetch a pinned Git commit into a new release directory and run `corepack pnpm install --frozen-lockfile`.
2. Run `pnpm build` without changing the live processes.
3. Run `pnpm backup:database -- /srv/zak-content/backups`.
4. Run `pnpm db:migrate`. Migrations are additive and recorded in `schema_migrations`.
5. Point the stable application symlink at the verified release.
6. Run `pm2 startOrReload ecosystem.config.cjs --update-env` and then `pm2 save`.
7. Verify `curl --fail http://127.0.0.1:3000/api/health` before routing public traffic.

SQLite migrations must run from exactly one release process before PM2 reload. If migration or
health verification fails, keep the previous release active and restore only from a verified backup.

## Process persistence

`ecosystem.config.cjs` runs one web process and one compiled worker. PM2 restarts crashes and enforces
memory ceilings; the worker handles SIGTERM/SIGINT cleanly. Configure boot persistence once with
`pm2 startup` (execute the command PM2 prints) and `pm2 save`. Do not use cluster mode with SQLite.

## Nginx and TLS

Copy `deploy/nginx.conf.example`, replace the placeholder hostname, validate with `nginx -t`, then
reload Nginx. Add TLS with Certbot before exposing authenticated or credential-bearing workflows.
The application binds to `127.0.0.1`; direct public access to port 3000 should be blocked.

## Backups and restore

Schedule an online SQLite backup outside the release directory, for example:

```cron
17 2 * * * cd /srv/zak-content/current && /usr/bin/pnpm backup:database -- /srv/zak-content/backups >> /var/log/zak-content-backup.log 2>&1
```

The backup command uses SQLite's backup API, so copying a live WAL database is avoided. It retains
14 snapshots by default (`BACKUP_RETENTION`). Send encrypted copies off-host and test restore monthly.

Restore procedure: stop both PM2 processes, preserve the failed database, copy a verified snapshot
to `DATABASE_URL`, start the web process, run migrations, check `/api/health`, then start the worker.

## Health and operations

`GET /api/health` returns HTTP 200 only when the process and SQLite query are healthy; database
failure returns HTTP 503 without exposing paths or errors. Monitor this endpoint and PM2 process
state. Health does not claim that Blogger, Meta, or AI providers are connected.
