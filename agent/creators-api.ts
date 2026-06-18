// Amazon Creators API client — successor to PA-API 5.0 (which retired May 2026).
//
// Auth is OAuth2 client-credentials: exchange Credential ID + Secret for a short
// Bearer token, then call the catalog API. Region is chosen by the x-marketplace
// header, not the host (the host is the single global `creatorsapi.amazon`, on
// Amazon's own `.amazon` TLD).
//
// Credential "Version" selects the flow:
//   v3.x (Login with Amazon) → token at api.amazon.com/auth/o2/token, scope
//        "creatorsapi::default", calls use `Authorization: Bearer <token>`.
//   v2.x (Cognito) → token at creatorsapi.auth.<region>.amazoncognito.com, scope
//        "creatorsapi/default", calls add `, Version <version>` to the header.
//
// Docs corroborated June 2026. Response shapes are parsed defensively (run with
// DEBUG=1 to dump raw JSON) since the API is new.

const CATALOG_BASE = "https://creatorsapi.amazon/catalog/v1";

export interface Creds {
  credentialId: string;
  credentialSecret: string;
  version: string;
  partnerTag: string;
  marketplace: string;
}

export function loadCreds(): Creds {
  const e = process.env;
  const missing = ["AMAZON_CREDENTIAL_ID", "AMAZON_CREDENTIAL_SECRET", "AMAZON_CREDENTIAL_VERSION", "AMAZON_PARTNER_TAG"].filter((k) => !e[k]);
  if (missing.length) {
    throw new Error(`Missing Creators API env: ${missing.join(", ")}. See agent/.env.example.`);
  }
  return {
    credentialId: e.AMAZON_CREDENTIAL_ID!,
    credentialSecret: e.AMAZON_CREDENTIAL_SECRET!,
    version: e.AMAZON_CREDENTIAL_VERSION!,
    partnerTag: e.AMAZON_PARTNER_TAG!,
    marketplace: e.AMAZON_MARKETPLACE || "www.amazon.com",
  };
}

const DEBUG = process.env.DEBUG === "1";
function major(version: string): number {
  return parseInt(version.split(".")[0], 10);
}

let cached: { token: string; exp: number } | null = null;

async function getToken(c: Creds): Promise<string> {
  const now = Date.now();
  if (cached && cached.exp > now) return cached.token;

  const v3 = major(c.version) >= 3;
  const endpoint = v3
    ? "https://api.amazon.com/auth/o2/token"
    : "https://creatorsapi.auth.us-east-1.amazoncognito.com/oauth2/token";
  const scope = v3 ? "creatorsapi::default" : "creatorsapi/default";
  const basic = Buffer.from(`${c.credentialId}:${c.credentialSecret}`).toString("base64");

  const resp = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials", scope }).toString(),
  });
  const text = await resp.text();
  if (!resp.ok) {
    throw new Error(`Creators API token request failed (${resp.status}): ${text}`);
  }
  const json = JSON.parse(text) as { access_token: string; expires_in: number };
  cached = { token: json.access_token, exp: now + (json.expires_in - 60) * 1000 };
  return cached.token;
}

async function call(path: string, body: Record<string, unknown>, c: Creds): Promise<any> {
  const token = await getToken(c);
  const auth = major(c.version) >= 3 ? `Bearer ${token}` : `Bearer ${token}, Version ${c.version}`;
  const resp = await fetch(`${CATALOG_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: auth,
      "x-marketplace": c.marketplace,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await resp.text();
  if (DEBUG) console.log(`[creators-api] ${path} ${resp.status}: ${text.slice(0, 1200)}`);
  if (!resp.ok) {
    // Eligibility gate: PA access stays active only after ~3 qualifying sales.
    if (resp.status === 401 || resp.status === 403) {
      throw new Error(
        `Creators API ${resp.status} on ${path}: ${text}\n` +
          `If this says "not eligible", you need ~3 qualifying sales in 180 days before the API unlocks.`
      );
    }
    throw new Error(`Creators API ${resp.status} on ${path}: ${text}`);
  }
  return JSON.parse(text);
}

export const DEFAULT_RESOURCES = [
  "itemInfo.title",
  "images.primary.large",
  "offersV2.listings.price",
  "offersV2.listings.availability",
];

export interface LiveItem {
  asin: string;
  title?: string;
  image?: string;
  price?: string;
  available?: string;
}

function parseItem(item: any): LiveItem {
  return {
    asin: item?.asin,
    title: item?.itemInfo?.title?.displayValue,
    image:
      item?.images?.primary?.large?.url ||
      item?.images?.primary?.medium?.url ||
      undefined,
    price:
      item?.offersV2?.listings?.[0]?.price?.money?.displayAmount ||
      item?.offersV2?.listings?.[0]?.price?.displayAmount ||
      item?.offersV2?.listings?.[0]?.price?.amount?.toString() ||
      undefined,
    available: item?.offersV2?.listings?.[0]?.availability?.message,
  };
}

/** Look up specific ASINs. */
export async function getItems(itemIds: string[], c = loadCreds(), resources = DEFAULT_RESOURCES): Promise<LiveItem[]> {
  const json = await call("/getItems", { partnerTag: c.partnerTag, marketplace: c.marketplace, itemIds, resources }, c);
  const items = json?.itemsResult?.items || json?.items || [];
  return items.map(parseItem);
}

/** Search by keywords (used to resolve our curated products to real ASINs). */
export async function searchItems(
  keywords: string,
  c = loadCreds(),
  opts: { itemCount?: number; searchIndex?: string; resources?: string[] } = {}
): Promise<LiveItem[]> {
  const json = await call(
    "/searchItems",
    {
      partnerTag: c.partnerTag,
      marketplace: c.marketplace,
      keywords,
      searchIndex: opts.searchIndex || "Beauty",
      itemCount: opts.itemCount || 1,
      resources: opts.resources || DEFAULT_RESOURCES,
    },
    c
  );
  const items = json?.searchResult?.items || json?.items || [];
  return items.map(parseItem);
}
