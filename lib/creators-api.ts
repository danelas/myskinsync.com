// Server-only Amazon Creators API client (runs on Vercel's Node runtime for live
// price fetches). Mirrors agent/creators-api.ts. Never import this from a client
// component — it reads secret credentials from server env.
//
// Auth: OAuth2 client-credentials → Bearer token. Version selects the flow
// (v3.x Login-with-Amazon vs v2.x Cognito). Single global host creatorsapi.amazon;
// region via x-marketplace header.

const CATALOG_BASE = "https://creatorsapi.amazon/catalog/v1";

interface Creds {
  credentialId: string;
  credentialSecret: string;
  version: string;
  partnerTag: string;
  marketplace: string;
}

function loadCreds(): Creds | null {
  const e = process.env;
  if (!e.AMAZON_CREDENTIAL_ID || !e.AMAZON_CREDENTIAL_SECRET || !e.AMAZON_CREDENTIAL_VERSION || !e.AMAZON_PARTNER_TAG) {
    return null; // not configured → callers degrade gracefully (no price shown)
  }
  return {
    credentialId: e.AMAZON_CREDENTIAL_ID,
    credentialSecret: e.AMAZON_CREDENTIAL_SECRET,
    version: e.AMAZON_CREDENTIAL_VERSION,
    partnerTag: e.AMAZON_PARTNER_TAG,
    marketplace: e.AMAZON_MARKETPLACE || "www.amazon.com",
  };
}

const major = (v: string) => parseInt(v.split(".")[0], 10);
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
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", scope }).toString(),
    cache: "no-store",
  });
  if (!resp.ok) throw new Error(`token ${resp.status}: ${await resp.text()}`);
  const json = (await resp.json()) as { access_token: string; expires_in: number };
  cached = { token: json.access_token, exp: now + (json.expires_in - 60) * 1000 };
  return cached.token;
}

export interface LiveItem {
  asin: string;
  title?: string;
  image?: string;
  price?: string;
  available?: string;
}

function parseItem(item: any): LiveItem {
  const listing = item?.offersV2?.listings?.[0];
  return {
    asin: item?.asin,
    title: item?.itemInfo?.title?.displayValue,
    image: item?.images?.primary?.large?.url || item?.images?.primary?.medium?.url,
    price: listing?.price?.money?.displayAmount || listing?.price?.displayAmount || listing?.price?.amount?.toString(),
    available: listing?.availability?.message,
  };
}

export async function getItems(
  itemIds: string[],
  resources: string[] = ["itemInfo.title", "images.primary.large", "offersV2.listings.price", "offersV2.listings.availability"]
): Promise<LiveItem[]> {
  const c = loadCreds();
  if (!c || itemIds.length === 0) return [];
  const token = await getToken(c);
  const auth = major(c.version) >= 3 ? `Bearer ${token}` : `Bearer ${token}, Version ${c.version}`;
  const resp = await fetch(`${CATALOG_BASE}/getItems`, {
    method: "POST",
    headers: { Authorization: auth, "x-marketplace": c.marketplace, "Content-Type": "application/json" },
    body: JSON.stringify({ partnerTag: c.partnerTag, marketplace: c.marketplace, itemIds, resources }),
    cache: "no-store",
  });
  if (!resp.ok) throw new Error(`getItems ${resp.status}: ${await resp.text()}`);
  const json = await resp.json();
  return (json?.itemsResult?.items || json?.items || []).map(parseItem);
}
