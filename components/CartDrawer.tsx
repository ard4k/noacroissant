"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Bell,
  Receipt,
  FileText,
  CreditCard,
  CheckCircle2,
  QrCode,
  ArrowLeft,
  ArrowRight,
  ReceiptText,
  Sparkles,
} from "lucide-react";
import { CartItem, Product, LocalizedText } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Language, getTranslation } from "@/lib/i18n/translations";
import {
  resolveLocalizedText,
  formatLocalizedPrice,
  getSortedAndFormattedOptionsLocalized,
} from "@/lib/i18n/resolver";
import { BRAND_ASSETS } from "@/lib/images";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  total: number;
  totalCount: number;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  generalNote: string;
  onSetGeneralNote: (note: string) => void;
  isSavouryEligible: boolean;
  complimentaryTeaClaimed: boolean;
  onToggleComplimentaryTea: (claimed: boolean) => void;
  onProceedCheckout: () => void;
  onAddDirectProduct?: (product: any) => void;
  tableLabel?: string;
  language?: Language;
}

interface UpsellItem {
  id: string;
  name: string;
  name_i18n?: LocalizedText;
  price: number;
  description: string;
  description_i18n?: LocalizedText;
  category: "coffee" | "drink" | "bakery";
}

const ALL_UPSELL_ITEMS: UpsellItem[] = [
  // NOA Special İçecekler
  {
    id: "prod-noa-turbo",
    name: "NOA Turbo",
    price: 140,
    description: "Özel tazeleyici enerji kokteyli",
    category: "drink",
  },
  {
    id: "prod-noa-full-depo",
    name: "NOA Full Depo",
    price: 140,
    description: "Süper vitamin taze meyve kokteyli",
    category: "drink",
  },
  {
    id: "prod-noa-benzin",
    name: "NOA Benzin",
    price: 140,
    description: "Kırmızı orman meyveli özel NOA karışımı",
    category: "drink",
  },
  {
    id: "prod-noa-dizel",
    name: "NOA Dizel",
    price: 140,
    description: "Tropikal meyve aromalı ferahlatıcı kokteyl",
    category: "drink",
  },
  {
    id: "prod-noa-mazot",
    name: "NOA Mazot",
    price: 140,
    description: "Şefin gizli tarifi ferahlatıcı NOA lezzeti",
    category: "drink",
  },
  {
    id: "prod-noa-antifriz",
    name: "NOA Antifriz",
    price: 140,
    description: "Buz gibi canlandırıcı nane ve narenciye",
    category: "drink",
  },
  {
    id: "prod-noa-motor-yagi",
    name: "NOA Motor Yağı",
    price: 140,
    description: "Koyu çikolatalı yoğun buzlu gurme içecek",
    category: "drink",
  },
  {
    id: "prod-el-yapimi-cilekli-limonata",
    name: "El Yapımı Çilekli Limonata",
    price: 130,
    description: "Taze bahçe çilekleri püreli limonata",
    category: "drink",
  },
  {
    id: "prod-el-yapimi-limonata",
    name: "El Yapımı Limonata",
    price: 110,
    description: "Taze sıkılmış ferahlatıcı limonata",
    category: "drink",
  },
  {
    id: "prod-hibiscus-limonata",
    name: "Hibiscus Limonata",
    price: 130,
    description: "Doğal hibiscus çayı ve taze limon",
    category: "drink",
  },
  {
    id: "prod-taze-portakal",
    name: "Taze Portakal Suyu",
    price: 120,
    description: "Sipariş üzerine sıkılmış %100 doğal",
    category: "drink",
  },

  // Kahveler & Çay
  {
    id: "prod-iced-latte",
    name: "Iced Latte",
    price: 125,
    description: "Buz, soğuk süt ve taze espresso",
    category: "coffee",
  },
  {
    id: "prod-iced-caramel-macchiato",
    name: "Iced Caramel Macchiato",
    price: 135,
    description: "Soğuk süt, vanilya, espresso & karamel",
    category: "coffee",
  },
  {
    id: "prod-cold-brew",
    name: "Cold Brew",
    price: 130,
    description: "16 saat soğuk demlenmiş zengin kahve",
    category: "coffee",
  },
  {
    id: "prod-flat-white",
    name: "Flat White",
    price: 125,
    description: "Double espresso & ipeksi süt köpüğü",
    category: "coffee",
  },
  {
    id: "prod-cappuccino",
    name: "Cappuccino",
    price: 115,
    description: "Espresso, sıcak süt & kadife köpük",
    category: "coffee",
  },
  {
    id: "prod-cortado",
    name: "Cortado",
    price: 110,
    description: "Eşit oranda espresso ve kadifemsi süt",
    category: "coffee",
  },
  {
    id: "prod-turk-kahvesi",
    name: "Türk Kahvesi",
    price: 90,
    description: "Közde pişirilmiş geleneksel lezzet",
    category: "coffee",
  },
  {
    id: "prod-filtre-kahve",
    name: "Filtre Kahve",
    price: 100,
    description: "Taze çekilmiş çekirdeklerden filtre kahve",
    category: "coffee",
  },
  {
    id: "prod-iced-americano",
    name: "Iced Americano",
    price: 110,
    description: "Buz ve soğuk su ile ferahlatıcı espresso",
    category: "coffee",
  },
  {
    id: "prod-cay",
    name: "Çay",
    price: 35,
    description: "Taze demlenmiş geleneksel çay",
    category: "drink",
  },

  // Fırın & Tatlı
  {
    id: "prod-dondurma",
    name: "1 Top Dondurma",
    price: 75,
    description: "Doğal ve taze lezzet eşlikçisi",
    category: "bakery",
  },
  {
    id: "prod-sade-kruvasan",
    name: "Sade Kruvasan",
    price: 150,
    description: "Hakiki Fransız tereyağlı çıtır kruvasan",
    category: "bakery",
  },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled;
}

