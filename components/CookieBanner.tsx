"use client";

import React, { useState, useEffect } from "react";
import { Cookie, ShieldCheck, X } from "lucide-react";
import { Language, getTranslation } from "@/lib/i18n/translations";

interface CookieBannerProps {
  language?: Language;
}

export function CookieBanner({ language = "tr" }: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("noa_cookie_consent");
      if (!consent) {
        // Small delay for smooth entry
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Storage unavailable
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem("noa_cookie_consent", "all");
      document.cookie = "noa_cookie_consent=all; path=/; max-age=31536000; SameSite=Lax";
    } catch {}
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem("noa_cookie_consent", "essential");
      document.cookie = "noa_cookie_consent=essential; path=/; max-age=31536000; SameSite=Lax";
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const t = (key: string, fallback: string) => getTranslation(language, key, fallback);

  return (
    <aside
      aria-label={t("cookieTitle", "Çerez & Gizlilik Tercihleri")}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-[380px] sm:max-w-md w-[calc(100vw-32px)] bg-[#241408]/95 backdrop-blur-md text-[#FAF4EE] border border-[#D1A37A]/40 shadow-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 animate-slideUp select-none"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-[#D1A37A]/20 border border-[#D1A37A]/40 flex items-center justify-center shrink-0 text-[#D1A37A]">
          <Cookie className="w-5 h-5" />
        </div>

        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs sm:text-sm font-black text-white tracking-tight flex items-center gap-1.5">
              <span>{t("cookieTitle", "Çerez & Gizlilik Tercihleri")}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
            </h4>
            <button
              type="button"
              onClick={handleEssentialOnly}
              className="text-stone-400 hover:text-white transition-colors p-1 -mr-1 cursor-pointer"
              title="Kapat"
              aria-label="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] sm:text-xs text-stone-300 font-medium leading-relaxed">
            {t(
              "cookieNotice",
              "Sitemizde en iyi deneyimi sunmak, siparişlerinizi ve masa oturumunuzu güvenle yönetmek için zorunlu ve işlevsel çerezler kullanılmaktadır."
            )}
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleAcceptAll}
              className="w-full px-4 py-2.5 rounded-xl bg-[#D1A37A] hover:bg-[#E5BE99] text-[#241408] font-black text-xs transition-all active:scale-98 shadow-sm cursor-pointer text-center"
            >
              {t("cookieAccept", "Tümünü Kabul Et")}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default CookieBanner;
