import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Home, Utensils } from "lucide-react";

export const metadata: Metadata = {
  title: "Sayfa Bulunamadı (404) | NOA Croissant",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8F1EB] text-[#381D05] flex flex-col justify-between">
      <header className="w-full bg-[#F8F1EB]/95 backdrop-blur-md border-b border-[#D1A37A]/30 h-16 flex items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#683B0C]/20 bg-white">
            <Image
              src="/noa_icon.jpg"
              alt="NOA Croissant Logo"
              fill
              sizes="36px"
              className="object-cover"
            />
          </div>
          <div className="relative h-8 w-36">
            <Image
              src="/noa_text.png"
              alt="NOA Croissant"
              fill
              sizes="144px"
              className="object-contain object-left"
            />
          </div>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 max-w-lg mx-auto space-y-6">
        <div className="w-20 h-20 rounded-full bg-[#EAD8C5] border border-[#683B0C]/20 flex items-center justify-center text-3xl shadow-sm">
          🥐
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-[#2B231B] tracking-tight">
            Aradığınız Sayfa Bulunamadı
          </h1>
          <p className="text-sm text-[#4A2808]/80 font-medium leading-relaxed">
            Ulaşmak istediğiniz sayfa taşınmış veya silinmiş olabilir. Menümüze dönerek siparişinize devam edebilirsiniz.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="px-5 py-3 rounded-full bg-[#381D05] hover:bg-[#683B0C] text-white text-xs sm:text-sm font-extrabold shadow-sm flex items-center gap-2 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Menüye Dön</span>
          </Link>
        </div>
      </main>

      <footer className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-12 flex flex-col items-center justify-center">
        <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-xs border border-[#683B0C]/15 opacity-80">
          <Image
            src="/noa_icon.jpg"
            alt="NOA Amblem"
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
      </footer>
    </div>
  );
}
