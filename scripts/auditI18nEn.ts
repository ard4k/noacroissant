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
} from "../lib/i18n/translations";
import { resolveLocalizedText, resolveProductName, resolveProductDescription } from "../lib/i18n/resolver";
import { OptionGroup, OptionValue } from "../lib/types";

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

export function runEnglishAudit(): boolean {
  console.log("English translation audit\n");

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

  let productsMissingEn: string[] = [];
  let categoriesMissingEn: string[] = [];
  let optionGroupsMissingEn: string[] = [];
  let optionsMissingEn: string[] = [];
  let staticUIKeysMissingEn: string[] = [];
  let legacyTurkishFallbacks: string[] = [];
  let suspiciousTrEnIdentical: string[] = [];

  // Check Categories
  INITIAL_CATEGORIES.forEach((cat) => {
    const enName = resolveLocalizedText(cat.name_i18n || cat.name, "en");
    if (!enName || enName.trim() === "") {
      categoriesMissingEn.push(cat.name);
    } else if (enName === cat.name && !isWhitelisted(cat.name)) {
      suspiciousTrEnIdentical.push(`Category: ${cat.name}`);
    }
  });

  // Check Products
  INITIAL_PRODUCTS.forEach((prod) => {
    const enName = resolveProductName(prod, "en");
    const enDesc = resolveProductDescription(prod, "en");

    if (!enName || enName.trim() === "") {
      productsMissingEn.push(`Name missing for: ${prod.name}`);
    } else if (enName === prod.name && !isWhitelisted(prod.name)) {
      suspiciousTrEnIdentical.push(`Product Name: ${prod.name}`);
    }

    if (prod.description && (!enDesc || enDesc.trim() === "")) {
      productsMissingEn.push(`Desc missing for: ${prod.name}`);
    } else if (prod.description && enDesc === prod.description && !isWhitelisted(prod.description)) {
      legacyTurkishFallbacks.push(`Product Desc TR fallback: ${prod.name} -> "${prod.description}"`);
    }
  });

  // Check Option Groups
  allOptionGroups.forEach((og) => {
    const nameOrKey = og.display_name_i18n || og.display_name || og.name;
    const enGroup = resolveLocalizedText(nameOrKey, "en");
    if (!enGroup || enGroup.trim() === "") {
      optionGroupsMissingEn.push(og.display_name || og.name);
    } else if (
      enGroup === (og.display_name || og.name) &&
      !isWhitelisted(og.display_name || og.name)
    ) {
      suspiciousTrEnIdentical.push(`Option Group: ${og.display_name || og.name}`);
    }
  });

  // Check Options
  allOptions.forEach((opt) => {
    const enOpt = resolveLocalizedText(opt.name_i18n || opt.name, "en");
    if (!enOpt || enOpt.trim() === "") {
      optionsMissingEn.push(opt.name);
    } else if (enOpt === opt.name && !isWhitelisted(opt.name)) {
      suspiciousTrEnIdentical.push(`Option Value: ${opt.name}`);
    }
  });

  // Check Static UI Keys
  const trStaticKeys = Object.keys(UI_TRANSLATIONS.tr || {});
  const enDict = UI_TRANSLATIONS.en || {};
  trStaticKeys.forEach((key) => {
    if (!enDict[key] || enDict[key].trim() === "") {
      staticUIKeysMissingEn.push(key);
    }
  });

  console.log(`Products checked: ${INITIAL_PRODUCTS.length}`);
  console.log(`Products missing English: ${productsMissingEn.length}`);
  console.log(`Categories missing English: ${categoriesMissingEn.length}`);
  console.log(`Option groups missing English: ${optionGroupsMissingEn.length}`);
  console.log(`Options missing English: ${optionsMissingEn.length}`);
  console.log(`Static UI keys missing English: ${staticUIKeysMissingEn.length}`);
  console.log(`Legacy Turkish fallbacks: ${legacyTurkishFallbacks.length}`);
  console.log(`Suspicious TR/EN identical values: ${suspiciousTrEnIdentical.length}`);

  if (productsMissingEn.length > 0) {
    console.error("\n❌ Products missing English:", productsMissingEn);
  }
  if (categoriesMissingEn.length > 0) {
    console.error("\n❌ Categories missing English:", categoriesMissingEn);
  }
  if (optionGroupsMissingEn.length > 0) {
    console.error("\n❌ Option groups missing English:", optionGroupsMissingEn);
  }
  if (optionsMissingEn.length > 0) {
    console.error("\n❌ Options missing English:", optionsMissingEn);
  }
  if (staticUIKeysMissingEn.length > 0) {
    console.error("\n❌ Static UI keys missing English:", staticUIKeysMissingEn);
  }
  if (legacyTurkishFallbacks.length > 0) {
    console.error("\n❌ Legacy Turkish fallbacks:", legacyTurkishFallbacks);
  }
  if (suspiciousTrEnIdentical.length > 0) {
    console.error("\n❌ Suspicious identical TR/EN:", suspiciousTrEnIdentical);
  }

  const passed =
    productsMissingEn.length === 0 &&
    categoriesMissingEn.length === 0 &&
    optionGroupsMissingEn.length === 0 &&
    optionsMissingEn.length === 0 &&
    staticUIKeysMissingEn.length === 0 &&
    legacyTurkishFallbacks.length === 0 &&
    suspiciousTrEnIdentical.length === 0;

  if (passed) {
    console.log("Result: PASS");
    return true;
  } else {
    console.log("Result: FAIL");
    return false;
  }
}

if (require.main === module) {
  const success = runEnglishAudit();
  if (!success) {
    process.exit(1);
  }
}
