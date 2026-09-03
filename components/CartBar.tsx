"use client";

import React from "react";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { Language } from "@/lib/i18n/translations";
import { formatLocalizedPrice } from "@/lib/i18n/resolver";

interface CartBarProps {
  totalCount: number;
  totalPrice: number;
  onOpenCart: () => void;
  language?: Language;
}

export function CartBar({ totalCount, totalPrice, onOpenCart, language = "tr" }: CartBarProps) {
  if (totalCount <= 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-slideUp">
      <button
        onClick={onOpenCart}
        aria-label={language === "en" ? "View Cart" : "Sepeti İncele"}
        className="px-6 py-3.5 rounded-full bg-[#15803D] hover:bg-[#166534] text-white shadow-[0_12px_35px_rgba(21,128,61,0.45)] flex items-center gap-3.5 active:scale-95 transition-all group cursor-pointer"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 text-white" />
          <span className="absolute -top-2 -right-2.5 w-4 h-4 rounded-full bg-white text-[#15803D] text-[10px] font-black flex items-center justify-center shadow-xs">
            {totalCount}
          </span>
        </div>

        <span className="font-black text-base tracking-tight text-white font-sans">
          {formatLocalizedPrice(totalPrice, language)}
        </span>

        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
      </button>
    </div>
  );
}
