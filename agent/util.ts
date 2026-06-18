import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

/** Create (or ensure) a preview directory. No arg → a fresh timestamped root. */
export async function makePreviewDir(dir?: string): Promise<string> {
  const target = dir ?? resolve("preview", `run-${new Date().toISOString().replace(/[:.]/g, "-")}`);
  await mkdir(target, { recursive: true });
  return target;
}

export async function writeJson(path: string, data: unknown): Promise<void> {
  await writeFile(path, JSON.stringify(data, null, 2), "utf8");
}

export async function writeText(path: string, text: string): Promise<void> {
  await writeFile(path, text, "utf8");
}
