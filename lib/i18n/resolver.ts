import { SupportedLocale, LocalizedText, CartItemOption } from "../types";
import {
  UI_TRANSLATIONS,
  PRODUCT_TRANSLATIONS,
  CATEGORY_TRANSLATIONS,
  OPTION_GROUP_TRANSLATIONS,
  OPTION_ITEM_TRANSLATIONS,
} from "./translations";

export const ALL_SUPPORTED_LOCALES: SupportedLocale[] = [
  "tr",
  "en",
  "de",
  "ru",
  "nl",
  "sv",
  "no",
  "fi",
  "pl",
  "ar",
];

export const SUPPORTED_LOCALES = ALL_SUPPORTED_LOCALES;

const loggedMissingWarnings = new Set<string>();

/**
 * Normalizes any locale string (e.g., "en-US", "en_GB", "de-DE", "ar-SA") to a SupportedLocale
 */
export function normalizeLocale(locale?: string | null): SupportedLocale {
  if (!locale || typeof locale !== "string") return "tr";
  const clean = locale.toLowerCase().split(/[-_]/)[0].trim();

  if (clean === "nb" || clean === "nn") return "no";
  if ((ALL_SUPPORTED_LOCALES as string[]).includes(clean)) {
    return clean as SupportedLocale;
  }
  return "tr";
}

/**
 * Type guard for LocalizedText object
 */
export function isLocalizedTextObject(val: any): val is LocalizedText {
  return val !== null && typeof val === "object" && !Array.isArray(val);
}

/**
 * Central Type-Safe Localized Text Resolver
 * Resolves localized strings from LocalizedText objects, legacy strings, or global translation dictionaries.
 */
export function resolveLocalizedText(
  value: LocalizedText | string | undefined | null,
  locale: SupportedLocale = "tr",
  options: { fallback?: string; warnIfMissing?: boolean; context?: string } = {}
): string {
  if (value === undefined || value === null) {
    return options.fallback || "";
  }

  const normLocale = normalizeLocale(locale);

  // 1. Direct LocalizedText object resolution
  if (isLocalizedTextObject(value)) {
    const textForLocale = value[normLocale];
    if (typeof textForLocale === "string" && textForLocale.trim() !== "") {
      return textForLocale.trim();
    }

    // If requested locale is not TR, try dictionary lookup using TR value
    const trText = value["tr"] || "";
    if (trText && normLocale !== "tr") {
      const fromDict = lookupInDictionaries(trText, normLocale);
      if (fromDict && fromDict.trim() !== "" && fromDict !== trText) {
        return fromDict.trim();
      }
    }

    // Fallback to TR, then fallback option, then any non-empty locale
    if (typeof trText === "string" && trText.trim() !== "") {
      reportMissingTranslation(trText, normLocale, options);
      return trText.trim();
    }

    for (const loc of ALL_SUPPORTED_LOCALES) {
      const candidate = value[loc];
      if (typeof candidate === "string" && candidate.trim() !== "") {
        return candidate.trim();
      }
    }

    return options.fallback || "";
  }

  // 2. Legacy string resolution (uses dictionary lookup)
  if (typeof value === "string") {
    const cleanStr = value.trim();
    if (cleanStr === "") return options.fallback || "";
    if (normLocale === "tr") return cleanStr;

    const translated = lookupInDictionaries(cleanStr, normLocale);
    if (translated && translated !== cleanStr) {
      return translated;
    }

    reportMissingTranslation(cleanStr, normLocale, options);
    return options.fallback || cleanStr;
  }

  return options.fallback || "";
}

/**
 * Global dictionary lookup helper
 */
