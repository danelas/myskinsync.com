// Quick credential check for the Amazon Creators API. Run after setting AMAZON_*:
//   cd agent && npm run amazon:test
// Prints a single search result so you can confirm auth + eligibility work before
// running the full catalog sync. Use DEBUG=1 to see the raw API response.
import dotenv from "dotenv";
dotenv.config({ override: true });

import { searchItems } from "./creators-api.ts";

async function main() {
  console.log("Testing Amazon Creators API credentials…");
  const items = await searchItems("CeraVe Moisturizing Cream", undefined, { itemCount: 1 });
  if (!items.length) {
    console.log("Auth worked but no items returned — try a different keyword or check eligibility.");
    return;
  }
  console.log("✓ Success! Sample result:");
  console.log(JSON.stringify(items[0], null, 2));
}

main().catch((e) => {
  console.error("✗ Failed:", e.message);
  process.exit(1);
});
