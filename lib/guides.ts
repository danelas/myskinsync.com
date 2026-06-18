import fs from "fs";
import path from "path";

export interface GuideSection {
  h2: string;
  body: string[]; // paragraphs
}
export interface GuideFAQ {
  q: string;
  a: string;
}
export interface Guide {
  slug: string;
  title: string;
  description: string;
  concern?: string;
  skinType?: string;
  painQuote?: string; // the real thing people ask (from The Listener)
  intro: string[];
  sections: GuideSection[];
  featuredProductIds: string[];
  faq: GuideFAQ[];
  updated: string; // ISO date
}

const GUIDES_DIR = path.join(process.cwd(), "content", "guides");

export function getGuideSlugs(): string[] {
  if (!fs.existsSync(GUIDES_DIR)) return [];
  return fs
    .readdirSync(GUIDES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
}

export function getGuide(slug: string): Guide | null {
  const file = path.join(GUIDES_DIR, `${slug}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf-8")) as Guide;
}

export function getAllGuides(): Guide[] {
  return getGuideSlugs()
    .map((s) => getGuide(s))
    .filter((g): g is Guide => g !== null)
    .sort((a, b) => (a.updated < b.updated ? 1 : -1));
}
