import fs from "fs";
import path from "path";
import { PRODUCT_IMAGES, BRAND_ASSETS } from "../lib/images";
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from "../lib/seedData";

const PUBLIC_DIR = path.join(process.cwd(), "public");

interface Issue {
  type: "IMAGE_NOT_FOUND" | "BROKEN_LINK" | "INVALID_URL";
  source: string;
  target: string;
  details?: string;
}

const issues: Issue[] = [];

console.log("=========================================");
console.log("🔍 COMPREHENSIVE LINK & IMAGE AUDIT");
console.log("=========================================\n");

// 1. Audit BRAND_ASSETS in lib/images.ts
console.log("1. Auditing BRAND_ASSETS...");
for (const [key, assetPath] of Object.entries(BRAND_ASSETS)) {
  if (typeof assetPath === "string" && assetPath.startsWith("/")) {
    const fullPath = path.join(PUBLIC_DIR, assetPath.replace(/^\//, ""));
    if (!fs.existsSync(fullPath)) {
      issues.push({
        type: "IMAGE_NOT_FOUND",
        source: `BRAND_ASSETS.${key}`,
        target: assetPath,
        details: `File does not exist: ${fullPath}`,
      });
    }
  }
}

// 2. Audit PRODUCT_IMAGES in lib/images.ts
console.log("2. Auditing PRODUCT_IMAGES registry...");
for (const [slug, meta] of Object.entries(PRODUCT_IMAGES)) {
  if (meta.src && meta.src.startsWith("/")) {
    const fullPath = path.join(PUBLIC_DIR, meta.src.replace(/^\//, ""));
    if (!fs.existsSync(fullPath)) {
      issues.push({
        type: "IMAGE_NOT_FOUND",
        source: `PRODUCT_IMAGES['${slug}'].src`,
        target: meta.src,
        details: `File does not exist: ${fullPath}`,
      });
    }
  }
  if (meta.variantImages) {
    for (const [varKey, varSrc] of Object.entries(meta.variantImages)) {
      if (varSrc && varSrc.startsWith("/")) {
        const fullPath = path.join(PUBLIC_DIR, varSrc.replace(/^\//, ""));
        if (!fs.existsSync(fullPath)) {
          issues.push({
            type: "IMAGE_NOT_FOUND",
            source: `PRODUCT_IMAGES['${slug}'].variantImages['${varKey}']`,
            target: varSrc,
            details: `File does not exist: ${fullPath}`,
          });
        }
      }
    }
  }
}

// 3. Audit all INITIAL_PRODUCTS image_url in lib/seedData.ts
console.log("3. Auditing INITIAL_PRODUCTS in seedData.ts...");
let activeProductCount = 0;
let totalProductCount = INITIAL_PRODUCTS.length;

for (const prod of INITIAL_PRODUCTS) {
  if (prod.is_active !== false && prod.is_available !== false) {
    activeProductCount++;
  }
  if (prod.image_url) {
    if (prod.image_url.startsWith("/")) {
      const cleanPath = prod.image_url.split("?")[0].replace(/^\//, "");
      const fullPath = path.join(PUBLIC_DIR, cleanPath);
      if (!fs.existsSync(fullPath)) {
        issues.push({
          type: "IMAGE_NOT_FOUND",
          source: `Product '${prod.name}' (${prod.id}) [active=${prod.is_active}, available=${prod.is_available}]`,
          target: prod.image_url,
          details: `File does not exist: ${fullPath}`,
        });
      }
    }
  } else {
    // If active large/visual product and has no image_url
    if (prod.is_active !== false && prod.is_available !== false && prod.card_density === "large") {
      issues.push({
        type: "IMAGE_NOT_FOUND",
        source: `Product '${prod.name}' (${prod.id}) [card_density=large]`,
        target: "EMPTY_IMAGE_URL",
        details: "Active visual product has no image_url assigned",
      });
    }
  }

  // Check option images if any
  if (prod.option_groups) {
    for (const group of prod.option_groups) {
      for (const opt of group.options) {
        if (opt.image_url && opt.image_url.startsWith("/")) {
          const cleanPath = opt.image_url.split("?")[0].replace(/^\//, "");
          const fullPath = path.join(PUBLIC_DIR, cleanPath);
          if (!fs.existsSync(fullPath)) {
            issues.push({
              type: "IMAGE_NOT_FOUND",
              source: `Product '${prod.name}' Option '${opt.name}'`,
              target: opt.image_url,
              details: `File does not exist: ${fullPath}`,
            });
          }
        }
      }
    }
  }
}

// 4. Scan all TSX/TS files in app/ and components/ for image paths and href links
console.log("4. Scanning JSX/TSX source files for hardcoded image paths and links...");
function scanDir(dir: string, ext: string[]): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(scanDir(full, ext));
    } else if (ext.some((e) => file.endsWith(e))) {
      results.push(full);
    }
  });
  return results;
}

const sourceFiles = [
  ...scanDir(path.join(process.cwd(), "app"), [".tsx", ".ts"]),
  ...scanDir(path.join(process.cwd(), "components"), [".tsx", ".ts"]),
];

const srcRegex = /src=["'](\/[^"']+\.(jpg|jpeg|png|webp|svg|ico))["']/g;
const hrefRegex = /href=["'](\/[^"']*)["']/g;

for (const file of sourceFiles) {
  const content = fs.readFileSync(file, "utf-8");
  const relPath = path.relative(process.cwd(), file);

  // Check static image sources
  let match: RegExpExecArray | null;
  while ((match = srcRegex.exec(content)) !== null) {
    const imgPath = match[1];
    const cleanPath = imgPath.split("?")[0].replace(/^\//, "");
    const fullPath = path.join(PUBLIC_DIR, cleanPath);
    if (!fs.existsSync(fullPath)) {
      issues.push({
        type: "IMAGE_NOT_FOUND",
        source: `${relPath}: src="${imgPath}"`,
        target: imgPath,
        details: `File not found in public/: ${fullPath}`,
      });
    }
  }

  // Check internal href links
  while ((match = hrefRegex.exec(content)) !== null) {
    const href = match[1].split("?")[0].split("#")[0];
    if (href === "" || href === "/") continue;
    
    // Check if it's a public static file
    if (href.match(/\.(jpg|jpeg|png|webp|svg|ico|webmanifest|xml|txt)$/)) {
      const cleanPath = href.replace(/^\//, "");
      const fullPath = path.join(PUBLIC_DIR, cleanPath);
      const appRoutePath1 = path.join(process.cwd(), "app", cleanPath, "route.ts");
      const appRoutePath2 = path.join(process.cwd(), "app", cleanPath.replace(/\.[^.]+$/, ""), "route.ts");
      const appPagePath = path.join(process.cwd(), "app", cleanPath, "page.tsx");
      if (!fs.existsSync(fullPath) && !fs.existsSync(appRoutePath1) && !fs.existsSync(appRoutePath2) && !fs.existsSync(appPagePath)) {
        issues.push({
          type: "BROKEN_LINK",
          source: `${relPath}: href="${match[1]}"`,
          target: href,
          details: `Target static file or route not found`,
        });
      }
    } else {
      // It's an internal route like /menu, /admin, /mutfak, /hakkimizda
      const routeDir = path.join(process.cwd(), "app", href.replace(/^\//, ""));
      const routePage = path.join(routeDir, "page.tsx");
      const routePageTs = path.join(routeDir, "page.ts");
      const routeFile = path.join(routeDir, "route.ts");
      if (!fs.existsSync(routePage) && !fs.existsSync(routePageTs) && !fs.existsSync(routeFile) && !href.includes("[") && !href.startsWith("/siparis/")) {
        issues.push({
          type: "BROKEN_LINK",
          source: `${relPath}: href="${match[1]}"`,
          target: href,
          details: `Route page not found: ${routePage}`,
        });
      }
    }
  }
}

// 5. Audit Results Summary
console.log("\n=========================================");
console.log(`   TOTAL ACTIVE PRODUCTS AUDITED: ${activeProductCount}`);
console.log(`   TOTAL PRODUCTS IN DATABASE:    ${totalProductCount}`);
console.log(`   TOTAL REGISTERED IMAGES:       ${Object.keys(PRODUCT_IMAGES).length}`);
console.log(`   TOTAL ISSUES DETECTED:         ${issues.length}`);
console.log("=========================================\n");

if (issues.length > 0) {
  console.log("❌ ISSUES FOUND:");
  issues.forEach((iss, idx) => {
    console.log(`\n[#${idx + 1}] ${iss.type}`);
    console.log(`   Source:  ${iss.source}`);
    console.log(`   Target:  ${iss.target}`);
    if (iss.details) console.log(`   Details: ${iss.details}`);
  });
  process.exit(1);
} else {
  console.log("✅ ALL ASSETS, IMAGES & LINKS ARE 100% VALID! ZERO BROKEN REFERENCES.");
  process.exit(0);
}
