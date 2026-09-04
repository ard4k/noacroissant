"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Header } from "@/components/Header";
import { CategoryTabs } from "@/components/CategoryTabs";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetailDrawer } from "@/components/ProductDetailDrawer";
import { CartDrawer } from "@/components/CartDrawer";
import { CartBar } from "@/components/CartBar";
import { OpeningSplash } from "@/components/OpeningSplash";
import { Coffee, Gift, Sparkles, Award, Crown, Star, ChevronRight, Instagram } from "lucide-react";
import { BUSINESS_INFO } from "@/lib/businessConfig";

// Lazy-load non-critical modals for improved initial page load performance
const CheckoutModal = dynamic(
  () => import("@/components/CheckoutModal").then((mod) => mod.CheckoutModal),
  { ssr: false }
);
const SearchModal = dynamic(
  () => import("@/components/SearchModal").then((mod) => mod.SearchModal),
  { ssr: false }
);
const StoryModal = dynamic(
  () => import("@/components/StoryModal").then((mod) => mod.StoryModal),
  { ssr: false }
);
const WifiModal = dynamic(
  () => import("@/components/WifiModal").then((mod) => mod.WifiModal),
  { ssr: false }
);
const LoyaltyModal = dynamic(
  () => import("@/components/LoyaltyModal").then((mod) => mod.LoyaltyModal),
  { ssr: false }
);
const CookieBanner = dynamic(
  () => import("@/components/CookieBanner").then((mod) => mod.CookieBanner),
  { ssr: false }
);
import { useCart } from "@/lib/useCart";
import { useSearchParams } from "next/navigation";
import { Category, Product, DiningTable } from "@/lib/types";
import { BRAND_ASSETS } from "@/lib/images";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from "@/lib/seedData";
import { noaStore } from "@/lib/store";
import { fetchLoyaltyCard, getStoredCustomerPhone, LoyaltyCard } from "@/lib/loyalty";
import {
  Language,
  getTranslation,
  translateCategory,
  translateNotice,
  detectDeviceLanguage,
  savePreferredLanguage,
} from "@/lib/i18n/translations";
import { resolveLocalizedText } from "@/lib/i18n/resolver";
import { trackViewItem, trackAddToCart } from "@/lib/analytics";

