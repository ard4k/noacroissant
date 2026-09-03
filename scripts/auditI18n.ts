import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, IC_DOLGU_CIKOLATA_SECIMI, TATLI_KRUVASAN_SECIMI } from "../lib/seedData";
import { UI_TRANSLATIONS, OPTION_GROUP_TRANSLATIONS, OPTION_ITEM_TRANSLATIONS, CATEGORY_TRANSLATIONS, PRODUCT_TRANSLATIONS } from "../lib/i18n/translations";
import { SUPPORTED_LOCALES, resolveLocalizedText } from "../lib/i18n/resolver";
import { SupportedLocale, OptionValue, OptionGroup } from "../lib/types";

interface AuditReport {
  totalCategories: number;
  totalProducts: number;
  totalOptionGroups: number;
  totalOptions: number;
  staticKeys: number;
  localeCoverage: Record<
    SupportedLocale,
    {
      categories: { covered: number; total: number; missing: string[] };
      products: { covered: number; total: number; missing: string[] };
      optionGroups: { covered: number; total: number; missing: string[] };
      options: { covered: number; total: number; missing: string[] };
      staticUI: { covered: number; total: number; missing: string[] };
      overallPercentage: number;
    }
  >;
}

export function runI18nAudit(): AuditReport {
  const allOptionGroups: OptionGroup[] = [IC_DOLGU_CIKOLATA_SECIMI, TATLI_KRUVASAN_SECIMI].filter(Boolean);
  INITIAL_PRODUCTS.forEach((p) => {
    (p.option_groups || []).forEach((og) => {
      if (og && !allOptionGroups.some((g) => g && g.id === og.id)) {
        allOptionGroups.push(og);
      }
    });
  });

  const allOptions: OptionValue[] = [];
  allOptionGroups.forEach((og) => {
    (og.options || []).forEach((opt: OptionValue) => {
      if (opt && !allOptions.some((o) => o && o.name === opt.name)) {
        allOptions.push(opt);
      }
    });
  });

  const trStaticKeys = Object.keys(UI_TRANSLATIONS.tr || {});

  const report: AuditReport = {
    totalCategories: INITIAL_CATEGORIES.length,
    totalProducts: INITIAL_PRODUCTS.length,
    totalOptionGroups: allOptionGroups.length,
    totalOptions: allOptions.length,
    staticKeys: trStaticKeys.length,
    localeCoverage: {} as any,
  };

  SUPPORTED_LOCALES.forEach((locale) => {
    // 1. Categories
    const missingCats: string[] = [];
    let coveredCats = 0;
    INITIAL_CATEGORIES.forEach((cat) => {
      const resolved = resolveLocalizedText(cat.name_i18n || cat.name, locale);
      if (locale === "tr" || (resolved && resolved !== cat.name) || (cat.name_i18n && cat.name_i18n[locale])) {
        coveredCats++;
      } else {
        missingCats.push(cat.name);
      }
    });

    // 2. Products
    const missingProds: string[] = [];
    let coveredProds = 0;
    INITIAL_PRODUCTS.forEach((p) => {
      const hasDict = Boolean(
        (p.name_i18n && p.name_i18n[locale]) ||
        PRODUCT_TRANSLATIONS[p.name]?.[locale]?.name ||
        PRODUCT_TRANSLATIONS[p.slug]?.[locale]?.name
      );
      const resolved = resolveLocalizedText(p.name_i18n || p.name, locale);

      if (locale === "tr" || hasDict || (resolved && resolved !== p.name)) {
        coveredProds++;
      } else {
        missingProds.push(p.name);
      }
    });

    // 3. Option Groups
    const missingOG: string[] = [];
    let coveredOG = 0;
    const normalizeKey = (s: string) =>
      s
        .toLocaleLowerCase("tr-TR")
        .replace(/ı/g, "i")
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/[\s\-_/.]+/g, "_");

    allOptionGroups.forEach((og) => {
      const title = og.display_name || og.name;
      const normKey = normalizeKey(title);
      const hasDict = Boolean(
        (og.display_name_i18n && og.display_name_i18n[locale]) ||
        (og.name_i18n && og.name_i18n[locale]) ||
        OPTION_GROUP_TRANSLATIONS[title]?.[locale] ||
        OPTION_GROUP_TRANSLATIONS[normKey]?.[locale] ||
        OPTION_GROUP_TRANSLATIONS[og.id]?.[locale]
      );
      const resolved = resolveLocalizedText(og.display_name_i18n || og.name_i18n || title, locale);

      if (locale === "tr" || hasDict || (resolved && resolved !== title)) {
        coveredOG++;
      } else {
        missingOG.push(title);
      }
    });

    // 4. Options
    const missingOpts: string[] = [];
    let coveredOpts = 0;
    allOptions.forEach((opt) => {
      const hasDict = Boolean(
        (opt.name_i18n && opt.name_i18n[locale]) ||
        OPTION_ITEM_TRANSLATIONS[opt.name]?.[locale] ||
        PRODUCT_TRANSLATIONS[opt.name]?.[locale]?.name
      );
      const resolved = resolveLocalizedText(opt.name_i18n || opt.name, locale);

      if (locale === "tr" || hasDict || (resolved && resolved !== opt.name)) {
        coveredOpts++;
      } else {
        missingOpts.push(opt.name);
      }
    });

    // 5. Static UI
    const missingStatic: string[] = [];
    let coveredStatic = 0;
    const localeDict = UI_TRANSLATIONS[locale] || {};
    trStaticKeys.forEach((key) => {
      if (locale === "tr" || localeDict[key]) {
        coveredStatic++;
      } else {
        missingStatic.push(key);
      }
    });

    const totalElements =
      INITIAL_CATEGORIES.length +
      INITIAL_PRODUCTS.length +
      allOptionGroups.length +
      allOptions.length +
      trStaticKeys.length;

    const totalCovered = coveredCats + coveredProds + coveredOG + coveredOpts + coveredStatic;
    const percentage = Number(((totalCovered / totalElements) * 100).toFixed(1));

    report.localeCoverage[locale] = {
      categories: { covered: coveredCats, total: INITIAL_CATEGORIES.length, missing: missingCats },
      products: { covered: coveredProds, total: INITIAL_PRODUCTS.length, missing: missingProds },
      optionGroups: { covered: coveredOG, total: allOptionGroups.length, missing: missingOG },
      options: { covered: coveredOpts, total: allOptions.length, missing: missingOpts },
      staticUI: { covered: coveredStatic, total: trStaticKeys.length, missing: missingStatic },
      overallPercentage: percentage,
    };
  });

  return report;
}

