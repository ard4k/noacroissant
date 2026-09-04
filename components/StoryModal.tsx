"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Heart, Sparkles, Volume2, VolumeX } from "lucide-react";
import { Language, getTranslation } from "@/lib/i18n/translations";

export interface StorySlide {
  id: string;
  tag: Record<Language, string>;
  title: Record<Language, string>;
  description: Record<Language, string>;
  image: string;
  highlight?: Record<Language, string>;
  stickerText?: Record<Language, string>;
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
    image: "/story-1.webp",
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
    stickerText: {
      tr: "🥐 Hakiki Fransız Tereyağı",
      en: "🥐 Pure French Butter",
      de: "🥐 Echte französische Butter",
      ru: "🥐 Французское масло",
      nl: "🥐 Franse Boter",
      sv: "🥐 Franskt Smör",
      no: "🥐 Fransk Smør",
      fi: "🥐 Ranskalainen Voi",
      pl: "🥐 Francuskie Masło",
      ar: "🥐 زبدة فرنسية أصيلة",
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
    image: "/story-2.webp",
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
    stickerText: {
      tr: "🍫 Sıcak & Akışkan Lezzet",
      en: "🍫 Warm & Silky Melt",
      de: "🍫 Zartschmelzend & Warm",
      ru: "🍫 Горячий Шоколад",
      nl: "🍫 Warm Vloeiend",
      sv: "🍫 Varm & Krämig",
      no: "🍫 Varm & Kremet",
      fi: "🍫 Lämmintä & Samettista",
      pl: "🍫 Płynna Czekolada",
      ar: "🍫 شوكولاتة ذائبة غنية",
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
    image: "/story-3.webp",
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
    stickerText: {
      tr: "🍓 Sabah Bahçe Hasadı",
      en: "🍓 Daily Morning Harvest",
      de: "🍓 Frische Ernte",
      ru: "🍓 Утренний Сбор",
      nl: "🍓 Dagverse Oogst",
      sv: "🍓 Morgonskörd",
      no: "🍓 Morgenhøstet",
      fi: "🍓 Aamun Satoa",
      pl: "🍓 Świeże Zbiory",
      ar: "🍓 قطاف صباحي طازج",
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
    image: "/story-4.webp",
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
    stickerText: {
      tr: "✨ İkonik Amora & Roll",
      en: "✨ Iconic Amora & Roll",
      de: "✨ Ikonisches Amora & Roll",
      ru: "✨ Культовая Амора и Ролл",
      nl: "✨ Iconische Amora & Roll",
      sv: "✨ Ikonisk Amora & Roll",
      no: "✨ Ikonisk Amora & Roll",
      fi: "✨ Ikoninen Amora & Roll",
      pl: "✨ Kultowa Amora i Roll",
      ar: "✨ أمورا ورول الأيقوني",
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
    image: "/story-5.webp",
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
    stickerText: {
      tr: "☕ Nitelikli Kahve & Kruvasan",
      en: "☕ Specialty Coffee & Pastry",
      de: "☕ Spezialitätenkaffee & Genuss",
      ru: "☕ Спешелти Кофе и Выпечка",
      nl: "☕ Specialty Koffie & Croissant",
      sv: "☕ Specialkaffe & Bakverk",
      no: "☕ Spesialkaffe & Bakst",
      fi: "☕ Erikoiskahvi & Croissant",
      pl: "☕ Kawa Specialty i Rogalik",
      ar: "☕ قهوة مختصة وكرواسان",
    },
  },
];

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: Language;
  initialSlideIndex?: number;
}

export function StoryModal({
  isOpen,
  onClose,
  language = "tr",
  initialSlideIndex = 0,
}: StoryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [likedSlides, setLikedSlides] = useState<Record<number, boolean>>({});
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number }[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const SLIDE_DURATION_MS = 5000;
  const TICK_MS = 50;

  // Preload all story images in browser memory on initial render
  useEffect(() => {
    STORY_SLIDES.forEach((slide) => {
      const img = new window.Image();
      img.src = slide.image;
    });
  }, []);

  // Sync initial slide index when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialSlideIndex);
      setProgress(0);
      setIsPaused(false);
      setIsHolding(false);
    }
  }, [isOpen, initialSlideIndex]);

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

  // Heart reaction animation
  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentlyLiked = likedSlides[currentIndex];
    setLikedSlides((prev) => ({ ...prev, [currentIndex]: !isCurrentlyLiked }));

    if (!isCurrentlyLiked) {
      const newHeart = { id: Date.now(), x: Math.random() * 40 - 20 };
      setFloatingHearts((prev) => [...prev, newHeart]);
      setTimeout(() => {
        setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
      }, 1000);
    }
  };

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

  // When progress reaches 100%, advance slide
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
  const sticker = currentSlide.stickerText?.[language] || currentSlide.stickerText?.tr;
  const isLiked = Boolean(likedSlides[currentIndex]);

  return (
    <AnimatePresence>
      <motion.div
        key="story-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/95 sm:bg-black/85 backdrop-blur-2xl p-0 sm:p-4 select-none"
        style={{ zIndex: 100000 }}
      >
        {/* Backdrop dismiss on desktop */}
        <div
          onClick={onClose}
          className="absolute inset-0 hidden sm:block -z-10 cursor-pointer"
          aria-hidden="true"
        />

        {/* Desktop Flanking Navigation: Prev */}
        {currentIndex > 0 && (
          <button
            type="button"
            onClick={handlePrev}
            className="hidden sm:flex absolute left-8 lg:left-16 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center backdrop-blur-md border border-white/15 shadow-xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
            aria-label={getTranslation(language, "previous", "Önceki")}
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
        )}

        {/* Desktop Flanking Navigation: Next */}
        <button
          type="button"
          onClick={handleNext}
          className="hidden sm:flex absolute right-8 lg:right-16 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center backdrop-blur-md border border-white/15 shadow-xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
          aria-label={getTranslation(language, "next", "Sonraki")}
        >
          <ChevronRight className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Story Phone Container - True Fullscreen on Mobile / 9:16 Frame on Desktop */}
        <div className="relative w-full h-[100dvh] sm:h-[92vh] sm:max-h-[860px] sm:max-w-[420px] sm:aspect-[9/16] sm:rounded-[36px] overflow-hidden bg-black shadow-[0_25px_80px_rgba(0,0,0,0.9)] sm:border sm:border-white/15 flex flex-col justify-between">
          {/* Background Fullscreen Photography */}
          <div className="absolute inset-0 z-0 overflow-hidden bg-black">
            {STORY_SLIDES.map((slide, sIdx) => {
              const isActive = sIdx === currentIndex;
              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  <Image
                    src={slide.image}
                    alt={slide.title[language] || slide.title.tr}
                    fill
                    sizes="(max-width: 640px) 100vw, 420px"
                    priority={Math.abs(sIdx - currentIndex) <= 1}
                    className="object-cover object-center transform scale-[1.01]"
                  />
                  {/* Luxury Ambient Instagram Gradients: Top for header/progress & Bottom for caption */}
                  <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 inset-x-0 h-96 bg-gradient-to-t from-black/95 via-black/65 via-50% to-transparent pointer-events-none" />
                </div>
              );
            })}
          </div>

          {/* Top Bar: Progress Segments + Profile Header */}
          <div
            className={`relative z-20 pt-3 sm:pt-4 px-3.5 sm:px-4 space-y-2.5 transition-opacity duration-200 ${
              isHolding ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            {/* Segmented Story Progress Indicators */}
            <div className="flex items-center gap-1.5 w-full">
              {STORY_SLIDES.map((slide, idx) => {
                let fillPercent = 0;
                if (idx < currentIndex) fillPercent = 100;
                else if (idx === currentIndex) fillPercent = progress;

                return (
                  <div
                    key={slide.id}
                    className="flex-1 h-[3px] bg-white/35 rounded-full overflow-hidden backdrop-blur-xs"
                  >
                    <div
                      className="h-full bg-white transition-all duration-75 rounded-full"
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Instagram Profile Header & Controls */}
            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-center gap-2.5">
                {/* Profile Avatar with Instagram Gradient Ring */}
                <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-[#F59E0B] via-[#E11D48] to-[#9333EA] shadow-md">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border-[1.5px] border-black bg-black">
                    <Image
                      src="/noa_icon.jpg"
                      alt="NOA"
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-white font-black text-sm tracking-tight drop-shadow-sm">
                    noacroissant
                  </span>
                  <span className="w-1 h-1 rounded-full bg-white/60" />
                  <span className="text-white/70 font-semibold text-xs drop-shadow-sm">
                    {currentIndex + 1}/{STORY_SLIDES.length}
                  </span>
                </div>
              </div>

              {/* Top Right Controls: Pause Toggle & Close Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaused((prev) => !prev)}
                  className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white/90 flex items-center justify-center backdrop-blur-md border border-white/20 transition-all active:scale-90 cursor-pointer"
                  aria-label={isPaused ? "Oynat" : "Duraklat"}
                >
                  <span className="text-[10px] font-black uppercase">
                    {isPaused ? "▶" : "❚❚"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all active:scale-90 cursor-pointer"
                  aria-label={getTranslation(language, "closeModal", "Kapat")}
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Tap Areas for Navigation & Hold to Pause / Hide UI */}
          <div
            className="absolute inset-0 z-10 flex cursor-pointer"
            onPointerDown={() => {
              setIsPaused(true);
              setIsHolding(true);
            }}
            onPointerUp={() => {
              setIsPaused(false);
              setIsHolding(false);
            }}
            onPointerLeave={() => {
              setIsPaused(false);
              setIsHolding(false);
            }}
          >
            {/* Left Tap Zone: 30% Width -> Previous Slide */}
            <div
              className="w-1/3 h-full"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
            />
            {/* Right Tap Zone: 70% Width -> Next Slide */}
            <div
              className="w-2/3 h-full"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            />
          </div>

          {/* Floating Hearts Animation Container */}
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
            {floatingHearts.map((heart) => (
              <motion.div
                key={heart.id}
                initial={{ opacity: 1, y: 0, x: heart.x, scale: 0.8 }}
                animate={{ opacity: 0, y: -180, scale: 1.4 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute bottom-20 right-6 text-rose-500"
              >
                <Heart className="w-7 h-7 fill-rose-500" />
              </motion.div>
            ))}
          </div>

          {/* Bottom Content Area (Instagram Caption & Interactive Actions) */}
          <div
            className={`relative z-20 pb-6 sm:pb-7 px-5 space-y-3.5 transition-opacity duration-200 ${
              isHolding ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            {/* Stickers / Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              {sticker && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-extrabold text-[11px] shadow-sm">
                  <span>{sticker}</span>
                </div>
              )}

              {highlight && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/25 backdrop-blur-md border border-amber-300/40 text-amber-200 font-extrabold text-[11px] tracking-wide uppercase shadow-sm">
                  <Sparkles className="w-3 h-3 fill-amber-300 text-amber-300" />
                  <span>{highlight}</span>
                </div>
              )}
            </div>

            {/* Story Title & Description */}
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {title}
              </h2>
              <p className="text-white/90 text-xs sm:text-[13px] font-medium leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] line-clamp-3">
                {desc}
              </p>
            </div>

            {/* Bottom Interactive Bar (Instagram Story Swipe-up / Action Pill & Heart Reaction) */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-white/15 pointer-events-auto">
              {/* Instagram Story Action Button */}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-full bg-white hover:bg-[#FAF0E4] text-[#381D05] font-black text-xs shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{getTranslation(language, "viewMenu", "Menüyü İncele")}</span>
                <span className="text-[#8C5828] font-black">➔</span>
              </button>

              {/* Heart / Like Reaction Button */}
              <button
                type="button"
                onClick={handleToggleLike}
                className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all active:scale-90 cursor-pointer shadow-md ${
                  isLiked
                    ? "bg-rose-500/30 border-rose-400 text-rose-500 scale-105"
                    : "bg-white/15 hover:bg-white/25 border-white/25 text-white"
                }`}
                aria-label="Beğen"
              >
                <Heart
                  className={`w-5 h-5 transition-transform ${
                    isLiked ? "fill-rose-500 stroke-rose-500 scale-110" : "stroke-white"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default StoryModal;
