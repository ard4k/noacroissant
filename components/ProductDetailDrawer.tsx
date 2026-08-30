"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { Minus, Plus, Check, MessageSquare, AlertCircle, Sparkles } from "lucide-react";
import { Product, CartItemOption } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { getProductImage } from "@/lib/images";
import { Language, translateProduct, getTranslation } from "@/lib/i18n/translations";

interface ProductDetailDrawerProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    selectedOptions: CartItemOption[],
    quantity: number,
    itemNote?: string
  ) => void;
  language?: Language;
}

// Robust Turkish-aware helper to identify "İstemiyorum" / "Yok" options
function isNoneOption(name: string, id?: string): boolean {
  if (id && (id.includes("-yok") || id.includes("istemiyorum"))) return true;
  if (!name) return false;
  const trLower = name.toLocaleLowerCase("tr-TR");
  const enLower = name.toLowerCase();
  return (
    trLower.includes("istemiyorum") ||
    trLower.includes("yok") ||
    enLower.includes("istemiyorum") ||
    enLower.includes("yok")
  );
}

// Helper to resolve high-res thumbnail photos for pairing / upsell items
function getPairingThumbnail(optionId: string, optionName: string): string {
  const name = optionName.toLocaleLowerCase("tr-TR");
  
  // Signature NOA Drinks & Refreshers
  if (name.includes("turbo")) return "/noa-turbo.jpg";
  if (name.includes("full depo") || name.includes("depo")) return "/noa-full-depo.jpg";
  if (name.includes("benzin")) return "/benzin.jpg";
  if (name.includes("dizel")) return "/dizel.jpg";
  if (name.includes("çilekli limonata") || name.includes("cilekli limonata")) return "/el-yapimi-cilekli-limonata.jpg";
  if (name.includes("nar")) return "/el-yapimi-nar-suyu.jpg";
  if (name.includes("limonata")) return "/el-yapimi-limonata.jpg";
  
  // Dondurma
  if (name.includes("dondurma")) return "/dondurma.jpg";
  
  // Bakery items
  if (name.includes("fıstık") || name.includes("fistik")) return "/antep-fistikli.jpg";
  if (name.includes("kremalı") || name.includes("çilekli muzlu") || name.includes("nutella")) return "/cilekli-muzlu-nutella.jpg";
  if (name.includes("lotus")) return "/lotus-cruffin.jpg";
  if (name.includes("sade") || name.includes("kruvasan")) return "/noa-croissant.jpg";
  if (name.includes("twissy")) return "/antep-fistikli-twissy.jpg";
  if (name.includes("danish")) return "/cilekli-danish.jpg";
  if (name.includes("roll")) return "/sutlu-roll-kruvasan.jpg";
  if (name.includes("küp") || name.includes("kup")) return "/sutlu-kup-kruvasan.jpg";
  if (name.includes("amora")) return "/sutlu-amora.jpg";
  if (name.includes("cheesecake")) return "/san-sebastian-cheesecake-dilim.jpg";
  if (name.includes("waffle")) return "/bardakta-waffle.jpg";
  if (name.includes("kahvaltı") || name.includes("kahvalti")) return "/kahvalti-tabagi.jpg";
  
  return "/noa_icon.jpg";
}

