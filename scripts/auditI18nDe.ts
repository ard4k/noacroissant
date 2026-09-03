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

export function runGermanAudit(): boolean {
  const targetLocale: SupportedLocale = "de";
  console.log(`German (${targetLocale}) translation audit\n`);

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

  let productsMissingDe: string[] = [];
  let categoriesMissingDe: string[] = [];
  let categoryNoticesMissingDe: string[] = [];
  let optionGroupsMissingDe: string[] = [];
  let optionsMissingDe: string[] = [];
  let staticUIKeysMissingDe: string[] = [];
  let legacyTurkishFallbacks: string[] = [];
  let legacyEnglishFallbacks: string[] = [];
  let suspiciousTrDeIdentical: string[] = [];

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
    const deNotice = translateNotice(notice, targetLocale);
    if (!deNotice || deNotice.trim() === "" || deNotice === notice) {
      categoryNoticesMissingDe.push(`Notice for ${slug}: "${notice}"`);
    }
  });

  // Check Categories
  INITIAL_CATEGORIES.forEach((cat) => {
    const deName = resolveLocalizedText(cat.name_i18n || cat.name, targetLocale);
    if (!deName || deName.trim() === "") {
      categoriesMissingDe.push(cat.name);
    } else if (deName === cat.name && !isWhitelisted(cat.name)) {
      suspiciousTrDeIdentical.push(`Category: ${cat.name}`);
    }
  });

  // Check Products
  INITIAL_PRODUCTS.forEach((prod) => {
    const deName = resolveProductName(prod, targetLocale);
    const deDesc = resolveProductDescription(prod, targetLocale);
    const trDesc = prod.description || "";
    const enDesc = resolveProductDescription(prod, "en");

    if (!deName || deName.trim() === "") {
      productsMissingDe.push(`Name missing for: ${prod.name}`);
    } else if (deName === prod.name && !isWhitelisted(prod.name)) {
      suspiciousTrDeIdentical.push(`Product Name: ${prod.name}`);
    }

    if (trDesc && (!deDesc || deDesc.trim() === "")) {
      productsMissingDe.push(`Desc missing for: ${prod.name}`);
    } else if (trDesc && deDesc === trDesc && !isWhitelisted(trDesc)) {
      legacyTurkishFallbacks.push(`Product Desc TR fallback: ${prod.name} -> "${trDesc}"`);
    } else if (deDesc && enDesc && deDesc === enDesc && deDesc.includes("fresh") && !isWhitelisted(deDesc)) {
      legacyEnglishFallbacks.push(`Product Desc EN fallback: ${prod.name} -> "${deDesc}"`);
    }
  });

  // Check Option Groups
  allOptionGroups.forEach((og) => {
    const nameOrKey = og.display_name_i18n || og.display_name || og.name;
    const deGroup = resolveLocalizedText(nameOrKey, targetLocale);
    const trGroup = og.display_name || og.name;
    if (!deGroup || deGroup.trim() === "") {
      optionGroupsMissingDe.push(trGroup);
    } else if (deGroup === trGroup && !isWhitelisted(trGroup)) {
      suspiciousTrDeIdentical.push(`Option Group: ${trGroup}`);
    }
  });

  // Check Options
  allOptions.forEach((opt) => {
    const deOpt = resolveLocalizedText(opt.name_i18n || opt.name, targetLocale);
    if (!deOpt || deOpt.trim() === "") {
      optionsMissingDe.push(opt.name);
    } else if (deOpt === opt.name && !isWhitelisted(opt.name)) {
      suspiciousTrDeIdentical.push(`Option Value: ${opt.name}`);
    }
  });

  // Check Static UI Keys
  const trStaticKeys = Object.keys(UI_TRANSLATIONS.tr || {});
  const deDict = UI_TRANSLATIONS.de || {};
  trStaticKeys.forEach((key) => {
    if (!deDict[key] || deDict[key].trim() === "") {
      staticUIKeysMissingDe.push(key);
    }
  });

  console.log(`Products checked: ${INITIAL_PRODUCTS.length}`);
  console.log(`Products missing German: ${productsMissingDe.length}`);
  console.log(`Categories missing German: ${categoriesMissingDe.length}`);
  console.log(`Category notices missing German: ${categoryNoticesMissingDe.length}`);
  console.log(`Option groups missing German: ${optionGroupsMissingDe.length}`);
  console.log(`Options missing German: ${optionsMissingDe.length}`);
  console.log(`Static UI keys missing German: ${staticUIKeysMissingDe.length}`);
  console.log(`Legacy Turkish fallbacks: ${legacyTurkishFallbacks.length}`);
  console.log(`Legacy English fallbacks: ${legacyEnglishFallbacks.length}`);
  console.log(`Suspicious TR/DE identical values: ${suspiciousTrDeIdentical.length}`);

  if (productsMissingDe.length > 0) {
    console.error("\n❌ Products missing German:", productsMissingDe);
  }
  if (categoriesMissingDe.length > 0) {
    console.error("\n❌ Categories missing German:", categoriesMissingDe);
  }
  if (categoryNoticesMissingDe.length > 0) {
    console.error("\n❌ Category notices missing German:", categoryNoticesMissingDe);
  }
  if (optionGroupsMissingDe.length > 0) {
    console.error("\n❌ Option groups missing German:", optionGroupsMissingDe);
  }
  if (optionsMissingDe.length > 0) {
    console.error("\n❌ Options missing German:", optionsMissingDe);
  }
  if (staticUIKeysMissingDe.length > 0) {
    console.error("\n❌ Static UI keys missing German:", staticUIKeysMissingDe);
  }
  if (legacyTurkishFallbacks.length > 0) {
    console.error("\n❌ Legacy Turkish fallbacks:", legacyTurkishFallbacks);
  }
  if (legacyEnglishFallbacks.length > 0) {
    console.error("\n❌ Legacy English fallbacks:", legacyEnglishFallbacks);
  }
  if (suspiciousTrDeIdentical.length > 0) {
    console.error("\n❌ Suspicious identical TR/DE:", suspiciousTrDeIdentical);
  }

  const passed =
    productsMissingDe.length === 0 &&
    categoriesMissingDe.length === 0 &&
    categoryNoticesMissingDe.length === 0 &&
    optionGroupsMissingDe.length === 0 &&
    optionsMissingDe.length === 0 &&
    staticUIKeysMissingDe.length === 0 &&
    legacyTurkishFallbacks.length === 0 &&
    legacyEnglishFallbacks.length === 0 &&
    suspiciousTrDeIdentical.length === 0;

  if (passed) {
    console.log("Result: PASS");
    return true;
  } else {
    console.log("Result: FAIL");
    return false;
  }
}

if (require.main === module) {
  const success = runGermanAudit();
  if (!success) {
    process.exit(1);
  }
}
