import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, MapPin, Phone, Clock, ArrowUpRight } from "lucide-react";
import { BUSINESS_INFO } from "@/lib/businessConfig";

export function Footer() {
  return (
    <footer className="w-full bg-[#241408] text-[#F8F1EB] border-t border-[#D1A37A]/20 pt-12 pb-16 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#D1A37A]/40 bg-white">
                <Image
                  src="/noa_icon.jpg"
                  alt="NOA Icon"
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="relative h-8 w-36 brightness-125">
                <Image
                  src="/noa_text.png"
                  alt="NOA Croissant"
                  fill
                  sizes="144px"
                  className="object-contain object-left"
                />
              </div>
            </div>
            <p className="text-sm text-stone-300 max-w-md leading-relaxed font-normal">
              {BUSINESS_INFO.description.tr}
            </p>
            <div className="pt-2">
              <a
                href={BUSINESS_INFO.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all"
              >
                <Instagram className="w-3.5 h-3.5 text-[#D1A37A]" />
                <span>{BUSINESS_INFO.social.instagramHandle}</span>
                <ArrowUpRight className="w-3 h-3 opacity-70" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold tracking-wider uppercase text-[#D1A37A]">
              Hızlı Bağlantılar
            </h4>
            <ul className="space-y-2 text-sm text-stone-300">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Menü
                </Link>
              </li>
              <li>
                <Link href="/hakkimizda" className="hover:text-white transition-colors">
                  Hakkımızda & Hikayemiz
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold tracking-wider uppercase text-[#D1A37A]">
              İletişim & Konum
            </h4>
            <div className="space-y-2.5 text-xs text-stone-300">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D1A37A] shrink-0 mt-0.5" />
                <a
                  href={BUSINESS_INFO.social.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors leading-tight"
                >
                  {BUSINESS_INFO.address.formatted}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D1A37A] shrink-0" />
                <a
                  href={`tel:${BUSINESS_INFO.telephone}`}
                  className="hover:text-white transition-colors"
                >
                  {BUSINESS_INFO.displayPhone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D1A37A] shrink-0" />
                <span>{BUSINESS_INFO.openingHoursDays} ({BUSINESS_INFO.openingHours})</span>
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} {BUSINESS_INFO.name}. Tüm hakları saklıdır.</p>
          <p className="text-[11px] text-stone-500">Alanya Artisan Croissant & Specialty Coffee</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
