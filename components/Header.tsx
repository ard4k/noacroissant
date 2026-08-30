"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingBag, ChevronDown, Check } from "lucide-react";
import { BRAND_ASSETS } from "@/lib/images";
import { DiningTable } from "@/lib/types";
import { Language, getTranslation } from "@/lib/i18n/translations";
import { LanguageSelector } from "./LanguageSelector";

interface HeaderProps {
  table: DiningTable | null;
  allTables?: DiningTable[];
  onSelectTable?: (token: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenStory?: () => void;
  isDevMode?: boolean;
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
}

export function Header({
  table,
  allTables = [],
  onSelectTable,
  cartCount,
  onOpenCart,
  onOpenSearch,
  onOpenStory,
  isDevMode = false,
  language = "tr",
  onLanguageChange = () => {},
}: HeaderProps) {
  return (
    <header className="w-full bg-[#F8F1EB] border-b border-[#D1A37A]/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Brand with Story Ring & Static Dot */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenStory}
            className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#D97706] via-[#B45309] to-[#F59E0B] shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer group"
            title="Hikayemiz"
          >
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-white bg-white">
              <Image
                src="/noa_icon.jpg"
                alt="NOA Icon"
                fill
                sizes="40px"
                className="object-cover transition-transform duration-200 group-hover:scale-110"
                priority
              />
            </div>
            {/* Authentic Notification Badge */}
            <span className="absolute top-0 right-0 w-3 h-3 bg-[#EF4444] border-[1.5px] border-white rounded-full shadow-xs pointer-events-none" />
          </button>

          <Link
            href={table ? `/?t=${table.qr_token}` : "/"}
            className="flex items-center group select-none"
          >
            <div className="relative h-7 sm:h-9 w-28 sm:w-44 shrink-0">
              <Image
                src="/noa_text.png"
                alt="NOA CROISSANT"
                fill
                sizes="180px"
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Right: Language Selector & Wide Search Bar */}
        <div className="flex-1 max-w-[240px] sm:max-w-xs md:max-w-sm flex items-center justify-end gap-2 min-w-0">
          <LanguageSelector
            currentLanguage={language}
            onLanguageChange={onLanguageChange}
          />

          <button
            onClick={onOpenSearch}
            aria-label="Ürün veya lezzet ara"
            className="flex-1 h-9 sm:h-10 px-3 sm:px-3.5 rounded-full bg-[#FAF4EE] hover:bg-white text-[#4A2808] flex items-center gap-2 border border-[#683B0C]/15 shadow-2xs transition-all cursor-pointer group active:scale-[0.98] min-w-0"
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8C5828] group-hover:text-[#381D05] transition-colors shrink-0 stroke-[2.2]" />
            <span className="text-[11px] sm:text-xs text-[#8C5828]/80 font-medium group-hover:text-[#381D05] truncate">
              {getTranslation(language, "searchPlaceholder", "Ara...")}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
