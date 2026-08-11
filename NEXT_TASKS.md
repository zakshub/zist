# Next Tasks

## Priority 0 — Security

- Revoke the Gemini API key exposed in the external archive folder's `st.py`.
- Replace hard-coded credentials with environment variables.
- Confirm no credential exists in Git history, tracked files, logs, or generated artifacts.

## Priority 1 — Real AI

- Select the production text provider and model.
- Add the new API key to local `.env` only.
- Implement and test the real provider behind the existing provider-neutral interface.
- Generate one article from the imported corpus.
- Compare it with the current mock draft for Urdu quality, originality, citations, and style.
- Keep every generated article in `REVIEW_REQUIRED` state.

## Priority 2 — Editorial workflow

- Review the article screen with Zak and record required UI/editor changes.
- Add edit, approve, reject, and regenerate actions if missing.
- Verify source-post provenance is visible and useful.
- Review the generated image and replace the mock SVG provider when ready.

## Priority 3 — Blogger connection

- Create/configure Google OAuth credentials and redirect URI.
- Resolve and verify the Blogger blog ID for `https://mehfilz.blogspot.com/`.
- Test token storage and refresh without committing credentials.
- Create one real Blogger draft only after explicit approval.
- Verify title, RTL HTML, labels, image, canonical URL, and idempotency.
- Do not publish publicly during connection testing.

## Priority 4 — Facebook Page connection

- Configure the Meta app, Page ID, Page access token, and Graph API version.
- Validate required Page permissions.
- Attach the real Blogger URL to the three Facebook variants.
- Test Meta delivery in dry-run mode.
- Publish one approved Page test only after explicit approval.

## Priority 5 — Operations

- Decide whether a VPS deployment is wanted.
- If authorized, provision the VPS using `docs/VPS.md`.
- Configure PM2, Nginx, TLS, firewall, backups, health monitoring, and log rotation.
- Keep `AUTOMATION_ENABLED=false` until enough manually reviewed output exists.

## Current local review links

- Dashboard: `http://localhost:3000`
- Content memory: `http://localhost:3000/content-memory`
- Topics: `http://localhost:3000/topics`
- Articles: `http://localhost:3000/articles`
- Images: `http://localhost:3000/images`
- Blogger: `http://localhost:3000/blogger`
- Facebook: `http://localhost:3000/facebook`
- Schedule: `http://localhost:3000/schedule`
- Analytics: `http://localhost:3000/analytics`

## Resume point

Start with Priority 0. Do not reuse the exposed Gemini key.
