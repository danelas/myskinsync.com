/**
 * Social distribution generator — turns The Listener's briefs into ready-to-post
 * Pinterest pins + TikTok/Reels scripts, each linking to a MySkinSync guide or the
 * quiz (NEVER a raw Amazon link — that's against Amazon's terms off-site; the
 * affiliate links live on your site, where the disclosure is).
 *
 * Output is a review calendar (social/social_calendar_<date>.md + .json). The JSON
 * `pinPlan` per post mirrors the social-agent's PinPlan shape, so it can be fed
 * into that repo's pin-image renderer + postToUploadPost (link + PINTEREST_BOARD)
 * for auto-posting later.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... node scripts/generate-social.mjs --limit 8
 *   node scripts/generate-social.mjs --brief ../the-listener/briefs/brief_skincare_latest.json --limit 12
 *
 * Install dep first:  npm i -D @anthropic-ai/sdk
 */
import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";

const args = process.argv.slice(2);
const getArg = (flag, def) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : def;
};
const BRIEF = getArg("--brief", "../the-listener/briefs/brief_skincare_latest.json");
const LIMIT = parseInt(getArg("--limit", "8"), 10);
const SITE = (process.env.SITE_URL || "https://myskinsync.com").replace(/\/$/, "");
const OUT_DIR = path.join(process.cwd(), "social");
const GUIDES_DIR = path.join(process.cwd(), "content", "guides");
const MODEL = "claude-sonnet-4-6";

function loadDestinations() {
  const dests = [{ url: `${SITE}/quiz`, title: "Free 60-second skin quiz", keywords: ["routine", "skin type", "what to buy", "help"] }];
  if (fs.existsSync(GUIDES_DIR)) {
    for (const f of fs.readdirSync(GUIDES_DIR).filter((f) => f.endsWith(".json"))) {
      const g = JSON.parse(fs.readFileSync(path.join(GUIDES_DIR, f), "utf-8"));
      dests.push({
        url: `${SITE}/guides/${g.slug}`,
        title: g.title,
        keywords: [g.concern, g.skinType, ...(g.title.toLowerCase().split(/[^a-z]+/))].filter(Boolean),
      });
    }
  }
  return dests;
}

/** Pick the destination on OUR side (don't let the model invent URLs). */
function pickDestination(pain, dests) {
  const tokens = new Set((pain || "").toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3));
  let best = dests[0]; // /quiz fallback
  let bestScore = 0;
  for (const d of dests) {
    if (d.url.endsWith("/quiz")) continue;
    const score = d.keywords.reduce((n, k) => n + (tokens.has(k) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = d;
    }
  }
  return best;
}

const SYSTEM = `You write social copy for MySkinSync (myskinsync.com) — a free skincare quiz that builds a personalized routine and recommends products.
Tone: warm, real, encouraging, never hypey or clinical. Pinterest users search with keywords; TikTok rewards a strong first-line hook.
Never make medical claims ("may help", not "cures"). Output ONLY JSON matching the schema.`;

