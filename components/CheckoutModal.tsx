"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, CreditCard, Banknote, AlertCircle, Loader2, Check, CheckCircle2 } from "lucide-react";
import { CartItem, PaymentMethod } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { formatLocalizedPrice, resolveProductName, resolveLocalizedText } from "@/lib/i18n/resolver";
import { trackBeginCheckout, trackPurchase } from "@/lib/analytics";
import { noaStore } from "@/lib/store";
import { getStoredCustomerPhone } from "@/lib/loyalty";
import { Language, getTranslation } from "@/lib/i18n/translations";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  total: number;
  tableToken?: string | null;
  tableNumber?: number | null;
  generalNote?: string;
  onClearCart: () => void;
  language?: Language;
}

export function CheckoutModal({
  isOpen,
  onClose,
  items,
  total,
  tableToken,
  tableNumber,
  generalNote,
  onClearCart,
  language = "tr",
}: CheckoutModalProps) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit_card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const t = (key: string, fallback?: string) => getTranslation(language, key, fallback);

  if (!isOpen) return null;

  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      setErrorMsg("Sepetinizde ürün bulunmamaktadır.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const idempotencyKey = `idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      const response = await fetch("/api/order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table_token: tableToken || "self_service",
          items: items.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
            selected_options: (i.selected_options || []).map((opt) => ({
              option_group_id: opt.option_group_id,
              option_value_id: opt.option_value_id,
            })),
            item_note: i.item_note,
            is_complimentary: i.is_complimentary,
          })),
          payment_method: paymentMethod,
          general_note: generalNote,
          idempotency_key: idempotencyKey,
          customer_phone: getStoredCustomerPhone() || undefined,
          language: language,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Sipariş verilirken bir sorun oluştu.");
      }

      // Track GA4 Purchase safely
      try {
        trackPurchase({
          id: data.order?.id || data.order_id || idempotencyKey,
          table_number: tableNumber || 0,
          total_amount: total,
          items: items.map((i) => ({
            id: i.id,
            order_id: data.order?.id || "",
            product_id: i.product_id,
            name: i.product_name || "",
            unit_price: i.unit_price || 0,
            quantity: i.quantity || 1,
            selected_options: (i.selected_options || []).map((o) => ({
              id: o.option_value_id,
              name: o.option_value_name || "",
              price_modifier: o.price_modifier || 0,
              group_name: o.option_group_name || o.option_group_id || "",
            })),
          })),
          status: "received",
          payment_status: "pending",
          payment_method: paymentMethod,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tracking_token: data.tracking_token,
        });
      } catch (analyticsErr) {
        console.warn("Non-fatal analytics error:", analyticsErr);
      }

      onClearCart();
      onClose();
      if (data.tracking_token) {
        if (data.order) {
          try {
            localStorage.setItem(`noa_order_${data.tracking_token}`, JSON.stringify(data.order));
            noaStore.hydrateOrder(data.order);
          } catch (e) {}
        }
        router.push(`/siparis/${data.tracking_token}`);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Bağlantı hatası oluştu, lütfen tekrar deneyiniz.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={() => !isSubmitting && onClose()}
        className="fixed inset-0 bg-[#1F1004]/60 backdrop-blur-xl transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-modal-title"
        className="relative w-full max-w-md bg-[#FAF7F2] rounded-[28px] shadow-[0_30px_90px_rgba(31,16,4,0.4)] p-6 sm:p-7 z-10 border border-white/80 animate-slideUp space-y-5"
      >
        {/* Header with Transparent NOA Emblem */}
        <div className="flex items-center justify-between pb-3 border-b border-[#683B0C]/10">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 shrink-0">
              <Image
                src="/brand/noa-icon.png"
                alt="NOA Logo"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>
            <h2 id="checkout-modal-title" className="text-lg font-black text-[#381D05] tracking-wide uppercase">
              {t("orderConfirmation", "SİPARİŞ ONAYI")}
            </h2>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Kapat"
            className="w-8 h-8 rounded-full bg-[#EF4444] hover:bg-[#DC2626] text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-xs border-0"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Payment Method Selection */}
        <div className="space-y-2.5">
          <label className="block text-xs font-black text-[#381D05] uppercase tracking-wider">
            {t("selectPaymentMethod", "Ödeme Yöntemi Seçiniz")}
          </label>

          <div className="grid grid-cols-2 gap-3">
            {/* Kredi Kartı (Emerald Green Theme) */}
            <button
              type="button"
              onClick={() => setPaymentMethod("credit_card")}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2.5 cursor-pointer ${
                paymentMethod === "credit_card"
                  ? "bg-[#15803D] text-white border-[#15803D] shadow-md"
                  : "bg-white text-[#381D05] border-[#683B0C]/15 hover:border-[#15803D]/50 hover:bg-[#FAF4EE]"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <CreditCard
                  className={`w-5 h-5 ${
                    paymentMethod === "credit_card" ? "text-emerald-100" : "text-[#15803D]"
                  }`}
                />
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentMethod === "credit_card"
                      ? "border-white bg-white"
                      : "border-[#683B0C]/30"
                  }`}
                >
                  {paymentMethod === "credit_card" && <Check className="w-2.5 h-2.5 text-[#15803D] stroke-[3]" />}
                </div>
              </div>

              <div>
                <span className="font-black text-xs block">{t("creditCard", "Kredi / Banka Kartı")}</span>
                <span
                  className={`text-[10px] block mt-0.5 ${
                    paymentMethod === "credit_card" ? "text-emerald-100" : "text-[#8C5828]"
                  }`}
                >
                  {t("payWithCardAtCashier", "Kasada Kartla Öde")}
                </span>
              </div>
            </button>

            {/* Nakit (Dollar Green Theme) */}
            <button
              type="button"
              onClick={() => setPaymentMethod("cash")}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2.5 cursor-pointer ${
                paymentMethod === "cash"
                  ? "bg-[#15803D] text-white border-[#15803D] shadow-md"
                  : "bg-white text-[#381D05] border-[#683B0C]/15 hover:border-[#15803D]/50 hover:bg-[#FAF4EE]"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <Banknote
                  className={`w-5 h-5 ${
                    paymentMethod === "cash" ? "text-emerald-100" : "text-[#15803D]"
                  }`}
                />
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentMethod === "cash"
                      ? "border-white bg-white"
                      : "border-[#683B0C]/30"
                  }`}
                >
                  {paymentMethod === "cash" && <Check className="w-2.5 h-2.5 text-[#15803D] stroke-[3]" />}
                </div>
              </div>

              <div>
                <span className="font-black text-xs block">{t("cash", "Nakit")}</span>
                <span
                  className={`text-[10px] block mt-0.5 ${
                    paymentMethod === "cash" ? "text-emerald-100" : "text-[#8C5828]"
                  }`}
                >
                  {t("payWithCashAtCashier", "Kasada Nakit Öde")}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Order Items Detail & Total Summary (Receipt Style Matching Tracking Screen) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#683B0C]/15 shadow-xs space-y-3 font-mono">
          {/* Itemized List */}
          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
            {items.map((item) => {
              const displayName = resolveLocalizedText(item.product_name_i18n || item.product_name, language);
              return (
                <div key={item.id} className="flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-1.5 min-w-0 pr-2">
                    <span className="text-[#381D05] select-none">•</span>
                    <div>
                      <span className="font-bold text-[#381D05]">{displayName}</span>
                      <span className="text-[#8C5828] ml-1 font-bold">x{item.quantity}</span>
                      {item.selected_options && item.selected_options.length > 0 && (
                        <div className="text-[11px] text-[#8C5828] font-sans mt-0.5 space-y-0.5">
                          {item.selected_options.map((opt, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <span className="text-[#8C5828]/60 text-[9px]">↳</span>
                              <span>{resolveLocalizedText(opt.option_value_name_i18n || opt.option_value_name, language)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {item.item_note && (
                        <div className="text-[10px] italic text-[#8C5828] font-sans mt-0.5">
                          {t("notePrefix", "Not")}: {item.item_note}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-[#381D05] shrink-0">
                    {formatLocalizedPrice(item.total_price, language)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Total Row */}
          <div className="pt-3 border-t border-dashed border-[#683B0C]/20 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[#381D05]">
              {t("total", "Toplam")}
            </span>
            <span className="text-xl font-black text-[#15803D]">
              {formatLocalizedPrice(total, language)}
            </span>
          </div>
        </div>

        {/* Structured Process Guidance Card with Step Timeline */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#683B0C]/15 shadow-xs space-y-3.5 text-left">
          <div className="relative pl-10 py-1 space-y-6">
            {/* Continuous Solid 4px Line with smooth green to orange gradient */}
            <div className="absolute left-[13px] top-3.5 -bottom-2.5 w-1 bg-gradient-to-b from-[#15803D] via-[#15803D] to-[#EA580C] rounded-full z-0" />

            {/* Step 1 Row */}
            <div className="relative z-10 flex items-center">
              <div className="absolute -left-10 w-7 h-7 rounded-full bg-[#15803D] text-white flex items-center justify-center text-xs font-black shadow-xs">
                1
              </div>
              <span className="text-xs sm:text-sm font-black text-[#381D05] pl-1">
                {t("stepGetNumber", "Sipariş Numaranızı Alın")}
              </span>
            </div>

            {/* Step 2 Row */}
            <div className="relative z-10 flex items-center">
              <div className="absolute -left-10 w-7 h-7 rounded-full bg-[#EA580C] text-white flex items-center justify-center text-xs font-black shadow-xs">
                2
              </div>
              <span className="text-xs sm:text-sm font-black text-[#381D05] pl-1">
                {t("stepPayAtCashier", "Kasada Ödemenizi Tamamlayın")}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-[#8C5828] font-medium leading-relaxed pt-2.5 border-t border-[#683B0C]/10">
            {t("stepPreparationNotice", "Ödemeniz kasada onaylandığında mutfak ekibimiz siparişinizi hemen taze olarak hazırlamaya başlayacaktır.")}
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleSubmitOrder}
          disabled={isSubmitting}
          className="w-full h-14 rounded-2xl bg-[#15803D] hover:bg-[#166534] active:scale-[0.98] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="uppercase tracking-wider">{t("creatingOrder", "Sipariş Oluşturuluyor...")}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span className="uppercase tracking-wider">{t("confirmOrder", "SİPARİŞİ ONAYLA")}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
