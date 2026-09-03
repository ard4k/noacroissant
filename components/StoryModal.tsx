"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Sparkles, Heart } from "lucide-react";
import { Language, getTranslation } from "@/lib/i18n/translations";

export interface StorySlide {
  id: string;
  tag: Record<Language, string>;
  title: Record<Language, string>;
  description: Record<Language, string>;
  image: string;
  highlight?: Record<Language, string>;
}

export const STORY_SLIDES: StorySlide[] = [
  {
    id: "slide-1",
    tag: {
      tr: "USTALIK & SABIR",
      en: "CRAFT & PATIENCE",
      de: "HANDWERK & GEDULD",
      ru: "МАСТЕРСТВО И ТЕРПЕНИЕ",
      nl: "VAKMANSCHAP & GEDULD",
      sv: "HANTVERK & TÅLAMOD",
      no: "HÅNDVERK & TÅLMODIGHET",
      fi: "KÄSITYÖTÄ & KÄRSIVÄLLISYYTTÄ",
      pl: "KUNSZT I CIERPLIWOŚĆ",
      ar: "حرفية وصبر",
    },
    title: {
      tr: "48 Saatlik Fransız Sabrı",
      en: "48-Hour French Patience",
      de: "48 Stunden französische Geduld",
      ru: "48 Часов Французского Терпения",
      nl: "48 Uur Franse Geduld",
      sv: "48 Timmars Fransk Perfektion",
      no: "48 Timers Fransk Perfeksjon",
      fi: "48 Tunnin Ranskalainen Kärsivällisyys",
      pl: "48 Godzin Francuskiej Cierpliwości",
      ar: "48 ساعة من الصبر الفرنسي",
    },
    description: {
      tr: "Gerçek kruvasan aceleye gelmez. Hakiki Fransız tereyağı ile hazırlanan hamurumuz, 48 saatlik soğuk fermantasyon sürecinde kat kat havalandırılır.",
      en: "Authentic croissants cannot be rushed. Crafted with pure French butter, our dough undergoes 48 hours of slow cold fermentation for featherlight flaky layers.",
      de: "Echtes Croissant braucht Zeit. Unser Teig mit reiner französischer Butter ruht 48 Stunden in kalter Fermentation für unvergleichliche Knusprigkeit.",
      ru: "Настоящий круассан не терпит спешки. Тесто на французском масле ферментируется 48 часов, создавая сотни воздушных хрустящих слоев.",
      nl: "Echte croissants vragen geduld. Bereid met zuivere Franse boter en 48 uur langzame koude fermentatie voor vederlichte bladerdeeglaagjes.",
      sv: "Äkta croissanter kan inte stressas fram. Bakad med franskt smör och 48 timmars kalljäsning för fjäderlätta spröda lager.",
      no: "Ekte croissanter krever tålmodighet. Laget med ekte fransk smør og 48 timers kaldheving for luftige, sprø lag.",
      fi: "Aitoa croissantia ei voi kiirehtiä. Valmistettu aidosta ranskalaisesta voista 48 tunnin kylmälepuutuksella täydellisen lehtevyyden takaamiseksi.",
      pl: "Prawdziwy croissant wymaga czasu. Nasze ciasto na francuskim maśle dojrzewa 48 godzin, tworząc setki chrupiących warstw.",
      ar: "الكرواسان الأصيل يحتاج وقتاً. نستخدم الزبدة الفرنسية النقية مع تخمير بطيء على البارد لمدة 48 ساعة لنصل إلى قرمشة فائقة وهشة.",
    },
    image: "/story-1.jpg?v=4",
    highlight: {
      tr: "Kat Kat Çıtır & Havadar",
      en: "Flaky & Featherlight",
      de: "Knusprig & Hauchzart",
      ru: "Воздушный и Хрустящий",
      nl: "Knapperig & Luchtig",
      sv: "Frasig & Luftig",
      no: "Sprø & Luftig",
      fi: "Rapea & Ilmava",
      pl: "Chrupiący i Lekki",
      ar: "طبقات هشة ومقرمشة",
    },
  },
  {
    id: "slide-2",
    tag: {
      tr: "SAF BELÇİKA ÇİKOLATASI",
      en: "PURE BELGIAN CHOCOLATE",
      de: "ECHTE BELGISCHE SCHOKOLADE",
      ru: "БЕЛЬГИЙСКИЙ ШОКОЛАД",
      nl: "ZUIVERE BELGISCHE CHOCOLADE",
      sv: "ÄKTA BELGISK CHOKLAD",
      no: "EKTE BELGISK SJOKOLADE",
      fi: "AITOA BELGIALAISTA SUKLAATA",
      pl: "PRAWDZIWA BELGIJSKA CZEKOLADA",
      ar: "شوكولاتة بلجيكية نقية",
    },
    title: {
      tr: "Akışkan Çikolata Aşkı",
      en: "Flowing Chocolate Passion",
      de: "Fließende Schokoladen-Leidenschaft",
      ru: "Страсть к Текучему Шоколаду",
      nl: "Vloeiende Chocoladepassie",
      sv: "Flytande Chokladmagi",
      no: "Flytende Sjokolademagi",
      fi: "Valuvaa Suklaaintoutta",
      pl: "Płynna Czekoladowa Pasja",
      ar: "عشق الشوكولاتة الذائبة",
    },
    description: {
      tr: "Fırından yeni çıkmış sıcak kruvasanın çıtırtısıyla buluşan sıcak Belçika çikolatası, her ısırıkta unutulmaz bir lezzet şöleni yaşatır.",
      en: "Silky warm Belgian chocolate melting inside freshly baked crisp croissants creates an unforgettable taste sensation in every bite.",
      de: "Warme belgische Schokolade, die im ofenfrischen Croissant schmilzt, schenkt bei jedem Bissen einen unvergleichlichen Genuss.",
      ru: "Нежный теплый бельгийский шоколад, тающий внутри свежеиспеченного хрустящего круассана, дарит восторг с первого кусочка.",
      nl: "Zijdezachte warme Belgische chocolade die smelt in versgebakken knapperige croissants bezorgt een onvergetelijke smaakbeleving.",
      sv: "Varm silkeslen belgisk choklad som smälter i nygräddade frasiga croissanter bjuder på en magisk smakupplevelse.",
      no: "Varm belgisk sjokolade som smelter i nybakte sprø croissanter gir en uforglemmelig smaksopplevelse i hver bit.",
      fi: "Lämmin silkkinen belgialainen suklaa yhdistettynä uunituoreeseen rapeaan croissantiin luo unohtumattoman makuelämyksen.",
      pl: "Aksamitna, ciepła belgijska czekolada rozpływająca się w świeżo upieczonym croissancie to rozkosz w każdym kęsie.",
      ar: "الشوكولاتة البلجيكية الساخنة الغنية تذوب داخل الكرواسان المقرمش الطازج لتمنحك متعة تذوق استثنائية.",
    },
    image: "/story-2.jpg?v=4",
    highlight: {
      tr: "Callebaut & Nutella",
      en: "Callebaut & Nutella",
      de: "Callebaut & Nutella",
      ru: "Callebaut и Nutella",
      nl: "Callebaut & Nutella",
      sv: "Callebaut & Nutella",
      no: "Callebaut & Nutella",
      fi: "Callebaut & Nutella",
      pl: "Callebaut & Nutella",
      ar: "شوكولاتة بلجيكية فاخرة",
    },
  },
  {
    id: "slide-3",
    tag: {
      tr: "TAZE & DOĞAL",
      en: "FRESH & NATURAL",
      de: "FRISCH & NATÜRLICH",
      ru: "СВEЖЕСТЬ И НАТУРАЛЬНОСТЬ",
      nl: "VERS & NATUURLIJK",
      sv: "FÄRSKT & NATURLIGT",
      no: "FERSKT & NATURLIG",
      fi: "TUORETTA & LUONNOLLISTA",
      pl: "ŚWIEŻE I NATURALNE",
      ar: "طبيعي وطازج يومياً",
    },
    title: {
      tr: "Alanya'nın Bahçe Meyveleri",
      en: "Fresh Garden Berries",
      de: "Frische Gartenfrüchte",
      ru: "Свежие Садовые Ягоды",
      nl: "Verse Tuinvruchten",
      sv: "Färska Trädgårdsbär",
      no: "Ferske Hagebær",
      fi: "Tuoreet Puutarhamarjat",
      pl: "Świeże Owoce Ogrodowe",
      ar: "فواكه وبساتين طازجة",
    },
    description: {
      tr: "Her sabah yerel üreticilerden özenle seçilen taze çilek, muz, frambuaz ve yaban mersinleri; ipeksi pastacı kremamızla anlık olarak buluşur.",
      en: "Hand-picked sweet strawberries, blueberries and raspberries sourced fresh every morning, paired with our velvety French patisserie cream.",
      de: "Jeden Morgen handverlesene frische Erdbeeren, Blaubeeren und Himbeeren harmonieren mit unserer samtigen Konditorcreme.",
      ru: "Каждое утро мы отбираем свежую клубнику, чернику и малину, соединяя их с нашим нежнейшим заварным кондитерским кремом.",
      nl: "Elke ochtend vers geselecteerde aardbeien, bosbessen en frambozen gecombineerd met onze zachte banketbakkersroom.",
      sv: "Handplockade färska jordgubbar, blåbär och hallon varje morgon tillsammans med vår lena vaniljkräm.",
      no: "Håndplukkede ferske jordbær, blåbær og bringebær hver morgen sammen med vår silkemyke vaniljekrem.",
      fi: "Joka aamu tuoreina valitut mansikat, mustikat ja vadelmat yhdistettynä samettiseen kondiittorinkreemiimme.",
      pl: "Codziennie rano świeżo wybierane truskawki, borówki i maliny w połączeniu z naszym aksamitnym kremem cukierniczym.",
      ar: "نختار كل صباح أجود حبات الفراولة، التوت البري وتوت العليق الطازج لنمزجها مع كريمة الباتيسير الفرنسية الفاخرة.",
    },
    image: "/story-3.jpg?v=4",
    highlight: {
      tr: "Günlük El Emeği",
      en: "Handcrafted Daily",
      de: "Täglich Handgemacht",
      ru: "Ежедневный Ручной Труд",
      nl: "Dagelijks Ambachtelijk",
      sv: "Hantverk Varje Dag",
      no: "Håndlaget Hver Dag",
      fi: "Päivittäin Käsintehty",
      pl: "Codziennie Rzemieślniczo",
      ar: "صنع يدوي طازج يومياً",
    },
  },
  {
    id: "slide-4",
    tag: {
      tr: "İNOVASYON & TASARIM",
      en: "INNOVATION & DESIGN",
      de: "INNOVATION & DESIGN",
      ru: "ИННОВАЦИИ И ДИЗАЙН",
      nl: "INNOVATIE & DESIGN",
      sv: "INNOVATION & DESIGN",
      no: "INNOVASJON & DESIGN",
      fi: "INNOVAATIO & MUOTOILU",
      pl: "INNOWACJA I DESIGN",
      ar: "ابتكار وتصميم عصري",
    },
    title: {
      tr: "Bir Kruvasandan Daha Fazlası",
      en: "More Than Just a Croissant",
      de: "Mehr als nur ein Croissant",
      ru: "Больше чем просто Круассан",
      nl: "Meer dan zomaar een croissant",
      sv: "Mer än bara en croissant",
      no: "Mer enn bare en croissant",
      fi: "Enemmän kuin vain croissant",
      pl: "Więcej niż zwykły croissant",
      ar: "أكثر من مجرد كرواسان",
    },
    description: {
      tr: "İkonik kalp formundaki Amora, çıtır Roll ve küp kruvasan inovasyonlarımızla klasik Fransız lezzetini modern gastronomi sanatına dönüştürüyoruz.",
      en: "From our iconic heart-shaped Amora to circular Rolls and Cube croissants, we transform classic French pastry into modern culinary art.",
      de: "Vom ikonischen Amora-Herz bis hin zu Roll- und Würfel-Croissants verbinden wir traditionelle Backkunst mit modernem Design.",
      ru: "От нашего культового сердца Амора до круглых роллов и кубических круассанов — мы превращаем классику в современное искусство.",
      nl: "Van onze iconische hartvormige Amora tot ronde Roll en Kubus croissants: wij verheffen klassieke patisserie tot moderne kunst.",
      sv: "Från vårt ikoniska hjärtformade Amora till runda Roll och Kubcroissanter förvandlar vi klassiskt hantverk till modern konst.",
      no: "Fra vårt ikoniske hjerteformede Amora til runde Roll og Kubecroissanter forvandler vi klassisk bakverk til moderne kunst.",
      fi: "Ikonisesta sydämenmuotoisesta Amorasta aina pyöreisiin Roll- ja Kuutiocroissantteihin luomme modernia leipomotaidetta.",
      pl: "Od naszego kultowego serca Amora po okrągłe Roll i Kostki — zmieniamy klasyczne wypieki w nowoczesną sztukę kulinarną.",
      ar: "من كرواسان أمورا الأيقوني على شكل قلب إلى رول ومكعب الكرواسان المبتكر، نحول فن المخبوزات الكلاسيكي إلى تجربة عصرية استثنائية.",
    },
    image: "/story-4.jpg?v=4",
    highlight: {
      tr: "NOA Özel İmzası",
      en: "NOA Signature Creations",
      de: "NOA Signatur-Kreationen",
      ru: "Фирменный Почерк NOA",
      nl: "NOA Signature Creaties",
      sv: "NOA Signaturkreationer",
      no: "NOA Signaturkreasjoner",
      fi: "NOA Signatuuriluomukset",
      pl: "Autorskie Kreacje NOA",
      ar: "إبداعات نوا الحصرية",
    },
  },
  {
    id: "slide-5",
    tag: {
      tr: "NOA CROISSANT AİLESİ",
      en: "THE NOA EXPERIENCE",
      de: "DAS NOA ERLEBNIS",
      ru: "АТМОСФЕРА NOA",
      nl: "DE NOA BELEVING",
      sv: "NOA UPPLEVELSEN",
      no: "NOA OPPLEVELSEN",
      fi: "NOA ELÄMYS",
      pl: "DOŚWIADCZENIE NOA",
      ar: "تجربة نوا الفريدة",
    },
    title: {
      tr: "Masanıza Keyif Katıyoruz",
      en: "Crafted for Your Table",
      de: "Genuss an Ihrem Tisch",
      ru: "Удовольствие за Вашим Столом",
      nl: "Puur Genieten Aan Tafel",
      sv: "Njutning Vid Ditt Bord",
      no: "Nytelse Ved Bordet",
      fi: "Nautintoa Pöytääsi",
      pl: "Przyjemność Przy Twoim Stoliku",
      ar: "متعة حقيقية على طاولتك",
    },
    description: {
      tr: "Sıcak kruvasan kokusu, taze demlenmiş nitelikli kahveler ve sıcak atmosferimizle gününüze tatlı bir dokunuş katmaktan mutluluk duyuyoruz.",
      en: "With the scent of warm golden croissants, specialty brewed coffees and our inviting ambience, we are delighted to sweeten your day.",
      de: "Mit dem Duft warmer goldener Croissants, frisch gebrühtem Spezialitätenkaffee und herzlicher Atmosphäre versüßen wir Ihren Tag.",
      ru: "Аромат теплой выпечки, спешелти кофе свежей обжарки и наша уютная атмосфера созданы для ваших идеальных моментов.",
      nl: "Met de geur van warme croissants, verse specialty koffie en onze gezellige sfeer maken wij uw dag graag een stukje mooier.",
      sv: "Med doften av nybakade croissanter, noga bryggt specialkaffe och varm atmosfär förgyller vi gärna din dag.",
      no: "Med duften av varme croissanter, nydelig spesialkaffe og vår varme atmosfære gleder vi oss til å gjøre dagen din søtere.",
      fi: "Lämpimien croissanttien tuoksu, tuore erikoiskahvi ja lämmin tunnelma tuovat iloa ja nautintoa päivääsi.",
      pl: "Zapach ciepłych croissantów, wyśmienita kawa specialty i nasza serdeczna atmosfera umilą każdy Twój dzień.",
      ar: "مع عبير الكرواسان الطازج، القهوة المختصة الفاخرة وأجوائنا الدافئة، يسعدنا أن نضيف لمسة من البهجة إلى يومكم.",
    },
    image: "/story-5.jpg?v=4",
    highlight: {
      tr: "Afiyet Olsun!",
      en: "Bon Appétit!",
      de: "Guten Appetit!",
      ru: "Приятного Аппетита!",
      nl: "Eet Smakelijk!",
      sv: "Smaklig Måltid!",
      no: "God Fornøyelse!",
      fi: "Hyvää Ruokahalua!",
      pl: "Smacznego!",
      ar: "بالهناء والشفاء!",
    },
  },
];

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: Language;
}

