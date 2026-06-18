// Upload-Post poster — image posting with Pinterest link + board + scheduling.
// Ported from the Gold Touch List social-agent, trimmed to the platforms this
// agent uses (Pinterest first; IG/TikTok ready). Keeps the soft-vs-hard failure
// detection so rate limits don't redden the run but real auth errors surface.
import { readFile } from "node:fs/promises";
import { basename } from "node:path";

const API_BASE = "https://api.upload-post.com/api";

export type Platform = "instagram" | "tiktok" | "youtube" | "pinterest";

type PostInput = {
  caption: string;
  title?: string;
  mediaPath: string;
  platforms: Platform[];
  scheduledTime?: Date;
  link?: string;            // Pinterest destination URL
  pinterestBoard?: string;  // board id/name
};

function authHeader(): Record<string, string> {
  const key = process.env.UPLOAD_POST_API_KEY;
  if (!key) throw new Error("UPLOAD_POST_API_KEY not set");
  return { Authorization: `Apikey ${key}` };
}

function userProfile(): string {
  const user = process.env.UPLOAD_POST_USER;
  if (!user) throw new Error("UPLOAD_POST_USER not set (the profile name in your Upload-Post dashboard)");
  return user;
}

function isSoftFailure(text: string): boolean {
  const t = (text || "").toLowerCase();
  return (
    t.includes("rate limit") || t.includes("rate-limit") || t.includes("rate_limit") ||
    t.includes("too many requests") || t.includes("throttle") || t.includes("quota") ||
    t.includes("daily limit") || t.includes("429") || t.includes("try again later")
  );
}

export async function postToUploadPost(input: PostInput): Promise<unknown> {
  const fileBuf = await readFile(input.mediaPath);
  const fileName = basename(input.mediaPath);
  const blob = new Blob([fileBuf]);

  const form = new FormData();
  form.append("user", userProfile());
  for (const p of input.platforms) form.append("platform[]", p);
  if (input.scheduledTime) form.append("scheduled_time", input.scheduledTime.toISOString());

  // Photo endpoint (Pinterest pins are images).
  form.append("photos[]", blob, fileName);
  form.append("caption", input.caption);
  form.append("title", input.title ?? input.caption.slice(0, 90));
  if (input.link) form.append("link", input.link);

  if (input.platforms.includes("pinterest")) {
    const board = input.pinterestBoard ?? process.env.PINTEREST_BOARD;
    if (!board) {
      throw new Error("Pinterest board not set — add PINTEREST_BOARD env (board id/name from your Upload-Post Pinterest connection).");
    }
    form.append("pinterest_board_id", board);
    form.append("pinterest_board", board);
  }

  const resp = await fetch(`${API_BASE}/upload_photos`, {
    method: "POST",
    headers: authHeader(),
    body: form,
  });

  const bodyText = await resp.text();
  if (!resp.ok) {
    throw new Error(`upload-post image post failed: ${resp.status} ${bodyText}`);
  }

  let body: unknown;
  try { body = JSON.parse(bodyText); } catch { body = bodyText; }

  // Detect per-platform failures even on HTTP 200 (Upload-Post's envelope often
  // says success:true while a platform inside failed).
  if (body && typeof body === "object") {
    const obj = body as Record<string, unknown>;
    const soft: string[] = [];
    const hard: string[] = [];
    const inspect = (platform: string, raw: unknown) => {
      if (!raw || typeof raw !== "object") return;
      const r = raw as Record<string, unknown>;
      const status = String(r.status ?? r.state ?? "").toLowerCase();
      const error = r.error ?? r.message ?? r.error_message;
      const failed = r.success === false || error || ["failed", "error", "rejected"].includes(status);
      if (!failed) return;
      const msg = `${platform}: ${typeof error === "string" ? error : status || "unknown error"}`;
      (isSoftFailure(typeof error === "string" ? error : status) ? soft : hard).push(msg);
    };
    const results = (obj.results ?? null) as Record<string, unknown> | null;
    for (const platform of input.platforms) {
      inspect(platform, obj[platform]);
      if (results) inspect(platform, results[platform]);
    }
    if (soft.length) console.warn(`[upload-post] soft failures (continuing):\n  ${soft.join("\n  ")}`);
    if (hard.length) {
      throw new Error(
        `upload-post returned 200 but platform(s) failed:\n  ${hard.join("\n  ")}\n` +
          `If it mentions "access token"/"session invalidated", reconnect Pinterest at upload-post.com.`
      );
    }
  }

  return body;
}
