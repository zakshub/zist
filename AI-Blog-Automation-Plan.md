> From: https://chatgpt.com/g/g-p-6a3cc9f3d7c081918a69407b5e00fa46/c/6a7b6842-2f5c-83ee-a5df-3d053c36ddaa

# you asked

message time: 2026-08-11 23:24:49

1) i have a facebook PAGEAND FACEBOOK PROFILE AND A GROUP 
2) I WANT TO WRITE ON A BLOG , AND IWANT AI TO POST THAT BLOG  LINK ,ALONG WITH CAPTION , AND ( AI GENRATE IMAGE  ( RELEVANT) ON THAT BLOG AND POST IT ON FB 

I LL USE BLOGGER to post , but for now , 

this is , how it shoud be

1) randomly CHATGPT AI SELECT TOPICS ( FROM GIVE DATABASE OF OLD TOPICS AND POSTS) 
2) WRITE ITS FROM OWN BRAIN
3) POST IT ON BLOGGER ALONG WITH AOWSME FEATHRE IMAGE
4) ONCE PHBLISHED ON BLOGGER (
5) FIND SUITABLE TIME TO POST N facbeook page
6) i ll just run the script intialluyfrom local and it would take from there
7) later on , that script would be , ON , A VPS ( THAT PHASE COMES LATER) N IT WOULD AUTOMATE COMPLETE THE ABOVE PROCEDUR ( JUST PUTTING THINGS IN DRAFT FOR ME TO REVIEW EITHER BLOGGER OR FACBEOOK PROFILE AND PAGE
write exact STEPS FROM MVP TO CMPELTE

---

# chatgpt response

You’re describing a **human-reviewed publishing pipeline first**, then a mostly automated VPS pipeline later. The critical design choice is to separate **content generation**, **Blogger drafting/publishing**, and **Facebook distribution** so each can be tested independently.

One constraint changes the final architecture: **Facebook Page automation is viable through Meta’s Pages API, but personal-profile publishing is not a normal supported Graph API workflow, and Meta deprecated the Facebook Groups API capabilities used for group posting.** So I would not build the system around browser bots that imitate you; keep Profile/Group as review-and-post targets unless Meta exposes a supported route later.

## NUANCES — 5 real parts

1. **Content intelligence** — choose from your old writing without simply recycling it.
2. **AI production** — write article, title, SEO metadata, Facebook captions, and generate the featured image.
3. **Blogger workflow** — create a Blogger draft, let you review, detect when you publish it.
4. **Facebook distribution** — Page can be automated; personal Profile and Group have API restrictions.
5. **Automation maturity** — local CLI → approval queue → scheduling intelligence → VPS service.

Your idea is technically realistic, but I would change one thing: **do not make topic selection purely random.**

---

# WHAT HOLDS UP

The strongest part of your idea is the sequence:

> old knowledge → new article → human review → Blogger publication → social distribution

That is much better than telling AI to continuously generate arbitrary content.

Also, keeping **human approval during the first versions** is the correct approach. Blogger's API explicitly supports creating posts as drafts using `isDraft=true`, and a draft can later be published through the API. ([Google for Developers](https://developers.google.com/blogger/docs/3.0/reference/posts/insert))

Your old-post database should become the **idea/history layer**, not a library that AI merely paraphrases.

---

# CRITIQUE

### 1. Don't use true random topic selection

If you have 500 old posts and say:

```text
pick random post
write something about it
```

you will eventually get:

- repeated subjects
- several similar posts in a row
- weak old topics resurfacing
- no thematic balance
- near-duplicate articles

Instead use **weighted intelligent selection**.

For example:

```text
Candidate Topics
      ↓
remove recently used
      ↓
remove semantically similar recent articles
      ↓
prefer under-used categories
      ↓
AI scores remaining topics
      ↓
weighted-random selection
```

There is still randomness, but controlled randomness.

---

### 2. "Write from own brain" needs a precise rule

I would define it as:

```text
OLD POST
   ↓
extract:
- central idea
- questions
- arguments
- concepts
- possible directions

NOT:
rewrite sentences
NOT:
paraphrase article
NOT:
preserve old structure

AI then independently writes a new article.
```

That distinction matters.

---

### 3. Facebook Profile automation is the awkward part

Meta removed the general permission that let third-party apps publish automatically to an ordinary user's personal feed. The supported Pages API, however, still provides Page publishing functionality. ([Facebook Developers](https://developers.facebook.com/ads/blog/post/v2/2018/04/24/platform-product-changes/?utm_source=chatgpt.com))

And Facebook's Groups API capabilities that were previously used for group integrations were deprecated in Graph API v19. ([Facebook Developers](https://developers.facebook.com/docs/graph-api/changelog/version19.0/?utm_source=chatgpt.com))

So design the system like this:

| Destination | Final automation |
|---|---|
| Blogger | ✅ Fully automated |
| Facebook Page | ✅ API automation |
| Facebook Profile | ⚠️ Generate package → manual publish |
| Facebook Group | ⚠️ Generate package → manual publish |

I would **not** use Selenium/Playwright/browser automation to fake Facebook posting. It will be fragile and creates account/security problems.

---

# BALANCED READ

The complete system should eventually look like this:

```text
                    YOUR OLD WRITING DATABASE
                              │
                              ▼
                     CONTENT INTELLIGENCE
                              │
                ┌─────────────┴──────────────┐
                │                            │
          Topic Selector                Memory/Search
                │                            │
                └─────────────┬──────────────┘
                              ▼
                       AI ARTICLE WRITER
                              │
             ┌────────────────┼────────────────┐
             ▼                ▼                ▼
           ARTICLE           SEO          IMAGE PROMPT
                                                 │
                                                 ▼
                                          IMAGE GENERATION
                              │
                              ▼
                       BLOGGER DRAFT
                              │
                         YOU REVIEW
                              │
                        YOU PUBLISH
                              │
                              ▼
                       BLOG URL CREATED
                              │
                              ▼
                   SOCIAL CONTENT ENGINE
                              │
          ┌───────────────────┼────────────────────┐
          ▼                   ▼                    ▼
       FB PAGE             FB PROFILE           FB GROUP
          │                   │                    │
        API               Review Queue          Review Queue
          │                   │                    │
       Schedule           Copy/Post             Copy/Post
```

OpenAI's API can handle the text-generation side and image generation from a server-side application; the official SDK is designed for this kind of programmatic workflow. ([OpenAI Platform](https://platform.openai.com/docs/quickstart/make-your-first-api-request?utm_source=chatgpt.com))

---

# PRACTICAL BOTTOM LINE

Build this in **7 versions**, not all at once.

# PHASE 0 — Prepare the source database

Before connecting Blogger or Facebook.

Take your old articles/posts and import them.

I recommend initially:

```text
SQLite
```

Not MySQL, MongoDB, PostgreSQL, Pinecone, etc.

You don't need them yet.

### Table: `source_posts`

```text
id
title
content
original_date
category
tags
language
source
used_count
last_used_at
quality_score
status
```

Example:

```text
234
"Why people resist changing their beliefs"
<full old article>
2013-04-18
Psychology
belief, bias, identity
ur
old_blog
2
2026-06-13
8.2
active
```

---

# PHASE 1 — LOCAL MVP

This is where I would start.

No Facebook API.

No VPS.

No scheduling.

No complicated dashboard.

Run:

```bash
npm run create-post
```

The system does this:

```text
START
 ↓
load old posts
 ↓
select candidate
 ↓
AI analyzes idea
 ↓
AI proposes new angle
 ↓
write complete article
 ↓
generate title
 ↓
generate excerpt
 ↓
generate labels
 ↓
generate SEO description
 ↓
generate image prompt
 ↓
generate featured image
 ↓
generate Facebook caption
 ↓
SAVE EVERYTHING
```

Output:

```text
/output/
   /2026-08-12-belief-and-identity/
       article.html
       article.md
       metadata.json
       featured-image.png
       facebook-caption.txt
       generation-log.json
```

### `metadata.json`

Something like:

```json
{
  "source_post_id": 234,
  "topic": "Why beliefs become part of identity",
  "title": "When Beliefs Become Identity",
  "slug": "when-beliefs-become-identity",
  "labels": [
    "Psychology",
    "Thinking",
    "Beliefs"
  ],
  "status": "generated"
}
```

### Goal

At this point:

**AI produces one complete publishing package locally.**

Nothing is posted anywhere.

---

# PHASE 2 — CONNECT BLOGGER

Now create:

```text
Google Cloud Project
        ↓
Enable Blogger API
        ↓
OAuth credentials
        ↓
authenticate your Google account
        ↓
obtain Blog ID
```

Blogger API v3 supports programmatic creation, editing and management of blog posts. ([Google for Developers](https://developers.google.com/blogger?utm_source=chatgpt.com))

Your script sends:

```text
POST
/blogger/v3/blogs/{BLOG_ID}/posts
```

with:

```text
isDraft=true
```

Google explicitly documents this capability. ([Google for Developers](https://developers.google.com/blogger/docs/3.0/reference/posts/insert))

Now:

```bash
npm run create-post
```

does:

```text
AI
 ↓
Article
 ↓
Image
 ↓
Blogger
 ↓
DRAFT
```

You open Blogger and see:

> **Draft: When Beliefs Become Identity**

You review it.

---

# PHASE 3 — ADD THE FEATURED IMAGE PROPERLY

This needs its own module:

```text
article
   ↓
Image Director AI
   ↓
visual concept
   ↓
image prompt
   ↓
OpenAI Image API
   ↓
image.png
```

Do **not** tell the image model merely:

> create an image about psychology

The article AI should generate a visual brief:

```text
Concept:
A person standing between several translucent
versions of themselves, representing competing
belief systems.

Style:
Editorial photography / conceptual illustration

Mood:
Introspective, intellectually provocative

Composition:
16:9 landscape

Restrictions:
No text
No logos
No generic AI brain imagery
No stock-photo handshake imagery
```

Then generate the image.

---

# PHASE 4 — BLOGGER → FACEBOOK ENGINE

This is when the system becomes useful.

Your database gets another table.

### `publications`

```text
id
article_id
blogger_post_id
blogger_url

blog_status

fb_page_status
fb_profile_status
fb_group_status

created_at
published_at
```

Possible statuses:

```text
GENERATED
BLOG_DRAFT
BLOG_APPROVED
BLOG_PUBLISHED

SOCIAL_PENDING
SOCIAL_READY
SOCIAL_SCHEDULED
SOCIAL_PUBLISHED
```

---

## After you publish the Blogger article

The system detects:

```text
BLOG_DRAFT
     ↓
BLOG_PUBLISHED
```

and retrieves:

```text
canonical URL
title
excerpt
featured image
publish date
```

Then AI gets:

```text
ARTICLE
+
BLOG URL
```

and generates **separate social content**.

Not:

> New blog published. Read here.

Instead:

```text
Hook
↓
interesting thought
↓
one tension/question
↓
tiny article context
↓
CTA
↓
blog URL
```

---

# PHASE 5 — FACEBOOK PAGE

Create a Meta developer application and connect the Page you manage.

Your system will eventually need the applicable Page access and Page permissions. Meta's Pages API exists specifically for managing Pages, and the Page posts APIs support creating and publishing posts as the Page. ([Facebook Developers](https://developers.facebook.com/documentation/pages-api?utm_source=chatgpt.com))

The module becomes:

```text
facebookPage.js
```

It receives:

```json
{
  "caption": "...",
  "blog_url": "...",
  "image": "...",
  "article_id": "..."
}
```

---

## But initially DON'T auto-publish

Create:

```text
FB_PAGE_REVIEW
```

Your system should show:

```text
ARTICLE
When Beliefs Become Identity

BLOG
✓ Published

FACEBOOK PAGE
Caption:
--------------------------------
What if changing someone's mind
isn't really about facts?

...
--------------------------------

Image:
[preview]

Suggested time:
Wednesday
8:35 PM

[APPROVE]
[REGENERATE CAPTION]
[REGENERATE IMAGE]
[EDIT]
```

Only after:

```text
APPROVE
```

does it enter the publishing queue.

This is much safer.

---

# PHASE 6 — "BEST TIME TO POST"

Do **not** start with AI pretending it knows the perfect time.

Start with simple scheduling rules.

Example:

```text
Mon–Thu
7:00 PM – 10:30 PM

Friday
3:00 PM – 6:00 PM

Weekend
11:00 AM – 2:00 PM
or
7:00 PM – 10:00 PM
```

Those are just configurable starting windows, not universal truths.

Then collect YOUR Page's actual performance.

Meta exposes Page/Post insights metrics through its Insights APIs. ([Facebook Developers](https://developers.facebook.com/docs/graph-api/reference/insights/?utm_source=chatgpt.com))

Store:

```text
post_time
weekday
reach
impressions
reactions
comments
shares
link_clicks
engagement_rate
```

After enough posts:

```text
30+
50+
100+
```

your scheduler can calculate:

```text
Your Audience
Your Page
Your Content
Your Historical Performance
```

instead of internet-average advice.

---

# PHASE 7 — SMART TOPIC ENGINE

Now replace basic randomization.

Create embeddings or semantic representations for:

```text
OLD POSTS
+
NEW ARTICLES
```

Then every potential topic receives scores:

```text
Novelty score
Recency score
Repetition penalty
Category balance
Historical relevance
Quality
Evergreen value
Personal relevance
```

Example formula:

```text
Topic Score =
Novelty             25%
Old-post quality    20%
Category balance    15%
Time since last use 15%
Evergreen value     15%
Randomness          10%
```

Then:

```text
TOP 10 candidates
       ↓
weighted random
       ↓
one selected
```

That preserves the surprise you want without making the system stupid.

---

# YOUR TOPIC DATABASE BECOMES A CONTENT MEMORY

Eventually:

```text
             ZAK WRITING MEMORY
                    │
       ┌────────────┼────────────┐
       │            │            │
   old posts     new posts     topics
       │            │            │
       └────────────┼────────────┘
                    │
               AI retrieval
                    │
             Topic synthesis
                    │
              New thinking
```

This is substantially better than:

```text
Random post → rewrite it
```

---

# PHASE 8 — PROFILE AND GROUP

For each published blog article generate:

### Facebook Page version

```text
professional / public
```

### Facebook Profile version

```text
more personal
more conversational
more opinionated
```

### Facebook Group version

```text
discussion focused
less promotional
question-oriented
```

So one article might generate:

```text
Blog = 1,500 words

Page:
250 words

Profile:
180 words

Group:
120 words + discussion question
```

But the software keeps Profile/Group as:

```text
READY FOR MANUAL POST
```

with:

```text
[COPY CAPTION]

[OPEN BLOG]

[DOWNLOAD/VIEW IMAGE]

[MARK POSTED]
```

No unsupported automation required.

---

# PHASE 9 — LOCAL AUTOMATION

At this point you run:

```bash
npm start
```

and leave it running.

The app has several jobs.

```text
CONTENT JOB
↓
Check if new article required
↓
Generate Blogger draft


BLOGGER WATCHER
↓
Check approved/published articles


SOCIAL JOB
↓
Generate social packages


SCHEDULER
↓
Determine Page publishing slot


PUBLISHER
↓
Publish approved Page posts


ANALYTICS JOB
↓
Collect performance
```

---

# PHASE 10 — HUMAN REVIEW DASHBOARD

Before VPS, I would build this.

Local:

```text
http://localhost:3000
```

Dashboard:

```text
┌───────────────────────────────────────┐
│ CONTENT AUTOMATION                    │
├───────────────────────────────────────┤
│                                       │
│ Drafts                    3           │
│ Awaiting Blog Review      1           │
│ Awaiting Social Review    2           │
│ Scheduled                 4           │
│ Published                37           │
│                                       │
├───────────────────────────────────────┤
│ NEXT ARTICLE                          │
│                                       │
│ Topic: Belief & Identity              │
│ Source: 2013 article                  │
│ Novelty: 91%                          │
│                                       │
│ [VIEW] [EDIT] [REGENERATE]            │
└───────────────────────────────────────┘
```

Article screen:

```text
ARTICLE
IMAGE
SEO
FACEBOOK PAGE
FACEBOOK PROFILE
FACEBOOK GROUP
```

each separately editable.

---

# PHASE 11 — ADD THE APPROVAL SYSTEM

Important.

Every AI action has a state.

```text
GENERATED
    ↓
WAITING_REVIEW
    ↓
APPROVED
    ↓
SCHEDULED
    ↓
PUBLISHED
```

And:

```text
REJECTED
REGENERATE
EDITED
FAILED
```

Never use:

```text
generated → published
```

during early development.

---

# PHASE 12 — MOVE TO VPS

Only after the local system works reliably.

Your Hostinger VPS then runs:

```text
Ubuntu
Node.js
Git
PM2
Nginx
SQLite/PostgreSQL
```

Code:

```text
/home/zak/blog-agent/
```

Environment:

```text
.env
```

containing secrets such as:

```text
OPENAI_API_KEY=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
BLOGGER_BLOG_ID=

META_APP_ID=
META_APP_SECRET=
META_PAGE_ID=
META_PAGE_ACCESS_TOKEN=
```

Never put those credentials inside Git.

---

# VPS PROCESS

Use PM2:

```bash
pm2 start ecosystem.config.js
```

Then:

```bash
pm2 save
pm2 startup
```

Meaning if the VPS restarts:

```text
SERVER RESTART
     ↓
PM2
     ↓
BLOG SYSTEM
     ↓
AUTOMATICALLY ONLINE
```

---

# PHASE 13 — FULL AUTOMATION

Eventually your system runs something like:

```text
03:00
Content engine checks pipeline
        ↓
need new article?
        ↓ YES
select intelligent topic
        ↓
generate original article
        ↓
generate SEO
        ↓
generate featured visual
        ↓
upload Blogger draft
        ↓
notify Zak
```

You review.

```text
Zak publishes article
       ↓
system detects publication
       ↓
retrieve final Blogger URL
       ↓
generate Page caption
       ↓
generate Profile caption
       ↓
generate Group caption
       ↓
choose Page posting slot
       ↓
place Page post in approval queue
       ↓
Zak approves
       ↓
Page scheduled/published
```

Meanwhile:

```text
Profile package = READY
Group package   = READY
```

---

# PHASE 14 — EVENTUALLY ALLOW "AUTOPILOT"

Once you've seen perhaps 50–100 successful generated articles/posts:

Have modes.

```text
MODE 1 — MANUAL

AI generates
Zak approves everything
```

```text
MODE 2 — ASSISTED

Blogger requires approval
Facebook Page automatically schedules after blog approval
```

```text
MODE 3 — AUTOPILOT

AI selects
AI writes
AI generates image
AI creates Blogger draft
AI applies quality checks

Only exceptional content asks for intervention
```

I would probably **keep Blogger publication human-approved permanently**, while automating Page distribution once the Blogger article has been approved.

That one click is a useful safety boundary.

---

# COMPLETE PROJECT STRUCTURE

I would build it roughly as:

```text
zak-content-engine/
│
├── src/
│
│   ├── ai/
│   │   ├── topic-selector.js
│   │   ├── article-writer.js
│   │   ├── title-generator.js
│   │   ├── seo-generator.js
│   │   ├── caption-generator.js
│   │   ├── image-director.js
│   │   └── quality-reviewer.js
│   │
│   ├── blogger/
│   │   ├── auth.js
│   │   ├── create-draft.js
│   │   ├── get-post.js
│   │   └── publication-watcher.js
│   │
│   ├── facebook/
│   │   ├── page-publisher.js
│   │   ├── page-insights.js
│   │   └── scheduler.js
│   │
│   ├── content/
│   │   ├── source-importer.js
│   │   ├── deduplicator.js
│   │   ├── topic-memory.js
│   │   └── similarity.js
│   │
│   ├── image/
│   │   ├── generator.js
│   │   ├── optimizer.js
│   │   └── uploader.js
│   │
│   ├── workflow/
│   │   ├── orchestrator.js
│   │   ├── approval.js
│   │   ├── queue.js
│   │   └── jobs.js
│   │
│   ├── db/
│   │   ├── database.js
│   │   └── migrations/
│   │
│   └── dashboard/
│
├── data/
│   └── source-posts/
│
├── generated/
│
├── logs/
│
├── .env
├── .env.example
├── package.json
└── README.md
```

---

# THE ACTUAL BUILD ORDER

Do **not** jump to VPS.

Build exactly in this order:

```text
01  Import old posts
 ↓
02  SQLite database
 ↓
03  Topic selector
 ↓
04  AI article writer
 ↓
05  AI quality/repetition checker
 ↓
06  Featured image generator
 ↓
07  Local output package
 ↓
08  Blogger OAuth
 ↓
09  Blogger draft creation
 ↓
10  Blogger publication detection
 ↓
11  Facebook caption generator
 ↓
12  Facebook Page API
 ↓
13  Approval queue
 ↓
14  Facebook Page scheduling
 ↓
15  Profile manual package
 ↓
16  Group manual package
 ↓
17  Analytics collection
 ↓
18  Intelligent timing
 ↓
19  Semantic topic selection
 ↓
20  Local dashboard
 ↓
21  Error/retry/logging system
 ↓
22  Move exact same project to VPS
 ↓
23  PM2 persistence
 ↓
24  Notifications
 ↓
25  Assisted/autopilot mode
```

---

# The MVP I would build first

Don't build all 25 items initially.

## **MVP v0.1**

Only:

```text
OLD POST DATABASE
       ↓
INTELLIGENT RANDOM TOPIC
       ↓
OPENAI
       ↓
NEW ORIGINAL ARTICLE
       ↓
TITLE + SEO + LABELS
       ↓
FEATURED IMAGE
       ↓
BLOGGER DRAFT
```

And stop.

Your first success condition is simply:

> **I execute one command locally and, without doing anything else, a complete new article with a generated featured image appears inside my Blogger account as a draft ready for review.**

Once **that** works reliably, add Facebook.

That is the right MVP boundary. Blogger officially provides the necessary authenticated post-creation and draft workflow, so there is no need to automate its UI. ([Google for Developers](https://developers.google.com/blogger/docs/3.0/reference/posts/insert))

Then MVP v0.2 becomes:

```text
I publish Blogger draft
        ↓
system detects it
        ↓
creates 3 social variants
        ↓
Page / Profile / Group
```

Then v0.3:

```text
Page → scheduled automatically after approval.
```

Then v1.0:

```text
LOCAL CONTENT OPERATING SYSTEM
```

And only **after v1.0 works locally** should we move the unchanged core engine to Hostinger VPS.

---

# you asked

message time: 2026-08-11 23:31:32

SIRF FB PAGE PER HI KARNA HE GROUP AND PROIFLE P , ANHI database me de donga , ITS MORE THAN 7K POSTS FROM FB , SMALL LONG ALL IN URDU ,  BUT FILHAL give me detailed codex prompt to build this , ON LOCAL AND SCALABLE TO VPS AND ALSO JO JO BANATA JAYE CODEX WO WO GIT REPO P JAYE BUT PEHELY LOCAL PER JIS KO ME VIUSAL CODE PER CHALA KAR DEKHON

---

# chatgpt response

I’ll turn this into a **single master Codex build prompt**: local-first on Windows/VS Code, Git-versioned from the first commit, only Facebook Page distribution, and structured so the same codebase can later move to your Hostinger VPS without a rewrite.

One architectural adjustment matters for your 7,000+ Urdu Facebook posts: **the raw archive should not be committed to GitHub by default**. The repo should contain code, schemas, migrations, prompts and tests; the private corpus, OAuth tokens and API keys stay local/VPS-only via ignored data directories and environment variables.

Your local environment can use Codex from the terminal or IDE, and OpenAI currently recommends the **Responses API** for new API integrations; GPT Image 2 is the current recommended image-generation model. ([OpenAI Developers](https://developers.openai.com/codex/cli?utm_source=chatgpt.com)) Blogger's API supports creating posts and keeping them as drafts, while Meta's Page Feed endpoint supports publishing to a Facebook Page. ([Google for Developers](https://developers.google.com/blogger/docs/3.0/reference/posts/insert?utm_source=chatgpt.com))

Below is the master prompt I would give Codex. I have deliberately made **Git/GitHub part of the development protocol**, not something added afterward.

**Document Title: **

# CODEX MASTER BUILD PROMPT
## ZAK URDU CONTENT ENGINE
### Local-First → GitHub-Versioned → VPS-Ready → Blogger + Facebook Page Automation

You are the **lead software architect, senior TypeScript engineer, AI engineer, DevOps engineer, database architect, and QA engineer** responsible for building this project from zero into a working application.

Do not merely explain how to build it.

**Actually create the project, files, code, database schema, UI, integrations, tests, documentation, Git history, and runnable local application.**

Work incrementally.

After every meaningful completed milestone:

1. run tests/lint/typecheck,
2. fix errors,
3. update project documentation,
4. create an atomic Git commit,
5. push that commit to GitHub if the remote is available.

Never commit secrets, tokens, OAuth credentials, generated private content, or my private 7,000+ post archive.

---

# 0. PROJECT NAME

Use:

```text
zak-urdu-content-engine
```

Working title in UI:

```text
Zak Content Engine
```

---

# 1. PRIMARY OBJECTIVE

Build a local-first AI publishing system that eventually performs this workflow:

```text
7,000+ historical Urdu Facebook posts
                ↓
        Private Content Database
                ↓
      Intelligent Topic Selection
                ↓
     Relevant Historical Retrieval
                ↓
       New Independent Thinking
                ↓
       New Original Urdu Article
                ↓
       AI Editorial Review
                ↓
        Featured Image Brief
                ↓
        AI Image Generation
                ↓
          Blogger Draft
                ↓
          Human Review
                ↓
       Human Publishes Blog
                ↓
      Detect Published Blog Post
                ↓
    Generate Facebook Page Caption
                ↓
      Determine Posting Window
                ↓
       Facebook Page Draft/Queue
                ↓
          Human Approval
                ↓
        Facebook Page Publish
                ↓
       Collect Performance Data
                ↓
Improve future topic/time selection
```

IMPORTANT:

Facebook automation is for:

```text
FACEBOOK PAGE ONLY
```

DO NOT implement:

```text
Facebook personal profile automation
Facebook Group automation
```

Do not spend development time on either.

---

# 2. DEVELOPMENT STRATEGY

This application must be:

```text
LOCAL FIRST
↓
TESTED IN VS CODE
↓
GIT VERSIONED
↓
PUSHED TO GITHUB IN MILESTONES
↓
LATER DEPLOYABLE TO HOSTINGER VPS
```

I will initially run everything manually on my Windows computer from VS Code.

Later, the same application will run continuously on an Ubuntu-based Hostinger VPS.

Therefore:

DO NOT design separate local and VPS applications.

Build ONE codebase whose infrastructure can change through environment configuration.

---

# 3. HUMAN-IN-THE-LOOP RULE

Initial versions must NOT autonomously publish content publicly.

Default workflow:

```text
AI GENERATES
↓
SYSTEM SAVES
↓
HUMAN REVIEWS
↓
HUMAN APPROVES
↓
PUBLICATION
```

Blogger:

```text
Create DRAFT automatically
Human reviews
Human publishes manually
```

Facebook Page:

Initially:

```text
Generate social package
↓
Put into review queue
↓
Human approves
↓
Then publish/schedule
```

Later we may enable automatic Facebook Page publishing after Blogger approval.

The architecture must support that later without rewriting the system.

---

# 4. IMPORTANT CONTENT CONTEXT

I have more than:

```text
7,000 historical Facebook posts
```

They vary significantly.

Some are:

```text
very short
one paragraph
random observations
questions
quotes
arguments
long posts
full essays
social commentary
personal analysis
philosophy
religion
psychology
technology
social issues
life observations
other subjects
```

Almost all are:

```text
URDU
```

The archive is not a clean collection of polished blog articles.

Treat it as:

```text
PERSONAL INTELLECTUAL MEMORY
```

not merely:

```text
old articles to rewrite
```

This distinction is fundamental.

---

# 5. PRIVATE DATA RULE

My raw archive is private.

Create something like:

```text
/data/private/
```

but ensure it is ignored by Git.

Add these patterns to `.gitignore` where appropriate:

```text
.env
.env.local
.env.*.local

/data/private/**
/data/imports/**
/data/generated/**
/storage/private/**
/storage/generated/**

*.db
*.db-journal
*.sqlite
*.sqlite3

credentials.json
token.json
oauth-token.json
google-token.json
meta-token.json

logs/
```

Do NOT accidentally ignore source-code migration files or test fixtures.

Provide safe mock/sample content under:

```text
/data/sample/
```

for testing.

The GitHub repository must be usable without containing my real corpus.

---

# 6. TECHNOLOGY ARCHITECTURE

Choose a clean, production-capable TypeScript stack.

Preferred architecture:

```text
pnpm workspace / monorepo
```

Structure approximately:

```text
zak-urdu-content-engine/

apps/
    web/
    worker/

packages/
    core/
    db/
    ai/
    blogger/
    facebook/
    shared/
    config/

scripts/

data/
    sample/
    private/

storage/

docs/

tests/
```

Use:

```text
TypeScript
Node.js
React
Next.js or another appropriate modern React framework
SQLite for initial local persistence
a clean repository/data-access abstraction
Zod or equivalent runtime validation
OpenAI official Node SDK
Google Blogger API
Meta Graph API
Vitest or equivalent
ESLint
Prettier
```

For the local database, SQLite is acceptable.

BUT:

Database logic must be isolated sufficiently that migration to PostgreSQL on the VPS later is realistic.

Do not scatter raw SQL/database-specific behavior throughout the application.

Create repositories/services.

Example:

```text
PostRepository
TopicRepository
GenerationRepository
PublicationRepository
SocialPostRepository
AnalyticsRepository
SettingsRepository
```

---

# 7. DO NOT OVERENGINEER THE MVP

Architecture should be scalable.

Implementation should remain incremental.

Do NOT spend days building:

```text
Kubernetes
microservices
Kafka
Redis clusters
distributed event buses
enterprise authentication
multi-user SaaS architecture
```

This is initially:

```text
ONE USER
ONE COMPUTER
ONE BLOG
ONE FACEBOOK PAGE
```

But code boundaries should permit expansion.

---

# 8. LOCAL USER EXPERIENCE

I want to open VS Code and run approximately:

```bash
pnpm install
pnpm dev
```

Then access:

```text
http://localhost:3000
```

The dashboard must visually show me what the system is doing.

I should NOT need to interact with the database manually.

---

# 9. BUILD A REAL DASHBOARD

Create a polished but restrained admin application.

This is an internal professional tool.

Do not make it look like an AI-generated toy dashboard.

Use:

```text
clear hierarchy
excellent typography
clean spacing
responsive layout
accessible controls
good information density
useful tables
status badges
progress/status views
empty states
loading states
errors
confirmation states
```

The dashboard should eventually contain:

```text
Dashboard

Content Memory

Topics

Generate

Articles

Blogger

Facebook Page

Queue

Analytics

Automation

Settings

System Logs
```

---

# 10. MAIN DASHBOARD

Show:

```text
TOTAL SOURCE POSTS

INDEXED POSTS

CONTENT CATEGORIES

DRAFT ARTICLES

BLOGGER DRAFTS

PUBLISHED BLOG POSTS

FACEBOOK POSTS WAITING APPROVAL

FACEBOOK POSTS SCHEDULED

FACEBOOK POSTS PUBLISHED

FAILED JOBS
```

Also show:

```text
Next Candidate Topic

Last Generated Article

Latest Blogger Status

Next Facebook Publishing Slot

Recent Activity
```

---

# 11. SYSTEM STATES

Use explicit statuses.

Article status:

```text
IDEA
SELECTED
GENERATING
GENERATED
REVIEW_REQUIRED
APPROVED
REJECTED
BLOGGER_DRAFT
BLOGGER_PUBLISHED
ARCHIVED
FAILED
```

Social post status:

```text
WAITING_FOR_BLOG
GENERATING
READY_FOR_REVIEW
APPROVED
SCHEDULED
PUBLISHING
PUBLISHED
REJECTED
FAILED
```

Image status:

```text
NOT_CREATED
BRIEF_CREATED
GENERATING
GENERATED
APPROVED
REJECTED
FAILED
```

Job status:

```text
PENDING
RUNNING
SUCCEEDED
FAILED
RETRYING
CANCELLED
```

Do not represent workflow using vague booleans such as:

```text
isDone
isReady
```

when a state machine is more appropriate.

---

# 12. DATABASE ENTITIES

Design normalized tables/entities.

At minimum create the following concepts.

## SourcePost

Fields should include:

```text
id
externalId
source
originalText
normalizedText
originalDate
importedAt
language
wordCount
characterCount
contentType
category
subcategories
tags
topics
people
entities
keywords
summary
centralIdea
argument
questions
tone
qualityScore
evergreenScore
personalVoiceScore
embeddingStatus
usedCount
lastUsedAt
active
metadata
createdAt
updatedAt
```

Some fields may initially be nullable.

---

## Topic

```text
id
name
description
category
sourcePostIds
keywords
status
noveltyScore
relevanceScore
recencyScore
qualityScore
diversityScore
finalScore
lastGeneratedAt
generationCount
createdAt
updatedAt
```

---

## Article

```text
id
topicId
title
slug
excerpt
contentMarkdown
contentHtml
seoTitle
seoDescription
labels
keywords
sourceContext
generationModel
generationPromptVersion
qualityScore
similarityScore
status
createdAt
updatedAt
approvedAt
publishedAt
```

---

## GeneratedImage

```text
id
articleId
brief
prompt
negativeInstructions
style
aspectRatio
model
localPath
remoteUrl
status
createdAt
approvedAt
```

---

## BloggerPublication

```text
id
articleId
blogId
bloggerPostId
bloggerUrl
status
createdAt
draftCreatedAt
publishedAt
lastCheckedAt
rawMetadata
```

---

## FacebookPagePost

```text
id
articleId
bloggerPublicationId
caption
hook
cta
imageId
blogUrl
recommendedPublishAt
scheduledPublishAt
facebookPostId
facebookPostUrl
status
createdAt
approvedAt
publishedAt
```

---

## FacebookAnalytics

```text
id
facebookPagePostId
capturedAt
reach
impressions
reactions
comments
shares
clicks
engagementRate
rawMetrics
```

Exact metrics will depend upon what the current Meta APIs expose.

Do not fabricate unavailable metrics.

---

## GenerationRun

```text
id
type
sourceIds
promptVersion
model
requestMetadata
resultMetadata
status
startedAt
finishedAt
error
tokenUsage
estimatedCost
```

---

## Job

```text
id
type
payload
status
attempts
maxAttempts
scheduledAt
startedAt
completedAt
lastError
createdAt
updatedAt
```

---

# 13. ARCHIVE IMPORTER

Build a flexible archive-import subsystem.

I have not supplied the actual 7,000-post database yet.

Therefore create adapters.

Support initially:

```text
TXT
JSON
CSV
```

Structure:

```text
ImportAdapter
    TXTImporter
    JSONImporter
    CSVImporter
```

Later another adapter can be added without changing core logic.

The importer must:

```text
scan source
parse posts
normalize Unicode
preserve original Urdu
remove obvious export artifacts
detect duplicates
calculate text statistics
save original raw value
save normalized value
record import errors
generate import report
```

Never destroy the original imported text.

---

# 14. URDU REQUIREMENTS

Preserve Unicode perfectly.

Do not transliterate Urdu.

Generated articles should default to:

```text
Urdu
```

Article rendering must support:

```text
RTL
```

with appropriate HTML:

```html
dir="rtl"
lang="ur"
```

Do not automatically convert Urdu terminology into Hindi.

Do not unnecessarily mix English into generated Urdu.

Technical names, brand names and unavoidable terminology may remain in their proper original form.

---

# 15. CONTENT ANALYSIS PIPELINE

A historical Facebook post should be analyzed into structured concepts.

Example:

```text
Original Post
↓
Normalize
↓
Analyze
↓
Extract
    central idea
    themes
    claims
    questions
    arguments
    observations
    category
    keywords
    entities
    tone
    evergreen value
↓
Store structured memory
```

Use structured model output validated against a schema.

Do not rely upon parsing arbitrary prose.

---

# 16. TOPIC SELECTION

Do NOT simply execute:

```javascript
Math.random()
```

across all 7,000 posts.

Build an intelligent weighted-selection engine.

Initial scoring should consider:

```text
content quality
evergreen potential
time since source was used
topic repetition
recent article similarity
category balance
idea richness
historical importance
randomness
```

Example conceptual weighting:

```text
Novelty             25%
Source quality      20%
Category diversity  15%
Time since used     15%
Evergreen potential 15%
Randomness          10%
```

Make weights configurable in Settings.

The engine should:

```text
1. create candidate pool
2. exclude recently used items
3. exclude near duplicates
4. calculate scores
5. select top candidate set
6. use weighted randomness among strong candidates
7. explain why the chosen topic was selected
```

Save the selection reasoning.

---

# 17. DO NOT REWRITE OLD POSTS

This rule is critical.

The source archive serves as:

```text
MEMORY
INSPIRATION
PERSONAL INTELLECTUAL HISTORY
TOPIC DISCOVERY
VOICE CONTEXT
```

It must NOT become a paraphrasing machine.

Article generation must explicitly instruct the model:

```text
Do not rewrite the source post.
Do not preserve its original sentence structure.
Do not merely expand it.
Do not plagiarize the original wording.

Understand the underlying question or idea.

Think independently.

Develop a fresh argument.

Challenge weak assumptions if necessary.

Add new reasoning.

Create a standalone article suitable for publication today.
```

---

# 18. RETRIEVAL

For every selected topic, retrieve a small relevant context set from the archive.

Example:

```text
Selected idea
↓
Retrieve:
    primary source post
    3–10 related historical posts
    contradictory posts if available
    adjacent ideas
↓
Build context packet
↓
Generate article
```

Do NOT dump all 7,000 posts into one model call.

Implement retrieval architecture.

Initially keyword/full-text similarity is acceptable.

Design it so embeddings/vector similarity can be enabled later.

---

# 19. EMBEDDINGS

Do not make embeddings mandatory for initial boot.

Create a pluggable semantic search interface:

```text
SemanticSearchProvider
```

Implement:

```text
Local/basic provider
```

Then create an optional OpenAI embeddings provider.

The application should work before all 7,000 posts have embeddings.

Background indexing can be added later.

---

# 20. ARTICLE GENERATION PIPELINE

Separate generation into stages.

DO NOT use one giant prompt that generates everything.

Pipeline:

```text
Topic Selection
↓
Context Retrieval
↓
Article Angle
↓
Outline
↓
Draft
↓
Editorial Critique
↓
Revision
↓
Similarity Check
↓
Metadata Generation
↓
Image Brief
```

Store important intermediate artifacts.

---

# 21. ARTICLE ANGLE GENERATOR

Before writing, generate:

```text
topic
central question
new angle
thesis
counterargument
key reasoning
intended reader
why this deserves publication now
possible structure
```

Show this in the dashboard.

---

# 22. ARTICLE WRITER

The writer should produce thoughtful Urdu rather than generic SEO filler.

The system should avoid:

```text
generic introductions
empty motivational statements
excessive headings
repetitive conclusions
AI clichés
forced bullet lists
fake quotations
fabricated facts
invented references
unnecessary English
```

Writing quality is more important than length.

Length should follow the subject.

Possible:

```text
500 words
800 words
1,500 words
2,500+ words
```

Do not force every article into the same length.

---

# 23. FACTUAL CLAIMS

Historical personal reflection can be generated from the private archive.

However, if an article makes externally verifiable claims involving:

```text
science
health
technology
history
law
politics
statistics
current events
research
```

the architecture should allow later addition of a research/fact-verification step.

For MVP:

mark potentially factual claims for review.

Do not fabricate citations.

---

# 24. EDITORIAL REVIEWER

After generation, run a separate AI editorial pass.

Evaluate:

```text
originality
clarity
argument quality
logical consistency
depth
redundancy
generic AI language
Urdu naturalness
coherence
title quality
opening strength
ending strength
similarity to source
```

Return structured scores.

Example:

```text
Originality: 8.7
Clarity: 9.1
Depth: 7.9
Source similarity: 14%
AI cliché risk: LOW
Publishability: 8.5
```

Scores must be model evaluations, not falsely presented as objective scientific measurements.

---

# 25. SIMILARITY SAFETY

Compare the generated article against:

```text
primary source
related sources
recent generated articles
```

If similarity crosses a configurable threshold:

```text
BLOCK automatic Blogger draft creation
```

Mark:

```text
REVIEW_REQUIRED
```

Allow regeneration.

---

# 26. OPENAI INTEGRATION

Use the current official OpenAI Node SDK.

For text generation:

Use the currently recommended modern API from official OpenAI documentation at implementation time.

Do not build new code against a legacy API if the official documentation recommends a newer interface.

Make models configurable through environment variables.

For example:

```text
OPENAI_TEXT_MODEL=
OPENAI_REASONING_MODEL=
OPENAI_IMAGE_MODEL=
OPENAI_EMBEDDING_MODEL=
```

Do not hardcode one model throughout the source code.

Use an abstraction:

```text
AIProvider
```

with services approximately:

```text
analyzePost()
selectTopic()
createArticleAngle()
createOutline()
writeDraft()
critiqueDraft()
reviseDraft()
generateMetadata()
createImageBrief()
generateFacebookCaption()
```

---

# 27. STRUCTURED OUTPUT

Where practical use schemas.

Example:

```typescript
TopicAnalysisSchema
ArticleAngleSchema
EditorialReviewSchema
MetadataSchema
ImageBriefSchema
FacebookCaptionSchema
```

Validate AI responses.

If validation fails:

```text
retry safely
log failure
do not corrupt workflow
```

---

# 28. PROMPT VERSIONING

Do not bury production prompts inside random source files.

Create:

```text
packages/ai/prompts/
```

Suggested:

```text
analyze-source-post.ts
select-topic.ts
article-angle.ts
article-outline.ts
article-writer.ts
article-reviewer.ts
article-reviser.ts
metadata-generator.ts
image-director.ts
facebook-caption.ts
```

Every generation run should store:

```text
prompt version
model
date
```

so results can later be compared.

---

# 29. FEATURED IMAGE SYSTEM

Do not generate generic AI artwork.

First create an:

```text
IMAGE BRIEF
```

containing:

```text
article concept
visual metaphor
subject
scene
composition
medium
lighting
mood
camera/perspective
background
aspect ratio
things to avoid
whether text should appear
```

Default featured image should generally have:

```text
NO TEXT
NO WATERMARK
NO LOGO
```

unless deliberately requested.

Avoid repetitive visual clichés such as:

```text
glowing brain
robot head
random futuristic circuitry
generic handshake
floating light bulb
anonymous businessman
```

unless conceptually justified.

---

# 30. IMAGE GENERATION

Generate the featured image through the current recommended OpenAI image-generation API/model.

Make configuration editable.

Store:

```text
image brief
final prompt
model
quality
dimensions
generation ID if available
local path
generated time
```

Default blog image orientation:

```text
landscape
```

Use an appropriate social/blog-friendly aspect ratio.

Do not assume that Blogger and Facebook must use separate images initially.

---

# 31. BLOGGER INTEGRATION

Create a Blogger connector isolated from business logic.

Example:

```text
BloggerClient
```

Responsibilities:

```text
authenticate
get blog information
create draft
get draft
update draft
list posts
detect publication
get canonical URL
handle errors
refresh credentials
```

The MVP should create:

```text
BLOGGER DRAFT ONLY
```

Never publish Blogger posts automatically unless an explicit setting is later enabled.

---

# 32. BLOGGER ARTICLE FORMAT

Convert article Markdown into clean HTML.

Support:

```text
RTL
headings
paragraphs
blockquote
lists
links
featured image
semantic markup
```

Avoid excessive inline styling.

Do not create malformed Blogger HTML.

---

# 33. BLOGGER DRAFT SCREEN

Dashboard should display:

```text
Article Title

Generation Status

Featured Image

Blogger Draft ID

Blogger Status

Created Time

Last Checked

Open Blogger

Regenerate Metadata

Replace Image

Refresh Status
```

---

# 34. BLOGGER PUBLICATION DETECTION

When a Blogger draft is manually published:

```text
poll periodically
or use the most appropriate supported mechanism
```

Update:

```text
BLOGGER_DRAFT
↓
BLOGGER_PUBLISHED
```

Capture:

```text
final URL
published timestamp
post ID
title
```

Then automatically trigger:

```text
FACEBOOK CONTENT GENERATION
```

but NOT immediate Facebook publication.

---

# 35. FACEBOOK PAGE ONLY

Implement:

```text
FacebookPageClient
```

Do not implement User/Profile or Groups integrations.

Functions should eventually include:

```text
validateConnection()
getPageIdentity()
createPagePost()
schedulePagePost() if current API supports it
getPagePost()
getPostInsights() where supported
```

Before implementation, inspect the CURRENT official Meta documentation.

Do not assume old Graph API versions or permissions are still correct.

Keep Graph API version configurable.

Example:

```text
META_GRAPH_API_VERSION=
```

---

# 36. FACEBOOK SOCIAL PACKAGE

Once Blogger is live:

Generate:

```text
hook
caption
CTA
blog URL
image
recommended posting time
reason for recommendation
```

The Facebook caption should NOT merely summarize the entire article.

Desired structure:

```text
Strong opening thought/question
↓
short insight/tension
↓
reason to continue reading
↓
blog link
```

Keep it natural.

Avoid:

```text
"Exciting news!"
"I just published..."
"Check out my latest blog!"
generic marketing language
hashtag spam
```

unless context genuinely calls for it.

---

# 37. FACEBOOK REVIEW SCREEN

Create a real preview/review UI.

Show:

```text
PAGE NAME

IMAGE

CAPTION

BLOG URL

RECOMMENDED TIME

STATUS
```

Actions:

```text
EDIT

SAVE

REGENERATE CAPTION

REGENERATE IMAGE

APPROVE

REJECT

SCHEDULE

PUBLISH NOW
```

Initially:

```text
APPROVAL REQUIRED = TRUE
```

---

# 38. FACEBOOK TIMING ENGINE — MVP

Do NOT claim AI knows the objectively best Facebook time.

Start using configurable time windows.

Settings may contain:

```text
timezone = Asia/Karachi
allowed weekdays
allowed hours
minimum interval between posts
maximum posts per day
```

The scheduler picks an available slot.

Store the reason for its choice.

---

# 39. FACEBOOK TIMING ENGINE — LATER

When enough analytics exist, improve timing from actual Page performance.

Possible features:

```text
engagement by weekday
engagement by hour
link click performance
content-category performance
article length vs performance
posting interval
recent saturation
```

Later algorithm:

```text
Historical Performance
+
Category Performance
+
Day/Time Performance
+
Posting Frequency
+
Exploration Factor
=
Recommended Slot
```

Do not implement fake sophistication before useful analytics exist.

---

# 40. JOB SYSTEM

Build a persistent job architecture.

Jobs could include:

```text
IMPORT_POSTS
ANALYZE_SOURCE
GENERATE_TOPIC
GENERATE_ARTICLE
GENERATE_IMAGE
CREATE_BLOGGER_DRAFT
CHECK_BLOGGER_STATUS
GENERATE_FACEBOOK_PACKAGE
PUBLISH_FACEBOOK
FETCH_FACEBOOK_ANALYTICS
```

For local MVP this may run using database-backed jobs and a worker process.

Do not require Redis initially.

The worker must survive recoverable failures.

---

# 41. RETRIES

External APIs fail.

Implement:

```text
timeouts
bounded retries
exponential backoff
clear error states
idempotency where possible
```

Never create duplicate Blogger posts because a network response timed out.

Never create duplicate Facebook Page posts because of retry logic.

Use local idempotency keys/workflow identifiers.

---

# 42. LOGGING

Create structured logs.

Levels:

```text
DEBUG
INFO
WARN
ERROR
```

Never log:

```text
API keys
OAuth secrets
access tokens
refresh tokens
complete private archive unnecessarily
```

Dashboard System Logs screen should expose useful safe logs.

---

# 43. COST TRACKING

Track approximate AI consumption.

Show:

```text
generation type
model
input tokens
output tokens
estimated cost if calculable
image generation count
```

Pricing must be configurable or clearly marked as approximate because model pricing changes.

Do not hardcode permanent pricing assumptions.

---

# 44. SETTINGS SCREEN

Settings categories:

```text
General

Content

AI

Blogger

Facebook Page

Scheduling

Automation

Privacy

Advanced
```

Do not store raw secrets in browser localStorage.

Sensitive values belong server-side.

---

# 45. AUTOMATION MODES

Prepare architecture for:

## MANUAL

```text
User starts every generation.
Everything requires approval.
```

## ASSISTED

```text
System automatically creates Blogger drafts.
Facebook waits for approval.
```

## AUTOPILOT

Future only:

```text
System selects topic on schedule.
Creates Blogger draft.
After explicit Blogger publication,
Facebook can automatically schedule according to policy.
```

Default:

```text
MANUAL
```

during development.

---

# 46. SAFETY SWITCH

Create global:

```text
AUTOMATION_ENABLED=false
```

and separate switches:

```text
AUTO_GENERATE_ARTICLES=false
AUTO_CREATE_BLOGGER_DRAFTS=false
AUTO_PUBLISH_BLOGGER=false
AUTO_GENERATE_FACEBOOK=true/false
AUTO_PUBLISH_FACEBOOK=false
```

Default every public-publishing switch to FALSE.

---

# 47. DRY RUN MODE

Implement:

```text
DRY_RUN=true
```

In dry-run:

AI calls may be real if configured.

But:

```text
NO Blogger write
NO Facebook write
```

Instead log exactly what WOULD be sent.

This is important for local development.

---

# 48. MOCK MODE

Implement:

```text
USE_MOCK_AI=true
USE_MOCK_BLOGGER=true
USE_MOCK_FACEBOOK=true
```

Provide deterministic fixtures.

The complete local UI must be testable without external credentials.

---

# 49. ENVIRONMENT VARIABLES

Create a comprehensive:

```text
.env.example
```

Something similar to:

```text
NODE_ENV=development
APP_URL=http://localhost:3000
APP_TIMEZONE=Asia/Karachi

DATABASE_URL=

OPENAI_API_KEY=
OPENAI_TEXT_MODEL=
OPENAI_REASONING_MODEL=
OPENAI_IMAGE_MODEL=
OPENAI_EMBEDDING_MODEL=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
BLOGGER_BLOG_ID=

META_APP_ID=
META_APP_SECRET=
META_PAGE_ID=
META_PAGE_ACCESS_TOKEN=
META_GRAPH_API_VERSION=

DRY_RUN=true

USE_MOCK_AI=true
USE_MOCK_BLOGGER=true
USE_MOCK_FACEBOOK=true

AUTOMATION_ENABLED=false
AUTO_GENERATE_ARTICLES=false
AUTO_CREATE_BLOGGER_DRAFTS=false
AUTO_PUBLISH_BLOGGER=false
AUTO_GENERATE_FACEBOOK=false
AUTO_PUBLISH_FACEBOOK=false
```

Do not expose secrets through client-side environment variables.

---

# 50. LOCAL COMMANDS

Create useful commands such as:

```bash
pnpm dev

pnpm build

pnpm lint

pnpm typecheck

pnpm test

pnpm test:e2e

pnpm db:migrate

pnpm db:seed

pnpm import:sample

pnpm import:archive

pnpm worker

pnpm generate:article

pnpm blogger:test

pnpm facebook:test

pnpm doctor
```

`pnpm doctor` should inspect configuration and report:

```text
Node
pnpm
database
OpenAI config
Google/Blogger config
Meta config
Git
GitHub remote
write permissions
```

Never print secret values.

---

# 51. README

README must contain:

```text
What the system does

Architecture overview

Prerequisites

Installation

Environment setup

Database setup

Running mock mode

Running real AI mode

Importing archive

Generating first article

Connecting Blogger

Connecting Facebook

Running worker

Testing

Git workflow

Local development

Future VPS deployment

Troubleshooting
```

README commands must actually work.

---

# 52. DOCUMENTATION

Create:

```text
/docs/ARCHITECTURE.md
/docs/ROADMAP.md
/docs/LOCAL_SETUP.md
/docs/DATA_MODEL.md
/docs/CONTENT_PIPELINE.md
/docs/AI_PROMPTS.md
/docs/BLOGGER_INTEGRATION.md
/docs/FACEBOOK_INTEGRATION.md
/docs/GIT_WORKFLOW.md
/docs/SECURITY.md
/docs/VPS_DEPLOYMENT.md
/docs/TROUBLESHOOTING.md
/docs/DECISIONS.md
```

---

# 53. ARCHITECTURAL DECISION RECORD

Whenever making a significant choice, record it.

Examples:

```text
Why TypeScript
Why SQLite initially
Why worker is separate
Why human approval is default
Why archive is excluded from Git
Why Facebook Page only
Why job state is persistent
```

Do not create documentation purely for volume.

Keep it useful.

---

# 54. GIT INITIALIZATION

At the very beginning:

Check:

```bash
git --version
git status
```

If repository does not exist:

```bash
git init
```

Use:

```text
main
```

as the primary branch.

Create `.gitignore` BEFORE importing or generating any private data.

Verify ignored files before first push.

Run:

```bash
git status
```

and explicitly inspect that secrets/private content are not staged.

---

# 55. GITHUB CONNECTION

Check:

```bash
gh --version
gh auth status
```

If GitHub CLI is authenticated and no remote repository exists:

Create a PRIVATE GitHub repository named:

```text
zak-urdu-content-engine
```

unless a remote URL is already configured.

Preferred:

```bash
gh repo create zak-urdu-content-engine --private --source=. --remote=origin
```

Do not destroy or replace an existing remote.

If GitHub authentication is unavailable:

continue developing locally.

Do not stop the entire project.

Clearly report:

```text
GitHub push pending because authentication is unavailable.
```

and provide the exact authentication step required.

Once authentication is available, push accumulated commits.

---

# 56. GIT DEVELOPMENT PROTOCOL

Code must reach GitHub progressively.

Do NOT wait until the complete application is finished.

But also do NOT commit every tiny file edit.

Commit by coherent milestone.

Every milestone:

```text
implement
↓
format
↓
lint
↓
typecheck
↓
test
↓
inspect git diff
↓
commit
↓
push
```

---

# 57. COMMIT STYLE

Use conventional, readable commits.

Examples:

```text
chore: bootstrap content engine workspace

feat: add private archive importer

feat: add source post analysis pipeline

feat: implement intelligent topic selection

feat: add article generation workflow

feat: add editorial review pipeline

feat: add featured image generation

feat: add blogger draft integration

feat: add publishing dashboard

feat: add facebook page review workflow

feat: add persistent job worker

test: add end-to-end generation coverage

docs: add local setup and deployment guide
```

Never put secrets in commit messages.

---

# 58. PUSH POLICY

After each completed stable milestone:

```bash
git push origin main
```

Only push when:

```text
build passes
typecheck passes
relevant tests pass
no secrets are staged
```

If a milestone is temporarily broken:

do not push broken main merely to create activity.

Fix it first.

---

# 59. PROJECT STATUS FILE

Maintain:

```text
PROJECT_STATUS.md
```

It should contain:

```text
Current Phase

Completed

Currently Working

Next

Known Issues

Manual Setup Needed

External Credentials Needed

Latest Verified Commands
```

Update this before each milestone commit.

This lets another Codex session continue without guessing.

---

# 60. AGENTS.md

Create:

```text
AGENTS.md
```

with permanent project rules.

It should tell future coding agents:

```text
read PROJECT_STATUS.md first
read architecture docs
do not expose secrets
do not commit private archive
preserve Urdu Unicode
Blogger remains human-approved
Facebook Page only
run tests before commits
use atomic commits
push completed milestones
do not rewrite architecture casually
update docs when behavior changes
```

---

# 61. TESTING STRATEGY

Use:

```text
unit tests
integration tests
selected end-to-end tests
```

Critical tests:

```text
Urdu Unicode import

duplicate detection

topic scoring

recent-topic exclusion

structured AI output validation

article state transitions

Blogger idempotency

Facebook idempotency

job retries

approval gates

dry-run prevents writes

mock mode works

private data cannot accidentally appear in API responses
```

---

# 62. SAMPLE DATA

Create fake/sample Urdu content.

Do NOT invent my real historical posts.

Use 15–30 clearly fictional sample posts to test:

```text
short posts
long posts
duplicates
related themes
different categories
RTL
Unicode punctuation
mixed dates
```

This allows the system to be developed before I provide my archive.

---

# 63. FIRST LOCAL DEMONSTRATION

The first meaningful end-to-end local demo must work WITHOUT Blogger or Facebook credentials.

Expected flow:

```text
pnpm install
↓
configure .env for mock mode
↓
pnpm db:migrate
↓
pnpm db:seed
↓
pnpm dev
↓
open localhost
↓
Content Memory
↓
Generate
↓
Select Topic
↓
Generate Article
↓
Create Image/Mock Image
↓
Review Result
```

Everything should be visible in the dashboard.

---

# 64. SECOND LOCAL DEMONSTRATION

After OpenAI credentials are supplied:

```text
Sample archive
↓
real OpenAI analysis
↓
real topic selection
↓
real Urdu article
↓
real editorial review
↓
real image generation
↓
local review screen
```

No external publishing yet.

---

# 65. THIRD LOCAL DEMONSTRATION

After Blogger credentials are supplied:

```text
Generate
↓
Review locally
↓
Create Blogger Draft
↓
Verify Blogger Draft
```

The Blogger post must NOT become public automatically.

---

# 66. FOURTH LOCAL DEMONSTRATION

After Meta credentials are supplied and a Blogger article has been published:

```text
detect Blogger published
↓
generate Facebook caption
↓
show Facebook preview
↓
approve
↓
publish/schedule Page post
↓
save Facebook Post ID
```

---

# 67. IMPORT MY REAL ARCHIVE ONLY AFTER IMPORTER IS VERIFIED

Do not design the application around assumptions about my exact archive format.

First make importer framework work using fixtures.

When I provide the real database/export:

```text
inspect format
create appropriate adapter
run dry import
show report
let me inspect
then commit importer CODE
```

But:

```text
DO NOT COMMIT THE IMPORTED ARCHIVE
```

---

# 68. IMPORT REPORT

When real archive is imported, generate something like:

```text
Files scanned: 18

Raw records: 7,438

Valid posts: 7,291

Duplicates: 103

Empty records: 22

Failed records: 22

Urdu dominant: 6,970

Other/mixed: 321

Short posts: 2,416

Medium posts: 3,129

Long posts: 1,746
```

Numbers above are examples only.

Use real calculated figures.

---

# 69. CONTENT MEMORY UI

Build a searchable archive view.

Filters:

```text
search
category
year
length
used/unused
quality
topic
status
```

Post detail:

```text
Original text

Normalized text

Date

Analysis

Topics

Related Posts

Used in Generated Articles

AI Analysis Status
```

---

# 70. TOPIC EXPLORER

Show:

```text
Topic Name

Related Historical Posts

Number of Mentions

Last Historical Appearance

Already Generated Articles

Novelty

Candidate Score
```

Allow:

```text
Generate from this topic
Exclude topic
Reduce priority
Increase priority
```

---

# 71. GENERATE SCREEN

Provide two paths.

## Automatic

```text
SELECT FOR ME
```

System intelligently chooses.

## Manual

```text
CHOOSE TOPIC
```

I select.

Both enter the same generation pipeline afterward.

---

# 72. ARTICLE REVIEW UI

Show:

```text
Title

Article

Featured Image

Source Context

Why Topic Was Selected

AI Editorial Review

Similarity Evaluation

SEO Metadata

Labels

Generation Cost

Generation History
```

Buttons:

```text
Edit

Regenerate Title

Regenerate Section

Regenerate Article

Regenerate Image

Approve

Reject

Create Blogger Draft
```

---

# 73. DO NOT DESTROY HUMAN EDITS

Once I manually edit generated content:

record:

```text
humanEdited=true
```

Regeneration should never silently overwrite human edits.

Provide explicit confirmation if a destructive action is requested.

Keep versions where practical.

---

# 74. ARTICLE VERSIONING

Maintain versions such as:

```text
AI Draft 1
AI Revision 1
Human Edit 1
Blogger Version
```

At minimum keep enough history to recover previous content.

---

# 75. UI RTL

Article preview:

```text
RTL
```

Application navigation itself may be English initially.

Urdu content must render correctly.

Do not mirror technical admin navigation automatically unless deliberately designed.

---

# 76. SECURITY

Follow these rules:

```text
secrets server-side only
no secrets committed
OAuth state protection
safe token storage
input validation
HTML sanitization
CSRF considerations
avoid arbitrary file writes
avoid command injection
rate-limit risky endpoints
safe logs
```

Local app can remain single-user.

Do not add unnecessary login initially unless exposing beyond localhost.

For VPS phase, authentication becomes mandatory.

---

# 77. LOCALHOST BINDING

During local development:

bind safely to localhost by default.

Do not expose admin application to the public network unless intentionally configured.

---

# 78. VPS READINESS

Do NOT deploy yet.

But create:

```text
/docs/VPS_DEPLOYMENT.md
```

targeting:

```text
Hostinger VPS
Ubuntu
Node.js LTS
pnpm
Git
PM2
Nginx
HTTPS
firewall
persistent storage
environment variables
```

Plan for processes:

```text
web
worker
```

Example future PM2 structure:

```text
zak-content-web
zak-content-worker
```

But local development comes FIRST.

---

# 79. FUTURE DATABASE MIGRATION

Document how SQLite could eventually migrate to PostgreSQL.

Do not perform premature migration.

Keep domain/database architecture sufficiently clean.

---

# 80. FUTURE AUTOMATED SCHEDULING

Prepare but do not activate:

```text
daily article generation
scheduled Blogger status checks
Facebook scheduling
analytics collection
failure notifications
```

All recurring behavior should be implemented through jobs/services rather than hardcoded inside HTTP request handlers.

---

# 81. FUTURE NOTIFICATIONS

Design an abstraction:

```text
NotificationProvider
```

Possible future:

```text
email
Telegram
WhatsApp
dashboard notification
```

Do not implement all of them now.

Dashboard notification is enough initially.

---

# 82. ERROR UX

Never display:

```text
Something went wrong
```

without useful context.

Show:

```text
which operation failed
human-readable reason
whether retry is safe
retry button
technical details expandable
timestamp
job ID
```

Do not reveal secrets.

---

# 83. RESUMABILITY

If generation stops halfway:

```text
do not restart complete pipeline unnecessarily
```

Persist completed stages.

Example:

```text
Topic selected ✓
Angle generated ✓
Outline generated ✓
Draft failed ✗
```

Retry should resume from:

```text
Draft
```

where safe.

---

# 84. IDEMPOTENCY

Especially protect:

```text
Blogger create
Facebook publish
```

Before external creation:

look for existing successful external IDs.

A button double-click must NOT create duplicate public posts.

---

# 85. API ADAPTER DESIGN

External services must live behind interfaces.

Business logic should not know low-level HTTP details.

Example:

```typescript
interface BloggerPublisher {
    createDraft(input: BloggerDraftInput): Promise<BloggerDraftResult>;
    getPost(id: string): Promise<BloggerPost>;
}

interface FacebookPublisher {
    createPost(input: FacebookPagePostInput): Promise<FacebookPagePostResult>;
}
```

This enables:

```text
mock adapters
real adapters
tests
future API changes
```

---

# 86. MODEL CONFIGURATION

Do not put model IDs in dozens of files.

Centralize AI configuration.

Allow:

```text
high-quality model for article reasoning

lower-cost model for classification/metadata

image model for images

embedding model for retrieval
```

But MVP may use fewer models for simplicity.

---

# 87. MODEL FALLBACKS

Do not silently switch models.

If fallback logic exists:

```text
record fallback
show it in generation metadata
```

---

# 88. GENERATION OBSERVABILITY

Every AI step should make it possible to answer:

```text
What was generated?

Why?

Using which model?

Using which prompt version?

Using which source posts?

When?

How much did it cost approximately?

Did it fail/retry?
```

---

# 89. CONTENT PROVENANCE

For each article save:

```text
primary historical inspiration
related retrieved posts
selection scores
generation run IDs
```

But this metadata is INTERNAL.

Do not automatically publish historical-source metadata to Blogger.

---

# 90. QUALITY OVER VOLUME

This system is NOT a spam machine.

Primary objective:

```text
publish fewer high-quality pieces
```

rather than:

```text
maximize posting frequency
```

Never optimize toward meaningless daily output merely because automation makes it possible.

---

# 91. NO FAKE AI CONFIDENCE

When displaying scores or recommendations:

distinguish:

```text
calculated metrics
AI evaluations
heuristics
historical analytics
```

Do not visually present all as objective truth.

---

# 92. MVP PHASE PLAN

Implement in this order.

---

## PHASE 1 — REPOSITORY + FOUNDATION

Create:

```text
workspace
Git repo
GitHub repo if authenticated
.gitignore
README
AGENTS.md
PROJECT_STATUS.md
docs
linting
formatting
testing
environment config
basic web dashboard
basic worker
database
```

Acceptance:

```text
pnpm install
pnpm dev
```

works.

Commit and push.

---

## PHASE 2 — DATA MODEL + MOCK ARCHIVE

Create:

```text
database schema
repositories
sample Urdu posts
seed system
Content Memory screen
```

Acceptance:

I can view sample posts in browser.

Commit and push.

---

## PHASE 3 — ARCHIVE IMPORT FRAMEWORK

Create:

```text
TXT importer
JSON importer
CSV importer
duplicate detection
normalization
import report
```

Acceptance:

sample imports work.

Commit and push.

---

## PHASE 4 — CONTENT ANALYSIS

Create:

```text
structured source analysis
mock AI provider
real OpenAI provider
analysis UI
```

Acceptance:

a post receives structured analysis.

Commit and push.

---

## PHASE 5 — TOPIC ENGINE

Create:

```text
candidate generation
scoring
recent-use penalties
category diversity
weighted selection
topic explorer
```

Acceptance:

dashboard explains why a topic was selected.

Commit and push.

---

## PHASE 6 — ARTICLE PIPELINE

Create:

```text
context retrieval
angle
outline
draft
editorial review
revision
metadata
version storage
```

Acceptance:

a complete Urdu article appears locally.

Commit and push.

---

## PHASE 7 — IMAGE SYSTEM

Create:

```text
image brief
image generation provider
mock image provider
storage
preview
regeneration
```

Acceptance:

article has a generated featured image.

Commit and push.

---

# THIS IS MVP v0.1

At this point I must be able to:

```text
launch locally
↓
load content database
↓
select intelligent topic
↓
generate independent Urdu article
↓
review article
↓
generate featured image
↓
review everything locally
```

Do not advance blindly if this pipeline is broken.

---

## PHASE 8 — BLOGGER

Create:

```text
OAuth/configuration
Blogger client
create draft
refresh status
publication detection
canonical URL capture
```

Acceptance:

approved local article becomes a Blogger DRAFT.

Never public automatically.

Commit and push.

---

# THIS IS MVP v0.2

Success:

```text
one local command/UI action
↓
AI content package generated
↓
Blogger draft created
```

---

## PHASE 9 — FACEBOOK PAGE CONTENT

Create:

```text
Facebook caption generation
review screen
blog URL attachment
image preview
approval workflow
```

No publishing required initially.

Commit and push.

---

## PHASE 10 — FACEBOOK PAGE API

Create:

```text
Meta connection
Page identity validation
Page publication adapter
dry-run
publish after approval
idempotency
```

Acceptance:

approved test post can be published to the connected Facebook PAGE.

Commit and push.

---

# THIS IS MVP v0.3

Workflow:

```text
Blogger published
↓
system detects it
↓
Facebook package generated
↓
human approves
↓
Page publishes
```

---

## PHASE 11 — SCHEDULING

Create:

```text
allowed publishing windows
timezone
queue
recommended slot
worker execution
```

Commit and push.

---

## PHASE 12 — ANALYTICS

Where supported:

```text
retrieve relevant Page post analytics
store snapshots
dashboard charts
timing analysis
```

Commit and push.

---

## PHASE 13 — REAL ARCHIVE ADAPTER

ONLY when my actual archive/database is supplied:

```text
inspect it
create/import adapter
dry run
validate
import
analyze corpus incrementally
```

Do NOT commit raw archive.

Commit code only.

---

## PHASE 14 — VPS PREPARATION

Create/test:

```text
production build
PM2 config
Nginx example
environment documentation
backup strategy
database migration strategy
worker persistence
health endpoint
```

DO NOT deploy until explicitly requested.

Commit and push.

---

# 93. DO NOT SKIP PHASE ACCEPTANCE

After every phase provide terminal summary:

```text
PHASE:
STATUS:

IMPLEMENTED:
-

TESTS:
-

COMMANDS VERIFIED:
-

FILES/AREAS CREATED:
-

GIT COMMIT:
-

GITHUB PUSH:
-

MANUAL ACTION NEEDED:
-

NEXT PHASE:
-
```

---

# 94. DO NOT ASK ME FOR API CREDENTIALS BEFORE THEY ARE NEEDED

Build using mocks first.

When reaching an integration requiring credentials:

implement everything possible.

Then clearly list the exact credentials/config I must provide.

Example:

```text
Blogger implementation complete.

Required from user:
1. GOOGLE_CLIENT_ID
2. GOOGLE_CLIENT_SECRET
3. BLOGGER_BLOG_ID
```

Do not block unrelated work.

---

# 95. DO NOT ASK ME TO MAKE ROUTINE TECHNICAL DECISIONS

You are the lead engineer.

Choose reasonable implementations yourself for:

```text
folder structure
libraries
validation
state management
database abstraction
testing utilities
UI implementation details
error handling
```

Ask me only when the decision fundamentally changes product behavior or requires private credentials/external account action.

---

# 96. VERIFY EXTERNAL API DOCUMENTATION

Before implementing:

```text
OpenAI
Blogger
Meta Graph API
GitHub
```

check current OFFICIAL documentation.

These APIs evolve.

Do not rely upon old tutorials, old Stack Overflow examples, abandoned npm packages, or deprecated API versions.

Record relevant integration decisions in documentation.

---

# 97. PACKAGE DISCIPLINE

Avoid unnecessary dependencies.

Before adding a package:

determine whether the platform/standard library or an existing dependency already solves it.

Do not create dependency bloat.

Use maintained packages.

---

# 98. CODE QUALITY

Requirements:

```text
strict TypeScript
no casual any
clear names
small cohesive modules
dependency inversion around external APIs
runtime validation
useful comments only
no giant God classes
no business logic inside React components
no API secrets client-side
no duplicated domain logic
```

---

# 99. UI QUALITY

Avoid the stereotypical generated dashboard:

```text
huge gradients
random purple cards
meaningless metrics
everything rounded 24px
excessive shadows
decorative AI icons
fake charts
```

Design for actual operational use.

Information hierarchy first.

---

# 100. DEFINITION OF COMPLETE LOCAL SYSTEM

The LOCAL system is complete when:

```text
✓ Application runs from VS Code

✓ Private archive can be imported

✓ Urdu remains intact

✓ Archive can be searched

✓ Topics are intelligently selected

✓ Recent repetition is reduced

✓ New independent Urdu articles are generated

✓ Articles receive editorial review

✓ Featured images can be generated

✓ Everything is reviewable in UI

✓ Blogger drafts can be created

✓ Blogger publication can be detected

✓ Facebook Page packages can be generated

✓ Facebook posts require approval

✓ Approved Facebook Page posts can publish

✓ Posting windows can be managed

✓ Job failures can recover

✓ Logs are visible

✓ Secrets are safe

✓ Dry-run works

✓ Mock mode works

✓ Tests pass

✓ Git history is meaningful

✓ Every stable milestone is pushed to GitHub

✓ Private 7,000-post archive is NOT in Git

✓ Same project is structurally ready for later VPS deployment
```

---

# 101. FIRST THING YOU MUST DO NOW

Do NOT start by building Facebook.

Do NOT start by connecting Blogger.

Do NOT start with AI API calls.

Begin with:

```text
1. Inspect current directory.

2. Inspect installed versions:
   Node
   npm
   pnpm
   Git
   GitHub CLI

3. Check existing Git state.

4. Create safe .gitignore FIRST.

5. Create project architecture.

6. Initialize TypeScript workspace.

7. Create database foundation.

8. Create mock providers.

9. Create sample Urdu corpus.

10. Create first functional dashboard.

11. Run it locally.

12. Run lint/typecheck/tests.

13. Create first stable Git commit.

14. Create/connect private GitHub repo if authenticated.

15. Push first milestone.

16. Update PROJECT_STATUS.md.

17. Continue to Phase 2.
```

---

# 102. IMPORTANT EXECUTION RULE

You are not writing a tutorial for me.

You are operating as the implementation agent.

Therefore:

DO:

```text
inspect
create
edit
install
run
test
debug
commit
push
document
continue
```

DO NOT spend the response merely explaining what you could build.

When something fails:

```text
inspect error
diagnose
fix
rerun
```

Do not abandon the phase after the first error.

---

# 103. PROTECT EXISTING WORK

If this directory already contains project files:

inspect before changing anything.

Never:

```text
git reset --hard
force push
delete unrelated work
overwrite existing .env
remove existing remote
```

without an explicit justified need.

Respect existing user changes.

---

# 104. CONTINUATION PROTOCOL

This project may span multiple Codex sessions.

At the beginning of every future session:

```text
1. Read AGENTS.md.
2. Read PROJECT_STATUS.md.
3. Read docs/ARCHITECTURE.md.
4. Check git status.
5. Check latest commits.
6. Check current tests.
7. Continue from the next incomplete milestone.
```

Do not redesign completed architecture from scratch every session.

---

# 105. FINAL PRODUCT PHILOSOPHY

This application is not simply:

```text
AI BLOG GENERATOR
```

It is:

```text
A PERSONAL URDU CONTENT INTELLIGENCE AND PUBLISHING SYSTEM
```

The historical archive represents years of thought.

The system should progressively understand:

```text
what I repeatedly think about
which ideas evolved
which subjects overlap
which topics deserve revisiting
which arguments contradict each other
which areas have been overused
which ideas remain unexplored
```

The long-term advantage comes from:

```text
MEMORY
+
RETRIEVAL
+
NEW REASONING
+
EDITORIAL QUALITY
+
CONTROLLED DISTRIBUTION
+
PERFORMANCE FEEDBACK
```

not merely automating posts.

Build accordingly.

---

# BEGIN

Start implementing **PHASE 1** now.

Do the work in the repository.

Do not proceed by giving me a hypothetical code dump in chat if you have filesystem/terminal access.

Create the actual project.

Keep `PROJECT_STATUS.md` current.

Commit and push each stable milestone.

Stop only when you genuinely require an external credential, external account authorization, or user-owned dataset that cannot be substituted with mocks.

## Practical bottom line

Paste that into **Codex while it is opened in the folder where you want the project created**. Codex CLI is explicitly intended to inspect and edit local projects from the terminal, and its IDE integration is appropriate when you want to inspect those changes inside your editor. ([OpenAI Developers](https://developers.openai.com/codex/cli?utm_source=chatgpt.com))

I would **not give Codex your 7,000 posts initially**. First make it complete Phases 1–7 with fake Urdu fixtures. Then give it the real archive only when the importer, duplicate detection, privacy rules, content memory and topic-selection system are already working. That prevents your dataset format from dictating a bad architecture.

Also, the prompt deliberately tells Codex to consult current official API documentation before implementing integrations. That matters because OpenAI recommends the Responses API for new work, Blogger currently exposes draft/publish lifecycle APIs, and Meta's Page feed supports Page publishing, but these interfaces and versions can change. ([OpenAI Developers](https://developers.openai.com/api/docs/guides/text?utm_source=chatgpt.com))

The **first checkpoint you should demand from Codex is not Blogger**. It should be: `pnpm dev` → localhost dashboard → fake Urdu archive visible → generate a new Urdu article locally → generated featured image visible → Git commit pushed. Only after that foundation works should it touch Blogger and then Facebook Page.

---

# you asked

message time: 2026-08-12 00:16:41

16. TOPIC SELECTION

Facebook algorithm trending Facebook Pakistan trending topic sniffing and everything that goes with algorithm along with the timing demographics overall 24 hour Round the Clock you know but within the topics within the 7,000 post the intent is Vitality intent is views intent is likes in 10 days jumping the bandwagon intent is getting too much reach intent is getting too much engagement along with you know avoiding the spam and stuff so that's how it's going to do selection it can go through internet it can go through Google Trends it can go through Google search engine and can go through your Facebook social media Network Instagram whatever is going through you know you understand what I'm trying to say so that's how it's going to select and it's not going to spam it's just one or two article depending on the you know 12 hour of the region we didn't have continent to get more reach to get more likes to get more Vitality you know but I'm talking about so just just add

---

# chatgpt response

Yes. Replace **Section 16 — TOPIC SELECTION** in the Codex prompt with this expanded version. The key correction is that the system cannot literally inspect Facebook's private ranking algorithm; it should infer **current attention opportunities from observable signals** and continuously match them against your 7,000-post intellectual archive.

**Document Title: **

# 16. TOPIC SELECTION — TREND, VIRALITY & ATTENTION INTELLIGENCE ENGINE

Topic selection is NOT primarily random.

The primary objective is:

```text
MY 7,000+ HISTORICAL IDEAS
+
WHAT PEOPLE ARE INTERESTED IN RIGHT NOW
+
PAKISTAN / TARGET AUDIENCE ATTENTION
+
CURRENT DISCUSSION MOMENTUM
+
TIMING
+
CONTENT FIT
+
NOVELTY
+
VIRAL / ENGAGEMENT POTENTIAL
=
BEST ARTICLE OPPORTUNITY RIGHT NOW
```

The system should operate as an:

```text
ATTENTION OPPORTUNITY ENGINE
```

not merely a:

```text
RANDOM TOPIC GENERATOR
```

---

## 16.1 PRIMARY GOAL

The topic engine should attempt to maximize:

```text
REACH
ENGAGEMENT
COMMENTS
SHARES
LINK CLICKS
READERSHIP
RELEVANCE
DISCUSSION
TIMELINESS
```

while avoiding:

```text
spam
clickbait without substance
irrelevant trend-jacking
duplicate content
excessive posting
low-quality bandwagon content
controversy farming
misinformation
artificial engagement tactics
```

The system should look for situations where:

```text
something is becoming interesting NOW
+
I already have something meaningful to say about it
```

That combination gets priority.

---

# 16.2 IMPORTANT DISTINCTION

Do NOT attempt to claim that the application can directly inspect or reverse-engineer Facebook's private recommendation algorithm.

Instead infer probable attention opportunities from observable signals such as:

```text
public discussion velocity
search interest
news velocity
social discussion volume
recency
topic acceleration
related query growth
Facebook Page historical performance
audience behavior
content format performance
posting time
local relevance
competition/saturation
```

Call this:

```text
ATTENTION SIGNALS
```

not:

```text
Facebook algorithm access
```

---

# 16.3 CONTINUOUS TREND INTELLIGENCE

Design a:

```text
TrendIntelligenceService
```

capable of periodically examining external attention signals.

Potential sources may include, where legally and technically available:

```text
Google Trends

Google Search / current web search

Google News or other reputable news discovery

public news websites

public social discussions

Meta-approved Facebook APIs where available

Facebook Page insights for our OWN Page

Instagram/public Meta signals where officially available

YouTube trends/search signals

Reddit/public discussion signals

X/public search or API signals where available

Wikipedia current-interest signals if useful

technology/news feeds

Pakistan-specific news sources

global news sources

search autocomplete / related-query signals where legitimately available
```

IMPORTANT:

Do not use prohibited scraping or fragile browser automation solely to circumvent platform API restrictions.

Use:

```text
official APIs
publicly accessible sources
approved integrations
search APIs
licensed data
```

where practical.

External-source adapters must be replaceable.

Example:

```text
TrendSource
    GoogleTrendsSource
    WebSearchSource
    NewsSource
    MetaInsightsSource
    SocialSignalSource
```

A failure in one source must not stop topic selection.

---

# 16.4 REGION-FIRST TREND DETECTION

Primary geographical context:

```text
Pakistan
```

Primary timezone:

```text
Asia/Karachi
```

But do not restrict discovery only to Pakistan.

Monitor:

```text
Pakistan
South Asia
global English internet
global technology discussion
global culture
global major events
```

because some global discussions become relevant in Pakistan several hours later.

For each detected trend store:

```text
trend name

canonical topic

keywords

aliases

entities

country

region

language

first detected

last detected

current velocity

search velocity

social velocity

news velocity

estimated saturation

trend stage

related topics

source signals
```

---

# 16.5 TREND LIFECYCLE

Classify trends approximately as:

```text
EMERGING

ACCELERATING

BREAKING

PEAKING

SATURATED

DECLINING

EVERGREEN_RESURGENCE
```

Prefer:

```text
EMERGING
ACCELERATING
```

when there is a strong archive match.

Be cautious with:

```text
PEAKING
```

because the opportunity may already be crowded.

Generally avoid:

```text
SATURATED
DECLINING
```

unless my archive provides an unusually strong or contrarian angle.

---

# 16.6 MULTIPLE TIME WINDOWS

Analyze attention across multiple windows.

At minimum:

```text
1 hour

3 hours

6 hours

12 hours

24 hours

3 days

7 days

10 days
```

Purpose:

```text
1–6 hours
detect sudden acceleration

12–24 hours
identify active discussion cycles

3–7 days
identify sustained trends

10 days
measure whether a topic is still climbing,
stable,
or already exhausted
```

Do not judge trends solely by absolute popularity.

Calculate:

```text
VELOCITY
```

and:

```text
ACCELERATION
```

A smaller topic growing rapidly may be more useful than a huge topic already declining.

---

# 16.7 24-HOUR ROUND-THE-CLOCK OBSERVATION

Architect the trend engine so it can eventually run continuously on the VPS.

Example future checks:

```text
00:00
03:00
06:00
09:00
12:00
15:00
18:00
21:00
```

Exact frequency should be configurable.

Do NOT require continuous monitoring during the initial local MVP.

Local version should support:

```text
SCAN TRENDS NOW
```

button/command.

Future VPS version can execute scans automatically.

---

# 16.8 HISTORICAL ARCHIVE MATCHING

Every detected trend should be matched against:

```text
7,000+ historical posts
```

Use:

```text
semantic similarity

keywords

entities

themes

arguments

questions

categories

historical observations

contradictory opinions

adjacent ideas
```

Example:

```text
CURRENT TREND

"AI replacing junior jobs"

↓

ARCHIVE SEARCH

2013 post about automation
2016 post about employment
2019 post about skill obsolescence
2023 post about AI
older philosophical post about work

↓

CURRENT ARTICLE OPPORTUNITY

"What AI job anxiety is actually revealing
about how we think about human value"
```

The new article does NOT need to repeat the historical posts.

The historical posts provide intellectual context.

---

# 16.9 TREND × ARCHIVE FIT

Calculate:

```text
TrendArchiveFit
```

Consider:

```text
semantic relevance

strength of my historical thinking

number of relevant historical posts

uniqueness of my angle

whether I have previously explored the issue deeply

whether my old position has evolved

whether contradictory historical posts exist

whether a meaningful new argument can be constructed
```

A trend with huge popularity but almost no meaningful archive connection should receive a penalty.

---

# 16.10 DO NOT CHASE EVERY TREND

Example:

```text
TREND:
Celebrity wedding

Popularity:
VERY HIGH

Archive relevance:
VERY LOW

Meaningful angle:
NONE
```

Result:

```text
SKIP
```

But:

```text
TREND:
Celebrity wedding

Archive contains:
20 posts about marriage expectations,
social status,
relationships,
culture,
privacy,
parasocial behavior

Meaningful angle:
STRONG
```

Result:

```text
POTENTIAL CANDIDATE
```

This prevents the system from becoming a generic trend-spam account.

---

# 16.11 OPPORTUNITY SCORE

Every candidate should receive an:

```text
OpportunityScore
```

Suggested initial model:

```text
Current Trend Strength          15%

Trend Acceleration              15%

Archive Relevance               15%

Unique Angle Potential          15%

Audience Relevance              10%

Engagement Potential            10%

Timing Opportunity               5%

Shareability                     5%

Discussion Potential             5%

Evergreen Residual Value         5%
```

Then subtract penalties:

```text
Saturation Penalty

Repetition Penalty

Recent Topic Penalty

Clickbait Risk

Weak Archive Fit

Fact-Risk Penalty

Spam/Frequency Penalty

Sensitive-Event Exploitation Penalty
```

Make weights configurable.

Do NOT permanently hardcode these exact weights.

Later use performance data to tune them.

---

# 16.12 VIRALITY POTENTIAL

Create a heuristic:

```text
ViralityPotentialScore
```

Possible signals:

```text
rapidly growing search interest

high discussion velocity

strong emotional relevance

identity relevance

social disagreement

surprise

novel information

high curiosity gap

high share utility

strong question potential

strong opinion potential

local relevance

timely connection to current event
```

But:

```text
VIRALITY != QUALITY
```

Never allow the virality score alone to control publication.

---

# 16.13 ENGAGEMENT POTENTIAL

Separately calculate:

```text
EngagementPotential
```

Estimate likelihood of:

```text
comments

shares

reactions

clicks

discussion
```

Possible indicators:

```text
open-ended question

recognizable social experience

debate potential

personal relevance

counterintuitive argument

strong narrative

useful insight

identity/community connection

timely controversy
```

Again:

do not manufacture controversy merely for engagement.

---

# 16.14 FACEBOOK PAGE PERFORMANCE MEMORY

Once our Page accumulates data, topic selection should increasingly use OUR OWN historical performance.

Store relationships such as:

```text
topic
category
article angle
caption style
post length
featured image style
weekday
posting hour
reach
engagement
shares
comments
clicks
```

Then learn:

```text
What works for MY Page?
```

rather than relying indefinitely on generic internet advice.

---

# 16.15 AUDIENCE MODEL

Build an evolving:

```text
AudienceModel
```

using only legitimate analytics available to us.

Possible dimensions:

```text
country

city/region when available

language

age ranges when available

gender distribution when available

active periods

top-performing categories

engagement behavior

content format preferences

click behavior

historical response
```

Do not invent demographics that Meta does not expose.

Distinguish:

```text
KNOWN DATA
```

from:

```text
INFERRED DATA
```

---

# 16.16 TIMING AND TOPIC MUST BE CONNECTED

Do not independently select:

```text
topic
```

and then randomly select:

```text
time
```

Evaluate:

```text
Topic × Trend Stage × Audience × Time
```

Example:

```text
Trend exploding at 11 AM
but our audience usually peaks at 8 PM
```

The engine should evaluate:

```text
Will this topic still be valuable at 8 PM?
```

If YES:

schedule.

If NO:

consider earlier publication.

---

# 16.17 OPPORTUNITY HALF-LIFE

Estimate:

```text
OpportunityHalfLife
```

Example classifications:

```text
URGENT
1–3 hours

FAST
3–12 hours

DAILY
12–36 hours

MULTI_DAY
2–7 days

EVERGREEN
7+ days
```

This helps determine whether waiting for the normal posting slot makes sense.

---

# 16.18 ARTICLE GENERATION SPEED

When opportunity is:

```text
URGENT
```

the system may prioritize:

```text
shorter analysis

faster editorial cycle

fewer unnecessary generation stages
```

But NEVER bypass:

```text
quality check

fact-risk review

human approval
```

during the initial system.

---

# 16.19 CONTENT FREQUENCY

The goal is NOT:

```text
POST AS MUCH AS POSSIBLE
```

Default maximum:

```text
1–2 BLOG ARTICLES PER DAY
```

and potentially fewer.

The system should decide:

```text
0
1
or
2
```

depending upon opportunity quality.

Example:

```text
No strong opportunity today

→ Generate nothing
```

That is a valid result.

Do not generate filler just because a scheduled job ran.

---

# 16.20 MINIMUM PUBLISHING GAP

Add configurable:

```text
MIN_ARTICLE_INTERVAL_HOURS
```

Example initial configuration:

```text
12 hours
```

But this should NOT mean exactly one article every 12 hours.

It means:

```text
do not publish another article inside this cooldown
unless an exceptional opportunity policy later permits it
```

Default exceptional bypass should remain disabled.

---

# 16.21 DAILY CONTENT BUDGET

Settings:

```text
MIN_ARTICLES_PER_DAY=0

TARGET_ARTICLES_PER_DAY=1

MAX_ARTICLES_PER_DAY=2
```

These are ceilings/targets, not quotas.

Quality threshold always wins.

---

# 16.22 MINIMUM OPPORTUNITY THRESHOLD

Set:

```text
MIN_OPPORTUNITY_SCORE
```

If no candidate exceeds it:

```text
DO NOT GENERATE
```

Dashboard should say:

```text
No topic currently meets publishing threshold.
```

This is better than publishing weak content.

---

# 16.23 JUMPING ON THE BANDWAGON — CORRECTLY

Trend-jacking is permitted only if:

```text
trend is genuinely relevant

archive contains meaningful context

new article adds something

timing still offers opportunity

topic matches intended audience
```

Avoid:

```text
forcing unrelated historical posts onto trending keywords

keyword stuffing

misleading titles

fake urgency

copying viral opinions

writing the same article everyone else is writing
```

The goal is:

```text
JOIN THE CONVERSATION EARLY
WITH SOMETHING WORTH SAYING
```

not:

```text
COPY THE CONVERSATION
```

---

# 16.24 CONTRARIAN OPPORTUNITY

Sometimes the highest-value content is not agreement with the trend.

Allow:

```text
ContrarianOpportunity
```

when:

```text
most discussion assumes X

archive strongly supports Y

Y can be defended intelligently

Y is not misinformation or manufactured outrage
```

Contrarian writing can receive an engagement bonus but also a:

```text
ControversyRiskScore
```

for human review.

---

# 16.25 NEWS VS EVERGREEN OPPORTUNITY

Classify candidate:

```text
TREND_REACTIVE

TREND_ADJACENT

EVERGREEN_TIMELY

PURE_EVERGREEN
```

Examples:

```text
TREND_REACTIVE
directly discusses current event

TREND_ADJACENT
uses current event to explore larger issue

EVERGREEN_TIMELY
old subject becomes newly relevant

PURE_EVERGREEN
unrelated to current trend but strong enough on its own
```

Do not completely eliminate evergreen articles.

If external trend quality is weak:

the system may choose a high-quality evergreen topic.

---

# 16.26 CONTENT OPPORTUNITY PIPELINE

Final topic-selection pipeline:

```text
RUN TREND SCAN
        ↓
Collect Attention Signals
        ↓
Normalize Topics
        ↓
Measure Trend Velocity
        ↓
Determine Trend Stage
        ↓
Estimate Opportunity Half-Life
        ↓
Search 7,000+ Post Memory
        ↓
Calculate Archive Fit
        ↓
Generate Possible Angles
        ↓
Estimate Novelty
        ↓
Estimate Virality Potential
        ↓
Estimate Engagement Potential
        ↓
Check Page Historical Performance
        ↓
Check Audience Fit
        ↓
Check Timing
        ↓
Check Recent Content
        ↓
Check Saturation
        ↓
Check Spam/Frequency Limits
        ↓
Calculate Opportunity Score
        ↓
Rank Candidates
        ↓
QUALITY THRESHOLD
        ↓
SELECT BEST OPPORTUNITY
```

---

# 16.27 CANDIDATE TABLE

Create database concept:

```text
ContentOpportunity
```

Possible fields:

```text
id

trendId

topicId

detectedAt

trendStage

trendVelocity

trendAcceleration

archiveFitScore

noveltyScore

audienceFitScore

viralityScore

engagementScore

timingScore

discussionScore

shareabilityScore

saturationScore

spamRiskScore

factRiskScore

opportunityScore

opportunityHalfLife

recommendedAngle

recommendedArticleLength

recommendedPublishBefore

reasoning

status
```

---

# 16.28 TREND DATABASE

Create:

```text
DetectedTrend
```

Fields approximately:

```text
id

canonicalName

keywords

aliases

entities

region

country

language

source

firstDetectedAt

lastDetectedAt

currentScore

previousScore

velocity

acceleration

stage

saturation

rawSignals

createdAt

updatedAt
```

---

# 16.29 TREND SNAPSHOTS

Do not overwrite historical trend values.

Create:

```text
TrendSnapshot
```

allowing comparisons:

```text
09:00 score 34

12:00 score 51

15:00 score 83
```

Then:

```text
velocity = rising rapidly
```

This is much more useful than simply knowing:

```text
score = 83
```

---

# 16.30 TREND NORMALIZATION

Different sources may describe the same subject differently.

Example:

```text
"ChatGPT jobs"

"AI unemployment"

"AI taking jobs"

"automation employment"

"AI layoffs"
```

Create normalization/entity clustering so these can become:

```text
AI AND EMPLOYMENT
```

while retaining individual queries.

---

# 16.31 LOCAL RELEVANCE

Give additional consideration to:

```text
Pakistan

Karachi

Urdu-speaking audience

Pakistani social context

regional culture

local technology adoption

local economic context

local public discussion
```

when relevant.

Do not artificially inject Pakistan into every topic.

---

# 16.32 LANGUAGE SIGNALS

Trend scanner should support:

```text
English

Urdu

Roman Urdu
```

for DISCOVERY.

But resulting blog article remains:

```text
Urdu by default
```

A trend discussed mainly in English can still inspire an Urdu article.

---

# 16.33 REAL-TIME RESEARCH PACKET

For trend-reactive articles, generation context should contain:

```text
trend summary

why it is trending

detected entities

relevant dates

major factual claims

reputable sources

Pakistan relevance

public discussion themes

historical archive matches
```

The article writer receives this alongside archive context.

Do not allow the model to invent why something is trending.

---

# 16.34 SOURCE QUALITY

Rank external sources.

Prefer:

```text
official sources

primary sources

reputable journalism

recognized research

direct statements
```

Use lower-confidence social chatter as:

```text
attention signal
```

not necessarily:

```text
factual evidence
```

This distinction is critical.

---

# 16.35 VIRALITY WITHOUT SPAM

Never implement:

```text
mass hashtag stuffing

comment automation

fake engagement

reaction automation

reposting identical content

duplicate captions

automated engagement bait

tagging unrelated people

posting into unrelated communities

deceptive headlines
```

Optimization should come from:

```text
topic relevance

timing

quality

novel angle

audience fit

strong writing

strong visual

good caption

real discussion value
```

---

# 16.36 POSTING DECISION

Before article generation, produce:

```text
PUBLISHING OPPORTUNITY REPORT
```

Example:

```text
TOPIC
AI and employment anxiety

TREND STAGE
Accelerating

PAKISTAN RELEVANCE
High

ARCHIVE MATCH
11 historical posts

ARCHIVE FIT
91/100

TREND VELOCITY
High

SATURATION
Medium

VIRALITY POTENTIAL
83/100

DISCUSSION POTENTIAL
88/100

EXPECTED OPPORTUNITY WINDOW
6–18 hours

RECENT SIMILAR ARTICLE
None

RECOMMENDATION
Generate

WHY
Global discussion is accelerating,
Pakistan search interest is increasing,
and the archive contains unusually strong
historical material on work, technology
and human identity.
```

Scores are heuristic estimates.

Label them as such.

---

# 16.37 ALTERNATIVE DECISION

System must also be capable of:

```text
RECOMMENDATION
SKIP
```

Example:

```text
TREND
Very high

ARCHIVE FIT
12/100

SATURATION
94/100

UNIQUE ANGLE
Weak

RECENT SIMILAR CONTENT
Published yesterday

RECOMMENDATION
SKIP
```

This is essential.

---

# 16.38 TOP THREE OPPORTUNITIES

Instead of immediately choosing one topic, initially show:

```text
TOP 3 OPPORTUNITIES RIGHT NOW
```

Example:

```text
1. AI & employment
   Opportunity: 91

2. Parenting and smartphone restrictions
   Opportunity: 84

3. Marriage expectations
   Opportunity: 77
```

Buttons:

```text
GENERATE BEST

GENERATE THIS

IGNORE

SNOOZE TOPIC
```

Future AUTOPILOT mode may automatically select #1.

---

# 16.39 LEARNING LOOP

After publication:

```text
Selected Opportunity
        ↓
Article
        ↓
Facebook Page Post
        ↓
Actual Performance
        ↓
Compare Prediction vs Reality
        ↓
Update Heuristics
```

Example:

```text
Predicted virality: HIGH

Actual:
low reach
high click-through
high comments
```

The system should learn that:

```text
reach

clickability

discussion

shareability
```

are separate outcomes.

---

# 16.40 PERFORMANCE TARGETS

Do NOT promise specific results such as:

```text
viral in 10 days

10,000 likes

100,000 reach
```

Those cannot be guaranteed.

Instead optimize measurable leading indicators and compare:

```text
previous 10 posts

previous 30 posts

same category baseline

same posting-hour baseline

Page rolling average
```

Target:

```text
OUTPERFORM OUR OWN BASELINE
```

rather than imaginary guaranteed virality.

---

# 16.41 10-DAY MOMENTUM MODE

Create an optional:

```text
MOMENTUM_MODE
```

Purpose:

aggressively test and learn what increases Page reach during a defined period such as:

```text
10 days
```

During Momentum Mode:

```text
scan trends more frequently

prioritize high-opportunity topics

allow up to configured 2 articles/day

test different posting windows

test different hooks

test different visual concepts

collect analytics aggressively

compare every result

avoid repeating losing patterns
```

Still enforce:

```text
quality threshold

minimum publishing interval

human approval

no spam tactics
```

At end generate:

```text
10-DAY PERFORMANCE REPORT
```

containing:

```text
articles published

Page posts published

total reach

average reach

median reach

best topic

worst topic

best posting window

best-performing hook pattern

best visual pattern

comments

shares

link clicks

engagement rate

performance vs previous baseline

lessons learned

recommended strategy for next 10 days
```

---

# 16.42 EXPLORATION VS EXPLOITATION

Do not keep publishing only topics that already performed well.

Use an approach approximately like:

```text
80% exploitation
topics/patterns showing evidence of performance

20% exploration
new subjects, new angles, new timing windows
```

Make percentages configurable.

This prevents the system from becoming trapped in one topic category.

---

# 16.43 FINAL SELECTION PRINCIPLE

The engine should prefer:

```text
RIGHT SUBJECT
+
RIGHT MOMENT
+
RIGHT AUDIENCE
+
MY EXISTING INTELLECTUAL CONNECTION
+
FRESH ARGUMENT
+
STRONG VISUAL
+
STRONG FACEBOOK HOOK
+
RIGHT DISTRIBUTION WINDOW
```

The target is NOT simply:

```text
write whatever is trending
```

The target is:

```text
DETECT WHAT PEOPLE CARE ABOUT RIGHT NOW,

SEARCH YEARS OF MY OWN THINKING FOR
AN AUTHENTIC CONNECTION,

FIND AN ANGLE WORTH CONTRIBUTING,

AND PUBLISH IT WHILE THE ATTENTION
WINDOW IS STILL OPEN.
```

That is the core topic-selection philosophy for this system.

This is a materially better version of the system than the earlier weighted-random selector. **Randomness should now only be a minor exploration mechanism.** The main engine becomes *trend detection → velocity → Pakistan relevance → archive matching → angle discovery → engagement/virality estimate → timing → publication decision*.

---
Powered by [AI Exporter](https://saveai.net)