function promptFor(pain, dest) {
  return `A real person posted this skincare need:
"${pain}"

Write a social pack that drives them to this destination (already chosen — do NOT change the URL):
${dest.title} — ${dest.url}

Output ONLY this JSON:
{
  "pinPlan": {
    "kind": "solution",
    "category": "skincare",
    "title": "4-40 char bold overlay hook (the problem)",
    "subtitle": "4-80 char overlay support line (the promise)",
    "pinTitle": "<=100 char Pinterest title field, keyword-rich",
    "description": "<=380 chars, keyword-rich, sets up the problem and promises the answer, ends with soft CTA to take the free quiz on myskinsync.com",
    "hashtags": ["3-6 tags, no # symbol, skincare-relevant"],
    "targetUrl": "${dest.url}",
    "backgroundMode": "ai",
    "imagePrompt": "detailed gpt-image-1 prompt, 1024x1536 portrait, premium editorial skincare scene, soft natural light, warm clean aesthetic. TOP THIRD must be empty/soft for text overlay. End with: No text, no lettering, no watermarks, no signage, no captions."
  },
  "tiktok": {
    "hook": "scroll-stopping first line (<=12 words)",
    "script": ["3-5 short spoken beats"],
    "onScreenText": ["3-5 short captions to overlay"],
    "caption": "post caption with a soft CTA to the link in bio",
    "hashtags": ["4-7 tags, no # symbol"]
  }
}`;
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Set ANTHROPIC_API_KEY (it's in ../the-listener/.env).");
    process.exit(1);
  }
  const briefPath = path.resolve(BRIEF);
  if (!fs.existsSync(briefPath)) {
    console.error(`Brief not found: ${briefPath}. Run the listener bridge first.`);
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const brief = JSON.parse(fs.readFileSync(briefPath, "utf-8"));
  const dests = loadDestinations();
  const client = new Anthropic();

  const posts = [];
  for (const item of (brief.content_briefs || []).slice(0, LIMIT * 2)) {
    if (posts.length >= LIMIT) break;
    const pain = (item.pain || "").trim();
    if (!pain) continue;
    const dest = pickDestination(pain, dests);
    try {
      const resp = await client.messages.create({
        model: MODEL,
        max_tokens: 1500,
        system: SYSTEM,
        messages: [{ role: "user", content: promptFor(pain, dest) }],
      });
      const text = resp.content.filter((b) => b.type === "text").map((b) => b.text).join("");
      const m = text.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("no JSON");
      const pack = JSON.parse(m[0]);
      pack.pinPlan.targetUrl = dest.url; // trust our own URL
      posts.push({ sourcePain: pain, sourceUrl: item.url, destination: dest, ...pack });
      console.log(`✓ ${dest.url.replace(SITE, "")}  ← "${pain.slice(0, 50)}"`);
    } catch (e) {
      console.error(`✗ "${pain.slice(0, 40)}" — ${e.message}`);
    }
  }

  const stamp = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(path.join(OUT_DIR, `social_calendar_${stamp}.json`), JSON.stringify(posts, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, `social_calendar_${stamp}.md`), renderMd(posts, stamp));
  console.log(`\nWrote social/social_calendar_${stamp}.md (+ .json) — ${posts.length} posts.`);
}

function renderMd(posts, stamp) {
  const L = [
    `# MySkinSync — Social Calendar (${stamp})`,
    "",
    "Every post links to the SITE (quiz or a guide), never to Amazon directly — that keeps you within Amazon's off-site rules. Put “Contains affiliate links” in your profile bio once.",
    "",
    `Suggested cadence: 3–5 Pinterest pins/day + 1 TikTok/Reel/day. ${posts.length} posts below.`,
    "",
    "---",
    "",
  ];
  posts.forEach((p, i) => {
    const pp = p.pinPlan, tt = p.tiktok;
    L.push(`## ${i + 1}. → ${p.destination.url}`);
    L.push(`*Seeded from a real post: “${p.sourcePain}”*`, "");
    L.push("### 📌 Pinterest");
    L.push(`- **Overlay:** ${pp.title} — ${pp.subtitle}`);
    L.push(`- **Pin title:** ${pp.pinTitle}`);
    L.push(`- **Description:** ${pp.description}`);
    L.push(`- **Hashtags:** ${pp.hashtags.map((h) => "#" + h).join(" ")}`);
    L.push(`- **Link:** ${pp.targetUrl}`);
    L.push(`- **Image prompt:** ${pp.imagePrompt}`, "");
    L.push("### 🎬 TikTok / Reels");
    L.push(`- **Hook:** ${tt.hook}`);
    L.push(`- **Script:** ${tt.script.map((s, j) => `(${j + 1}) ${s}`).join(" ")}`);
    L.push(`- **On-screen text:** ${tt.onScreenText.join(" · ")}`);
    L.push(`- **Caption:** ${tt.caption}`);
    L.push(`- **Hashtags:** ${tt.hashtags.map((h) => "#" + h).join(" ")}`, "", "---", "");
  });
  return L.join("\n");
}

main();
