# Meta Pages Integration

Verified from Meta's official Pages API documentation on 2026-08-12:

- Publish endpoint: `POST /{page_id}/feed`
- Page access token is required.
- Relevant documented permissions include `pages_manage_posts` and `pages_read_engagement`.
- Content parameters include `message` and `link`.
- `published=true` publishes immediately; `published=false` is used with `scheduled_publish_time`.

Reference: https://developers.facebook.com/docs/pages-api/posts/

The current adapter is mock-only. No token, Graph version, Page ID, or live request is used.