// Category notices matching reference
const CATEGORY_NOTICES: Record<string, string[]> = {
  "amora-kruvasan": [
    "10-15 DAKİKA HAZIRLANMA SÜRESİ VARDIR.",
    "NOA İKONİK KALP FORMUNDA ÖZEL ÇİKOLATALI VE DOLGULU KRUVASANLAR.",
  ],
  "danish-kruvasan": [
    "10-15 DAKİKA HAZIRLANMA SÜRESİ VARDIR.",
    "TAZE BAHÇE MEYVELERİ VE ÖZEL PASTACI KREMASI İLE HAZIRLANIR.",
  ],
  "roll-kruvasan": [
    "10-15 DAKİKA HAZIRLANMA SÜRESİ VARDIR.",
    "SİLİNDİRİK FRANSIZ ROLL HAMURU VE AKIŞKAN DOLGU İLE SERVİS EDİLİR.",
  ],
  "kup-kruvasan": [
    "10-15 DAKİKA HAZIRLANMA SÜRESİ VARDIR.",
    "GEOMETRİK KÜP FORMUNDA ÖZEL FIRINLANMIŞ KATMANLI KRUVASANLAR.",
  ],
  "twissy-kruvasan": [
    "10-15 DAKİKA HAZIRLANMA SÜRESİ VARDIR.",
    "BURGULU ÇITIR TWISSY DOKUSU VE ÖZEL KAPLAMALAR.",
  ],
  "klasik-tatli-kruvasan": [
    "10-15 DAKİKA HAZIRLANMA SÜRESİ VARDIR.",
    "TÜM KRUVASANLARIMIZ HAKİKİ FRANSIZ TEREYAĞI İLE HER GÜN TAZE PİŞİRİLMEKTEDİR.",
  ],
  "noa-menuler": [
    "10-15 DAKİKA HAZIRLANMA SÜRESİ VARDIR.",
    "NOA ÖZEL FORMÜLLÜ SPESİYAL MENÜLER VE KENDİN OLUŞTUR SEÇENEKLERİ.",
  ],
  "noa-ozel-menuler": [
    "10-15 DAKİKA HAZIRLANMA SÜRESİ VARDIR.",
    "NOA ÖZEL FORMÜLLÜ SPESİYAL MENÜLER VE KENDİN OLUŞTUR SEÇENEKLERİ.",
  ],
  "noa-spesiyaller": [
    "10-15 DAKİKA HAZIRLANMA SÜRESİ VARDIR.",
    "NOA ÖZEL FORMÜLLÜ SPESİYAL MENÜLER VE KENDİN OLUŞTUR SEÇENEKLERİ.",
  ],
  "noa-icecekler": [
    "NOA ÖZEL FORMÜL VE TAZE MEYVELERLE GÜNLÜK HAZIRLANIR.",
    "BUZ VE ŞEKER İLAVESİZ DOĞAL LEZZETLER.",
  ],
  "tuzlu-kruvasanlar": [
    "10-15 DAKİKA HAZIRLANMA SÜRESİ VARDIR.",
    "BU GRUBUN TAMAMI ÇİFT PİŞİRİM İLE SERVİS EDİLMEKTEDİR.",
  ],
  "special-icecekler": [
    "NOA ÖZEL FORMÜL VE TAZE MEYVELERLE GÜNLÜK HAZIRLANIR.",
    "BUZ VE ŞEKER İLAVESİZ DOĞAL LEZZETLER.",
  ],
  "dondurma": [
    "HEMEN SERVİS EDİLİR.",
    "GELENEKSEL VE DOĞAL TAZE DONDURMA ÇEŞİTLERİ.",
  ],
  "soft-icecekler": [
    "HEMEN SERVİS EDİLİR.",
    "SOĞUK ŞİŞE VE KUTU İÇECEKLER.",
  ],
  "soguk-kahveler": [
    "HEMEN SERVİS EDİLİR.",
    "TAZE ESPRESSO VE BOL BUZLU FERAH KAHVELER.",
  ],
  "sicak-kahveler": [
    "TAZE ÇEKİLMİŞ ÇEKİRDEKLER İLE HAZIRLANIR.",
    "ÖZEL KAHVE HARMANLARI VE DEMLEME ÇAY.",
  ],
  "sicak-icecekler": [
    "TAZE ÇEKİLMİŞ ÇEKİRDEKLER İLE HAZIRLANIR.",
    "ÖZEL KAHVE HARMANLARI VE DEMLEME ÇAY.",
  ],
};

interface MenuClientProps {
  categories?: Category[];
  products?: Product[];
  tables?: DiningTable[];
  initialTable?: DiningTable | null;
  tableTokenFromUrl?: string | null;
  isDevMode?: boolean;
}