// Run if called via CLI
if (require.main === module || process.argv[1]?.includes("auditI18n")) {
  console.log("=================================================");
  console.log("  🌍 NOA CROISSANT - MULTILINGUAL i18n AUDIT     ");
  console.log("=================================================\n");

  const report = runI18nAudit();
  console.log(`📦 Domain Stats:`);
  console.log(` - Categories: ${report.totalCategories}`);
  console.log(` - Products: ${report.totalProducts}`);
  console.log(` - Option Groups: ${report.totalOptionGroups}`);
  console.log(` - Options: ${report.totalOptions}`);
  console.log(` - Static UI Keys: ${report.staticKeys}\n`);

  console.log("📊 Coverage by Locale:");
  console.log("-------------------------------------------------");
  SUPPORTED_LOCALES.forEach((loc) => {
    const data = report.localeCoverage[loc];
    const flag =
      loc === "tr" ? "🇹🇷" :
      loc === "en" ? "🇬🇧" :
      loc === "de" ? "🇩🇪" :
      loc === "ru" ? "🇷🇺" :
      loc === "nl" ? "🇳🇱" :
      loc === "sv" ? "🇸🇪" :
      loc === "no" ? "🇳🇴" :
      loc === "fi" ? "🇫🇮" :
      loc === "pl" ? "🇵🇱" : "🇸🇦";

    console.log(
      `${flag} [${loc.toUpperCase()}] Overall: ${data.overallPercentage}% | UI: ${data.staticUI.covered}/${data.staticUI.total} | Products: ${data.products.covered}/${data.products.total} | Options: ${data.options.covered}/${data.options.total}`
    );
  });
  console.log("-------------------------------------------------\n");

  console.log("🔍 Missing in English (Option Groups):");
  console.log(report.localeCoverage["en"].optionGroups.missing);
  console.log("\n🔍 Missing in English (Products):");
  console.log(report.localeCoverage["en"].products.missing);
  console.log("\n🔍 Missing in English (Options):");
  console.log(report.localeCoverage["en"].options.missing);
}
