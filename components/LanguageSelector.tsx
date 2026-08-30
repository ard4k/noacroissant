"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { Language, LANGUAGES } from "@/lib/i18n/translations";

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export function LanguageSelector({
  currentLanguage,
  onLanguageChange,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLang = LANGUAGES.find((l) => l.code === currentLanguage) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-[#381D05] border border-[#683B0C]/20 shadow-xs transition-all text-xs font-bold active:scale-95 cursor-pointer backdrop-blur-md"
        aria-label="Dil Seçimi"
      >
        <span className="text-base leading-none">{selectedLang.flag}</span>
        <span className="uppercase text-[11px] font-black tracking-wider hidden sm:inline">
          {selectedLang.code}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#8C5828] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-[#683B0C]/20 shadow-floating z-50 p-1.5 animate-fadeIn max-h-72 overflow-y-auto">
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLanguage;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  onLanguageChange(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-colors text-left cursor-pointer ${
                  isSelected
                    ? "bg-[#FAF0E4] text-[#381D05]"
                    : "text-stone-700 hover:bg-[#FAF4EE]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{lang.flag}</span>
                  <span className="font-sans">{lang.nativeName}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#15803D] stroke-[3]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
