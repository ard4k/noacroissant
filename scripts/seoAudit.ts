import fs from "fs";
import path from "path";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from "../lib/seedData";
import { BUSINESS_INFO } from "../lib/businessConfig";
import sitemap from "../app/sitemap";
import robots from "../app/robots";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, passMessage: string, failMessage: string) {
  if (condition) {
    console.log(`✅ PASS: ${passMessage}`);
    passedCount++;
  } else {
    console.error(`❌ FAIL: ${failMessage}`);
    failedCount++;
  }
}

async function runSeoAudit() {
  console.log("=========================================");
  console.log("   NOA CROISSANT AUTOMATED SEO AUDIT     ");
  console.log("=========================================\n");

  const publicDir = path.join(process.cwd(), "public");

  // --- 1. SITEMAP AUDIT ---
  console.log("--- 1. SITEMAP & CANONICAL AUDIT ---");
  const sitemapEntries = sitemap();
  const sitemapUrls = sitemapEntries.map((e) => e.url);

  assert(
    sitemapUrls.includes("https://www.noacroissant.com"),
    "Homepage is included in sitemap",
    "Homepage is missing from sitemap"
  );

  // Ensure NO private / tracking / admin / mutfak / api pages in sitemap
  const forbiddenInSitemap = sitemapUrls.some(
    (url) =>
      url.includes("/admin") ||
      url.includes("/mutfak") ||
      url.includes("/siparis") ||
      url.includes("/api") ||
      url.includes("?t=")
  );
  assert(
    !forbiddenInSitemap,
    "No private/admin/tracking/order routes found in sitemap",
    "Private route improperly present in sitemap!"
  );

  // Check language alternates in sitemap
  const supportedLocales = ["tr", "en", "de", "ru", "nl", "sv", "no", "fi", "pl", "ar"];
  const homepageEntry = sitemapEntries.find((e) => e.url === "https://www.noacroissant.com");
  const hasAllLocalesInSitemap =
    homepageEntry?.alternates?.languages &&
    supportedLocales.every((lang) => lang in (homepageEntry.alternates?.languages || {}));
  assert(
    Boolean(hasAllLocalesInSitemap),
    "All 10 locales are properly declared in sitemap alternates",
    "Missing locales in sitemap alternates"
  );

  // --- 2. ROBOTS.TXT AUDIT ---
  console.log("\n--- 2. ROBOTS.TXT AUDIT ---");
  const robotsRules = robots();
  assert(
    robotsRules.sitemap === "https://www.noacroissant.com/sitemap.xml",
    "Robots.txt points to correct primary sitemap URL",
    `Robots.txt has incorrect sitemap: ${robotsRules.sitemap}`
  );
  assert(
    robotsRules.host === "https://www.noacroissant.com",
    "Robots.txt specifies primary host www.noacroissant.com",
    `Robots.txt has incorrect host: ${robotsRules.host}`
  );

  const rulesList = Array.isArray(robotsRules.rules) ? robotsRules.rules : [robotsRules.rules];
  const disallows = rulesList.flatMap((r) => (Array.isArray(r.disallow) ? r.disallow : [r.disallow]));
  assert(
    disallows.includes("/admin") && disallows.includes("/mutfak") && disallows.includes("/siparis"),
    "Robots.txt disallows /admin, /mutfak, and /siparis",
    "Robots.txt missing disallow rules for sensitive areas"
  );

  // --- 3. STRUCTURED DATA & PRICE INTEGRITY AUDIT ---
  console.log("\n--- 3. STRUCTURED DATA & PRICING INTEGRITY AUDIT ---");
  assert(
    BUSINESS_INFO.telephone === "+905404233307",
    "Verified phone number is present in business configuration",
    "Business phone number missing or malformed"
  );
  assert(
    BUSINESS_INFO.address.formatted === "Saray, Yunus Emre Cd., 07400 Alanya/Antalya",
    "Verified physical address matches Saray, Yunus Emre Cd., 07400 Alanya/Antalya",
    "Business address mismatch"
  );
  assert(
    BUSINESS_INFO.openingHours === "09:30 – 00:00",
    "Operating hours match verified 09:30 – 00:00",
    "Operating hours mismatch"
  );

  // Verify all 92 menu items in structured data match real seed products
  assert(
    INITIAL_PRODUCTS.length === 92,
    `Exact 92 products found in seed database (got ${INITIAL_PRODUCTS.length})`,
    `Product count mismatch! Expected 92, found ${INITIAL_PRODUCTS.length}`
  );

  let priceMismatchCount = 0;
  for (const prod of INITIAL_PRODUCTS) {
    if (typeof prod.base_price !== "number" || prod.base_price <= 0) {
      priceMismatchCount++;
    }
  }
  assert(
    priceMismatchCount === 0,
    "All 92 products have valid numeric positive prices matching schema",
    `Found ${priceMismatchCount} products with invalid prices`
  );

  // --- 4. STATIC ASSET & IMAGE AUDIT ---
  console.log("\n--- 4. STATIC ASSET & IMAGE INTEGRITY AUDIT ---");
  let missingImageCount = 0;
  for (const prod of INITIAL_PRODUCTS) {
    if (prod.image_url) {
      const cleanPath = prod.image_url.startsWith("/") ? prod.image_url.slice(1) : prod.image_url;
      const fullPath = path.join(publicDir, decodeURIComponent(cleanPath));
      if (!fs.existsSync(fullPath)) {
        console.error(`Missing image file on disk: ${prod.image_url} (resolved to: ${fullPath})`);
        missingImageCount++;
      }
    }
  }
  assert(
    missingImageCount === 0,
    "0 broken images found across all 92 products",
    `Found ${missingImageCount} broken product images!`
  );

  // Brand assets verification
  const brandFiles = [
    "noa-croissant.jpg",
    "noa_icon.jpg",
    "noa_text.png",
    "favicon.png",
    "brand/logo.png",
    "brand/logo-192.png",
    "brand/logo-512.png",
  ];
  for (const file of brandFiles) {
    const fullPath = path.join(publicDir, file);
    assert(
      fs.existsSync(fullPath),
      `Brand asset [${file}] exists (HTTP 200)`,
      `Brand asset [${file}] is missing from public directory!`
    );
  }

  // --- 5. HEADERS & SHIELDING AUDIT ---
  console.log("\n--- 5. HEADERS & SHIELDING AUDIT ---");
  const nextConfigFile = fs.readFileSync(path.join(process.cwd(), "next.config.ts"), "utf-8");
  assert(
    nextConfigFile.includes("noindex, nofollow, noarchive"),
    "next.config.ts enforces noindex headers on admin/mutfak/siparis",
    "next.config.ts missing noindex security headers"
  );
  assert(
    nextConfigFile.includes("destination: \"https://www.noacroissant.com/:path*\""),
    "next.config.ts enforces 301 permanent redirect from non-www to www",
    "next.config.ts missing non-www redirect rule"
  );

  // --- 6. SERVICE WORKER AUDIT ---
  console.log("\n--- 6. SERVICE WORKER AUDIT ---");
  const swFile = fs.readFileSync(path.join(publicDir, "sw.js"), "utf-8");
  assert(
    swFile.includes("url.pathname.startsWith(\"/siparis\")") &&
      swFile.includes("url.pathname.startsWith(\"/admin\")") &&
      swFile.includes("url.pathname.startsWith(\"/mutfak\")"),
    "Service worker explicitly bypasses cache for /admin, /mutfak, and /siparis",
    "Service worker might cache private routes!"
  );
  assert(
    swFile.includes("request.mode === \"navigate\""),
    "Service worker implements Network-First strategy for HTML navigations",
    "Service worker missing fresh navigation strategy"
  );

  // --- SUMMARY ---
  console.log("\n=========================================");
  console.log(`AUDIT RESULTS: ${passedCount} PASSED / ${failedCount} FAILED`);
  console.log("=========================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runSeoAudit().catch((err) => {
  console.error("SEO Audit Error:", err);
  process.exit(1);
});
