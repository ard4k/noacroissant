"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, Languages, ChevronDown, Check, Sparkles } from "lucide-react";
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
      {/* Modern Aesthetic Blue Language Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 sm:h-10 px-3 sm:px-3.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center gap-1.5 border-0 shadow-none transition-all active:scale-95 cursor-pointer select-none group"
        aria-label="Dil Seçimi"
        aria-expanded={isOpen}
      >
        <Languages className="w-4 h-4 text-white stroke-[2.4] shrink-0" />
        <span className="text-[11px] font-black tracking-wider text-white">
          {selectedLang.code.toUpperCase()}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-white/90 transition-transform duration-200 ease-out ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Luxury Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border-2 border-[#381D05]/20 shadow-[0_16px_40px_rgba(42,22,4,0.22)] z-[999] p-2 animate-fadeIn max-h-96 overflow-y-auto">
          <div className="px-3 py-2 mb-1.5 border-b border-[#381D05]/10 flex items-center justify-between text-[11px] font-black text-[#683B0C] uppercase tracking-wider bg-[#FAF4EE] rounded-xl">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#8C5828]" />
              <span>DİL SEÇİMİ / LANGUAGE</span>
            </span>
          </div>

          <div className="space-y-1">
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    isSelected
                      ? "bg-[#381D05] text-white font-black shadow-sm"
                      : "text-[#2A1604] hover:bg-[#FAF4EE] hover:text-[#120700]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg leading-none drop-shadow-xs">{lang.flag}</span>
                    <div>
                      <p className={`font-black text-xs leading-tight ${isSelected ? "text-white" : "text-[#2A1604]"}`}>
                        {lang.nativeName}
                      </p>
                      <p className={`text-[10px] font-bold ${isSelected ? "text-amber-200" : "text-stone-500"}`}>
                        {lang.name}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;