export function MenuClient({
  categories = INITIAL_CATEGORIES,
  products = INITIAL_PRODUCTS,
  tables = [],
  initialTable = null,
  tableTokenFromUrl = null,
  isDevMode = process.env.NODE_ENV === "development",
}: MenuClientProps = {}) {
  const searchParams = useSearchParams();
  const tokenFromQuery = searchParams ? searchParams.get("t") : null;
  const activeToken = tableTokenFromUrl || tokenFromQuery;

  // Live dynamic state
  const [liveCategories, setLiveCategories] = useState<Category[]>(categories);
  const [liveProducts, setLiveProducts] = useState<Product[]>(products);
  const [liveTables, setLiveTables] = useState<DiningTable[]>(tables);
  const [disabledIngredients, setDisabledIngredients] = useState<string[]>([]);
  const [wifiSettings, setWifiSettings] = useState<{ ssid: string; password: string }>({
    ssid: "",
    password: "",
  });
  const [loyaltySettings, setLoyaltySettings] = useState<{
    enabled: boolean;
    requiredStamps: number;
    rewardName: string;
    itemType: string;
  }>({
    enabled: true,
    requiredStamps: 7,
    rewardName: "Hediye Kahve",
    itemType: "Kahve",
  });


  useEffect(() => {
    // Deep diffing helper to avoid redundant re-renders and image flickering
    const applyProductsDiff = (incoming: Product[]) => {
      if (!incoming || !Array.isArray(incoming) || incoming.length === 0) return;
      setLiveProducts((prev) => {
        if (prev.length !== incoming.length) return incoming;
        const hasDiff = incoming.some((inc, idx) => {
          const p = prev[idx];
          return (
            !p ||
            p.id !== inc.id ||
            p.is_available !== inc.is_available ||
            p.base_price !== inc.base_price ||
            p.name !== inc.name ||
            p.image_url !== inc.image_url
          );
        });
        return hasDiff ? incoming : prev;
      });
    };

    const applyCategoriesDiff = (incoming: Category[]) => {
      if (!incoming || !Array.isArray(incoming) || incoming.length === 0) return;
      setLiveCategories((prev) => {
        if (prev.length !== incoming.length) return incoming;
        const hasDiff = incoming.some((inc, idx) => {
          const c = prev[idx];
          return !c || c.id !== inc.id || c.name !== inc.name || c.display_order !== inc.display_order;
        });
        return hasDiff ? incoming : prev;
      });
    };

    const syncFromStore = () => {
      const prods = noaStore.getProducts();
      if (prods && prods.length > 0) applyProductsDiff(prods);
      const cats = noaStore.getCategories();
      if (cats && cats.length > 0) applyCategoriesDiff(cats);
      const settings = noaStore.getSettings();
      if (settings) {
        if (settings.disabled_ingredients) {
          setDisabledIngredients((prev) => {
            const same = JSON.stringify(prev) === JSON.stringify(settings.disabled_ingredients);
            return same ? prev : settings.disabled_ingredients || [];
          });
        }
        if (settings.wifi_ssid !== undefined || settings.wifi_password !== undefined) {
          setWifiSettings({
            ssid: settings.wifi_ssid || "",
            password: settings.wifi_password || "",
          });
        }
        setLoyaltySettings({
          enabled: settings.loyalty_enabled !== false,
          requiredStamps: settings.loyalty_required_stamps || 7,
          rewardName: settings.loyalty_reward_name || "Hediye Kahve",
          itemType: settings.loyalty_stamp_item_type || "Kahve",
        });
      }
    };

    syncFromStore();
    const unsub = noaStore.subscribe(syncFromStore);

    const fetchLive = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (data.products && Array.isArray(data.products) && data.products.length > 0) {
            applyProductsDiff(data.products);
          }
          if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
            applyCategoriesDiff(data.categories);
          }
          if (data.settings) {
            if (Array.isArray(data.settings.disabled_ingredients)) {
              setDisabledIngredients((prev) => {
                const same = JSON.stringify(prev) === JSON.stringify(data.settings.disabled_ingredients);
                return same ? prev : data.settings.disabled_ingredients;
              });
            }
            if (data.settings.wifi_ssid !== undefined || data.settings.wifi_password !== undefined) {
              setWifiSettings({
                ssid: data.settings.wifi_ssid || "",
                password: data.settings.wifi_password || "",
              });
            }
            setLoyaltySettings({
              enabled: data.settings.loyalty_enabled !== false,
              requiredStamps: data.settings.loyalty_required_stamps || 7,
              rewardName: data.settings.loyalty_reward_name || "Hediye Kahve",
              itemType: data.settings.loyalty_stamp_item_type || "Kahve",
            });
          }
        }
      } catch (e) {}
    };

    fetchLive();
    const pollInterval = setInterval(fetchLive, 8000);
    window.addEventListener("storage", syncFromStore);

    return () => {
      unsub();
      clearInterval(pollInterval);
      window.removeEventListener("storage", syncFromStore);
    };
  }, []);

  // Validate active token from server
  useEffect(() => {
    if (!activeToken) return;
    const validateToken = async () => {
      try {
        const res = await fetch(`/api/tables/validate?token=${encodeURIComponent(activeToken)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.valid && data.table) {
            // qr_token is not returned by the server (security) — populate from activeToken
            // which the client already has from the URL/QR code scan
            setCurrentTable({ ...data.table, qr_token: activeToken });
          }
        }
      } catch (e) {}
    };
    validateToken();
  }, [activeToken]);

  const resolvedInitialTable = useMemo(() => {
    if (initialTable) return initialTable;
    if (activeToken && liveTables.length > 0) {
      return liveTables.find((t) => t.qr_token === activeToken) || null;
    }
    return null; // Visitors without QR token are never silently assigned to Masa 1
  }, [initialTable, activeToken, liveTables]);

  const [currentTable, setCurrentTable] = useState<DiningTable | null>(resolvedInitialTable);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    (liveCategories && liveCategories[0]?.id) || ""
  );
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [isWifiOpen, setIsWifiOpen] = useState(false);
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);
  const [customerLoyaltyCard, setCustomerLoyaltyCard] = useState<LoyaltyCard | null>(null);
  const [language, setLanguage] = useState<Language>("tr");
  const t = (key: string, fallback?: string) => getTranslation(language, key, fallback);

  // Sync stored customer loyalty card
  useEffect(() => {
    const phone = getStoredCustomerPhone();
    if (phone) {
      fetchLoyaltyCard(phone)
        .then((c) => setCustomerLoyaltyCard(c))
        .catch(() => {});
    }
  }, []);

  // Auto-detect phone / device language on first load
  useEffect(() => {
    const autoLang = detectDeviceLanguage();
    setLanguage(autoLang);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    }
  }, [language]);

  const handleLanguageChange = useCallback((newLang: Language) => {
    setLanguage(newLang);
    savePreferredLanguage(newLang);
  }, []);

  const cartHook = useCart();

  // Group active and available products by category
  const productsByCategory = useMemo(() => {
    const map: Record<string, Product[]> = {};
    for (const cat of liveCategories) {
      map[cat.id] = liveProducts.filter(
        (p) => p.category_id === cat.id && p.is_available !== false && p.is_active !== false
      );
    }
    return map;
  }, [liveCategories, liveProducts]);

  // Only categories that are active and contain at least one available product
  const visibleCategories = useMemo(() => {
    return liveCategories.filter(
      (cat) => cat.is_active !== false && (productsByCategory[cat.id]?.length ?? 0) > 0
    );
  }, [liveCategories, productsByCategory]);

  // Keep active category in sync with visible categories
  useEffect(() => {
    if (visibleCategories.length > 0 && !visibleCategories.some((c) => c.id === activeCategoryId)) {
      setActiveCategoryId(visibleCategories[0].id);
    }
  }, [visibleCategories, activeCategoryId]);

  // Scrollspy to detect active category among visible categories
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;

      for (const cat of visibleCategories) {
        const el = document.getElementById(`category-${cat.id}`);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveCategoryId(cat.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visibleCategories]);

  const handleScrollToCategory = useCallback((categoryId: string) => {
    setActiveCategoryId(categoryId);
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const topOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  }, []);

  const handleOpenDetail = useCallback((product: Product) => {
    setSelectedProductForDetail(product);
    trackViewItem(product);
  }, []);

  const handleQuickAdd = useCallback(
    (product: Product) => {
      cartHook.addItem(product, [], 1);
      trackAddToCart(product, [], 1, product.base_price);
    },
    [cartHook]
  );

  const handleSelectTableDev = useCallback(
    (token: string) => {
      const found = liveTables.find((t) => t.qr_token === token);
      if (found) {
        setCurrentTable(found);
        window.history.replaceState(null, "", `/?t=${token}`);
      }
    },
    [liveTables]
  );

  // Scroll Direction Listener for Smart Header Animation
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show both near the very top of the page
      if (currentScrollY < 20) {
        setShowHeader(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Scrolling Down -> Hide Header (Category tabs move to top: 0)
      if (currentScrollY > lastScrollY.current + 8) {
        setShowHeader(false);
      }
      // Scrolling Up -> Show both (Header slides back in above Category tabs)
      else if (currentScrollY < lastScrollY.current - 8) {
        setShowHeader(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F1EB] text-[#4A2808]" suppressHydrationWarning>
      {/* Brand Opening Splash Animation */}
      <OpeningSplash onOpenStory={() => setIsStoryOpen(true)} language={language} />

      {/* Smart Dual Sticky Header Wrapper */}
      <div
        className="sticky top-0 z-40 w-full transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: showHeader ? "translateY(0)" : "translateY(-64px)",
        }}
      >
        <Header
          table={currentTable}
          allTables={liveTables}
          onSelectTable={handleSelectTableDev}
          cartCount={cartHook.totalItemCount}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenStory={() => setIsStoryOpen(true)}
          onOpenWifi={() => setIsWifiOpen(true)}
          loyaltyStamps={customerLoyaltyCard?.stamps}
          hasFreeReward={(customerLoyaltyCard?.rewards_count || 0) > 0}
          isDevMode={isDevMode}
          language={language}
          onLanguageChange={handleLanguageChange}
        />

        {/* Category Tabs Pill Bar */}
        <CategoryTabs
          categories={visibleCategories}
          activeCategoryId={activeCategoryId}
          onSelectCategory={handleScrollToCategory}
          language={language}
        />
      </div>

      {/* Main Menu Feed - 3 Cards Side-by-Side Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-36 space-y-16">
        {visibleCategories.map((cat, catIdx) => {
          const catProducts = productsByCategory[cat.id] || [];
          if (catProducts.length === 0) return null;

          const notices = CATEGORY_NOTICES[cat.slug] || [
            "GÜNLÜK TAZE ÜRETİLMEKTEDİR.",
          ];

          return (
            <section
              key={cat.id}
              id={`category-${cat.id}`}
              className="scroll-mt-24 space-y-6"
            >
              {/* Category Header */}
              <div className="space-y-1 px-1">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#683B0C] tracking-tight">
                  {resolveLocalizedText(cat.name_i18n || cat.name, language)}
                </h2>
                <div className="text-[11px] sm:text-xs font-semibold text-[#8C5828] space-y-0.5 tracking-wider">
                  {notices.map((notice, idx) => (
                    <p key={idx}>{translateNotice(notice, language)}</p>
                  ))}
                </div>
              </div>

              {/* 3 Cards Side-by-Side Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                {catProducts.map((prod, prodIdx) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onOpenDetail={handleOpenDetail}
                    onQuickAdd={handleQuickAdd}
                    language={language}
                    priority={catIdx === 0 && prodIdx < 3}
                    disabledIngredients={disabledIngredients}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-20 border-t border-[#683B0C]/12 flex flex-col items-center justify-center gap-3">
        <div className="relative w-12 h-12 opacity-80 hover:opacity-100 transition-opacity">
          <Image
            src="/brand/noa-icon.png"
            alt="NOA Amblem"
            fill
            sizes="48px"
            className="object-contain"
          />
        </div>
        <a
          href={BUSINESS_INFO.social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all active:scale-95"
        >
          <Instagram className="w-3.5 h-3.5 text-white stroke-[2.2]" />
          <span>Instagram @noacroissant</span>
        </a>
        <p className="text-[11px] text-[#683B0C]/70 flex items-center gap-1">
          <span>made with</span>
          <span className="text-[#D1A37A]">♡</span>
          <span>by</span>
          <a
            href="https://553adx.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#683B0C] font-semibold hover:underline underline-offset-2 transition-colors"
          >
            553adx.com
          </a>
        </p>
      </footer>

      {/* Floating Bottom Cart Bar */}
      <CartBar
        totalCount={cartHook.totalItemCount}
        totalPrice={cartHook.totalPrice}
        onOpenCart={() => setIsCartOpen(true)}
        language={language}
      />

      {/* Product Detail Modal */}
      <ProductDetailDrawer
        product={
          selectedProductForDetail
            ? liveProducts.find((p) => p.id === selectedProductForDetail.id) || selectedProductForDetail
            : null
        }
        isOpen={Boolean(selectedProductForDetail)}
        onClose={() => setSelectedProductForDetail(null)}
        onAddToCart={(prod, options, qty, note) => {
          cartHook.addItem(prod, options, qty, note);
        }}
        language={language}
        disabledIngredients={disabledIngredients}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartHook.items}
        subtotal={cartHook.subtotal}
        total={cartHook.totalPrice}
        totalCount={cartHook.totalItemCount}
        onUpdateQuantity={cartHook.updateQuantity}
        onRemoveItem={cartHook.removeItem}
        onClearCart={cartHook.clearCart}
        generalNote={cartHook.generalNote}
        onSetGeneralNote={cartHook.setGeneralNote}
        isSavouryEligible={cartHook.isSavouryEligible}
        complimentaryTeaClaimed={cartHook.complimentaryTeaClaimed}
        onToggleComplimentaryTea={cartHook.toggleComplimentaryTea}
        onProceedCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        onAddDirectProduct={(prod) => cartHook.addItem(prod, [], 1)}
        tableLabel={currentTable?.label}
        language={language}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartHook.items}
        subtotal={cartHook.subtotal}
        total={cartHook.totalPrice}
        tableToken={currentTable?.qr_token || tableTokenFromUrl}
        tableNumber={currentTable?.table_number || null}
        generalNote={cartHook.generalNote}
        onClearCart={cartHook.clearCart}
        language={language}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={liveProducts.filter((p) => p.is_available !== false && p.is_active !== false)}
        onSelectProduct={(prod) => setSelectedProductForDetail(prod)}
        language={language}
      />

      {/* NOA Story Slideshow Modal */}
      <StoryModal
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
        language={language}
      />

      {/* Wi-Fi Quick Connect Modal */}
      <WifiModal
        isOpen={isWifiOpen}
        onClose={() => setIsWifiOpen(false)}
        ssid={wifiSettings.ssid}
        password={wifiSettings.password}
        language={language}
      />

      {/* Floating Bottom-Left Luxury Loyalty Capsule Badge – Saf Beyaz İnci */}
      {loyaltySettings.enabled && (
        <div className="fixed bottom-6 sm:bottom-8 left-4 sm:left-6 z-30 animate-fadeIn">
          <button
            type="button"
            onClick={() => setIsLoyaltyOpen(true)}
            title={t("loyaltyCardTitle", "NOA Kahve Kartı")}
            aria-label={t("loyaltyCardTitle", "NOA Kahve Kartı")}
            className="group relative flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-full bg-white hover:bg-[#FAF4EE] text-[#381D05] border border-[#E8DFD5] shadow-[0_10px_30px_rgba(56,29,5,0.14)] hover:shadow-[0_12px_36px_rgba(56,29,5,0.2)] backdrop-blur-md hover:scale-104 active:scale-96 transition-all duration-300 cursor-pointer"
          >
            {/* Round Mini Avatar */}
            <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-2xs border border-[#8C5828]/25 bg-white">
              <Image
                src="/noa_icon.jpg"
                alt="NOA"
                width={32}
                height={32}
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            {/* Gift Icon & Stamp Counter */}
            <div className="flex items-center gap-1.5 text-xs font-black tracking-tight">
              <Gift className="w-3.5 h-3.5 text-[#8C5828]" />

              {customerLoyaltyCard?.rewards_count && customerLoyaltyCard.rewards_count > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-[#15803D] text-white text-[11px] font-black uppercase tracking-wider animate-pulse shadow-xs">
                  🎁 {t("freeCoffeeReward", "Hediye!")}
                </span>
              ) : (
                <div className="flex items-baseline gap-0.5">
                  <span className="text-[#381D05] font-black text-xs">
                    {customerLoyaltyCard?.stamps ?? 0}
                  </span>
                  <span className="text-[#8C5828]/70 font-bold text-[11px]">
                    /{loyaltySettings.requiredStamps || 7}
                  </span>
                </div>
              )}
            </div>

            <ChevronRight className="w-3.5 h-3.5 text-[#8C5828] stroke-[2.5] -ml-0.5 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        </div>
      )}

      {/* NOA Digital Loyalty Club Modal */}
      <LoyaltyModal
        isOpen={isLoyaltyOpen}
        onClose={() => setIsLoyaltyOpen(false)}
        onCardUpdated={(c) => setCustomerLoyaltyCard(c)}
        requiredStamps={loyaltySettings.requiredStamps}
        rewardName={loyaltySettings.rewardName}
        language={language}
      />

      {/* Cookie & Privacy Consent Banner */}
      <CookieBanner language={language} />
    </div>
  );
}
