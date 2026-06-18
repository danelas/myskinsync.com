import type { NextRequest } from "next/server";
import { getPrices } from "@/lib/price";

// Used by the client-rendered quiz result to fetch live prices. Cached 6h.
export const revalidate = 21600;

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("asins") || "";
  const asins = raw.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 20);
  const prices = await getPrices(asins);
  return Response.json(prices);
}
