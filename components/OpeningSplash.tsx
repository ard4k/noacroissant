"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { BRAND_ASSETS } from "@/lib/images";

interface OpeningSplashProps {
  onComplete?: () => void;
  onOpenStory?: () => void;
}

export function OpeningSplash({
  onComplete,
  onOpenStory,
}: OpeningSplashProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onComplete?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-full h-full min-h-[100dvh] z-50 flex flex-col items-center justify-center bg-[#F8F1EB] select-none overflow-hidden"
          style={{ willChange: "opacity, transform" }}
        >
          {/* Central Animated Content Card */}
          <div className="relative flex flex-col items-center text-center px-4 max-w-sm w-full">
            {/* 1. NOA Icon Badge - Clean & Pure */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-5"
            >
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-white border border-[#683B0C]/15 shadow-sm">
                <Image
                  src={BRAND_ASSETS.logo || "/noa_icon.jpg"}
                  alt="NOA Croissant Logo"
                  fill
                  sizes="128px"
                  priority
                  className="object-cover"
                />
              </div>
            </motion.div>

            {/* 2. Official NOA Croissant Brand Typography (Transparent Vector PNG) */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="relative w-64 sm:w-72 h-14 sm:h-16 my-1 mx-auto flex items-center justify-center"
            >
              <Image
                src="/noa_text.png"
                alt="NOA Croissant"
                fill
                sizes="320px"
                priority
                className="object-contain"
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
                    className="flex-1 min-w-[130px] px-3.5 py-3 rounded-full bg-gradient-to-r from-[#FAF0E4] via-[#F6E9DA] to-[#EFE2D2] hover:from-[#F6E9DA] hover:to-[#EAD8C5] text-[#381D05] border border-[#8C5828]/35 font-extrabold text-[11.5px] sm:text-xs tracking-wider shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer group whitespace-nowrap shrink-0"
                  >
                    <div className="relative w-5 h-5 min-w-[20px] min-h-[20px] rounded-full overflow-hidden shrink-0 border border-[#8C5828]/50 shadow-2xs group-hover:scale-105 transition-transform">
                      <Image
                        src="/noa_icon.jpg"
                        alt="NOA"
                        fill
                        sizes="20px"
                        className="object-cover"
                      />
                    </div>
                    <span>Hikayemiz</span>
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
                  <span>Menüyü Keşfet</span>
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
