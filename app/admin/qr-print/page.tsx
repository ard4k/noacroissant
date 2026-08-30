"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { Printer, ArrowLeft, RefreshCw, Sparkles } from "lucide-react";
import { noaStore } from "@/lib/store";
import { DiningTable } from "@/lib/types";
import { BRAND_ASSETS } from "@/lib/images";

export default function QRPrintPage() {
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    const currentOrigin =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    setOrigin(currentOrigin);

    const storeTables = noaStore.getTables();
    setTables(storeTables);

    // Generate QR Data URLs
    const generateQRs = async () => {
      const qrs: Record<string, string> = {};

      // Master Self-Service QR
      try {
        const masterUrl = `${currentOrigin}/`;
        qrs["master"] = await QRCode.toDataURL(masterUrl, {
          width: 340,
          margin: 1,
          color: { dark: "#381D05", light: "#FFFFFF" },
          errorCorrectionLevel: "H",
        });
      } catch (e) {}

      for (const t of storeTables) {
        const fullUrl = `${currentOrigin}/?t=${t.qr_token}`;
        try {
          const dataUrl = await QRCode.toDataURL(fullUrl, {
            width: 320,
            margin: 1,
            color: {
              dark: "#381D05",
              light: "#FFFFFF",
            },
            errorCorrectionLevel: "H",
          });
          qrs[t.id] = dataUrl;
        } catch (e) {
          console.error("QR gen error for table", t.table_number, e);
        }
      }
      setQrImages(qrs);
    };

    generateQRs();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#381D05] font-sans p-4 sm:p-8">
      {/* Non-printable Control Header */}
      <div className="no-print max-w-5xl mx-auto mb-8 bg-white p-4 sm:p-6 rounded-3xl border border-[#683B0C]/15 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="w-10 h-10 rounded-2xl bg-[#FAF0E4] border border-[#683B0C]/15 flex items-center justify-center text-[#381D05] hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-[#381D05]">
              NOA Self-Servis Menü QR Stand & Baskı Şablonları
            </h1>
            <p className="text-xs text-[#8C5828]">
              Kasa standı, giriş ve masalar için yüksek çözünürlüklü şık QR menü kartları.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-6 py-3 rounded-2xl bg-[#381D05] text-white font-bold text-xs flex items-center gap-2 shadow-sm hover:bg-[#1F1004] transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#D1A37A]" />
            <span>Kartları Yazdır / PDF İndir</span>
          </button>
        </div>
      </div>

      {/* Printable Grid of Cards */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 print:grid-cols-2 print:gap-6">
        {/* 1. MASTER SELF-SERVİS STAND KARTI */}
        {qrImages["master"] && (
          <div
            className="print-card rounded-3xl bg-[#FFFDF9] border-2 border-[#381D05] p-6 sm:p-8 shadow-sm flex flex-col items-center justify-between text-center relative overflow-hidden space-y-4 col-span-1 sm:col-span-2"
            style={{ minHeight: "420px" }}
          >
            <div className="space-y-1 relative z-10">
              <div className="w-14 h-14 mx-auto rounded-full bg-white p-1.5 shadow-sm border border-[#683B0C]/15 flex items-center justify-center">
                <Image
                  src={BRAND_ASSETS.logo}
                  alt="NOA Croissant"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <h2 className="text-2xl font-black text-[#381D05] tracking-tight mt-2">
                NOA CROISSANT
              </h2>
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-[#8C5828] block">
                Hakiki Fransız Tereyağı • Günlük Taze Pişirilir
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl shadow-sm border border-[#683B0C]/20 relative z-10">
              <img
                src={qrImages["master"]}
                alt="NOA Self Servis QR Kodu"
                width={190}
                height={190}
                className="rounded-lg"
              />
            </div>

            <div className="space-y-1.5 relative z-10">
              <div className="inline-block px-6 py-2 rounded-full bg-[#15803D] text-white text-base font-black tracking-wider shadow">
                NOA • SELF SERVİS MENÜ
              </div>
              <p className="text-xs font-semibold text-[#5C3818] max-w-sm mt-1">
                Kameranızla okutarak menümüzü inceleyebilir, kolayca siparişinizi oluşturabilirsiniz.
              </p>
            </div>

            <div className="text-[10px] font-mono text-stone-400 pt-2 border-t border-[#683B0C]/15 w-full">
              noacroissant.com • Kasa & Giriş Standı
            </div>
          </div>
        )}
        {tables.map((table) => {
          const qrDataUrl = qrImages[table.id];

          return (
            <div
              key={table.id}
              className="print-card rounded-3xl bg-[#FFFDF9] border-2 border-noa-chocolate/80 p-6 sm:p-8 shadow-card flex flex-col items-center justify-between text-center relative overflow-hidden space-y-4"
              style={{ minHeight: "420px" }}
            >
              {/* Art Deco Arches & Border Accents */}
              <div
                className="absolute -top-12 -left-12 w-32 h-32 rounded-full border border-noa-caramel/30 pointer-events-none"
                aria-hidden="true"
              />
              <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full border border-noa-caramel/30 pointer-events-none"
                aria-hidden="true"
              />

              {/* Brand Header */}
              <div className="space-y-1 relative z-10">
                <div className="w-14 h-14 mx-auto rounded-full bg-white p-1.5 shadow-subtle border border-noa-caramel/30 flex items-center justify-center">
                  <Image
                    src={BRAND_ASSETS.logo}
                    alt="NOA Croissant"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <h2 className="font-editorial text-2xl font-bold text-noa-chocolate tracking-tight mt-2">
                  NOA Croissant
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-noa-caramel block">
                  Günlük Taze Pişirilir
                </span>
              </div>

              {/* QR Code Container */}
              <div className="p-3 bg-white rounded-2xl shadow-subtle border border-noa-caramel/40 relative z-10">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`Masa ${table.table_number} QR Kodu`}
                    width={170}
                    height={170}
                    className="rounded-lg"
                  />
                ) : (
                  <div className="w-[170px] h-[170px] bg-noa-ivory flex items-center justify-center text-xs text-stone-400">
                    QR Üretiliyor...
                  </div>
                )}
              </div>

              {/* Table Number Badge */}
              <div className="space-y-1 relative z-10">
                <div className="inline-block px-5 py-1.5 rounded-full bg-noa-chocolate text-white font-editorial text-xl font-bold tracking-wider shadow">
                  {table.label}
                </div>
                <p className="text-[11px] font-semibold text-stone-600 max-w-xs mt-1">
                  Kameranızla okutarak menüye ulaşabilir ve temassız sipariş verebilirsiniz.
                </p>
              </div>

              {/* Micro footer URL */}
              <div className="text-[9px] font-mono text-stone-400 pt-2 border-t border-noa-caramel/20 w-full">
                noacroissant.com • Masa {table.table_number.toString().padStart(2, "0")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
