"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { X, Wifi, Copy, Check, Sparkles } from "lucide-react";
import { Language, getTranslation } from "@/lib/i18n/translations";

interface WifiModalProps {
  isOpen: boolean;
  onClose: () => void;
  ssid?: string;
  password?: string;
  language?: Language;
}

export function WifiModal({
  isOpen,
  onClose,
  ssid = "Noa Croissant",
  password = "noa330738",
  language = "tr",
}: WifiModalProps) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const t = (key: string, fallback?: string) => getTranslation(language, key, fallback);

  useEffect(() => {
    if (!isOpen) return;

    // Standard Wi-Fi connection QR payload
    const wifiPayload = `WIFI:S:${ssid};T:WPA;P:${password};;`;

    QRCode.toDataURL(wifiPayload, {
      width: 240,
      margin: 1,
      color: {
        dark: "#381D05",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => {});
  }, [isOpen, ssid, password]);

  if (!isOpen) return null;

  const handleCopyPassword = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#1F1004]/60 backdrop-blur-xl transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-sm bg-[#FAF7F2] rounded-[30px] shadow-[0_30px_90px_rgba(31,16,4,0.4)] p-6 sm:p-7 z-10 border border-white/80 animate-slideUp space-y-5 text-center"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#683B0C]/10">
          <div className="flex items-center gap-3 text-left">
            <div className="relative w-10 h-10 shrink-0">
              <Image
                src="/brand/noa-icon.png"
                alt="NOA Icon"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#8C5828] block">
                NOA CROISSANT
              </span>
              <h2 className="text-lg font-black text-[#381D05] tracking-tight">
                {t("wifiConnectTitle", "Misafir Wi-Fi Ağı")}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label={t("closeModal", "Kapat")}
            className="w-8 h-8 rounded-full bg-[#EF4444] hover:bg-[#DC2626] text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-xs border-0"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-2xl border border-[#683B0C]/15 shadow-xs flex flex-col items-center space-y-2">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={t("wifiQrAlt", "Wi-Fi QR Kodu")}
              width={180}
              height={180}
              className="rounded-lg"
            />
          ) : (
            <div className="w-45 h-45 bg-[#FAF4EE] flex items-center justify-center text-xs text-stone-400">
              {t("generatingQr", "QR Üretiliyor...")}
            </div>
          )}
          <p className="text-[11px] font-bold text-stone-400 text-center max-w-xs leading-tight">
            {t("wifiScanPrompt", "Kameranızla okutarak şifresiz otomatik bağlanın")}
          </p>
        </div>

        {/* Network & Password Details */}
        <div className="p-4 bg-white rounded-2xl border border-[#683B0C]/15 shadow-xs text-left space-y-3">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-[#8C5828] block">
              {t("networkName", "Ağ Adı (SSID)")}
            </span>
            <span className="font-bold text-xs text-[#381D05] block mt-0.5">{ssid}</span>
          </div>

          <div className="pt-2 border-t border-[#683B0C]/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-[#8C5828] block">
                {t("wifiPassword", "Wi-Fi Şifresi")}
              </span>
              <span className="font-mono font-black text-sm text-[#15803D] block mt-0.5">
                {password}
              </span>
            </div>

            <button
              onClick={handleCopyPassword}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#15803D] border border-emerald-200/80 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#15803D]" />
                  <span className="text-[#15803D] font-black">{t("copied", "Kopyalandı")}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#15803D]" />
                  <span>{t("copy", "Kopyala")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
