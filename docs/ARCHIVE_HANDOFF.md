# Private Archive Handoff

The CLI accepts either one `.txt`, `.json`, or `.csv` archive file, or a directory containing
individual `.txt` posts. For directory imports, each non-empty text file is one post; an ISO date
at the end of its filename is retained as `originalDate`. Empty and non-TXT files are counted in
the preview but never imported.

Do not commit or upload the archive to GitHub. Put the export inside local `data/private/`, which is
ignored by Git.

Preferred format is UTF-8 JSON:

```json
[
  {
    "externalId": "facebook-post-id",
    "source": "FACEBOOK_ARCHIVE",
    "originalText": "اصل اردو متن",
    "originalDate": "2020-01-31T12:30:00Z",
    "category": "optional",
    "tags": ["optional"]
  }
]
```

TXT paragraphs and quoted CSV are also supported. JSON is preferred because it preserves IDs,
dates, categories, and tags without guessing.

Run preview first:

```powershell
pnpm.cmd import:preview -- data/private/archive.json
```

The preview prints no post bodies. If the record count and privacy signals are expected, run:

```powershell
pnpm.cmd import:archive -- data/private/archive.json
pnpm.cmd analyze:content -- 200
```

Analysis is resumable in batches. The original archive and local SQLite database remain ignored.
