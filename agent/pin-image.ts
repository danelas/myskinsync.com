// Render a 1000x1500 Pinterest-optimal PNG with text overlay.
// AI mode: full-bleed gpt-image-1 photo under a scrim + overlay.
// Gradient mode: cream/clay gradient fallback (no OpenAI needed).
//
// MySkinSync palette: cream #FBF7F2, ink #1F2421, clay #C97D60, sage #9CAF88.
import { readFile, writeFile } from "node:fs/promises";
import puppeteer from "puppeteer";
import { generateImage } from "./image.ts";
import type { PinPlan } from "./plan.ts";

const PIN_WIDTH = 1000;
const PIN_HEIGHT = 1500;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function gradientHtml(): string {
  return `
    <div class="bg gradient" style="background:
      radial-gradient(ellipse at 30% 20%, #F4E7DE 0%, #FBF7F2 55%, #F1E2D6 100%);">
      <div class="icon">✦</div>
    </div>
  `;
}

function aiHtml(bgDataUrl: string): string {
  return `
    <div class="bg ai" style="background-image:url('${bgDataUrl}');"></div>
    <div class="scrim"></div>
  `;
}

function overlayHtml(plan: PinPlan): string {
  return `
    <div class="overlay">
      <div class="kicker">${escapeHtml(plan.category.toUpperCase())}</div>
      <h1>${escapeHtml(plan.title)}</h1>
      <h2>${escapeHtml(plan.subtitle)}</h2>
      <div class="wordmark"><span class="dot"></span> MYSKINSYNC</div>
    </div>
  `;
}

function pageHtml(plan: PinPlan, body: string): string {
  const aiMode = plan.backgroundMode === "ai";
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');

  html,body { margin:0; padding:0; width:${PIN_WIDTH}px; height:${PIN_HEIGHT}px;
    font-family:'Inter', system-ui, sans-serif;
    background:#FBF7F2; color:#1F2421; overflow:hidden; }

  .bg { position:absolute; inset:0; }
  .bg.ai { background-size:cover; background-position:center; }
  .scrim { position:absolute; inset:0;
    background:
      linear-gradient(180deg, rgba(31,36,33,0.55) 0%, rgba(31,36,33,0.1) 45%, rgba(31,36,33,0.0) 70%),
      linear-gradient(0deg,   rgba(31,36,33,0.35) 0%, rgba(31,36,33,0.0) 30%);
  }

  .icon { position:absolute; top:60%; left:50%; transform:translate(-50%,-50%);
    font-family:'Fraunces', serif; font-size:240px; color:#C97D60; opacity:0.30; line-height:1; }

  .overlay { position:absolute; inset:0; padding:80px 70px;
    display:flex; flex-direction:column; justify-content:${aiMode ? "flex-start" : "center"};
    ${aiMode ? "" : "text-align:center; align-items:center;"}
    color:${aiMode ? "#FBF7F2" : "#1F2421"}; }

  .kicker { font-size:22px; font-weight:600; letter-spacing:0.32em;
    color:${aiMode ? "#F4C7C3" : "#C97D60"}; margin-bottom:28px; }

  h1 { font-family:'Fraunces', Georgia, serif; font-weight:800; font-size:92px; line-height:1.02;
    margin:0 0 24px 0; letter-spacing:-0.01em;
    ${aiMode ? "text-shadow:0 2px 18px rgba(0,0,0,0.45);" : ""} }

  h2 { font-family:'Fraunces', Georgia, serif; font-weight:600; font-size:50px; line-height:1.15;
    margin:0; color:${aiMode ? "#FBF7F2" : "#6E665A"};
    ${aiMode ? "text-shadow:0 2px 14px rgba(0,0,0,0.5);" : ""} max-width:860px; }

  .wordmark { position:absolute; bottom:70px; left:0; right:0; text-align:center;
    font-size:22px; font-weight:600; letter-spacing:0.36em;
    color:${aiMode ? "#FBF7F2" : "#1F2421"};
    display:flex; align-items:center; justify-content:center; gap:14px; }
  .dot { display:inline-block; width:10px; height:10px; border-radius:50%;
    background:#C97D60; box-shadow:0 0 0 4px rgba(201,125,96,0.25); }
</style>
</head>
<body>
  ${body}
  ${overlayHtml(plan)}
</body>
</html>`;
}

async function renderHtmlToPng(html: string, outPath: string): Promise<void> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: PIN_WIDTH, height: PIN_HEIGHT, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "load", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 1200)); // let webfonts settle
    await page.screenshot({ path: outPath as `${string}.png`, fullPage: false });
  } finally {
    await browser.close();
  }
}

export async function renderPinImage(
  plan: PinPlan,
  outPath: string,
  workDir: string
): Promise<string> {
  let body: string;
  if (plan.backgroundMode === "ai") {
    if (!plan.imagePrompt) throw new Error("pin-image: ai mode requires imagePrompt");
    try {
      const bgPath = `${workDir}/pin-bg.png`;
      await generateImage(plan.imagePrompt, bgPath, "1024x1536");
      const buf = await readFile(bgPath);
      body = aiHtml(`data:image/png;base64,${buf.toString("base64")}`);
    } catch (e) {
      // gpt-image-1 occasionally refuses a prompt — fall back to gradient so
      // the pin still ships rather than failing the whole slot.
      console.warn(`[pin-image] AI background failed, using gradient: ${(e as Error).message}`);
      body = gradientHtml();
    }
  } else {
    body = gradientHtml();
  }

  const html = pageHtml(plan, body);
  await writeFile(`${workDir}/pin.html`, html, "utf8");
  await renderHtmlToPng(html, outPath);
  return outPath;
}
