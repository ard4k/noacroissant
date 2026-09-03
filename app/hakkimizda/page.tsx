import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { 
  Sparkles, 
  Clock, 
  MapPin, 
  Phone, 
  Instagram, 
  Utensils, 
  Award, 
  Heart, 
  ArrowLeft,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { BUSINESS_INFO } from "@/lib/businessConfig";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";

export const metadata: Metadata = {
  title: "Hakkımızda | NOA Croissant Alanya - El Yapımı Kruvasan & Kahve",
  description: "NOA Croissant'ın hikayesi: Alanya'da %100 Fransız tereyağı ile günlük taze hazırlanan kruvasanlar, Belçika çikolatası ve nitelikli kahve tutkusu.",
  alternates: {
    canonical: `${BUSINESS_INFO.siteUrl}/hakkimizda`,
  },
  openGraph: {
    title: "Hakkımızda | NOA Croissant Alanya",
    description: "Alanya'da gerçek Fransız kruvasanı ve nitelikli kahve sanatı.",
    url: `${BUSINESS_INFO.siteUrl}/hakkimizda`,
    type: "website",
    images: [
      {
        url: `${BUSINESS_INFO.siteUrl}/story-1.jpg`,
        width: 1200,
        height: 630,
        alt: "NOA Croissant Alanya",
      },
    ],
  },
};

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "NOA Croissant Hakkımızda",
    description: BUSINESS_INFO.description.tr,
    mainEntity: {
      "@type": "Bakery",
      name: BUSINESS_INFO.name,
      legalName: BUSINESS_INFO.legalName,
      url: BUSINESS_INFO.siteUrl,
      telephone: BUSINESS_INFO.telephone,
      address: {
        "@type": "PostalAddress",
        streetAddress: BUSINESS_INFO.address.streetAddress,
        addressLocality: BUSINESS_INFO.address.addressLocality,
        addressRegion: BUSINESS_INFO.address.addressRegion,
        postalCode: BUSINESS_INFO.address.postalCode,
        addressCountry: BUSINESS_INFO.address.addressCountry,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: BUSINESS_INFO.geo.latitude,
        longitude: BUSINESS_INFO.geo.longitude,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#F8F1EB] text-[#381D05] flex flex-col justify-between">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="w-full bg-[#F8F1EB]/95 backdrop-blur-md border-b border-[#D1A37A]/30 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-white shadow-xs bg-white">
              <Image
                src="/noa_icon.jpg"
                alt="NOA Icon"
                fill
                sizes="40px"
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                priority
              />
            </div>
            <div className="relative h-7 sm:h-8 w-32 sm:w-40">
              <Image
                src="/noa_text.png"
                alt="NOA CROISSANT"
                fill
                sizes="160px"
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          <Link
            href="/"
            className="px-4 py-2 rounded-full bg-[#381D05] hover:bg-[#4A2808] text-[#FAF4EE] text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Menüye Dön</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: "Hakkımızda" }]} />

        {/* Hero Section */}
        <section className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAD8C5]/70 border border-[#D1A37A]/40 text-xs font-bold text-[#8C5828]">
            <Sparkles className="w-3.5 h-3.5 text-[#D1A37A]" />
            <span>Artisan Bakery & Specialty Coffee</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-5xl font-black text-[#2B1704] tracking-tight leading-tight">
            Tutkuyla Katlanan Katlar, Unutulmaz Lezzetler
          </h1>
          <p className="text-sm sm:text-base text-stone-600 font-medium leading-relaxed">
            NOA Croissant olarak, geleneksel Fransız pastacılık tekniklerini Alanya’nın sıcak ve samimi atmosferiyle buluşturuyoruz.
          </p>
        </section>

        {/* Story Visual & Story Text */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white rounded-3xl p-6 sm:p-10 border border-[#D1A37A]/25 shadow-xs">
          <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-md">
            <Image
              src="/story-1.jpg"
              alt="NOA Kruvasan Hazırlığı"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="space-y-4">
            <h2 className="font-editorial text-2xl sm:text-3xl font-black text-[#381D05]">
              Hikayemiz
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              Her sabah fırınımızdan yayılan taze tereyağı kokusu, saatler süren titiz bir emeğin sonucudur. %100 gerçek Fransız tereyağı ile günlerce dinlendirilen hamurlarımız, fırından altın sarısı ve çıtır çıtır çıkar.
            </p>
            <p className="text-sm text-stone-600 leading-relaxed">
              Orijinal Belçika çikolataları, günlük taze meyveler ve özenle kavrulmuş nitelikli kahve çekirdeklerimizle her masada ayrı bir lezzet serüveni sunuyoruz.
            </p>
          </div>
        </section>

        {/* 3 Core Values / Pillars */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#D1A37A]/20 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF4EE] text-[#8C5828] flex items-center justify-center border border-[#D1A37A]/30">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#381D05]">
              %100 Gerçek Tereyağı
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Kruvasanlarımızın hafifliği ve lezzet sırrı, sadece en kaliteli saf tereyağı kullanmamızda saklı.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#D1A37A]/20 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF4EE] text-[#8C5828] flex items-center justify-center border border-[#D1A37A]/30">
              <Utensils className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#381D05]">
              Günlük Taze Üretim
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Katkısız, saf ve her gün taptaze pişirilen lezzetlerle sofranıza ulaşıyoruz.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#D1A37A]/20 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF4EE] text-[#8C5828] flex items-center justify-center border border-[#D1A37A]/30">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#381D05]">
              Nitelikli Kahve
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Özel kavrum kahve çekirdeklerimiz, kruvasanınızın eşlikçisi olarak kusursuz bir uyum sağlar.
            </p>
          </div>
        </section>

        {/* Location & Map Section */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D1A37A]/25 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-editorial text-2xl sm:text-3xl font-black text-[#381D05]">
                Bizi Ziyaret Edin
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Alanya’nın merkezinde, taptaze kruvasanlar ve sıcak kahve eşliğinde bekliyoruz.
              </p>
            </div>
            <a
              href={BUSINESS_INFO.social.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FAF4EE] hover:bg-[#EAD8C5] text-xs font-bold text-[#381D05] border border-[#D1A37A]/40 transition-all active:scale-95 shrink-0"
            >
              <MapPin className="w-4 h-4 text-[#8C5828]" />
              <span>Haritada Aç</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs text-stone-700">
            <div className="p-4 rounded-xl bg-[#FAF4EE]/70 border border-[#D1A37A]/20 space-y-1">
              <span className="font-bold text-[#381D05] block">Adres</span>
              <span>{BUSINESS_INFO.address.formatted}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF4EE]/70 border border-[#D1A37A]/20 space-y-1">
              <span className="font-bold text-[#381D05] block">Çalışma Saatleri</span>
              <span>{BUSINESS_INFO.openingHoursDays} ({BUSINESS_INFO.openingHours})</span>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF4EE]/70 border border-[#D1A37A]/20 space-y-1">
              <span className="font-bold text-[#381D05] block">Telefon</span>
              <a href={`tel:${BUSINESS_INFO.telephone}`} className="text-[#8C5828] font-bold hover:underline">
                {BUSINESS_INFO.displayPhone}
              </a>
            </div>
          </div>

          {/* Embedded Interactive Map */}
          <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-[#D1A37A]/30 shadow-inner">
            <iframe
              title="NOA Croissant Konum Haritası"
              src={BUSINESS_INFO.social.googleMapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Cookie Consent Banner */}
      <CookieBanner language="tr" />
    </div>
  );
}
