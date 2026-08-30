"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { OrderRecord } from "@/lib/types";
import { INITIAL_PRODUCTS } from "@/lib/seedData";
import { Printer, X } from "lucide-react";

interface ThermalReceiptProps {
  order: OrderRecord | null;
  onClose: () => void;
}

export function ThermalReceipt({ order, onClose }: ThermalReceiptProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const dateObj = new Date(order.created_at);
  const formattedDate = dateObj.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedTime = dateObj.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const orderNumStr = order.order_number
    ? String(order.order_number).replace(/^#/, "")
    : order.id.slice(-4);

  const getProductName = (item: any) => {
    if (item.product_name && item.product_name.trim()) return item.product_name;
    if (item.name && item.name.trim()) return item.name;
    if (item.product_id) {
      const found = INITIAL_PRODUCTS.find((p) => p.id === item.product_id);
      if (found) return found.name;
    }
    return "Kruvasan / Ürün";
  };

  const totalAmount =
    order.total ??
    (order as any).total_amount ??
    order.subtotal ??
    (order.items || []).reduce((sum, it) => sum + (it.total_price || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
      {/* Print-specific style override */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #thermal-receipt,
          #thermal-receipt * {
            visibility: visible !important;
          }
          #thermal-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 !important;
            padding: 4mm !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
          }
        }
      `}</style>

      {/* Screen container */}
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-stone-200 print:border-none print:p-0 print:m-0 print:shadow-none print:w-full print:max-w-none">
        
        {/* Printable Thermal Receipt (80mm / 58mm Standard POS Width) */}
        <div
          id="thermal-receipt"
          className="font-mono text-black text-xs leading-tight space-y-2.5 p-4 bg-white rounded-xl border border-dashed border-stone-300 print:border-none print:p-0"
        >
          {/* Header Brand */}
          <div className="text-center space-y-1 pb-1">
            <div className="w-11 h-11 rounded-full overflow-hidden border border-black/20 mx-auto relative bg-white shadow-xs">
              <Image
                src="/noa_icon.jpg"
                alt="NOA Logo"
                width={44}
                height={44}
                className="object-cover"
              />
            </div>
            <h2 className="text-base font-black tracking-widest uppercase">NOA CROISSANT</h2>
          </div>

          {/* Subheader Box */}
          <div className="border-2 border-black py-1 px-2 text-center font-black text-xs tracking-wider uppercase">
            MUTFAK SİPARİŞİ / KITCHEN ORDER
          </div>

          {/* Meta Table */}
          <table className="w-full text-xs font-bold border-collapse">
            <tbody>
              <tr>
                <td className="text-stone-600 py-0.5">TARİH / DATE:</td>
                <td className="text-right font-black py-0.5">{formattedDate}</td>
              </tr>
              <tr>
                <td className="text-stone-600 py-0.5">SAAT / TIME:</td>
                <td className="text-right font-black py-0.5">{formattedTime}</td>
              </tr>
              <tr>
                <td className="text-stone-600 py-0.5">SİPARİŞ NO / ORDER NO:</td>
                <td className="text-right font-black py-0.5">#{orderNumStr}</td>
              </tr>
              {order.table_number ? (
                <tr>
                  <td className="text-stone-600 py-0.5">MASA / TABLE:</td>
                  <td className="text-right font-black py-0.5">MASA {String(order.table_number).padStart(2, "0")}</td>
                </tr>
              ) : (
                <tr>
                  <td className="text-stone-600 py-0.5">SERVİS / TYPE:</td>
                  <td className="text-right font-black py-0.5">{order.table_label || "SELF-SERVİS"}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Dashed Divider */}
          <div className="border-t border-dashed border-black my-2" />

          {/* Items List */}
          <div className="space-y-2.5 my-2">
            {(order.items || []).map((item, idx) => {
              const itemTotal = (item.unit_price || 0) * (item.quantity || 1);
              const itemName = getProductName(item).toUpperCase();
              const opts = item.options || (item as any).selected_options || [];

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-baseline font-black text-[13.5px] border-b-2 border-black pb-0.5">
                    <span className="pr-2 leading-snug">
                      {item.quantity}x {itemName}
                    </span>
                    <span className="shrink-0 whitespace-nowrap">{itemTotal} TL</span>
                  </div>

                  {/* Options */}
                  {opts && opts.length > 0 && (
                    <div className="pl-2.5 text-[11.5px] text-stone-900 font-semibold space-y-0.5">
                      {opts.map((opt: any, oIdx: number) => (
                        <div key={oIdx}>
                          ↳ {opt.option_group_name ? `${opt.option_group_name}: ` : ""}
                          <strong>{opt.option_value_name || opt.name || opt.value}</strong>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Item Specific Note */}
                  {item.item_note && (
                    <div className="pl-2.5 text-[11px] font-bold text-amber-800">
                      [NOT]: {item.item_note}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* General Order Note */}
          {order.general_note && (
            <div className="border-t border-dashed border-black py-1.5 text-[11.5px]">
              <strong>MÜŞTERİ NOTU:</strong> {order.general_note}
            </div>
          )}

          {/* Dashed Divider */}
          <div className="border-t border-dashed border-black my-2" />

          {/* Total */}
          <div className="flex justify-between items-center text-sm font-black py-0.5">
            <span>TOPLAM TUTAR:</span>
            <span>{totalAmount} TL</span>
          </div>

          {/* Dashed Divider */}
          <div className="border-t border-dashed border-black my-2" />

          {/* Footer */}
          <div className="text-center font-extrabold text-[11px] tracking-widest text-stone-700 uppercase pt-1">
            NOA CROISSANT
          </div>
        </div>

        {/* Action Controls (Hidden during print) */}
        <div className="flex items-center gap-2 pt-2 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 bg-[#683B0C] hover:bg-[#4A2808] text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Adisyon Yazdır (80mm)</span>
          </button>
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
