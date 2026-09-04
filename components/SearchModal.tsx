"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Search, Plus } from "lucide-react";
import { Product } from "@/lib/types";
import { Language, getTranslation } from "@/lib/i18n/translations";
import {
  resolveLocalizedText,
  resolveProductName,
  resolveProductDescription,
  formatLocalizedPrice,
} from "@/lib/i18n/resolver";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  language?: Language;
}

export function SearchModal({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  language = "tr",
}: SearchModalProps) {
  const [query, setQuery] = useState("");
  const t = (key: string, fallback?: string) => getTranslation(language, key, fallback);

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return products.filter((p) => {
      if (p.is_available === false || p.is_active === false) return false;
      const name = resolveLocalizedText(p.name_i18n || p.name, language).toLowerCase();
      const desc = resolveLocalizedText(p.description_i18n || p.description, language).toLowerCase();
      const ingr = resolveLocalizedText(p.ingredients_i18n || p.ingredients, language).toLowerCase();
      const rawName = (p.name || "").toLowerCase();
      return name.includes(q) || desc.includes(q) || ingr.includes(q) || rawName.includes(q);
    });
  }, [query, products, language]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-20 animate-fadeIn">
      {/* macOS Frosted Dim Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xl transition-opacity"
        aria-hidden="true"
      />

      {/* macOS Window Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
        className="relative w-full max-w-lg bg-white/95 backdrop-blur-3xl rounded-[26px] shadow-2xl border border-white/80 overflow-hidden z-10 flex flex-col max-h-[82vh] animate-slideUp"
      >
        {/* Title Bar with Red Close Button */}
        <div className="relative shrink-0 flex items-center justify-between px-4 py-3 bg-[#F6F3EE] border-b border-black/[0.06] select-none">
          <div className="flex items-center">
            <button
              onClick={onClose}
              aria-label={t("closeModal", "Pencereyi Kapat")}
              className="w-4 h-4 rounded-full bg-[#FF5F56] border border-[#E0443E] hover:opacity-80 active:scale-95 transition-transform flex items-center justify-center group cursor-pointer"
            >
              <span className="opacity-0 group-hover:opacity-100 text-[9px] font-black text-black/70 leading-none">✕</span>
            </button>
          </div>

          <div className="absolute inset-x-0 text-center pointer-events-none">
            <span className="text-xs font-bold text-[#4A2808]/80 font-sans tracking-wide">
              {t("searchTitle", "Ürün Arama")}
            </span>
          </div>

          <div className="w-4" />
        </div>

        {/* Search Input Bar */}
        <div className="p-4 border-b border-black/[0.06] flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-[#C89565] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder", "Ürün veya lezzet ara...")}
            autoFocus
            className="flex-1 text-sm bg-transparent border-none focus:outline-none text-[#4A2808] placeholder:text-stone-400 font-semibold"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs text-stone-400 hover:text-stone-700 font-bold px-1.5 cursor-pointer"
            >
              {t("clear", "Temizle")}
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {!query.trim() ? (
            <div className="py-10 text-center text-stone-400 space-y-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-[#D1A37A]/40 bg-[#FAF7F2] mx-auto flex items-center justify-center shadow-xs">
                <Image
                  src="/noa_icon.jpg"
                  alt="NOA"
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                />
              </div>
              <p className="text-xs font-semibold text-[#381D05]/70">
                {t("searchEmptyPrompt", "Aramak istediğiniz ürün veya içeriği yazabilirsiniz.")}
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-10 text-center text-stone-500 space-y-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-[#D1A37A]/40 bg-[#FAF7F2] mx-auto flex items-center justify-center shadow-xs opacity-60">
                <Image
                  src="/noa_icon.jpg"
                  alt="NOA"
                  width={56}
                  height={56}
                  className="object-cover w-full h-full grayscale"
                />
              </div>
              <p className="text-sm font-bold text-[#4A2808]">
                &quot;{query}&quot; {t("noResultsFound", "ile eşleşen ürün bulunamadı.")}
              </p>
              <p className="text-xs text-stone-400">
                {t("tryDifferentSearch", "Farklı bir arama terimi deneyebilirsiniz.")}
              </p>
            </div>
          ) : (
            filteredProducts.map((prod) => {
              const displayName = resolveProductName(prod, language);
              const displayDesc = resolveProductDescription(prod, language);

              return (
                <button
                  key={prod.id}
                  onClick={() => {
                    onSelectProduct(prod);
                    onClose();
                  }}
                  className="w-full p-3 rounded-2xl border border-black/[0.05] hover:bg-[#FAF5EF] flex items-center justify-between gap-3 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden relative shrink-0 bg-[#FAF5EF] border border-[#683B0C]/10">
                      <Image
                        src={prod.image_url || "/noa_icon.jpg"}
                        alt={displayName}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-[#4A2808] group-hover:text-[#2B1402] truncate">
                        {displayName}
                      </h4>
                      {displayDesc ? (
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">
                          {displayDesc}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-xs font-black text-[#15803D] font-sans">
                      {formatLocalizedPrice(prod.base_price, language)}
                    </span>
                    <div className="apple-action-btn w-7 h-7 rounded-full text-white flex items-center justify-center">
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

