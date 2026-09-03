import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  IC_DOLGU_CIKOLATA_SECIMI,
  TATLI_KRUVASAN_SECIMI,
} from "../lib/seedData";
import {
  UI_TRANSLATIONS,
  OPTION_GROUP_TRANSLATIONS,
  OPTION_ITEM_TRANSLATIONS,
  CATEGORY_TRANSLATIONS,
  PRODUCT_TRANSLATIONS,
  translateNotice,
} from "../lib/i18n/translations";
import { resolveLocalizedText, resolveProductName, resolveProductDescription } from "../lib/i18n/resolver";
import { OptionGroup, OptionValue, SupportedLocale } from "../lib/types";

const WHITELISTED_IDENTICAL_TERMS = new Set([
  "noa",
  "nutella",
  "lotus",
  "oreo",
  "san sebastian",
  "croissant",
  "waffle",
  "latte",
  "espresso",
  "americano",
  "flat white",
  "cappuccino",
  "cortado",
  "macchiato",
  "mocha",
  "white chocolate mocha",
  "chai tea latte",
  "matcha latte",
  "iced americano",
  "iced latte",
  "iced mocha",
  "iced white chocolate mocha",
  "iced chai tea latte",
  "iced matcha latte",
  "cold brew",
  "affogato",
  "espresso tonic",
  "double espresso",
  "single shot",
  "double shot",
  "pain au chocolat",
  "pain suisse",
  "danish",
  "twissy",
  "amora",
  "roll",
  "cheesecake",
  "churchill",
  "uludağ",
  "uludağ frutti",
  "uludağ frutti (20 cl.)",
  "uludağ frutti extra",
  "uludağ frutti extra (25 cl.)",
  "coca-cola",
  "coca-cola zero",
  "fanta",
  "sprite",
  "fuse tea",
  "red bull",
  "damla minera",
  "su",
  "soda",
  "tamek",
  "frutti",
  "guacamole",
  "mozzarella",
  "cheddar",
  "pesto",
  "labne",
  "avokado",
  "mango",
  "hot dog",
  "t-01",
  "t-02",
  "t-03",
]);

function isWhitelisted(val: string): boolean {
  const clean = val.toLowerCase().trim();
  if (WHITELISTED_IDENTICAL_TERMS.has(clean)) return true;
  for (const term of WHITELISTED_IDENTICAL_TERMS) {
    if (clean === term || clean.startsWith(term + " ") || clean.endsWith(" " + term)) {
      return true;
    }
  }
  return false;
}

