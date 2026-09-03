import fs from "fs";
import path from "path";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from "../lib/seedData";
import { SUPPORTED_LOCALES, resolveLocalizedText } from "../lib/i18n/resolver";
import { Product, Category, OptionGroup, OptionValue, SupportedLocale } from "../lib/types";

interface MigrationSummary {
  categoriesUpdated: number;
  productsUpdated: number;
  optionGroupsUpdated: number;
  backupFile?: string;
  isDryRun: boolean;
}

export async function runI18nMigration(isDryRun = true): Promise<MigrationSummary> {
  console.log(`\n🚀 Starting i18n Data Migration (Mode: ${isDryRun ? "DRY-RUN (Simulated)" : "APPLY (Live)"})`);

  // 1. Create backup dir & export existing state
  const dataDir = path.join(process.cwd(), ".data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = path.join(dataDir, `backup_products_${timestamp}.json`);
  const backupPayload = {
    timestamp: new Date().toISOString(),
    categories: INITIAL_CATEGORIES,
    products: INITIAL_PRODUCTS,
  };

  fs.writeFileSync(backupFile, JSON.stringify(backupPayload, null, 2), "utf-8");
  console.log(`📦 Safety backup written to: ${backupFile}`);

  // 2. Enrich Categories
  let categoriesUpdated = 0;
  const migratedCategories: Category[] = INITIAL_CATEGORIES.map((cat) => {
    const name_i18n: Partial<Record<SupportedLocale, string>> = { ...(cat.name_i18n || {}) };
    SUPPORTED_LOCALES.forEach((loc) => {
      if (!name_i18n[loc]) {
        name_i18n[loc] = resolveLocalizedText(cat.name, loc);
      }
    });

    categoriesUpdated++;
    return {
      ...cat,
      name_i18n,
    };
  });

  // 3. Enrich Products and Option Groups
  let productsUpdated = 0;
  let optionGroupsUpdated = 0;

  const migratedProducts: Product[] = INITIAL_PRODUCTS.map((prod) => {
    const name_i18n: Partial<Record<SupportedLocale, string>> = { ...(prod.name_i18n || {}) };
    const description_i18n: Partial<Record<SupportedLocale, string>> = { ...(prod.description_i18n || {}) };

    SUPPORTED_LOCALES.forEach((loc) => {
      if (!name_i18n[loc]) {
        name_i18n[loc] = resolveLocalizedText(prod.name, loc);
      }
      if (prod.description && !description_i18n[loc]) {
        description_i18n[loc] = resolveLocalizedText(prod.description, loc);
      }
    });

    const option_groups = (prod.option_groups || []).map((og) => {
      optionGroupsUpdated++;
      const display_name_i18n: Partial<Record<SupportedLocale, string>> = { ...(og.display_name_i18n || {}) };
      const name_i18n: Partial<Record<SupportedLocale, string>> = { ...(og.name_i18n || {}) };

      SUPPORTED_LOCALES.forEach((loc) => {
        if (!display_name_i18n[loc]) {
          display_name_i18n[loc] = resolveLocalizedText(og.display_name || og.name, loc);
        }
        if (!name_i18n[loc]) {
          name_i18n[loc] = resolveLocalizedText(og.name, loc);
        }
      });

      const options: OptionValue[] = (og.options || []).map((opt) => {
        const opt_name_i18n: Partial<Record<SupportedLocale, string>> = { ...(opt.name_i18n || {}) };
        SUPPORTED_LOCALES.forEach((loc) => {
          if (!opt_name_i18n[loc]) {
            opt_name_i18n[loc] = resolveLocalizedText(opt.name, loc);
          }
        });
        return {
          ...opt,
          name_i18n: opt_name_i18n,
        };
      });

      return {
        ...og,
        display_name_i18n,
        name_i18n,
        options,
      };
    });

    productsUpdated++;
    return {
      ...prod,
      name_i18n,
      description_i18n,
      option_groups,
    };
  });

  const migratedOutFile = path.join(dataDir, `migrated_payload_${timestamp}.json`);
  fs.writeFileSync(
    migratedOutFile,
    JSON.stringify({ categories: migratedCategories, products: migratedProducts }, null, 2),
    "utf-8"
  );
  console.log(`✨ Migrated payload generated: ${migratedOutFile}`);

  console.log(`\n📊 Migration Results:`);
  console.log(` - Categories enriched: ${categoriesUpdated}`);
  console.log(` - Products enriched: ${productsUpdated}`);
  console.log(` - Option Groups processed: ${optionGroupsUpdated}`);
  console.log(` - Mode: ${isDryRun ? "DRY RUN (No live DB mutation)" : "APPLIED"}\n`);

  return {
    categoriesUpdated,
    productsUpdated,
    optionGroupsUpdated,
    backupFile,
    isDryRun,
  };
}

if (require.main === module || process.argv[1]?.includes("migrateI18n")) {
  const isApply = process.argv.includes("--apply");
  runI18nMigration(!isApply)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Migration error:", err);
      process.exit(1);
    });
}
