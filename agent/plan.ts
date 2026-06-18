// Pinterest planner — Claude rewrites the user-facing pin copy + keyword-heavy
// description for a destination we picked. We never let the model invent the
// URL; we compose targetUrl on our side from the destination.
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const PinPlanSchema = z.object({
  kind: z.string(),
  category: z.literal("skincare"),
  title: z.string().min(3).max(48),        // big bold overlay text
  subtitle: z.string().min(3).max(90),     // smaller support line
  pinTitle: z.string().min(4).max(100),    // Pinterest "title" field
  description: z.string().min(40).max(380),// keyword-rich; leaves room for hashtags under the 500 cap
  hashtags: z.array(z.string()).min(3).max(8),
  targetUrl: z.string().url(),
  backgroundMode: z.enum(["ai", "gradient"]),
  imagePrompt: z.string().nullable(),
});
export type PinPlan = z.infer<typeof PinPlanSchema>;

export type Destination = {
  url: string;
  kind: "quiz" | "guide";
  seed: string;        // the angle/topic to write about
  concern?: string;
};

const SYSTEM = `You write Pinterest pin copy for MySkinSync (myskinsync.com) — a free skincare quiz that builds a personalized AM/PM routine and recommends real products.

Hard rules:
- Warm, real, encouraging tone. Speak to someone overwhelmed by skincare. Not hypey, not clinical.
- Pinterest users search with keywords — descriptions must be keyword-rich and readable, never hashtag-spam.
- Never make medical claims ("may help", not "cures"). No "miracle".
- Output JSON only, matching the schema provided.`;

export async function planPin(dest: Destination): Promise<PinPlan> {
  const anthropic = new Anthropic();
  const cta =
    dest.kind === "quiz"
      ? "take the free 60-second skin quiz on myskinsync.com"
      : "read the full guide on myskinsync.com";

  const resp = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1300,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Write a SOLUTION Pinterest pin (problem → insight → CTA).

Topic / angle: "${dest.seed}"
${dest.concern ? `Skin concern: ${dest.concern}` : ""}
Goal of the pin: get the reader to ${cta}

Output ONLY a JSON object:
{
  "kind": "${dest.kind}",
  "category": "skincare",
  "title": string (3-40 chars, bold overlay hook/problem, e.g. "Tried everything?" or "Breaking out?"),
  "subtitle": string (3-80 chars, the insight/answer/promise),
  "pinTitle": string (<=100 chars, SEO Pinterest title, specific and keyword-rich),
  "description": string (2-4 short sentences, MAX 380 chars, keyword-rich, sets up the problem and promises the answer, ends with a soft CTA to ${cta}),
  "hashtags": string[] (3-6, no # symbol, skincare-relevant),
  "targetUrl": "${dest.url}",
  "backgroundMode": "ai",
  "imagePrompt": string (detailed prompt for gpt-image-1, 1024x1536 portrait, premium editorial skincare scene relevant to the topic, soft natural light, warm clean cream/sand palette, calm and aspirational. Composition MUST leave the TOP THIRD mostly empty/soft-focus so text can overlay cleanly. CRITICAL: NO TEXT, NO WORDS, NO LOGOS, NO TYPOGRAPHY anywhere. End with: "No text, no lettering, no watermarks, no signage, no captions.")
}`,
      },
    ],
  });

  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("pinterest planner: no JSON in response");

  const raw = JSON.parse(match[0]);
  raw.targetUrl = dest.url;        // trust our own URL, not the model's echo
  raw.backgroundMode = "ai";
  raw.category = "skincare";
  return PinPlanSchema.parse(raw);
}