export function runLanguageAudit(targetLocale: SupportedLocale): boolean {
  console.log(`=========================================`);
  console.log(`   AUDIT FOR LOCALE: [${targetLocale.toUpperCase()}]`);
  console.log(`=========================================\n`);

  // 1. Gather all option groups and options
  const allOptionGroups: OptionGroup[] = [IC_DOLGU_CIKOLATA_SECIMI, TATLI_KRUVASAN_SECIMI].filter(Boolean);
  INITIAL_PRODUCTS.forEach((p) => {
    (p.option_groups || []).forEach((og) => {
      if (og && !allOptionGroups.some((g) => g && (g.id === og.id || g.name === og.name))) {
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

  let productsMissing: string[] = [];
  let categoriesMissing: string[] = [];
  let categoryNoticesMissing: string[] = [];
  let optionGroupsMissing: string[] = [];
  let optionsMissing: string[] = [];
  let staticUIKeysMissing: string[] = [];
  let legacyTurkishFallbacks: string[] = [];
  let legacyEnglishFallbacks: string[] = [];
  let suspiciousTrIdentical: string[] = [];

  const CATEGORY_NOTICES: Record<string, string> = {
    "roll-kruvasan": "SİLİNDİRİK FRANSIZ ROLL HAMURU VE AKIŞKAN DOLGU İLE SERVİS EDİLİR.",
    "kup-kruvasan": "GEOMETRİK KÜP FORMUNDA ÖZEL FIRINLANMIŞ KATMANLI KRUVASANLAR.",
    "twissy-kruvasan": "BURGULU ÇITIR TWISSY DOKUSU VE ÖZEL KAPLAMALAR.",
    "danish-kruvasan": "TAZE BAHÇE MEYVELERİ VE ÖZEL PASTACI KREMASI İLE HAZIRLANIR.",
    "klasik-tatli-kruvasan": "TÜM KRUVASANLARIMIZ HAKİKİ FRANSIZ TEREYAĞI İLE HER GÜN TAZE PİŞİRİLMEKTEDİR.",
    "amora-kruvasan": "NOA İKONİK KALP FORMUNDA ÖZEL ÇİKOLATALI VE DOLGULU KRUVASANLAR.",
    "noa-menuler": "NOA ÖZEL FORMÜLLÜ SPESİYAL MENÜLER VE KENDİN OLUŞTUR SEÇENEKLERİ.",
    "tuzlu-kruvasanlar": "GÜNLÜK TAZE ÜRETİLMEKTEDİR.",
    "waffle": "10-15 DAKİKA HAZIRLANMA SÜRESİ VARDIR.",
  };

  // Check Category Notices
  Object.entries(CATEGORY_NOTICES).forEach(([slug, notice]) => {
    const locNotice = translateNotice(notice, targetLocale);
    if (!locNotice || locNotice.trim() === "" || locNotice === notice) {
      categoryNoticesMissing.push(`Notice for ${slug}: "${notice}"`);
    }
  });

  // Check Categories
  INITIAL_CATEGORIES.forEach((cat) => {
    const locName = resolveLocalizedText(cat.name_i18n || cat.name, targetLocale);
    if (!locName || locName.trim() === "") {
      categoriesMissing.push(cat.name);
    } else if (locName === cat.name && !isWhitelisted(cat.name)) {
      suspiciousTrIdentical.push(`Category: ${cat.name}`);
    }
  });

  // Check Products
  INITIAL_PRODUCTS.forEach((prod) => {
    const locName = resolveProductName(prod, targetLocale);
    const locDesc = resolveProductDescription(prod, targetLocale);
    const trDesc = prod.description || "";
    const enDesc = resolveProductDescription(prod, "en");

    if (!locName || locName.trim() === "") {
      productsMissing.push(`Name missing for: ${prod.name}`);
    } else if (locName === prod.name && !isWhitelisted(prod.name)) {
      suspiciousTrIdentical.push(`Product Name: ${prod.name}`);
    }

    if (trDesc && (!locDesc || locDesc.trim() === "")) {
      productsMissing.push(`Desc missing for: ${prod.name}`);
    } else if (trDesc && locDesc === trDesc && !isWhitelisted(trDesc)) {
      legacyTurkishFallbacks.push(`Product Desc TR fallback: ${prod.name} -> "${trDesc}"`);
    } else if (
      targetLocale !== "en" &&
      locDesc &&
      enDesc &&
      locDesc === enDesc &&
      locDesc.includes("fresh") &&
      !isWhitelisted(locDesc)
    ) {
      legacyEnglishFallbacks.push(`Product Desc EN fallback: ${prod.name} -> "${locDesc}"`);
    }
  });

  // Check Option Groups
  allOptionGroups.forEach((og) => {
    const nameOrKey = og.display_name_i18n || og.display_name || og.name;
    const locGroup = resolveLocalizedText(nameOrKey, targetLocale);
    const trGroup = og.display_name || og.name;
    if (!locGroup || locGroup.trim() === "") {
      optionGroupsMissing.push(trGroup);
    } else if (locGroup === trGroup && !isWhitelisted(trGroup)) {
      suspiciousTrIdentical.push(`Option Group: ${trGroup}`);
    }
  });

  // Check Options
  allOptions.forEach((opt) => {
    const locOpt = resolveLocalizedText(opt.name_i18n || opt.name, targetLocale);
    if (!locOpt || locOpt.trim() === "") {
      optionsMissing.push(opt.name);
    } else if (locOpt === opt.name && !isWhitelisted(opt.name)) {
      suspiciousTrIdentical.push(`Option Value: ${opt.name}`);
    }
  });

  // Check Static UI Keys
  const trStaticKeys = Object.keys(UI_TRANSLATIONS.tr || {});
  const locDict = UI_TRANSLATIONS[targetLocale] || {};
  trStaticKeys.forEach((key) => {
    if (!locDict[key] || locDict[key].trim() === "") {
      staticUIKeysMissing.push(key);
    }
  });

  console.log(`Products checked: ${INITIAL_PRODUCTS.length}`);
  console.log(`Products missing [${targetLocale}]: ${productsMissing.length}`);
  console.log(`Categories missing [${targetLocale}]: ${categoriesMissing.length}`);
  console.log(`Category notices missing [${targetLocale}]: ${categoryNoticesMissing.length}`);
  console.log(`Option groups missing [${targetLocale}]: ${optionGroupsMissing.length}`);
  console.log(`Options missing [${targetLocale}]: ${optionsMissing.length}`);
  console.log(`Static UI keys missing [${targetLocale}]: ${staticUIKeysMissing.length}`);
  console.log(`Legacy Turkish fallbacks: ${legacyTurkishFallbacks.length}`);
  if (targetLocale !== "en") {
    console.log(`Legacy English fallbacks: ${legacyEnglishFallbacks.length}`);
  }
  console.log(`Suspicious TR/[${targetLocale}] identical values: ${suspiciousTrIdentical.length}`);

  if (productsMissing.length > 0) {
    console.error(`\n❌ Products missing [${targetLocale}]:`, productsMissing);
  }
  if (categoriesMissing.length > 0) {
    console.error(`\n❌ Categories missing [${targetLocale}]:`, categoriesMissing);
  }
  if (categoryNoticesMissing.length > 0) {
    console.error(`\n❌ Category notices missing [${targetLocale}]:`, categoryNoticesMissing);
  }
  if (optionGroupsMissing.length > 0) {
    console.error(`\n❌ Option groups missing [${targetLocale}]:`, optionGroupsMissing);
  }
  if (optionsMissing.length > 0) {
    console.error(`\n❌ Options missing [${targetLocale}]:`, optionsMissing);
  }
  if (staticUIKeysMissing.length > 0) {
    console.error(`\n❌ Static UI keys missing [${targetLocale}]:`, staticUIKeysMissing);
  }
  if (legacyTurkishFallbacks.length > 0) {
    console.error(`\n❌ Legacy Turkish fallbacks:`, legacyTurkishFallbacks);
  }
  if (legacyEnglishFallbacks.length > 0) {
    console.error(`\n❌ Legacy English fallbacks:`, legacyEnglishFallbacks);
  }
  if (suspiciousTrIdentical.length > 0) {
    console.error(`\n❌ Suspicious identical TR/[${targetLocale}]:`, suspiciousTrIdentical);
  }

  const passed =
    productsMissing.length === 0 &&
    categoriesMissing.length === 0 &&
    categoryNoticesMissing.length === 0 &&
    optionGroupsMissing.length === 0 &&
    optionsMissing.length === 0 &&
    staticUIKeysMissing.length === 0 &&
    legacyTurkishFallbacks.length === 0 &&
    legacyEnglishFallbacks.length === 0 &&
    suspiciousTrIdentical.length === 0;

  if (passed) {
    console.log(`Result for [${targetLocale}]: PASS\n`);
    return true;
  } else {
    console.log(`Result for [${targetLocale}]: FAIL\n`);
    return false;
  }
}

export function runAllLanguagesAudit(): boolean {
  const languages: SupportedLocale[] = ["en", "de", "ru", "nl", "sv", "no", "fi", "pl", "ar"];
  const targetArg = process.argv[2] as SupportedLocale | undefined;

  if (targetArg && languages.includes(targetArg)) {
    const ok = runLanguageAudit(targetArg);
    return ok;
  }

  console.log(`Running complete i18n audit across all ${languages.length} non-Turkish locales...\n`);
  let allPassed = true;
  const failedLangs: string[] = [];

  for (const lang of languages) {
    const ok = runLanguageAudit(lang);
    if (!ok) {
      allPassed = false;
      failedLangs.push(lang);
    }
  }

  console.log("=========================================");
  if (allPassed) {
    console.log("🏆 ALL 9 LOCALES PASSED AUDIT WITH 100% COMPLETENESS!");
  } else {
    console.error(`❌ FAILED LOCALES: ${failedLangs.join(", ")}`);
  }
  console.log("=========================================\n");

  return allPassed;
}

if (require.main === module) {
  const success = runAllLanguagesAudit();
  if (!success) {
    process.exit(1);
  }
}
