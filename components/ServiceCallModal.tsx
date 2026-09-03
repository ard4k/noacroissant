"use client";

import React, { useState } from "react";
import {
  X,
  Bell,
  CreditCard,
  Banknote,
  Droplets,
  Coffee,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { ServiceCallType } from "@/lib/types";
import { Language, getTranslation } from "@/lib/i18n/translations";

interface ServiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: number;
  tableLabel?: string;
  language?: Language;
}

export function ServiceCallModal({
  isOpen,
  onClose,
  tableNumber,
  tableLabel,
  language = "tr",
}: ServiceCallModalProps) {
  const [selectedType, setSelectedType] = useState<ServiceCallType>("waiter");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const t = (key: string, fallback?: string) => getTranslation(language, key, fallback);

  if (!isOpen) return null;

  const handleSendCall = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/service-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table_number: tableNumber,
          table_label: tableLabel || `Masa ${tableNumber.toString().padStart(2, "0")}`,
          type: selectedType,
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "İstek iletilemedi.");
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setNote("");
        onClose();
      }, 2500);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Bağlantı hatası oluştu, lütfen tekrar deneyiniz.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const options: {
    type: ServiceCallType;
    titleKey: string;
    titleDefault: string;
    descKey: string;
    descDefault: string;
    icon: React.ElementType;
    color: string;
  }[] = [
    {
      type: "waiter",
      titleKey: "callWaiter",
      titleDefault: "Garson Çağır",
      descKey: "callWaiterDesc",
      descDefault: "Genel istek veya sipariş için",
      icon: Bell,
      color: "#15803D",
    },
    {
      type: "bill_card",
      titleKey: "requestBillCard",
      titleDefault: "Hesap İstiyorum (Kart)",
      descKey: "requestBillCardDesc",
      descDefault: "Masaya POS cihazı getirilir",
      icon: CreditCard,
      color: "#1E293B",
    },
    {
      type: "bill_cash",
      titleKey: "requestBillCash",
      titleDefault: "Hesap İstiyorum (Nakit)",
      descKey: "requestBillCashDesc",
      descDefault: "Masada nakit ödeme",
      icon: Banknote,
      color: "#15803D",
    },
    {
      type: "water_napkin",
      titleKey: "requestWaterNapkin",
      titleDefault: "Su & Peçete İste",
      descKey: "requestWaterNapkinDesc",
      descDefault: "Masaya servis edilir",
      icon: Droplets,
      color: "#0284C7",
    },
    {
      type: "tea_refresh",
      titleKey: "requestTeaRefresh",
      titleDefault: "Çay Tazele",
      descKey: "requestTeaRefreshDesc",
      descDefault: "Taze demlenmiş sıcak çay",
      icon: Coffee,
      color: "#D97706",
    },
  ];

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
        className="relative w-full max-w-md bg-[#FAF7F2] rounded-[30px] shadow-[0_30px_90px_rgba(31,16,4,0.4)] p-6 sm:p-7 z-10 border border-white/80 animate-slideUp space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#683B0C]/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#381D05] text-white flex items-center justify-center shadow-xs">
              <Bell className="w-5 h-5 text-[#D1A37A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#8C5828]">
                  {tableLabel || (language === "en" ? `Table ${tableNumber.toString().padStart(2, "0")}` : `Masa ${tableNumber.toString().padStart(2, "0")}`)}
                </span>
              </div>
              <h2 className="text-lg font-black text-[#381D05] tracking-tight">
                {t("callStaff", "Garson / Servis Çağır")}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            aria-label={t("closeModal", "Kapat")}
            className="w-8 h-8 rounded-full bg-[#EF4444] hover:bg-[#DC2626] text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-xs border-0"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Success Alert View */}
        {isSuccess ? (
          <div className="py-8 text-center space-y-3 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs border-2 border-emerald-300">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-black text-[#381D05]">
              {t("callSentTitle", "Çağrınız Personele İletildi!")}
            </h3>
            <p className="text-xs text-[#683B0C]/80 font-medium max-w-xs mx-auto leading-relaxed">
              {t("callSentDesc", "Ekibimiz en kısa sürede masanıza gelecektir. Teşekkür ederiz.")}
            </p>
          </div>
        ) : (
          <>
            {/* Error message */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Quick Actions Grid */}
            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-wider text-[#8C5828]">
                {t("selectCallReason", "İşlem Türü Seçiniz")}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {options.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedType === opt.type;

                  return (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => setSelectedType(opt.type)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? "bg-[#381D05] text-white border-[#381D05] shadow-sm scale-[1.01]"
                          : "bg-white text-[#381D05] border-[#683B0C]/15 hover:border-[#381D05]/40 hover:bg-[#FAF4EE]"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-white/15 text-white" : "bg-[#FAF4EE] text-[#381D05]"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-xs block leading-tight truncate">
                          {t(opt.titleKey, opt.titleDefault)}
                        </span>
                        <span
                          className={`text-[10px] block truncate mt-0.5 ${
                            isSelected ? "text-white/70" : "text-[#8C5828]"
                          }`}
                        >
                          {t(opt.descKey, opt.descDefault)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note Input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#8C5828]">
                {t("optionalNote", "Eklemek İstediğiniz Not (Opsiyonel)")}
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={200}
                placeholder={t("notePlaceholder", "Örn: 2 adet su rica ediyoruz...")}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#683B0C]/15 text-xs text-[#381D05] placeholder:text-stone-400 focus:outline-hidden focus:border-[#381D05]"
              />
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSendCall}
              disabled={isSubmitting}
              className="w-full h-13 rounded-2xl bg-[#15803D] hover:bg-[#166534] active:scale-[0.98] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t("sendingCall", "İletiliyor...")}</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  <span>{t("sendCallBtn", "Çağrıyı Gönder")}</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
