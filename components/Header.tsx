"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingBag, ChevronDown, Check, Wifi, Coffee, Instagram } from "lucide-react";
import { BRAND_ASSETS } from "@/lib/images";
import { DiningTable } from "@/lib/types";
import { Language, getTranslation } from "@/lib/i18n/translations";
import { LanguageSelector } from "./LanguageSelector";
import { BUSINESS_INFO } from "@/lib/businessConfig";

interface HeaderProps {
  table: DiningTable | null;
  allTables?: DiningTable[];
  onSelectTable?: (token: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenStory?: () => void;
  onOpenWifi?: () => void;
  onOpenLoyalty?: () => void;
  loyaltyStamps?: number;
  hasFreeReward?: boolean;
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
  onOpenWifi,
  onOpenLoyalty,
  loyaltyStamps,
  hasFreeReward = false,
  isDevMode = false,
  language = "tr",
  onLanguageChange = () => {},
}: HeaderProps) {
  const isAtTable = Boolean(table && table.table_number > 0);

  return (
    <header className="w-full bg-[#F8F1EB] border-b border-[#D1A37A]/30 sticky top-0 z-30 shadow-2xs backdrop-blur-md bg-[#F8F1EB]/95">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Brand with Story Ring & Static Dot */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenStory}
            className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#D97706] via-[#B45309] to-[#F59E0B] shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer group"
            title={getTranslation(language, "ourStory", "Hikayemiz")}
            aria-label={getTranslation(language, "ourStory", "Hikayemiz")}
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

        {/* Right Actions: Dil Seçici, Wi-Fi & Arama */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
          {/* Language Selector (Translate) */}
          <LanguageSelector
            currentLanguage={language}
            onLanguageChange={onLanguageChange}
          />
          {/* Instagram Action Button */}
          <a
            href={BUSINESS_INFO.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram @noacroissant"
            aria-label="Instagram @noacroissant"
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white shadow-2xs hover:opacity-90 flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Instagram className="w-4 h-4 text-white stroke-[2.2]" />
          </a>

          {/* Wi-Fi Action Button */}
          {onOpenWifi && (
            <button
              type="button"
              onClick={onOpenWifi}
              title={getTranslation(language, "connectWifi", "Wi-Fi Ağına Bağlan")}
              aria-label={getTranslation(language, "wifiNetwork", "Wi-Fi Ağı")}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white border-0 shadow-none flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Wifi className="w-4 h-4 text-white stroke-[2.4]" />
            </button>
          )}

          {/* Search Box */}
          <button
            onClick={onOpenSearch}
            aria-label={getTranslation(language, "searchAria", "Ürün veya lezzet ara...")}
            className="h-9 sm:h-10 px-3 sm:px-3.5 rounded-full bg-white hover:bg-stone-50 text-[#381D05] flex items-center gap-2 border border-[#683B0C]/20 shadow-2xs transition-all cursor-pointer group active:scale-[0.98]"
          >
            <Search className="w-3.5 h-3.5 text-[#8C5828] group-hover:text-[#381D05] transition-colors shrink-0 stroke-[2.2]" />
            <span className="hidden sm:inline text-xs text-[#8C5828]/80 font-medium group-hover:text-[#381D05] truncate max-w-[130px] md:max-w-[170px]">
              {getTranslation(language, "searchPlaceholder", "Ürün veya lezzet ara...")}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
