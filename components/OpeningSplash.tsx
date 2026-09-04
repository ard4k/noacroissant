"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { BRAND_ASSETS } from "@/lib/images";

import { Language, getTranslation, detectDeviceLanguage } from "@/lib/i18n/translations";

interface OpeningSplashProps {
  onComplete?: () => void;
  onOpenStory?: () => void;
  language?: Language;
}

export function OpeningSplash({
  onComplete,
  onOpenStory,
  language = "tr",
}: OpeningSplashProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [activeLang, setActiveLang] = useState<Language>(language);

  useEffect(() => {
    setActiveLang(detectDeviceLanguage());
  }, []);

  useEffect(() => {
    if (language) setActiveLang(language);
  }, [language]);

  // Lock body & html scrolling completely while splash is visible
  useEffect(() => {
    if (!isVisible) return;

    const origBodyOverflow = document.body.style.overflow;
    const origHtmlOverflow = document.documentElement.style.overflow;
    const origTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    // Prevent default touch moves and wheel events
    const preventScroll = (e: Event) => {
      e.preventDefault();
    };

    window.addEventListener("touchmove", preventScroll, { passive: false });
    window.addEventListener("wheel", preventScroll, { passive: false });

    return () => {
      document.body.style.overflow = origBodyOverflow;
      document.documentElement.style.overflow = origHtmlOverflow;
      document.body.style.touchAction = origTouchAction;
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("wheel", preventScroll);
    };
  }, [isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    onComplete?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          onTouchMove={(e) => e.preventDefault()}
          onWheel={(e) => e.preventDefault()}
          className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-full h-[100dvh] min-h-[100dvh] z-[99999] flex flex-col items-center justify-center bg-[#F8F1EB] select-none overflow-hidden touch-none overscroll-none"
          style={{
            position: "fixed",
            inset: 0,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100dvh",
            backgroundColor: "#F8F1EB",
            zIndex: 99999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            willChange: "opacity, transform",
          }}
        >
          {/* Central Animated Content Card */}
          <div className="relative flex flex-col items-center text-center px-4 max-w-sm w-full">
            {/* 1. NOA Icon Badge - Clean & Pure (Borderless Transparent Emblem) */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-5"
            >
              <div
                className="relative w-28 h-28 sm:w-32 sm:h-32"
                style={{ position: "relative", width: 112, height: 112 }}
              >
                <Image
                  src="/brand/noa-icon.png"
                  alt="NOA Croissant Logo"
                  width={112}
                  height={112}
                  priority
                  className="object-contain"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>
            </motion.div>

            {/* 2. Official NOA Croissant Brand Typography (Transparent Vector PNG) */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="relative w-64 sm:w-72 h-14 sm:h-16 my-1 mx-auto flex items-center justify-center"
              style={{ position: "relative", width: 260, height: 56 }}
            >
              <Image
                src="/noa_text.png"
                alt="NOA Croissant"
                width={260}
                height={56}
                priority
                className="object-contain"
                style={{ width: "auto", height: "100%", objectFit: "contain" }}
              />
            </motion.div>

            {/* 3. Subtitle Tagline - Mixed Case (Positioned Lower) */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="mt-4 space-y-1"
            >
              <p className="text-xs sm:text-[13px] font-semibold text-[#8C5828] tracking-wider">
                Artisan Bakery & Specialty Coffee
              </p>
              <div className="w-12 h-0.5 bg-[#8C5828]/25 mx-auto rounded-full mt-2.5" />
            </motion.div>

            {/* 4. Action Buttons: Hikayemiz & Menüyü Keşfet (Guaranteed Single-Line) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="mt-8 w-full flex items-center justify-center"
            >
              <div className="flex flex-row items-center justify-center gap-2.5 w-full max-w-sm px-2">
                {onOpenStory && (
                  <button
                    type="button"
                    onClick={() => {
                      handleDismiss();
                      onOpenStory();
                    }}
                    className="flex-1 min-w-[135px] px-3.5 py-3 rounded-full bg-gradient-to-r from-[#FAF0E4] via-[#F6E9DA] to-[#EFE2D2] hover:from-[#F6E9DA] hover:to-[#EAD8C5] text-[#381D05] border border-[#8C5828]/35 font-extrabold text-[11.5px] sm:text-xs tracking-wider shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0 group"
                  >
                    <div className="relative w-4.5 h-4.5 min-w-[18px] min-h-[18px] shrink-0 group-hover:scale-110 transition-transform">
                      <Image
                        src="/brand/noa-icon.png"
                        alt="NOA"
                        fill
                        sizes="18px"
                        className="object-contain"
                      />
                    </div>
                    <span>{getTranslation(activeLang, "ourStory", "Hikayemiz")}</span>
                    <span className="text-[#8C5828] text-[13px] font-extrabold -ml-0.5">↗</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    handleDismiss();
                  }}
                  className="flex-1 min-w-[155px] px-4 py-3 rounded-full bg-[#381D05] hover:bg-[#683B0C] text-[#FAF0E4] font-extrabold text-[12px] sm:text-[13px] tracking-wide shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span className="text-sm">🥐</span>
                  <span>{getTranslation(activeLang, "exploreMenu", "Menüyü Keşfet")}</span>
                  <span className="text-[#D97706]">➔</span>
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default OpeningSplash;
