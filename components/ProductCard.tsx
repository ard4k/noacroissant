"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, Plus, ArrowUpRight } from "lucide-react";
import { Product } from "@/lib/types";
import { Language, getTranslation } from "@/lib/i18n/translations";
import {
  resolveLocalizedText,
  resolveProductName,
  resolveProductDescription,
  formatLocalizedPrice,
} from "@/lib/i18n/resolver";
import { getProductImage } from "@/lib/images";

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
  onQuickAdd?: (product: Product) => void;
  language?: Language;
  priority?: boolean;
  disabledIngredients?: string[];
}

export function ProductCard({
  product,
  onOpenDetail,
  language = "tr",
  priority = false,
  disabledIngredients = [],
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  
  // Check if primary ingredients or product name matches any disabled ingredient
  const isIngredientDisabled = Boolean(
    disabledIngredients &&
    disabledIngredients.length > 0 &&
    disabledIngredients.some((ing) => {
      const lowerIng = ing.toLocaleLowerCase("tr-TR").trim();
      if (!lowerIng) return false;
      const lowerName = (product.name || "").toLocaleLowerCase("tr-TR");
      const lowerDesc = (product.description || "").toLocaleLowerCase("tr-TR");
      const lowerIngredients = (product.ingredients || "").toLocaleLowerCase("tr-TR");
      return (
        lowerName.includes(lowerIng) ||
        lowerDesc.includes(lowerIng) ||
        lowerIngredients.includes(lowerIng)
      );
    })
  );

  const isAvailable = product.is_available && !isIngredientDisabled;
  const registeredImage = product.slug ? getProductImage(product.slug) : "";
  const effectiveImageUrl = registeredImage || product.image_url;
  const hasImage = Boolean(effectiveImageUrl && !imageError);

  const displayName = resolveProductName(product, language);
  const displayDesc = resolveProductDescription(product, language);
  const t = (key: string, fallback?: string) => getTranslation(language, key, fallback);

  const teaBadge =
    product.id === "prod-noa-kahvalti-tabagi"
      ? "2 Adet Çay İkramdır ☕"
      : (product.category_id === "cat-tuzlu" && product.id !== "prod-sade-kruvasan") ||
        product.option_groups?.some((og) => og.id === "opt-tuzlu-ikram-cay")
      ? "İlk Çay İkramdır ☕"
      : null;

  // Imageless Compact Card (for Soft/Hot drinks)
  if (!hasImage) {
    return (
      <div
        suppressHydrationWarning
        onClick={() => isAvailable && onOpenDetail(product)}
        className={`group relative flex flex-col justify-between bg-[#EAD8C5] rounded-[24px] p-5 sm:p-6 shadow-sm hover:-translate-y-1.5 transition-all duration-300 min-h-[150px] ${
          isAvailable ? "cursor-pointer" : "opacity-60 cursor-not-allowed select-none"
        }`}
      >
        <div>
          {teaBadge && (
            <span className="inline-block mb-1.5 px-2.5 py-0.5 rounded-full bg-[#381D05]/10 text-[#381D05] text-[10px] font-bold">
              {teaBadge}
            </span>
          )}
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[17px] sm:text-[18px] font-extrabold text-[#381D05] tracking-tight leading-snug group-hover:text-[#683B0C] transition-colors">
              {displayName}
            </h3>
            <span className="text-lg font-black text-[#15803D] shrink-0">
              {formatLocalizedPrice(product.base_price, language)}
            </span>
          </div>

          <div className="w-full h-px bg-[#683B0C]/15 my-2.5 rounded-full" />

          {displayDesc ? (
            <p className="text-[#4A2808] text-xs sm:text-[13px] font-medium leading-relaxed line-clamp-2">
              {displayDesc}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#683B0C]/10">
          <span className={`text-[11px] font-extrabold tracking-wider uppercase transition-colors ${
            isAvailable ? "text-[#7A4B22] group-hover:text-[#381D05]" : "text-red-700 font-black"
          }`}>
            {isAvailable ? t("addToCart", "SEPETE EKLE") : t("outOfStockUpper", "TÜKENDİ")}
          </span>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all ${
            isAvailable ? "bg-[#4A2808] text-white group-hover:bg-[#683B0C] group-hover:scale-110 active:scale-95" : "bg-red-600/30 text-red-800"
          }`}>
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>
        </div>
      </div>
    );
  }

  // Visual Card with Full 1:1 Photo (for Croissants, Danishes, Specials, etc.)
  return (
    <div
      suppressHydrationWarning
      onClick={() => isAvailable && onOpenDetail(product)}
      className={`group relative flex flex-col items-center h-full cursor-pointer transition-transform duration-300 hover:-translate-y-1.5 ${
        !isAvailable ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      {/* Layer 1 (Foreground Photo): Full width 1:1 square photo */}
      <div
        suppressHydrationWarning
        className="relative aspect-square w-full shrink-0 rounded-[28px] overflow-hidden bg-[#EFE7DE] z-10 shadow-sm"
      >
        <Image
          src={effectiveImageUrl!}
          alt={displayName}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-contain transition-transform duration-500 ease-out group-hover:scale-104"
          onError={() => setImageError(true)}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />

        {!isAvailable && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
            {t("outOfStock", "Tükendi")}
          </div>
        )}

        {isAvailable && teaBadge && (
          <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-[#381D05]/85 backdrop-blur-md border border-[#EAD8C5]/30 text-[#F5EBE1] text-[10.5px] font-bold flex items-center gap-1 shadow-md">
            <span>{teaBadge}</span>
          </div>
        )}
      </div>

      {/* Layer 2 (Background Box): %100 Eşit Boyutlu Luxury Podyum Kutusu */}
      <div className="relative w-[92%] flex-1 flex flex-col justify-between bg-[#EAD8C5] rounded-[26px] -mt-8 pt-12 pb-5 px-5 sm:px-6 z-0 shadow-sm">
        <div className="flex flex-col justify-between h-full">
          {/* Top: Product Name & Green Price */}
          <div>
            <div className="flex items-start justify-between gap-3 min-h-[48px]">
              <h3 className="text-[17px] sm:text-[18.5px] font-extrabold text-[#381D05] tracking-tight leading-snug group-hover:text-[#683B0C] transition-colors line-clamp-2">
                {displayName}
              </h3>
              <span className="text-xl sm:text-[22px] font-black text-[#15803D] tracking-tight shrink-0 whitespace-nowrap">
                {formatLocalizedPrice(product.base_price, language)}
              </span>
            </div>

            {/* Aesthetic Divider Line */}
            <div className="w-full h-px bg-[#683B0C]/15 my-2.5 rounded-full" />

            {/* Description */}
            {displayDesc ? (
              <p className="text-[#4A2808] text-xs sm:text-[13px] font-medium leading-relaxed line-clamp-3">
                {displayDesc}
              </p>
            ) : null}
          </div>

          {/* Bottom Footer: Ultra-Chic Luxury Action Bar */}
          <div className="flex items-center justify-between pt-4 mt-2">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold tracking-wider uppercase transition-colors">
              <span className={isAvailable ? "text-[#7A4B22] group-hover:text-[#381D05]" : "text-red-700 font-black"}>
                {isAvailable ? t("customize", "TIKLA & ÖZELLEŞTİR") : t("outOfStockUpper", "TÜKENDİ (STOKTA YOK)")}
              </span>
              {isAvailable && (
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5] text-[#7A4B22] group-hover:text-[#381D05] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              )}
            </div>

            {/* Luxury Circular Quick Action Button */}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all ${
              isAvailable ? "bg-[#4A2808] text-white group-hover:bg-[#683B0C] group-hover:scale-110 active:scale-95" : "bg-red-600/30 text-red-800"
            }`}>
              <Plus className="w-4 h-4 text-white stroke-[3]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