export function StoryModal({
  isOpen,
  onClose,
  language = "tr",
}: StoryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const SLIDE_DURATION_MS = 5000;
  const TICK_MS = 50;

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setProgress(0);
      setIsPaused(false);
    }
  }, [isOpen]);

  // Lock body scrolling when story is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  const handleNext = useCallback(() => {
    setProgress(0);
    if (currentIndex < STORY_SLIDES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  }, [currentIndex, onClose]);

  const handlePrev = useCallback(() => {
    setProgress(0);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Timer loop for progress bar
  useEffect(() => {
    if (!isOpen || isPaused) return;

    timerRef.current = setInterval(() => {
      setProgress((prev) => Math.min(100, prev + (TICK_MS / SLIDE_DURATION_MS) * 100));
    }, TICK_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isPaused]);

  // When progress reaches 100%, safely advance slide in effect phase
  useEffect(() => {
    if (progress >= 100) {
      handleNext();
    }
  }, [progress, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen) return null;

  const currentSlide = STORY_SLIDES[currentIndex];
  const tag = currentSlide.tag[language] || currentSlide.tag.tr;
  const title = currentSlide.title[language] || currentSlide.title.tr;
  const desc = currentSlide.description[language] || currentSlide.description.tr;
  const highlight = currentSlide.highlight?.[language] || currentSlide.highlight?.tr;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 sm:bg-black/80 backdrop-blur-2xl p-0 sm:p-4 select-none"
      >
        {/* Backdrop dismiss on desktop */}
        <div
          onClick={onClose}
          className="absolute inset-0 hidden sm:block -z-10"
          aria-hidden="true"
        />

        {/* Story Phone Container */}
        <div className="relative w-full h-full sm:h-[90vh] sm:max-w-md sm:rounded-[36px] overflow-hidden bg-black shadow-2xl flex flex-col justify-between">
          {/* Background Photo (Ultra High Definition & Smooth Transition) */}
          <div className="absolute inset-0 z-0 overflow-hidden bg-black">
            <div className="relative w-full h-full">
              {STORY_SLIDES.map((slide, sIdx) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    sIdx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  <Image
                    src={slide.image}
                    alt={slide.title[language] || slide.title.tr}
                    fill
                    priority
                    unoptimized
                    className="object-cover object-center"
                  />
                  {/* Luxury Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />
                </div>
              ))}
            </div>
          </div>

          {/* Top Bar: Progress Segments + Profile Header */}
          <div className="relative z-20 pt-4 sm:pt-5 px-4 space-y-3">
            {/* Story Progress Indicators */}
            <div className="flex items-center gap-1.5 w-full">
              {STORY_SLIDES.map((slide, idx) => {
                let fillPercent = 0;
                if (idx < currentIndex) fillPercent = 100;
                else if (idx === currentIndex) fillPercent = progress;

                return (
                  <div
                    key={slide.id}
                    className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-xs"
                  >
                    <div
                      className="h-full bg-white transition-all duration-75 rounded-full"
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Brand Header & Close Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-white/60 p-0.5 bg-white/20 shadow-md">
                  <Image
                    src="/noa_icon.jpg"
                    alt="NOA"
                    fill
                    sizes="36px"
                    className="object-cover rounded-full"
                  />
                </div>
                <div>
                  <h4 className="text-white font-extrabold text-sm tracking-wide">
                    Noa Croissant
                  </h4>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90 border border-white/20 cursor-pointer"
                aria-label={getTranslation(language, "closeModal", "Kapat")}
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Interactive Tap Areas for Navigation & Hold to Pause */}
          <div
            className="absolute inset-0 z-10 flex"
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {/* Left Tap: Previous */}
            <div
              className="w-1/3 h-full cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
            />
            {/* Right Tap: Next */}
            <div
              className="w-2/3 h-full cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            />
          </div>

          {/* Bottom Content Area */}
          <div className="relative z-20 pb-8 sm:pb-9 px-6 space-y-4">
            {highlight && (
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-amber-200 font-extrabold text-[11px] tracking-wider uppercase"
              >
                <Heart className="w-3 h-3 fill-amber-200" />
                <span>{highlight}</span>
              </div>
            )}

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                {title}
              </h2>
              <p className="text-white/85 text-xs sm:text-[13px] font-medium leading-relaxed drop-shadow-xs">
                {desc}
              </p>
            </div>

            {/* Bottom Action / Progress Cue */}
            <div className="pt-2 flex items-center justify-between border-t border-white/15">
              <span className="text-[10.5px] font-bold text-white/60 tracking-wider">
                {currentIndex + 1} / {STORY_SLIDES.length}
              </span>

              {currentIndex === STORY_SLIDES.length - 1 ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-full bg-white text-[#381D05] font-black text-xs shadow-lg hover:bg-[#FAF0E4] active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span>{getTranslation(language, "viewMenu", "Menüyü İncele")}</span>
                  <span>➔</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="text-white/80 hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>{getTranslation(language, "continue", "Devam Et")}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default StoryModal;