function lookupInDictionaries(text: string, locale: SupportedLocale): string | null {
  // 1. Products Dictionary (matches by name or slug)
  if (PRODUCT_TRANSLATIONS[text]?.[locale]?.name) {
    return PRODUCT_TRANSLATIONS[text][locale].name;
  }

  // 1.1 Match by description or name in PRODUCT_TRANSLATIONS values
  for (const [, langMap] of Object.entries(PRODUCT_TRANSLATIONS)) {
    const trEntry = langMap.tr;
    if (trEntry) {
      if (trEntry.desc && (trEntry.desc === text || trEntry.desc.trim() === text.trim())) {
        if (langMap[locale]?.desc) return langMap[locale].desc;
      }
      if (trEntry.name && (trEntry.name === text || trEntry.name.trim() === text.trim())) {
        if (langMap[locale]?.name) return langMap[locale].name;
      }
    }
  }

  // 2. Option Items Dictionary
  if (OPTION_ITEM_TRANSLATIONS[text]?.[locale]) {
    return OPTION_ITEM_TRANSLATIONS[text][locale];
  }

  // 3. Option Groups Dictionary
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

  const normalizedGroup = normalizeKey(text);
  if (OPTION_GROUP_TRANSLATIONS[normalizedGroup]?.[locale]) {
    return OPTION_GROUP_TRANSLATIONS[normalizedGroup][locale];
  }
  if (OPTION_GROUP_TRANSLATIONS[text]?.[locale]) {
    return OPTION_GROUP_TRANSLATIONS[text][locale];
  }
  for (const [k, v] of Object.entries(OPTION_GROUP_TRANSLATIONS)) {
    const normK = normalizeKey(k);
    if (normalizedGroup === normK || normalizedGroup.includes(normK) || normK.includes(normalizedGroup)) {
      if (v[locale]) return v[locale];
    }
  }

  // 4. Categories Dictionary
  for (const [slug, trans] of Object.entries(CATEGORY_TRANSLATIONS)) {
    if (trans.tr === text || slug === text.toLowerCase()) {
      if (trans[locale]) return trans[locale];
    }
  }

  // 5. UI Translations Dictionary
  if (UI_TRANSLATIONS[locale]?.[text]) {
    return UI_TRANSLATIONS[locale][text];
  }

  return null;
}

export function resolveProductName(product: { name: string; name_i18n?: LocalizedText; slug?: string }, locale: SupportedLocale | string): string {
  const normLocale = normalizeLocale(locale);
  if (product.name_i18n?.[normLocale]) return product.name_i18n[normLocale]!;
  if (PRODUCT_TRANSLATIONS[product.name]?.[normLocale]?.name) return PRODUCT_TRANSLATIONS[product.name][normLocale].name;
  if (product.slug && PRODUCT_TRANSLATIONS[product.slug]?.[normLocale]?.name) return PRODUCT_TRANSLATIONS[product.slug][normLocale].name;
  return resolveLocalizedText(product.name_i18n || product.name, normLocale);
}

export function resolveProductDescription(product: { name: string; description?: string; description_i18n?: LocalizedText; slug?: string; ingredients?: string }, locale: SupportedLocale | string): string {
  const normLocale = normalizeLocale(locale);
  if (normLocale === "tr") return product.description || (product.ingredients ? `${product.ingredients} ile hazırlanarak servis edilir.` : "");
  if (product.description_i18n?.[normLocale]) return product.description_i18n[normLocale]!;
  if (PRODUCT_TRANSLATIONS[product.name]?.[normLocale]?.desc) return PRODUCT_TRANSLATIONS[product.name][normLocale].desc!;
  if (product.slug && PRODUCT_TRANSLATIONS[product.slug]?.[normLocale]?.desc) return PRODUCT_TRANSLATIONS[product.slug][normLocale].desc!;
  const fallbackDesc = resolveLocalizedText(product.description_i18n || product.description, normLocale);
  if (fallbackDesc && fallbackDesc !== product.description) return fallbackDesc;
  if (product.ingredients) {
    const translatedIng = resolveLocalizedText(product.ingredients, normLocale);
    switch (normLocale) {
      case "de":
        return `Frisch zubereitet und serviert mit ${translatedIng}.`;
      case "ru":
        return `Свежеприготовлено и подается с ${translatedIng}.`;
      case "nl":
        return `Vers bereid en geserveerd met ${translatedIng}.`;
      case "sv":
        return `Nytillagad och serveras med ${translatedIng}.`;
      case "no":
        return `Ferskt tilberedt og serveres med ${translatedIng}.`;
      case "fi":
        return `Tuoreena valmistettu ja tarjoillaan: ${translatedIng}.`;
      case "pl":
        return `Świeżo przygotowane i podawane z: ${translatedIng}.`;
      case "ar":
        return `يُحضر طازجاً ويُقدم مع ${translatedIng}.`;
      case "en":
      default:
        return `Prepared and served fresh with ${translatedIng}.`;
    }
  }
  return fallbackDesc || "";
}

/**
 * Development telemetry warning for missing translations
 */
function reportMissingTranslation(
  text: string,
  locale: SupportedLocale,
  options: { warnIfMissing?: boolean; context?: string }
) {
  if (process.env.NODE_ENV === "development" && options.warnIfMissing) {
    const key = `${locale}:${text}:${options.context || "generic"}`;
    if (!loggedMissingWarnings.has(key)) {
      loggedMissingWarnings.add(key);
      console.warn(
        `[i18n Warning] Missing translation for "${text}" in locale "${locale}"${
          options.context ? ` (Context: ${options.context})` : ""
        }`
      );
    }
  }
}

