"use client";

import React from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { Language } from "@/lib/i18n/translations";

interface StoryHighlightItem {
  id: string;
  index: number;
  image: string;
  emoji: string;
  title: Record<Language, string>;
  subtitle: Record<Language, string>;
}

export const STORY_HIGHLIGHTS: StoryHighlightItem[] = [
  {
    id: "hl-1",
    index: 0,
    image: "/story-1.webp",
    emoji: "🥐",
    title: {
      tr: "Hamurumuz",
      en: "Our Dough",
      de: "Unser Teig",
      ru: "Наше Тесто",
      nl: "Ons Deeg",
      sv: "Vår Deg",
      no: "Vår Deig",
      fi: "Taikinamme",
      pl: "Nasze Ciasto",
      ar: "عجينتنا",
    },
    subtitle: {
      tr: "48s Sabır",
      en: "48h Patience",
      de: "48h Geduld",
      ru: "48ч Терпения",
      nl: "48u Geduld",
      sv: "48t Tålamod",
      no: "48t Tålmodighet",
      fi: "48h Kärsivällisyys",
      pl: "48h Cierpliwości",
      ar: "٤٨ ساعة صبر",
    },
  },
  {
    id: "hl-2",
    index: 1,
    image: "/story-2.webp",
    emoji: "🍫",
    title: {
      tr: "Çikolatamız",
      en: "Chocolate",
      de: "Schokolade",
      ru: "Шоколад",
      nl: "Chocolade",
      sv: "Choklad",
      no: "Sjokolade",
      fi: "Suklaa",
      pl: "Czekolada",
      ar: "شوكولاتة",
    },
    subtitle: {
      tr: "Saf Belçika",
      en: "Pure Belgian",
      de: "Belgisch",
      ru: "Бельгийский",
      nl: "Puur Belgisch",
      sv: "Äkta Belgisk",
      no: "Ekte Belgisk",
      fi: "Belgialainen",
      pl: "Belgijska",
      ar: "بلجيكية فاخرة",
    },
  },
  {
    id: "hl-3",
    index: 2,
    image: "/story-3.webp",
    emoji: "🍓",
    title: {
      tr: "Meyveler",
      en: "Fresh Berries",
      de: "Früchte",
      ru: "Ягоды",
      nl: "Vruchten",
      sv: "Färska Bär",
      no: "Ferske Bær",
      fi: "Marjat",
      pl: "Owoce",
      ar: "فواكه طازجة",
    },
    subtitle: {
      tr: "Taze Bahçe",
      en: "Garden Fresh",
      de: "Gartenfrisch",
      ru: "Садовая Свежесть",
      nl: "Vers Geplukt",
      sv: "Nyskördat",
      no: "Nyhøstet",
      fi: "Tuorepoiminta",
      pl: "Świeże z Ogrodu",
      ar: "طازج يومياً",
    },
  },
  {
    id: "hl-4",
    index: 3,
    image: "/story-4.webp",
    emoji: "✨",
    title: {
      tr: "İnovasyon",
      en: "Innovation",
      de: "Innovation",
      ru: "Инновации",
      nl: "Innovatie",
      sv: "Innovation",
      no: "Innovasjon",
      fi: "Innovaatio",
      pl: "Innowacje",
      ar: "ابتكار",
    },
    subtitle: {
      tr: "Amora & Küp",
      en: "Amora & Cube",
      de: "Amora & Cube",
      ru: "Amora и Куб",
      nl: "Amora & Kubus",
      sv: "Amora & Kub",
      no: "Amora & Kube",
      fi: "Amora & Kuutio",
      pl: "Amora i Kostka",
      ar: "أمورا ومكعب",
    },
  },
  {
    id: "hl-5",
    index: 4,
    image: "/story-5.webp",
    emoji: "☕",
    title: {
      tr: "NOA Ruhu",
      en: "NOA Vibe",
      de: "NOA Geist",
      ru: "Дух NOA",
      nl: "NOA Beleving",
      sv: "NOA Känslan",
      no: "NOA Ånden",
      fi: "NOA Henki",
      pl: "Duch NOA",
      ar: "روح نوا",
    },
    subtitle: {
      tr: "Sıcak Keyif",
      en: "Warm Ambiance",
      de: "Herzlichkeit",
      ru: "Уют и Вкус",
      nl: "Warme Sfeer",
      sv: "Varm Atmosfär",
      no: "Varm Atmosfære",
      fi: "Lämmin Tunnelma",
      pl: "Ciepły Klimat",
      ar: "أجواء دافئة",
    },
  },
];

interface StoryHighlightsProps {
  onSelectStory: (index: number) => void;
  language?: Language;
}

export function StoryHighlights({
  onSelectStory,
  language = "tr",
}: StoryHighlightsProps) {
  return (
    <div className="w-full select-none">
      {/* Scroll Container */}
      <div className="flex items-center gap-3.5 sm:gap-5 overflow-x-auto no-scrollbar py-2 px-1 -mx-1">
        {STORY_HIGHLIGHTS.map((item) => {
          const title = item.title[language] || item.title.tr;
          const subtitle = item.subtitle[language] || item.subtitle.tr;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectStory(item.index)}
              className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer focus:outline-none"
              aria-label={title}
            >
              {/* Authentic Instagram Story Gradient Ring */}
              <div className="relative p-[2.5px] rounded-full bg-gradient-to-tr from-[#F59E0B] via-[#E11D48] to-[#9333EA] shadow-sm group-hover:shadow-md group-hover:scale-105 active:scale-95 transition-all duration-300">
                {/* White / Cream Gap Ring */}
                <div className="p-[2px] bg-[#F8F1EB] rounded-full">
                  {/* Circular Image Container */}
                  <div className="relative w-15 h-15 sm:w-18 sm:h-18 rounded-full overflow-hidden bg-[#E7DACD]">
                    <Image
                      src={item.image}
                      alt={title}
                      fill
                      sizes="72px"
                      priority={item.index < 3}
                      className="object-cover object-center group-hover:scale-110 transition-transform duration-500 ease-out"
                    />
                  </div>
                </div>

                {/* Subtle Emoji Badge */}
                <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white shadow-xs border border-[#F8F1EB] flex items-center justify-center text-[11px] leading-none pointer-events-none">
                  {item.emoji}
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="flex flex-col items-center text-center max-w-[72px] sm:max-w-[80px]">
                <span className="text-[11.5px] sm:text-xs font-bold text-[#5B330C] group-hover:text-[#9333EA] transition-colors truncate w-full">
                  {title}
                </span>
                <span className="text-[9.5px] font-medium text-[#8C5828]/80 truncate w-full hidden sm:block">
                  {subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default StoryHighlights;