function getDynamicRecommendations(items: CartItem[]): UpsellItem[] {
  const inCartNames = items.map((it) => it.product_name.toLowerCase());

  // Filter out products already in cart
  const available = ALL_UPSELL_ITEMS.filter(
    (u) => !inCartNames.some((cName) => cName.includes(u.name.toLowerCase()) || u.name.toLowerCase().includes(cName))
  );

  const randomized = shuffleArray(available);
  if (randomized.length >= 2) return randomized.slice(0, 2);

  const fallback = shuffleArray(ALL_UPSELL_ITEMS);
  return fallback.slice(0, 2);
}

function getSortedAndFormattedOptions(options?: { option_group_id?: string; option_group_name?: string; option_value_name: string; price_modifier?: number }[]) {
  if (!options || options.length === 0) return [];

  const getRank = (opt: { option_group_id?: string; option_group_name?: string; option_value_name: string }) => {
    const gn = (opt.option_group_name || "").toLocaleLowerCase("tr-TR");
    const vn = (opt.option_value_name || "").toLocaleLowerCase("tr-TR");
    const gid = (opt.option_group_id || "").toLowerCase();

    // 1. Kruvasan Tabanı / Seçimi (Roll, Küp, Sade, vb.)
    if (gn.includes("taban") || gn.includes("kruvasan") || gid.includes("taban") || gid.includes("kruvasan") || vn.includes("kruvasan") || vn.includes("danish") || vn.includes("twissy")) {
      return 1;
    }
    // 2. İç Dolgu Çikolata
    if (gn.includes("iç dolgu") || gn.includes("ic dolgu") || gid.includes("ic_dolgu") || gid.includes("ic-dolgu") || gid.includes("ic_")) {
      return 2;
    }
    // 3. Dış Dolgu Çikolata
    if (gn.includes("dış dolgu") || gn.includes("dis dolgu") || gid.includes("dis_dolgu") || gid.includes("dis-dolgu") || gid.includes("dis_") || gn.includes("çikolata")) {
      return 3;
    }
    // 4. Krema
    if (gn.includes("krema") || gid.includes("krema") || vn.includes("krema")) {
      return 4;
    }
    // 5. Meyve / Malzeme
    if (gn.includes("meyve") || gn.includes("malzeme") || gid.includes("meyve") || gid.includes("malzeme")) {
      return 5;
    }
    // 6. Sos / Süsleme / Ekstra
    if (gn.includes("sos") || gid.includes("sos") || gn.includes("süs") || gn.includes("topping")) {
      return 6;
    }
    // 7. İçecek / Yanında
    if (gn.includes("içecek") || gn.includes("icecek") || gid.includes("icecek")) {
      return 7;
    }
    return 8;
  };

  return [...options]
    .filter((o) => {
      const name = o.option_value_name.toLocaleLowerCase("tr-TR");
      return !name.includes("istemiyorum") && !name.includes("yok");
    })
    .sort((a, b) => getRank(a) - getRank(b))
    .map((o) => {
      const gn = (o.option_group_name || "").toLocaleLowerCase("tr-TR");
      const gid = (o.option_group_id || "").toLowerCase();
      let label = o.option_value_name;

      if (gn.includes("iç dolgu") || gn.includes("ic dolgu") || gid.includes("ic_dolgu") || gid.includes("ic-dolgu") || gid.includes("ic_")) {
        label = `İç Dolgu: ${o.option_value_name}`;
      } else if (gn.includes("dış dolgu") || gn.includes("dis dolgu") || gid.includes("dis_dolgu") || gid.includes("dis-dolgu") || gid.includes("dis_")) {
        label = `Dış Dolgu: ${o.option_value_name}`;
      }

      if (o.price_modifier && o.price_modifier > 0) {
        label += ` (+${o.price_modifier} TL)`;
      }

      return label;
    });
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  subtotal,
  total,
  totalCount,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  generalNote,
  onSetGeneralNote,
  isSavouryEligible,
  complimentaryTeaClaimed,
  onToggleComplimentaryTea,
  onProceedCheckout,
  onAddDirectProduct,
  tableLabel,
  language = "tr",
}: CartDrawerProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [activeIconConcept, setActiveIconConcept] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [recommendations, setRecommendations] = useState<UpsellItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setRecommendations(getDynamicRecommendations(items));
    }
  }, [isOpen, items]);

  const t = (key: string, fallback?: string) => getTranslation(language, key, fallback);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Generate QR Code containing the digital waiter receipt payload
  useEffect(() => {
    if (!showQrModal || items.length === 0) return;

    const payload = {
      type: "NOA_WAITER_ORDER",
      table: tableLabel || "Self Servis",
      total: total,
      totalCount: totalCount,
      note: generalNote || "",
      items: items.map((i) => ({
        name: i.product_name,
        qty: i.quantity,
        price: i.total_price,
        options: i.selected_options?.map((o) => o.option_value_name) || [],
        note: i.item_note || "",
      })),
      timestamp: new Date().toISOString(),
    };

    QRCode.toDataURL(JSON.stringify(payload), {
      width: 320,
      margin: 2,
      color: {
        dark: "#381D05",
        light: "#FFFFFF",
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error("QR Code generation error:", err));
  }, [showQrModal, items, tableLabel, total, totalCount, generalNote]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={() => {
          setShowQrModal(false);
          onClose();
        }}
        className="fixed inset-0 bg-[#1F1004]/60 backdrop-blur-xl transition-opacity"
        aria-hidden="true"
      />

      {/* Centered Modal Window */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-modal-title"
        className="relative w-full max-w-lg bg-[#FAF7F2] rounded-[28px] shadow-[0_30px_90px_rgba(31,16,4,0.4)] max-h-[92vh] flex flex-col overflow-hidden z-10 animate-slideUp border border-white/80"
      >
        {/* Top Header */}
        <div className="shrink-0 flex items-center justify-between px-5 sm:px-6 py-4 bg-white border-b border-[#683B0C]/10">
          <div className="flex items-center gap-2.5">
            {showQrModal && (
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                aria-label="Sepete Geri Dön"
                className="w-8 h-8 rounded-full bg-[#8C3B14] hover:bg-[#722F0F] text-white flex items-center justify-center shadow-sm transition-all active:scale-90 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
            <h2 id="cart-modal-title" className="text-lg font-black text-[#381D05] tracking-wide uppercase">
              {showQrModal ? t("showToCashier", "KASAYA GÖSTER") : t("myCart", "SEPETİM")}
            </h2>
          </div>

          <button
            onClick={() => {
              setShowQrModal(false);
              onClose();
            }}
            aria-label="Kapat"
            className="w-8 h-8 rounded-full bg-[#EF4444] hover:bg-[#DC2626] text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-xs border-0"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="absolute top-16 inset-x-6 z-30 flex items-center justify-center animate-slideDown">
            <div className="bg-[#15803D] text-white text-xs font-black px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-white/20">
              <CheckCircle2 className="w-4 h-4" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* --- QR CODE MODAL VIEW (EXACT MATCH TO REFERENCE) --- */}
        {showQrModal ? (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col items-center text-center space-y-4 animate-fadeIn">
            {/* Top Brand Logo & Header */}
            <div className="flex flex-col items-center space-y-1.5 pt-1">
              <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-xs border border-[#683B0C]/20">
                <Image
                  src="/noa_icon.jpg"
                  alt="NOA Icon"
                  fill
                  sizes="48px"
                  className="object-cover"
                  priority
                />
              </div>
              <h3 className="text-base font-black tracking-tight text-[#381D05] uppercase">
                NOA CROISSANT
              </h3>
              <span className="text-xs text-[#5C3818] font-medium block">
                Sipariş Listem
              </span>
            </div>

            {/* Receipt Summary Box */}
            <div className="w-full bg-white rounded-2xl border border-[#683B0C]/20 p-4 space-y-2.5 shadow-xs font-mono text-left">
              <div className="space-y-2 text-xs text-[#381D05]">
                {items.map((item) => {
                  const formattedOpts = getSortedAndFormattedOptionsLocalized(
                    item.selected_options,
                    language
                  );
                  const translatedName = resolveLocalizedText(
                    item.product_name_i18n || item.product_name,
                    language
                  );

                  return (
                    <div key={item.id} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[12px] font-bold">
                        <span className="truncate pr-2">
                          • {translatedName} <span className="text-[#8C5828]">x{item.quantity}</span>
                        </span>
                        <span className="shrink-0">{formatLocalizedPrice(item.total_price, language)}</span>
                      </div>
                      {formattedOpts.length > 0 && (
                        <div className="space-y-0.5 pt-0.5 pl-3 font-sans">
                          {formattedOpts.map((opt, oIdx) => (
                            <p key={oIdx} className="text-[11px] text-[#8C5828] font-medium leading-tight">
                              ↳ {opt}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-[#683B0C]/20 flex items-center justify-between text-xs font-black text-[#381D05]">
                <span className="tracking-wider">{t("total", "TOPLAM")}</span>
                <span className="text-sm font-black text-[#381D05] font-sans">
                  {formatLocalizedPrice(total, language)}
                </span>
              </div>
            </div>

            {/* QR Code Container Box */}
            <div className="w-full bg-white rounded-2xl border border-[#683B0C]/15 p-4 flex flex-col items-center space-y-3 shadow-xs">
              <span className="text-[11px] font-black text-[#381D05] uppercase tracking-wider">
                QR CODE
              </span>

              <div className="relative w-48 h-48 sm:w-52 sm:h-52 rounded-xl overflow-hidden p-1.5 bg-white">
                {qrCodeDataUrl ? (
                  <Image
                    src={qrCodeDataUrl}
                    alt="Sipariş QR Kodu"
                    fill
                    sizes="208px"
                    className="object-contain"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                    <QrCode className="w-12 h-12 animate-pulse" />
                  </div>
                )}
              </div>

              <p className="text-[10px] text-[#8C5828] font-bold uppercase tracking-wider max-w-xs leading-relaxed">
                {t("qrWaiterNotice", "QR KOD OKUTULDUĞUNDA SİPARİŞ LİSTESİ KASA PANELİNE OTOMATİK AKTARILIR.")}
              </p>
            </div>

            {/* Footer Notice */}
            <span className="text-[11px] font-black text-[#381D05] uppercase tracking-wider block pt-1">
              {t("showToCashier", "BU EKRANI KASAYA GÖSTEREBİLİRSİNİZ")}
            </span>
          </div>
        ) : (
          /* --- NORMAL CART VIEW --- */
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {items.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#FAF0E4] flex items-center justify-center text-[#8C5828]">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-black text-[#381D05]">{t("emptyCart", "Sepetiniz Boş")}</h3>
                <p className="text-xs text-[#5C3818]/70 max-w-xs leading-relaxed">
                  {t("emptyCartDesc", "Menüden dilediğiniz lezzetleri seçerek sepetinize ekleyebilirsiniz.")}
                </p>
              </div>
            ) : (
              <>
                {/* Product Items List */}
                <div className="divide-y divide-dashed divide-[#683B0C]/15">
                  {items.map((item) => {
                    const formattedOptions = getSortedAndFormattedOptionsLocalized(
                      item.selected_options,
                      language
                    );
                    const translatedItemName = resolveLocalizedText(
                      item.product_name_i18n || item.product_name,
                      language
                    );

                    return (
                      <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                        {/* Item Info */}
                        <div className="flex-1 min-w-0 pr-2">
                          <h4 className="text-[14px] font-black text-[#381D05] leading-tight">
                            {translatedItemName}
                          </h4>
                          <p className="text-[11.5px] font-medium text-[#8C5828] mt-0.5">
                            {formatLocalizedPrice(item.unit_price, language)} {t("perItem", "/ adet")}
                          </p>

                          {/* Selected Options Badges */}
                          {formattedOptions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {formattedOptions.map((optLabel, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md bg-[#FAF0E4] text-[#683B0C] text-[10.5px] font-bold border border-[#683B0C]/10"
                                >
                                  {optLabel}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Item Note */}
                          {item.item_note && (
                            <p className="text-[10.5px] italic text-[#8C5828] mt-1">
                              &quot;{item.item_note}&quot;
                            </p>
                          )}
                        </div>

                        {/* Stepper + Price + Remove */}
                        <div className="flex items-center gap-3 shrink-0 pt-0.5">
                          {/* Stepper Pill */}
                          <div className="flex items-center bg-white border border-[#683B0C]/15 rounded-xl px-1 py-0.5 shadow-xs">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              aria-label="Azalt"
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-[#381D05] hover:bg-[#FAF4EE] active:scale-90 transition-all cursor-pointer"
                            >
                              <Minus className="w-3 h-3 stroke-[2.5]" />
                            </button>
                            <span className="w-6 text-center text-xs font-black text-[#381D05] font-sans">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              aria-label="Artır"
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-[#381D05] hover:bg-[#FAF4EE] active:scale-90 transition-all cursor-pointer"
                            >
                              <Plus className="w-3 h-3 stroke-[2.5]" />
                            </button>
                          </div>

                          {/* Item Total Price */}
                          <span className="text-[14px] font-black text-[#381D05] font-sans min-w-[55px] text-right">
                            {formatLocalizedPrice(item.total_price, language)}
                          </span>

                          {/* Trash Delete */}
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            aria-label="Ürünü Sil"
                            className="text-[#8C5828] hover:text-[#DC2626] p-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 stroke-[1.8]" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* TOPLAM Row */}
                <div className="pt-3 border-t border-[#683B0C]/15 flex items-center justify-between">
                  <span className="text-sm font-black uppercase tracking-wider text-[#381D05]">
                    {t("total", "TOPLAM")}
                  </span>
                  <span className="text-xl font-black text-[#15803D] font-sans">
                    {formatLocalizedPrice(total, language)}
                  </span>
                </div>

                {/* Mini Receipt / Adisyon Box with Sub-Options */}
                <div className="p-4 bg-white rounded-[20px] border border-[#683B0C]/15 space-y-2.5 shadow-xs font-mono">
                  <div className="space-y-2 text-xs text-[#381D05]">
                    {items.map((item) => {
                      const formattedOpts = getSortedAndFormattedOptionsLocalized(
                        item.selected_options,
                        language
                      );
                      const translatedItemName = resolveLocalizedText(
                        item.product_name_i18n || item.product_name,
                        language
                      );

                      return (
                        <div key={item.id} className="space-y-0.5">
                          <div className="flex items-center justify-between text-[11.5px] font-bold">
                            <span className="truncate pr-2">• {translatedItemName} x{item.quantity}</span>
                            <span className="shrink-0">{formatLocalizedPrice(item.total_price, language)}</span>
                          </div>
                          {formattedOpts.length > 0 && (
                            <div className="space-y-0.5 text-[11px] text-[#8C5828] pl-3 font-sans mt-0.5">
                              {formattedOpts.map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-1 leading-snug">
                                  <span className="text-[#8C5828]/60 text-[10px]">↳</span>
                                  <span>{opt}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {item.item_note && (
                            <div className="text-[10.5px] italic text-[#8C5828] pl-3 font-sans">
                              {t("notePrefix", "Not")}: {item.item_note}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-dashed border-[#683B0C]/20 flex items-center justify-between text-xs font-black text-[#381D05]">
                    <span>{t("total", "TOTAL")}</span>
                    <span className="text-sm font-black text-[#15803D] font-sans">{formatLocalizedPrice(total, language)}</span>
                  </div>
                </div>

                {/* Smart Upselling Recommendations Box */}
                {(() => {
                  const availableUpsells = recommendations.length > 0 ? recommendations : getDynamicRecommendations(items);
                  if (availableUpsells.length === 0) return null;

                  return (
                    <div className="p-3.5 bg-gradient-to-r from-[#FAF0E4] to-[#F5E6D3] rounded-[22px] border border-[#683B0C]/20 space-y-2.5 shadow-2xs">
                      <div className="flex items-center gap-2 text-xs font-black text-[#381D05]">
                        <div className="w-5 h-5 shrink-0 relative">
                          <Image
                            src="/brand/noa-icon.png"
                            alt="NOA"
                            fill
                            sizes="20px"
                            className="object-contain"
                          />
                        </div>
                        <span>{t("smartUpsellTitle", "Kruvasanının yanına nefis bir eşlikçi!")}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {availableUpsells.map((up) => {
                          const upName = resolveLocalizedText(up.name_i18n || up.name, language);
                          const upDesc = resolveLocalizedText(up.description_i18n || up.description, language);

                          return (
                            <div
                              key={up.id}
                              className="p-2.5 bg-white rounded-xl border border-[#683B0C]/15 flex flex-col justify-between space-y-2 shadow-xs hover:border-[#683B0C]/30 transition-all"
                            >
                              <div>
                                <div className="font-black text-[12px] text-[#381D05] leading-tight truncate">
                                  {upName}
                                </div>
                                <div className="text-[10px] text-[#8C5828] font-medium line-clamp-1 mt-0.5">
                                  {upDesc}
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-1 border-t border-[#683B0C]/10">
                                <span className="text-[11px] font-black text-[#15803D]">{formatPrice(up.price)}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onAddDirectProduct) {
                                      onAddDirectProduct({
                                        id: up.id,
                                        name: up.name,
                                        base_price: up.price,
                                        description: up.description,
                                        category_id: "drinks",
                                        is_available: true,
                                        option_groups: [],
                                      });
                                      showToast(
                                        language === "tr"
                                          ? `${up.name} sepete eklendi! ✨`
                                          : `${upName} added to cart! ✨`
                                      );
                                    }
                                  }}
                                  className="px-2 py-1 rounded-lg bg-[#381D05] hover:bg-[#251202] text-white text-[10.5px] font-black flex items-center gap-1 transition-all active:scale-90 cursor-pointer shadow-xs"
                                >
                                  <Plus className="w-3 h-3 stroke-[3]" />
                                  <span>{t("smartUpsellAdd", "Ekle")}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={onProceedCheckout}
                    className="w-full h-14 rounded-2xl bg-[#15803D] hover:bg-[#166534] text-white text-sm font-black uppercase tracking-wider shadow-md active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#15803D]"
                  >
                    <ReceiptText className="w-5 h-5 stroke-[2.5]" />
                    <span>{t("completeOrder", "SİPARİŞİ OLUŞTUR")}</span>
                  </button>

                  {/* Destructive Clear Cart Button */}
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="w-full py-3 rounded-2xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-black uppercase tracking-wider shadow-sm active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4 stroke-[2.5]" />
                    <span>{t("clearCart", "SEPETİ TEMİZLE")}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