/**
 * Formats a currency amount with active locale Intl.NumberFormat
 */
export function formatLocalizedPrice(amount: number, locale: SupportedLocale = "tr"): string {
  const normLocale = normalizeLocale(locale);

  try {
    const intlLocaleMap: Record<SupportedLocale, string> = {
      tr: "tr-TR",
      en: "en-US",
      de: "de-DE",
      ru: "ru-RU",
      nl: "nl-NL",
      sv: "sv-SE",
      no: "nb-NO",
      fi: "fi-FI",
      pl: "pl-PL",
      ar: "ar-EG",
    };

    const targetIntlLocale = intlLocaleMap[normLocale] || "tr-TR";

    return new Intl.NumberFormat(targetIntlLocale, {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch (e) {
    // Graceful fallback
    return `${amount} TL`;
  }
}

/**
 * Option Group Prefix Translations for Cart & Order Display
 */
const GROUP_PREFIX_TRANSLATIONS: Record<string, Record<SupportedLocale, string>> = {
  ic_dolgu: {
    tr: "İç Dolgu",
    en: "Filling",
    de: "Füllung",
    ru: "Начинка",
    nl: "Vulling",
    sv: "Fyllning",
    no: "Fylling",
    fi: "Täyte",
    pl: "Nadzienie",
    ar: "الحشوة",
  },
  dis_dolgu: {
    tr: "Dış Dolgu",
    en: "Topping",
    de: "Glasur",
    ru: "Покрытие",
    nl: "Topping",
    sv: "Garnering",
    no: "Topping",
    fi: "Kuorrute",
    pl: "Polewa",
    ar: "التغطية",
  },
};

/**
 * Formats and sorts selected options for display in Cart, Tracking, and Receipts in active locale
 */
export function getSortedAndFormattedOptionsLocalized(
  options: CartItemOption[] = [],
  locale: SupportedLocale = "tr"
): string[] {
  const normLocale = normalizeLocale(locale);

  const getRank = (opt: CartItemOption): number => {
    const gn = (opt.option_group_name || "").toLowerCase();
    const gid = (opt.option_group_id || "").toLowerCase();

    if (gn.includes("kruvasan") || gid.includes("kruvasan") || gn.includes("boyut") || gid.includes("boyut")) return 1;
    if (gn.includes("porsiyon") || gid.includes("porsiyon")) return 2;
    if (gn.includes("iç dolgu") || gn.includes("ic dolgu") || gid.includes("ic_dolgu") || gid.includes("ic-dolgu")) return 3;
    if (gn.includes("dış dolgu") || gn.includes("dis dolgu") || gid.includes("dis_dolgu") || gid.includes("dis-dolgu")) return 4;
    if (gn.includes("meyve") || gn.includes("malzeme") || gid.includes("meyve") || gid.includes("malzeme")) return 5;
    if (gn.includes("sos") || gid.includes("sos") || gn.includes("topping")) return 6;
    if (gn.includes("içecek") || gid.includes("icecek")) return 7;
    return 8;
  };

  return [...options]
    .filter((o) => {
      const name = (o.option_value_name || "").toLowerCase();
      return !name.includes("istemiyorum") && !name.includes("yok") && !name.includes("none") && !name.includes("keine");
    })
    .sort((a, b) => getRank(a) - getRank(b))
    .map((o) => {
      const gn = (o.option_group_name || "").toLowerCase();
      const gid = (o.option_group_id || "").toLowerCase();

      // Resolve option name
      const optName = resolveLocalizedText(
        o.option_value_name_i18n || o.option_value_name,
        normLocale
      );

      let label = optName;

      // Group prefix if applicable
      if (gn.includes("iç dolgu") || gn.includes("ic dolgu") || gid.includes("ic_dolgu") || gid.includes("ic-dolgu")) {
        const prefix = GROUP_PREFIX_TRANSLATIONS.ic_dolgu[normLocale] || "İç Dolgu";
        label = `${prefix}: ${optName}`;
      } else if (gn.includes("dış dolgu") || gn.includes("dis dolgu") || gid.includes("dis_dolgu") || gid.includes("dis-dolgu")) {
        const prefix = GROUP_PREFIX_TRANSLATIONS.dis_dolgu[normLocale] || "Dış Dolgu";
        label = `${prefix}: ${optName}`;
      }

      if (o.price_modifier && o.price_modifier > 0) {
        const formattedModifier = formatLocalizedPrice(o.price_modifier, normLocale);
        label += ` (+${formattedModifier})`;
      }

      return label;
    });
}
