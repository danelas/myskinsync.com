import type { MetadataRoute } from "next";
import { getAllGuides } from "@/lib/guides";

const BASE = "https://myskinsync.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/quiz", "/guides"].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));

  const guideRoutes = getAllGuides().map((g) => ({
    url: `${BASE}/guides/${g.slug}`,
    lastModified: new Date(g.updated),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...guideRoutes];
}
