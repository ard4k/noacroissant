"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, CreditCard, Banknote, AlertCircle, Loader2, Check } from "lucide-react";
import { CartItem, PaymentMethod } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { trackBeginCheckout, trackPurchase } from "@/lib/analytics";

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
}: CheckoutModalProps) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit_card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#683B0C]/10">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#8C5828] block">
              NOA CROISSANT
            </span>
            <h2 id="checkout-modal-title" className="text-xl font-black text-[#381D05] tracking-tight">
              Sipariş Onayı
            </h2>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Kapat"
            className="w-8 h-8 rounded-full border border-[#683B0C]/20 flex items-center justify-center text-[#381D05] hover:bg-white active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
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
            Ödeme Yöntemi Seçiniz
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
                <span className="font-black text-xs block">Kredi / Banka Kartı</span>
                <span
                  className={`text-[10px] block mt-0.5 ${
                    paymentMethod === "credit_card" ? "text-emerald-100" : "text-[#8C5828]"
                  }`}
                >
                  Kasada Kartla Öde
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
                <span className="font-black text-xs block">Nakit</span>
                <span
                  className={`text-[10px] block mt-0.5 ${
                    paymentMethod === "cash" ? "text-emerald-100" : "text-[#8C5828]"
                  }`}
                >
                  Kasada Nakit Öde
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Order Price & Summary */}
        <div className="p-4 rounded-2xl bg-white border border-[#683B0C]/15 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] text-[#8C5828] font-bold block">
              Seçilen Ürün ({items.reduce((s, i) => s + i.quantity, 0)} adet)
            </span>
            <span className="text-xs font-black text-[#381D05]">Ödenecek Tutar</span>
          </div>

          <span className="text-2xl font-black text-[#15803D] font-sans">
            {formatPrice(total)}
          </span>
        </div>

        {/* Structured Process Guidance Card */}
        <div className="p-4 rounded-2xl bg-white border border-[#683B0C]/15 shadow-xs space-y-2.5 text-left">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[11px] font-black shrink-0 shadow-xs">
              1
            </span>
            <span className="text-xs font-black text-[#381D05]">
              Sipariş Numaranızı Alın
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#1E293B] text-white flex items-center justify-center text-[11px] font-black shrink-0 shadow-xs">
              2
            </span>
            <span className="text-xs font-black text-[#381D05]">
              Kasada Ödemenizi Tamamlayın
            </span>
          </div>
          <p className="text-[11px] text-[#8C5828] font-medium leading-relaxed pt-2 border-t border-[#683B0C]/10">
            Ödemeniz kasada onaylandığında mutfak ekibimiz siparişinizi hemen taze olarak hazırlamaya başlayacaktır.
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
              <span>Sipariş Oluşturuluyor...</span>
            </>
          ) : (
            <span>Siparişi Onayla & QR Kod Al</span>
          )}
        </button>
      </div>
    </div>
  );
}