export function ProductDetailDrawer({
  product,
  isOpen,
  onClose,
  onAddToCart,
  language = "tr",
}: ProductDetailDrawerProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptionsMap, setSelectedOptionsMap] = useState<Record<string, string[]>>({});
  const [itemNote, setItemNote] = useState("");
  const [activeVariantImageKey, setActiveVariantImageKey] = useState<string | undefined>(undefined);
  const lastOpenedProductIdRef = useRef<string | null>(null);

  const translated = product ? translateProduct(product, language) : { name: "", description: "" };
  const displayName = translated.name || product?.name || "";
  const displayDesc = translated.description || product?.description || "";
  const t = (key: string, fallback?: string) => getTranslation(language, key, fallback);

  // Reset selections ONLY when a new product is opened or drawer transitions from closed to open
  useEffect(() => {
    if (!isOpen || !product) {
      lastOpenedProductIdRef.current = null;
      setQuantity(1);
      setItemNote("");
      setSelectedOptionsMap({});
      setActiveVariantImageKey(undefined);
      return;
    }

    // Only reset if this is a newly opened product or opened fresh
    if (lastOpenedProductIdRef.current !== product.id) {
      lastOpenedProductIdRef.current = product.id;
      setQuantity(1);
      setItemNote("");
      setActiveVariantImageKey(undefined);

      const initialMap: Record<string, string[]> = {};
      if (product.option_groups) {
        product.option_groups.forEach((group) => {
          if (group.id === "opt-kahvalti-porsiyon") {
            initialMap[group.id] = ["kahvalti-1-kisi"];
          } else {
            initialMap[group.id] = [];
          }
        });
      }

      setSelectedOptionsMap(initialMap);
    }
  }, [isOpen, product?.id]);

  // Lock background body scrolling cleanly when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    setQuantity(1);
    setItemNote("");
    setSelectedOptionsMap({});
    setActiveVariantImageKey(undefined);
    onClose();
  };

  const handleToggleOption = (
    groupId: string,
    valueId: string,
    isRadio: boolean,
    optionName: string,
    maxSelection: number,
    isRequired: boolean = false
  ) => {
    setSelectedOptionsMap((prev) => {
      const current = prev[groupId] || [];
      const isNone = isNoneOption(optionName, valueId);
      const isAlreadySelected = current.includes(valueId);

      // 1. Radio (Single selection) group:
      if (isRadio) {
        if (isAlreadySelected) {
          if (isRequired) {
            // Cannot deselect a mandatory single-choice radio group
            return prev;
          }
          if (["Sütlü", "Bitter", "Beyaz"].includes(optionName)) {
            setActiveVariantImageKey(undefined);
          }
          return { ...prev, [groupId]: [] };
        } else {
          if (["Sütlü", "Bitter", "Beyaz"].includes(optionName)) {
            setActiveVariantImageKey(optionName);
          }
          return { ...prev, [groupId]: [valueId] };
        }
      }

      // 2. Multi-selection group:
      if (isNone) {
        if (isAlreadySelected) {
          return { ...prev, [groupId]: [] };
        } else {
          return { ...prev, [groupId]: [valueId] };
        }
      } else {
        if (isAlreadySelected) {
          return { ...prev, [groupId]: current.filter((id) => id !== valueId) };
        } else {
          const cleanSelections = current.filter((id) => {
            const opt = product?.option_groups
              ?.find((g) => g.id === groupId)
              ?.options.find((o) => o.id === id);
            return opt ? !isNoneOption(opt.name, opt.id) : true;
          });

          if (cleanSelections.length >= maxSelection) {
            return prev;
          }

          return { ...prev, [groupId]: [...cleanSelections, valueId] };
        }
      }
    });
  };

  const isKahvaltiProduct =
    product?.id === "prod-noa-kahvalti-tabagi" ||
    product?.slug === "noa-kahvalti-tabagi" ||
    Boolean(product?.slug?.includes("kahvalti"));

  const isKahvalti2Kisi =
    isKahvaltiProduct &&
    (selectedOptionsMap["opt-kahvalti-porsiyon"] || []).includes("kahvalti-2-kisi");

  const visibleOptionGroups = useMemo(() => {
    if (!product?.option_groups) return [];

    if (isKahvaltiProduct) {
      if (!isKahvalti2Kisi) {
        // 1 Kişilik: show only Porsiyon, 1. Kruvasan (renamed to "Kruvasan Seçimi"), 1. İkram Çay (renamed to "İkram Çay")
        return product.option_groups
          .filter(
            (g) =>
              g.id !== "opt-kahvalti-kruvasan-2" &&
              g.id !== "opt-kahvalti-ikram-cay-2"
          )
          .map((g) => {
            if (g.id === "opt-kahvalti-kruvasan-1") {
              return { ...g, display_name: "Kruvasan Seçimi" };
            }
            if (g.id === "opt-kahvalti-ikram-cay-1") {
              return { ...g, display_name: "İkram Çay" };
            }
            return g;
          });
      } else {
        // 2 Kişilik: show all 5 groups
        return product.option_groups;
      }
    }

    return product.option_groups;
  }, [product, isKahvaltiProduct, isKahvalti2Kisi]);

  const { currentUnitPrice, currentTotal, selectedOptionsList, isMissingRequired } = useMemo(() => {
    if (!product) {
      return { currentUnitPrice: 0, currentTotal: 0, selectedOptionsList: [], isMissingRequired: false };
    }

    let unit = product.base_price;
    const list: CartItemOption[] = [];
    let missingRequired = false;

    if (visibleOptionGroups.length > 0) {
      for (const group of visibleOptionGroups) {
        const selectedIds = selectedOptionsMap[group.id] || [];
        if (group.is_required && selectedIds.length < group.min_selection) {
          missingRequired = true;
        }

        for (const optId of selectedIds) {
          const optVal = group.options.find((o) => o.id === optId);
          if (optVal) {
            unit += optVal.price_modifier;
            list.push({
              option_group_id: group.id,
              option_group_name: group.display_name,
              option_value_id: optVal.id,
              option_value_name: optVal.name,
              price_modifier: optVal.price_modifier,
            });
          }
        }
      }
    }

    return {
      currentUnitPrice: unit,
      currentTotal: unit * quantity,
      selectedOptionsList: list,
      isMissingRequired: missingRequired,
    };
  }, [product, visibleOptionGroups, selectedOptionsMap, quantity]);

  if (!isOpen || !product) return null;

  const currentImageSrc = getProductImage(product.slug, activeVariantImageKey) || product.image_url;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMissingRequired) return;
    onAddToCart(product, selectedOptionsList, quantity, itemNote.trim() || undefined);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      {/* Frosted Deep Acrylic Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-2xl transition-opacity"
        aria-hidden="true"
      />

      {/* macOS Frosted Window Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-drawer-title"
        className="relative w-full max-w-lg bg-[#FAF7F2] backdrop-blur-2xl rounded-[28px] shadow-[0_30px_90px_rgba(31,16,4,0.4)] max-h-[92vh] flex flex-col overflow-hidden z-10 animate-slideUp border border-white/80"
      >
        {/* Title Bar with Red Close Button */}
        <div className="relative shrink-0 flex items-center justify-between px-5 py-3.5 bg-[#F4EDE4]/90 backdrop-blur-md border-b border-[#683B0C]/10 select-none">
          <div className="flex items-center">
            <button
              onClick={handleClose}
              aria-label="Pencereyi Kapat"
              className="w-4 h-4 rounded-full bg-[#FF5F56] border border-[#E0443E] hover:opacity-80 active:scale-95 transition-transform flex items-center justify-center group shadow-xs cursor-pointer"
            >
              <span className="opacity-0 group-hover:opacity-100 text-[9px] font-black text-black/70 leading-none">✕</span>
            </button>
          </div>

          <div className="absolute inset-x-0 text-center pointer-events-none">
            <span className="text-[11px] font-black tracking-widest text-[#683B0C]/80 uppercase font-sans">
              NOA CROISSANT
            </span>
          </div>

          <div className="w-4" />
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Visual Header Image Frame */}
          {currentImageSrc && (
            <div className="relative aspect-square w-full rounded-[22px] overflow-hidden bg-[#EFE8DF] shadow-inner border border-[#683B0C]/5">
              <Image
                src={currentImageSrc}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, 500px"
                className="object-contain"
                priority
              />

              {activeVariantImageKey && (
                <div className="absolute bottom-3.5 right-3.5 px-3 py-1 rounded-full bg-[#381D05]/85 text-[#F8F1EB] text-xs font-extrabold backdrop-blur-md shadow-sm">
                  {activeVariantImageKey}
                </div>
              )}
            </div>
          )}

          {/* Title & Price Row */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <h2
                id="product-drawer-title"
                className="text-[22px] sm:text-[24px] font-black text-[#381D05] leading-tight tracking-tight"
              >
                {displayName}
              </h2>
              <span className="text-[22px] sm:text-[24px] font-black text-[#15803D] tracking-tight shrink-0 font-sans">
                {formatPrice(currentUnitPrice)}
              </span>
            </div>

            {displayDesc && (
              <p className="text-xs sm:text-[13px] text-[#5C3818] mt-2 leading-relaxed font-medium">
                {displayDesc}
              </p>
            )}
          </div>

          {/* Ultra-Modern Luxury Option Groups & Pairing Showcases */}
          {visibleOptionGroups && visibleOptionGroups.length > 0 && (
            <div className="space-y-6 pt-3 border-t border-[#683B0C]/10">
              {visibleOptionGroups.map((group) => {
                const isRadio = group.max_selection === 1;
                const isPairingGroup = group.name === "yaninda_iyi_gider" || group.id.includes("pairing");
                const currentSelected = selectedOptionsMap[group.id] || [];

                const nonNoneCount = currentSelected.filter((id) => {
                  const opt = group.options.find((o) => o.id === id);
                  return opt ? !isNoneOption(opt.name, opt.id) : true;
                }).length;

                const isMaxReached = !isRadio && nonNoneCount >= group.max_selection;
                const isGroupSatisfied = currentSelected.length >= group.min_selection;

                // --- 1. DEDICATED YANINDA İYİ GİDER SHOWCASE CARDS ---
                if (isPairingGroup) {
                  return (
                    <div key={group.id} className="pt-2 space-y-3">
                      {/* Pairing Section Header */}
                      <div className="flex items-center gap-2">
                        {/* Frameless Artisan Hand-Drawn Sketch Icon */}
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#8C3B14"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-[18px] h-[18px] shrink-0"
                        >
                          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                          <path d="M6 1c0 1.2.8 1.8.8 2.8" />
                          <path d="M10 1c0 1.2.8 1.8.8 2.8" />
                          <path d="M14 1c0 1.2.8 1.8.8 2.8" />
                        </svg>
                        <span className="text-[12.5px] font-black uppercase tracking-wider text-[#381D05]">
                          {group.display_name}
                        </span>
                      </div>

                      {/* Mini Product Pairing Showcase Cards - Full Width List without Truncation */}
                      <div className="grid grid-cols-1 gap-2.5">
                        {group.options.map((opt) => {
                          const isChecked = currentSelected.includes(opt.id);
                          const thumbUrl = getPairingThumbnail(opt.id, opt.name);

                          return (
                            <div
                              key={opt.id}
                              onClick={() =>
                                handleToggleOption(group.id, opt.id, false, opt.name, group.max_selection)
                              }
                              className={`flex items-center gap-3.5 p-3 rounded-[20px] transition-all duration-200 cursor-pointer border ${
                                isChecked
                                  ? "bg-[#FAF7F2] border-[#15803D] shadow-sm ring-2 ring-[#15803D]/20 -translate-y-0.5"
                                  : "bg-white border-[#683B0C]/12 hover:border-[#15803D]/60 hover:shadow-xs shadow-2xs hover:-translate-y-0.5"
                              }`}
                            >
                              {/* Frameless Organic Preview Thumbnail */}
                              <div className="relative w-12 h-12 rounded-[16px] overflow-hidden shrink-0 shadow-xs">
                                <Image
                                  src={thumbUrl}
                                  alt={opt.name}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </div>

                              {/* Title & Price - Full Text Visibility */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-[13px] font-black text-[#381D05] leading-snug">
                                  {opt.name}
                                </h4>
                                <span className="text-[12px] font-black text-[#15803D] font-sans mt-0.5 block">
                                  +{formatPrice(opt.price_modifier)}
                                </span>
                              </div>

                              {/* Toggle Add / Check Button */}
                              <button
                                type="button"
                                className={`px-4 py-2 rounded-full text-xs font-black transition-all shrink-0 cursor-pointer ${
                                  isChecked
                                    ? "bg-[#15803D] text-white shadow-xs"
                                    : "bg-[#FAF4EE] text-[#4A2808] hover:bg-[#381D05] hover:text-white"
                                }`}
                              >
                                {isChecked ? "✓ Eklendi" : "+ Ekle"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                // --- 2. STANDARD PRODUCT OPTION GROUPS ---
                return (
                  <div key={group.id} className="space-y-3">
                    {/* Section Header with Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[12px] font-black uppercase tracking-wider text-[#381D05] truncate">
                          {group.display_name}
                        </span>
                        {group.is_required && (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-black tracking-wide transition-all shadow-xs shrink-0 ${
                              isGroupSatisfied
                                ? "bg-[#15803D] text-white"
                                : "bg-[#DC2626] text-white"
                            }`}
                          >
                            {isGroupSatisfied ? "✓ Seçildi" : "Zorunlu"}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-[#8C5828] shrink-0 whitespace-nowrap">
                        {isRadio
                          ? "1 Seçim"
                          : group.max_selection >= 10
                          ? "İsteğe Bağlı"
                          : `En fazla ${group.max_selection} seçim`}
                      </span>
                    </div>

                    {/* Luxury Tactile Option Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {group.options.map((opt) => {
                        const isChecked = currentSelected.includes(opt.id);
                        const isOptNone = isNoneOption(opt.name, opt.id);
                        const isBlocked = !isRadio && !isOptNone && isMaxReached && !isChecked;

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            disabled={isBlocked}
                            onClick={() =>
                              handleToggleOption(
                                group.id,
                                opt.id,
                                isRadio,
                                opt.name,
                                group.max_selection,
                                group.is_required
                              )
                            }
                            className={`group relative flex items-center justify-between p-3.5 rounded-[18px] text-left transition-all duration-200 cursor-pointer ${
                              isChecked
                                ? "bg-[#15803D] text-white border border-[#15803D] shadow-md -translate-y-0.5"
                                : isBlocked
                                ? "bg-white/40 text-[#5C3818]/30 border border-black/[0.04] cursor-not-allowed opacity-35"
                                : "bg-white text-[#381D05] border border-[#683B0C]/12 hover:border-[#15803D] hover:shadow-md shadow-xs hover:-translate-y-0.5 active:scale-[0.98]"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Sleek Custom Unified Circular Indicator */}
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center transition-all shrink-0 ${
                                  isChecked
                                    ? "bg-white text-[#15803D] shadow-xs scale-105"
                                    : "border-[1.5px] border-[#683B0C]/30 bg-[#FAF7F2] group-hover:border-[#15803D]"
                                }`}
                              >
                                {isChecked && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
                              </div>

                              {(() => {
                                const match = opt.name.match(/^(.*?)\s*\((.*?)\)$/);
                                if (match) {
                                  const mainTitle = match[1];
                                  const subTitle = match[2];
                                  return (
                                    <div className="flex flex-col text-left">
                                      <span
                                        className={`text-[12.5px] tracking-tight leading-tight ${
                                          isChecked ? "font-black" : "font-extrabold"
                                        }`}
                                      >
                                        {mainTitle}
                                      </span>
                                      <span
                                        className={`text-[10.5px] font-bold mt-0.5 ${
                                          isChecked ? "text-white/85" : "text-[#15803D]"
                                        }`}
                                      >
                                        {subTitle}
                                      </span>
                                    </div>
                                  );
                                }
                                return (
                                  <span
                                    className={`text-[12.5px] tracking-tight leading-snug ${
                                      isChecked ? "font-black" : "font-extrabold"
                                    }`}
                                  >
                                    {opt.name}
                                  </span>
                                );
                              })()}
                            </div>

                            {/* Extra Price Pill Badge */}
                            {opt.price_modifier > 0 && (
                              <span
                                className={`text-[11.5px] font-black shrink-0 px-2.5 py-1 rounded-full transition-colors ${
                                  isChecked
                                    ? "bg-white/20 text-white"
                                    : "bg-[#15803D]/10 text-[#15803D]"
                                }`}
                              >
                                +{formatPrice(opt.price_modifier)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sipariş Notu Kutusu */}
          <div className="pt-4 border-t border-[#683B0C]/10 space-y-2">
            <label
              htmlFor="item-note-input"
              className="flex items-center gap-1.5 text-xs font-black text-[#381D05] uppercase tracking-wider"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#683B0C]" />
              <span>Sipariş Notu (İsteğe bağlı)</span>
            </label>
            <input
              id="item-note-input"
              type="text"
              value={itemNote}
              onChange={(e) => setItemNote(e.target.value)}
              placeholder="Örn: Çikolatası bol olsun, sıcak servis..."
              maxLength={150}
              className="w-full px-4 py-3 rounded-[16px] border border-[#683B0C]/15 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#683B0C] text-[#381D05] shadow-xs transition-all placeholder:text-[#5C3818]/40"
            />
          </div>
        </div>

        {/* macOS Bottom Toolbar / Action Bar */}
        <div className="p-4 sm:p-5 bg-[#F4EDE4]/95 backdrop-blur-xl border-t border-[#683B0C]/10 shrink-0 space-y-3">
          {isMissingRequired && (
            <div className="flex items-center gap-2 text-[12px] font-black text-[#DC2626] bg-[#DC2626]/10 px-4 py-2.5 rounded-[14px] border border-[#DC2626]/25 shadow-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
              <span>Lütfen tüm zorunlu seçimleri tamamlayınız.</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* Tactile Stepper Pill */}
            <div className="flex items-center bg-white border border-[#683B0C]/15 rounded-[16px] p-1 shrink-0 shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                aria-label="Adet Azalt"
                className="w-9 h-9 rounded-[12px] flex items-center justify-center text-[#381D05] disabled:opacity-30 hover:bg-[#F4EDE4] active:scale-95 transition-all cursor-pointer"
              >
                <Minus className="w-4 h-4 stroke-[2.5]" />
              </button>

              <span className="w-8 text-center text-sm font-black text-[#381D05] font-sans">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Adet Artır"
                className="w-9 h-9 rounded-[12px] flex items-center justify-center text-[#381D05] hover:bg-[#F4EDE4] active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Solid Dollar Green Action Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isMissingRequired || !product.is_available}
              className="flex-1 h-12 rounded-[16px] bg-[#15803D] hover:bg-[#166534] active:scale-[0.98] text-white font-black text-sm flex items-center justify-between px-5 disabled:bg-[#5C3818]/15 disabled:text-[#5C3818]/40 disabled:border-transparent disabled:shadow-none disabled:cursor-not-allowed transition-all shadow-md border border-[#15803D] cursor-pointer"
            >
              <span className="tracking-wide">{t("addToCart", "Sepete Ekle")}</span>
              <span className="text-white font-black text-base tracking-tight font-sans">
                {formatPrice(currentTotal)}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
