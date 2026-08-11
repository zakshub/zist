# Blogger Integration

Verified against official Google documentation on 2026-08-12:

- Base API: `https://www.googleapis.com/blogger/v3`
- Create post: `POST /blogs/{blogId}/posts`
- Draft flag: `isDraft=true`
- Required write scope: `https://www.googleapis.com/auth/blogger`
- Public blog lookup: `GET /blogs/byurl?url={blog-url}`

References:

- https://developers.google.com/blogger/docs/3.0/using
- https://developers.google.com/blogger/docs/3.0/reference/posts/insert

The current implementation is mock-only. It does not exchange OAuth tokens or send network requests.
