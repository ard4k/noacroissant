"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import { Header } from "@/components/Header";
import { CategoryTabs } from "@/components/CategoryTabs";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetailDrawer } from "@/components/ProductDetailDrawer";
import { CartDrawer } from "@/components/CartDrawer";
import { CartBar } from "@/components/CartBar";
import { CheckoutModal } from "@/components/CheckoutModal";
import { SearchModal } from "@/components/SearchModal";
import { OpeningSplash } from "@/components/OpeningSplash";
import { StoryModal } from "@/components/StoryModal";
import { useCart } from "@/lib/useCart";
import { useSearchParams } from "next/navigation";
import { Category, Product, DiningTable } from "@/lib/types";
import { BRAND_ASSETS } from "@/lib/images";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_TABLES } from "@/lib/seedData";
import { noaStore } from "@/lib/store";
import { Language, translateCategory, translateNotice, detectDeviceLanguage, savePreferredLanguage } from "@/lib/i18n/translations";
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
  tables = INITIAL_TABLES,
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

  useEffect(() => {
    const syncFromStore = () => {
      const prods = noaStore.getProducts();
      if (prods && prods.length > 0) setLiveProducts(prods);
      const cats = noaStore.getCategories();
      if (cats && cats.length > 0) setLiveCategories(cats);
      const tbls = noaStore.getTables();
      if (tbls && tbls.length > 0) setLiveTables(tbls);
    };
    syncFromStore();
    const unsub = noaStore.subscribe(syncFromStore);

    const fetchLive = async () => {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (data.products && Array.isArray(data.products) && data.products.length > 0) {
            setLiveProducts(data.products);
          }
          if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
            setLiveCategories(data.categories);
          }
          if (data.tables && Array.isArray(data.tables) && data.tables.length > 0) {
            setLiveTables(data.tables);
          }
        }
      } catch (e) {}
    };
    fetchLive();
    const pollInterval = setInterval(fetchLive, 3000);

    return () => {
      unsub();
      clearInterval(pollInterval);
    };
  }, []);

  const resolvedInitialTable = useMemo(() => {
    if (initialTable) return initialTable;
    if (activeToken) {
      return liveTables.find((t) => t.qr_token === activeToken) || null;
    }
    return liveTables[0] || null;
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
  const [language, setLanguage] = useState<Language>("tr");

  // Auto-detect phone / device language on first load
  useEffect(() => {
    const autoLang = detectDeviceLanguage();
    setLanguage(autoLang);
    if (typeof document !== "undefined") {
      document.documentElement.lang = autoLang;
      document.documentElement.dir = autoLang === "ar" ? "rtl" : "ltr";
    }
  }, []);

  const handleLanguageChange = useCallback((newLang: Language) => {
    setLanguage(newLang);
    savePreferredLanguage(newLang);
  }, []);

  const cartHook = useCart();

  // Scrollspy to detect active category
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;

      for (const cat of liveCategories) {
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
  }, [liveCategories]);

  // Group products by category
  const productsByCategory = useMemo(() => {
    const map: Record<string, Product[]> = {};
    for (const cat of liveCategories) {
      map[cat.id] = liveProducts.filter((p) => p.category_id === cat.id);
    }
    return map;
  }, [liveCategories, liveProducts]);

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
      <OpeningSplash onOpenStory={() => setIsStoryOpen(true)} />

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
          isDevMode={isDevMode}
          language={language}
          onLanguageChange={handleLanguageChange}
        />

        {/* Category Tabs Pill Bar */}
        <CategoryTabs
          categories={liveCategories}
          activeCategoryId={activeCategoryId}
          onSelectCategory={handleScrollToCategory}
          language={language}
        />
      </div>

      {/* Main Menu Feed - 3 Cards Side-by-Side Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-36 space-y-16">
        {liveCategories.map((cat, catIdx) => {
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
                  {translateCategory(cat.name, language)}
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
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-20 border-t border-[#683B0C]/12 flex flex-col items-center justify-center">
        <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-xs border border-[#683B0C]/15 opacity-80 hover:opacity-100 transition-opacity">
          <Image
            src="/noa_icon.jpg"
            alt="NOA Amblem"
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
      </footer>

      {/* Floating Bottom Cart Bar */}
      <CartBar
        totalCount={cartHook.totalItemCount}
        totalPrice={cartHook.totalPrice}
        onOpenCart={() => setIsCartOpen(true)}
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
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={liveProducts}
        onSelectProduct={(prod) => setSelectedProductForDetail(prod)}
        language={language}
      />

      {/* NOA Story Slideshow Modal */}
      <StoryModal
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
        language={language}
      />
    </div>
  );
}
