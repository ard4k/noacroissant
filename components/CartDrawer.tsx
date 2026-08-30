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
  Sparkles,
} from "lucide-react";
import { CartItem, Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Language, getTranslation } from "@/lib/i18n/translations";
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
  price: number;
  description: string;
  category: "coffee" | "drink" | "bakery";
}

const ALL_UPSELL_ITEMS: UpsellItem[] = [
  {
    id: "prod-iced-latte",
    name: "Iced Latte",
    price: 125,
    description: "Buz, soğuk süt ve taze espresso",
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
    id: "prod-turk-kahvesi",
    name: "Türk Kahvesi",
    price: 90,
    description: "Közde pişirilmiş geleneksel lezzet",
    category: "coffee",
  },
  {
    id: "prod-el-yapimi-limonata",
    name: "El Yapımı Limonata",
    price: 110,
    description: "Taze sıkılmış ferahlatıcı limonata",
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
    id: "prod-noa-full-depo",
    name: "NOA Full Depo",
    price: 140,
    description: "Süper vitamin taze meyve kokteyli",
    category: "drink",
  },
  {
    id: "prod-coca-cola",
    name: "Coca-Cola (33 cl.)",
    price: 70,
    description: "Kutu 330 ml.",
    category: "drink",
  },
  {
    id: "prod-cay",
    name: "Çay",
    price: 35,
    description: "Taze demlenmiş geleneksel çay",
    category: "drink",
  },
  {
    id: "prod-sade-kruvasan",
    name: "Sade Kruvasan",
    price: 150,
    description: "Hakiki Fransız tereyağlı çıtır kruvasan",
    category: "bakery",
  },
  {
    id: "prod-dondurma",
    name: "Dondurma",
    price: 75,
    description: "1 Top doğal taze dondurma",
    category: "bakery",
  },
];

