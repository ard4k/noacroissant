"use client";

import React from "react";
import Image from "next/image";
import { BRAND_ASSETS } from "@/lib/images";
import { Sparkles, UtensilsCrossed } from "lucide-react";

export function IntroSection() {
  return (
    <section className="relative pt-6 pb-4 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Decorative Tilted Text Stamps in the background */}
      <div className="absolute top-2 left-0 -rotate-12 text-[#2B231B]/10 font-black text-2xl tracking-widest uppercase pointer-events-none select-none hidden lg:block">
        BAKERY & CROISSANT
      </div>
      <div className="absolute top-6 right-0 rotate-12 text-[#2B231B]/10 font-black text-2xl tracking-widest uppercase pointer-events-none select-none hidden lg:block">
        CRISPY & SWEET
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        {/* Left Headline */}
        <div className="max-w-xl space-y-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2B231B] tracking-tight uppercase">
            NOA menüsünü keşfet.
          </h1>
          <p className="text-sm sm:text-base text-[#2B231B]/80 font-medium leading-relaxed">
            Kruvasan, tatlı & tuzlu lezzetler, kahve ve fırından taze favoriler. Her detayıyla özenli, sıcak ve sade.
          </p>
        </div>

        {/* Right Stamp Graphics */}
        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
          {/* Circular Stamp */}
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 border-dashed border-[#2B231B] flex flex-col items-center justify-center p-1 text-center rotate-6 hover:rotate-0 transition-transform">
            <span className="text-[8px] font-black uppercase text-[#2B231B] tracking-widest">
              NOA
            </span>
            <span className="text-[7.5px] font-bold text-[#2B231B]/70">
              ARTISAN
            </span>
          </div>

          {/* Ticket Tag Badge */}
          <div className="px-3.5 py-2 rounded-xl bg-[#2B231B] text-white rotate-[-4deg] shadow-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-black uppercase tracking-wider">
              TAZE FIRIN
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
