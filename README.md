# MySkinSync

A skincare affiliate site built around one painfully common search:
**"I have no idea what products I need for my skin type."**

Visitors take a free 60-second quiz → get a personalized AM/PM routine →
shop the exact products (Amazon affiliate links, swappable for higher-commission
brand programs later).

The product catalog and content are **demand-validated by The Listener** — every
seeded product was something real people are actively asking about
(`../the-listener/briefs/brief_skincare_latest.json`).

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind
- No database needed for the MVP (the quiz runs client-side)
- Supabase added later for email capture / saved routines

## Run locally
```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_AMAZON_TAG to your Associates ID
npm run dev                  # http://localhost:3000
```

## Deploy
Push to GitHub, import on Vercel, set `NEXT_PUBLIC_AMAZON_TAG`. Point your domain
(myskinsync.com) at it. No build config needed.

## Architecture
| File | Role |
|---|---|
| `lib/products.ts` | Seed catalog (from the Listener brief). Add `asin` per product when known. |
| `lib/quiz.ts` | The 4 quiz questions. |
| `lib/routine.ts` | Scores products against answers → builds the AM/PM/weekly routine. |
| `lib/affiliate.ts` | **Single** place links are built. Add brand-program URLs here later. |
| `components/Quiz.tsx` | Client quiz flow. |
| `components/RoutineResult.tsx` | Renders the routine with affiliate buttons. |
| `components/Disclosure.tsx` | Required Amazon + FTC + medical disclosures. |

## Compliance (do not remove)
- "As an Amazon Associate we earn from qualifying purchases" + FTC disclosure are
  rendered site-wide (footer) and on the results page.
- Affiliate links carry `rel="sponsored nofollow"`.
- Not medical advice; results page points users to a dermatologist.
- **Amazon prices/stock**: do not scrape or cache. When you reach ~3 sales,
  Amazon unlocks the Product Advertising API (PA-API) — pull live price/availability
  then, refreshed under 24h per Amazon's Operating Agreement.

## Content + social generators
| Script | What it does |
|---|---|
| `scripts/generate-guides.mjs` | Brief → SEO guide pages (`content/guides/*.json`). `--limit N`, idempotent. |
| `scripts/generate-social.mjs` | Brief → Pinterest pins + TikTok scripts (`social/social_calendar_<date>.md`), each linking to a guide or the quiz. |

Both need `ANTHROPIC_API_KEY` (it's in `../the-listener/.env`) and `npm i -D @anthropic-ai/sdk`.
`social/social_calendar_seed.md` is hand-written, post-ready content to start today.

## Automated Pinterest posting (`agent/`)
A self-contained social agent (its own `package.json`, so Vercel never installs
puppeteer/openai). Daily it builds 5 pins → Claude writes the copy → `gpt-image-1`
makes the background → puppeteer overlays the text → Upload-Post schedules them
across 5 ET slots. Pins point at **in-repo destinations** (the quiz + your guides),
so there's no cross-repo dependency.

Runs via GitHub Actions: `.github/workflows/pinterest.yml` (cron 11:30 UTC daily;
`workflow_dispatch` with a dry-run option).

**Required GitHub repo secrets** (Settings → Secrets and variables → Actions):
`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `UPLOAD_POST_API_KEY`, `UPLOAD_POST_USER`,
`PINTEREST_BOARD` (optional `SITE_URL`). Connect Pinterest in your Upload-Post profile first.

Local test: `cd agent && cp .env.example .env && npm i && npm run pinterest:dry`
(renders pins into `agent/preview/` without posting).

## Roadmap
1. Add real ASINs to `lib/products.ts` (direct `/dp/` links convert best).
2. Email capture ("email me my routine") → Supabase.
3. ~~Content pages from the Listener brief (SEO long-tail).~~ ✅ done — `/guides`
4. ~~Social distribution generator.~~ ✅ done — `scripts/generate-social.mjs`
5. PA-API live pricing once Associates API access is unlocked.
6. Wire `generate-social.mjs` output into the social-agent poster for hands-off posting.