function getDynamicRecommendations(items: CartItem[]): UpsellItem[] {
  const inCartNames = items.map((it) => it.product_name.toLowerCase());

  // Detect cart contents
  const hasSavoury = items.some((it) => {
    const name = it.product_name.toLowerCase();
    return (
      name.includes("tuzlu") ||
      name.includes("yeşil") ||
      name.includes("ege") ||
      name.includes("avokado") ||
      name.includes("köz") ||
      name.includes("pesto") ||
      name.includes("kaburga") ||
      name.includes("hot dog")
    );
  });

  const hasSweet = items.some((it) => {
    const name = it.product_name.toLowerCase();
    return (
      name.includes("tatlı") ||
      name.includes("çikolata") ||
      name.includes("nutella") ||
      name.includes("fıstık") ||
      name.includes("lotus") ||
      name.includes("danish") ||
      name.includes("twissy") ||
      name.includes("roll") ||
      name.includes("küp") ||
      name.includes("amora")
    );
  });

  const hasOnlyDrinks = items.length > 0 && items.every((it) => {
    const name = it.product_name.toLowerCase();
    return (
      name.includes("kahve") ||
      name.includes("latte") ||
      name.includes("americano") ||
      name.includes("espresso") ||
      name.includes("cappuccino") ||
      name.includes("flat white") ||
      name.includes("çay") ||
      name.includes("limonata") ||
      name.includes("su") ||
      name.includes("cola") ||
      name.includes("depo") ||
      name.includes("turbo") ||
      name.includes("benzin") ||
      name.includes("dizel")
    );
  });

  let candidates: UpsellItem[] = [];

  if (hasOnlyDrinks) {
    // Only drinks -> recommend bakery/croissant/ice cream
    candidates = ALL_UPSELL_ITEMS.filter((u) => u.category === "bakery");
  } else if (hasSavoury && !hasSweet) {
    // Only savoury -> recommend refreshing lemonade/cold drink/tea
    candidates = ALL_UPSELL_ITEMS.filter((u) => u.category === "drink");
  } else if (hasSweet) {
    // Sweet croissants -> recommend coffees (Iced Latte, Flat White, Cappuccino, Turkish Coffee, etc.)
    candidates = ALL_UPSELL_ITEMS.filter((u) => u.category === "coffee" || u.name === "Çay");
  } else {
    candidates = ALL_UPSELL_ITEMS;
  }

  // Filter out products already in cart
  const available = candidates.filter(
    (u) => !inCartNames.some((cName) => cName.includes(u.name.toLowerCase()) || u.name.toLowerCase().includes(cName))
  );

  if (available.length >= 2) return available.slice(0, 2);

  // Fallback to any remaining item not in cart
  const fallback = ALL_UPSELL_ITEMS.filter(
    (u) => !inCartNames.some((cName) => cName.includes(u.name.toLowerCase()) || u.name.toLowerCase().includes(cName))
  );
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
      table: tableLabel || "Masa 01",
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
            {showQrModal ? (
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                aria-label="Sepete Geri Dön"
                className="w-8 h-8 rounded-full bg-[#8C3B14] hover:bg-[#722F0F] text-white flex items-center justify-center shadow-sm transition-all active:scale-90 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            ) : (
              <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-xs border border-[#683B0C]/15 bg-white">
                <Image
                  src="/noa_icon.jpg"
                  alt="NOA"
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
            )}
            <h2 id="cart-modal-title" className="text-lg font-black text-[#381D05] tracking-tight">
              {showQrModal ? "Kasaya Göster" : "Sepetim"}
            </h2>
          </div>

          <button
            onClick={() => {
              setShowQrModal(false);
              onClose();
            }}
            aria-label="Kapat"
            className="w-8 h-8 rounded-full border border-[#683B0C]/20 flex items-center justify-center text-[#381D05] hover:bg-[#FAF4EE] active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
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
                  const formattedOpts = getSortedAndFormattedOptions(item.selected_options);

                  return (
                    <div key={item.id} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[12px] font-bold">
                        <span className="truncate pr-2">• {item.product_name} <span className="text-[#8C5828]">x{item.quantity}</span></span>
                        <span className="shrink-0">{formatPrice(item.total_price)}</span>
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
                <span className="tracking-wider">TOPLAM</span>
                <span className="text-sm font-black text-[#381D05] font-sans">{formatPrice(total)}</span>
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
                QR KOD OKUTULDUĞUNDA SİPARİŞ LİSTESİ KASA PANELİNE OTOMATİK AKTARILIR.
              </p>
            </div>

            {/* Footer Notice */}
            <span className="text-[11px] font-black text-[#381D05] uppercase tracking-wider block pt-1">
              BU EKRANI KASAYA GÖSTEREBİLİRSİNİZ
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
                <h3 className="text-base font-black text-[#381D05]">Sepetiniz Boş</h3>
                <p className="text-xs text-[#5C3818]/70 max-w-xs leading-relaxed">
                  Menüden dilediğiniz lezzetleri seçerek sepetinize ekleyebilirsiniz.
                </p>
              </div>
            ) : (
              <>
                {/* Product Items List */}
                <div className="divide-y divide-dashed divide-[#683B0C]/15">
                  {items.map((item) => {
                    const formattedOptions = getSortedAndFormattedOptions(item.selected_options);

                    return (
                      <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                        {/* Item Info */}
                        <div className="flex-1 min-w-0 pr-2">
                          <h4 className="text-[14px] font-black text-[#381D05] leading-tight">
                            {item.product_name}
                          </h4>
                          <p className="text-[11.5px] font-medium text-[#8C5828] mt-0.5">
                            {formatPrice(item.unit_price)} / adet
                          </p>

                          {/* Selected Options Badges */}
                          {formattedOptions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {formattedOptions.map((optLabel, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md bg-[#FAF0E4] text-[#683B0C] text-[10.5px] font-bold border border-[#683B0C]/10"
                                >
                                  +{optLabel}
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
                            {formatPrice(item.total_price)}
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
                    TOPLAM
                  </span>
                  <span className="text-xl font-black text-[#15803D] font-sans">
                    {formatPrice(total)}
                  </span>
                </div>

                {/* Mini Receipt / Adisyon Box with Sub-Options */}
                <div className="p-4 bg-white rounded-[20px] border border-[#683B0C]/15 space-y-2.5 shadow-xs font-mono">
                  <div className="space-y-2 text-xs text-[#381D05]">
                    {items.map((item) => {
                      const formattedOpts = getSortedAndFormattedOptions(item.selected_options);

                      return (
                        <div key={item.id} className="space-y-0.5">
                          <div className="flex items-center justify-between text-[11.5px] font-bold">
                            <span className="truncate pr-2">• {item.product_name} x{item.quantity}</span>
                            <span className="shrink-0">{formatPrice(item.total_price)}</span>
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
                              Not: {item.item_note}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-dashed border-[#683B0C]/20 flex items-center justify-between text-xs font-black text-[#381D05]">
                    <span>TOTAL</span>
                    <span className="text-sm font-black text-[#15803D] font-sans">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Smart Upselling Recommendations Box */}
                {(() => {
                  const availableUpsells = getDynamicRecommendations(items);
                  if (availableUpsells.length === 0) return null;

                  return (
                    <div className="p-3.5 bg-gradient-to-r from-[#FAF0E4] to-[#F5E6D3] rounded-[22px] border border-[#683B0C]/20 space-y-2.5 shadow-2xs">
                      <div className="flex items-center gap-2 text-xs font-black text-[#381D05]">
                        <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-[#8C5828]/25 shadow-2xs relative">
                          <Image
                            src={BRAND_ASSETS.logo || "/noa_icon.jpg"}
                            alt="NOA"
                            fill
                            sizes="20px"
                            className="object-cover"
                          />
                        </div>
                        <span>{t("smartUpsellTitle", "Kruvasanının yanına nefis bir eşlikçi!")}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {availableUpsells.map((up) => (
                          <div
                            key={up.id}
                            className="p-2.5 bg-white rounded-xl border border-[#683B0C]/15 flex flex-col justify-between space-y-2 shadow-xs hover:border-[#683B0C]/30 transition-all"
                          >
                            <div>
                              <div className="font-black text-[12px] text-[#381D05] leading-tight truncate">
                                {up.name}
                              </div>
                              <div className="text-[10px] text-[#8C5828] font-medium line-clamp-1 mt-0.5">
                                {up.description}
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
                                    showToast(`${up.name} sepete eklendi! ✨`);
                                  }
                                }}
                                className="px-2 py-1 rounded-lg bg-[#381D05] hover:bg-[#251202] text-white text-[10.5px] font-black flex items-center gap-1 transition-all active:scale-90 cursor-pointer shadow-xs"
                              >
                                <Plus className="w-3 h-3 stroke-[3]" />
                                <span>{t("smartUpsellAdd", "Ekle")}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Self-Servis Action Buttons Grid */}
                <div className="space-y-2.5 pt-1">
                  {/* Primary Actions Row (KASAYA GÖSTER + SİPARİŞİ TAMAMLA) */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setShowQrModal(true)}
                      className="flex items-center justify-center gap-1.5 py-3.5 px-2 rounded-[16px] bg-[#381D05] hover:bg-[#251202] text-[#FAF0E4] text-[10.5px] sm:text-xs font-black uppercase tracking-wider shadow-sm active:scale-95 transition-all cursor-pointer border border-[#683B0C]/40"
                    >
                      <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] text-[#D1A37A] shrink-0" />
                      <span className="whitespace-nowrap">KASAYA GÖSTER</span>
                    </button>

                    <button
                      type="button"
                      onClick={onProceedCheckout}
                      className="flex items-center justify-center gap-1.5 py-3.5 px-2 rounded-[16px] bg-[#15803D] hover:bg-[#166534] text-white text-[10.5px] sm:text-xs font-black uppercase tracking-wider shadow-xs active:scale-95 transition-all cursor-pointer border border-[#15803D]"
                    >
                      <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] text-white shrink-0" />
                      <span className="whitespace-nowrap">SİPARİŞİ TAMAMLA</span>
                    </button>
                  </div>

                  {/* Destructive Clear Cart Button - Solid Red */}
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="w-full py-3 rounded-[16px] bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-black uppercase tracking-wider shadow-sm active:scale-98 transition-all cursor-pointer mt-1 flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>SEPETİ TEMİZLE</span>
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
