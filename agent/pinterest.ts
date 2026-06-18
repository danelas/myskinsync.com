// Daily Pinterest entry point for MySkinSync.
//
// Builds 5 pins/day, all pointing at IN-REPO destinations (the quiz + published
// guides) — so the GitHub Action has zero cross-repo dependency. Each pin:
//   plan copy (Claude) → render 1000x1500 PNG (gpt-image-1 bg + overlay) →
//   schedule via Upload-Post across 5 ET slots so Pinterest sees a steady drip.
//
// Slot 1 is always the quiz (highest converting). Slots 2-5 cycle through the
// guides by a daily offset, so copy stays fresh and coverage rotates as you add
// more guides.
import dotenv from "dotenv";
dotenv.config({ override: true });

import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { planPin, type Destination, type PinPlan } from "./plan.ts";
import { renderPinImage } from "./pin-image.ts";
import { postToUploadPost } from "./uploadpost.ts";
import { makePreviewDir, writeJson, writeText } from "./util.ts";
import { etHourToUtc } from "./et.ts";

const DRY_RUN = process.argv.includes("--dry-run");
const SITE = (process.env.SITE_URL || "https://myskinsync.com").replace(/\/$/, "");
const GUIDES_DIR = resolve(process.cwd(), "..", "content", "guides");
const SLOT_HOURS_ET = [8, 12, 15, 18, 21];
const PIN_DESC_MAX = 500;

function dayIndex(now = new Date()): number {
  return Math.floor(now.getTime() / 86400000);
}

const QUIZ_HOOKS = [
  "I have no idea what skincare products I actually need for my skin type",
  "Overwhelmed by skincare — where do I even start?",
  "Stop buying random skincare; find what fits your skin first",
  "Build a simple skincare routine for your exact skin type",
];

async function loadGuides(): Promise<Destination[]> {
  if (!existsSync(GUIDES_DIR)) return [];
  const files = (await readdir(GUIDES_DIR)).filter((f) => f.endsWith(".json"));
  const out: Destination[] = [];
  for (const f of files) {
    const g = JSON.parse(await readFile(resolve(GUIDES_DIR, f), "utf8"));
    out.push({
      url: `${SITE}/guides/${g.slug}`,
      kind: "guide",
      seed: g.painQuote || g.title,
      concern: g.concern,
    });
  }
  return out;
}

async function buildDestinations(day: number): Promise<Destination[]> {
  const guides = await loadGuides();
  const dests: Destination[] = [];

  // Slot 1 — the quiz, rotating the hook line.
  dests.push({ url: `${SITE}/quiz`, kind: "quiz", seed: QUIZ_HOOKS[day % QUIZ_HOOKS.length] });

  // Slots 2-5 — guides cycled by daily offset (falls back to quiz if no guides).
  for (let i = 0; i < 4; i++) {
    if (guides.length === 0) {
      dests.push({ url: `${SITE}/quiz`, kind: "quiz", seed: QUIZ_HOOKS[(day + i) % QUIZ_HOOKS.length] });
    } else {
      dests.push(guides[(day * 4 + i) % guides.length]);
    }
  }
  return dests;
}

function buildCaption(plan: PinPlan): string {
  const tagLine = plan.hashtags.map((h) => `#${h}`).join(" ");
  let caption = plan.description;
  if (caption.length + 2 + tagLine.length <= PIN_DESC_MAX) {
    caption = `${caption}\n\n${tagLine}`;
  } else if (caption.length + 2 < PIN_DESC_MAX) {
    const room = PIN_DESC_MAX - caption.length - 2;
    const fitted: string[] = [];
    let used = 0;
    for (const tag of plan.hashtags) {
      const next = `#${tag}`;
      const needed = used === 0 ? next.length : used + 1 + next.length;
      if (needed > room) break;
      fitted.push(next);
      used = needed;
    }
    if (fitted.length) caption = `${caption}\n\n${fitted.join(" ")}`;
  }
  return caption.length > PIN_DESC_MAX ? caption.slice(0, PIN_DESC_MAX) : caption;
}

async function main() {
  console.log(`[pinterest] dry-run=${DRY_RUN}  site=${SITE}`);
  const rootDir = await makePreviewDir();
  console.log(`[pinterest] preview: ${rootDir}`);

  const day = dayIndex();
  const dests = await buildDestinations(day);
  const now = new Date();

  for (let i = 0; i < dests.length; i++) {
    const name = `pin-${i + 1}`;
    const dir = await makePreviewDir(resolve(rootDir, name));
    const etHour = SLOT_HOURS_ET[i] ?? 12;

    try {
      const plan = await planPin(dests[i]);
      await writeJson(resolve(dir, "plan.json"), plan);
      await writeText(resolve(dir, "description.txt"), plan.description);
      console.log(`[${name}] ${dests[i].kind} → ${plan.targetUrl}`);

      const imgPath = resolve(dir, "pin.png");
      await renderPinImage(plan, imgPath, dir);

      const scheduledTime = etHourToUtc(etHour, 0, now);
      console.log(`[${name}] scheduled ${etHour}:00 ET → ${scheduledTime.toISOString()}`);

      if (DRY_RUN) {
        console.log(`[${name}] dry-run — skipping upload`);
        continue;
      }

      const r = await postToUploadPost({
        caption: buildCaption(plan),
        title: plan.pinTitle,
        mediaPath: imgPath,
        platforms: ["pinterest"],
        scheduledTime,
        link: plan.targetUrl,
      });
      console.log(`[${name}] posted:`, r);
    } catch (err) {
      // One bad slot shouldn't kill the rest of the day's pins.
      console.error(`[${name}] failed: ${(err as Error).message}`);
    }
  }
}

main().catch((err) => {
  console.error("[pinterest] fatal:", err);
  process.exit(1);
});
