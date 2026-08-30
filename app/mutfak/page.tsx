"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Volume2,
  VolumeX,
  Clock,
  CheckCircle2,
  Printer,
  Sparkles,
  RefreshCw,
  XCircle,
  LayoutDashboard,
} from "lucide-react";
import { noaStore } from "@/lib/store";
import { OrderRecord, OrderStatus } from "@/lib/types";
import { formatPrice, formatDateTime, playOrderChime } from "@/lib/utils";
import { ThermalReceipt } from "@/components/ThermalReceipt";

function formatElapsedMMSS(createdDateString: string) {
  const start = new Date(createdDateString).getTime();
  if (isNaN(start)) return "00:00";
  const diffSec = Math.max(0, Math.floor((Date.now() - start) / 1000));
  const m = Math.floor(diffSec / 60);
  const s = diffSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [activeFilter, setActiveFilter] = useState<"active" | "ready" | "completed" | "all">("active");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [nowTimestamp, setNowTimestamp] = useState(Date.now());
  const [printingOrder, setPrintingOrder] = useState<OrderRecord | null>(null);
  const prevOrderCountRef = useRef(0);

  // Load orders and subscribe to real-time events
  useEffect(() => {
    const mergeOrderLists = (current: OrderRecord[], incoming: OrderRecord[]): OrderRecord[] => {
      if (!incoming || incoming.length === 0) return current;
      const map = new Map<string, OrderRecord>();
      for (const o of current) {
        if (o && o.id) map.set(o.id, o);
      }
      for (const o of incoming) {
        if (!o || !o.id) continue;
        const existing = map.get(o.id);
        if (!existing) {
          map.set(o.id, o);
        } else {
          const existingTime = new Date(existing.updated_at || existing.created_at).getTime();
          const incomingTime = new Date(o.updated_at || o.created_at).getTime();
          if (incomingTime >= existingTime) {
            map.set(o.id, o);
          }
        }
      }
      return Array.from(map.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    };

    const syncOrders = () => {
      const all = noaStore.getOrders();
      setOrders(all);

      if (all.length > prevOrderCountRef.current && prevOrderCountRef.current > 0) {
        if (soundEnabled) {
          playOrderChime();
        }
      }
      prevOrderCountRef.current = all.length;
    };

    const fetchServerOrders = async () => {
      try {
        const res = await fetch("/api/admin/orders");
        if (res.ok) {
          const data = await res.json();
          if (data.orders && Array.isArray(data.orders)) {
            setOrders(data.orders);
            if (data.orders.length > prevOrderCountRef.current && prevOrderCountRef.current > 0) {
              if (soundEnabled) {
                playOrderChime();
              }
            }
            prevOrderCountRef.current = data.orders.length;
          }
        }
      } catch (e) {}
    };

    fetchServerOrders();
    const pollInterval = setInterval(fetchServerOrders, 2000);

    const handleFocus = () => fetchServerOrders();
    window.addEventListener("focus", handleFocus);

    const unsubscribeStore = noaStore.subscribe(fetchServerOrders);

    // 0ms Real-Time Server-Sent Events (SSE) Stream
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/orders/stream");
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.orders && Array.isArray(payload.orders)) {
            setOrders(payload.orders);
            if (payload.orders.length > prevOrderCountRef.current && prevOrderCountRef.current > 0) {
              if (soundEnabled) {
                playOrderChime();
              }
            }
            prevOrderCountRef.current = payload.orders.length;
          }
        } catch (e) {}
      };
      eventSource.onerror = () => {
        fetchServerOrders();
      };
    } catch (e) {}

    // Live timer ticking every second
    const timer = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 1000);

    return () => {
      unsubscribeStore();
      clearInterval(pollInterval);
      window.removeEventListener("focus", handleFocus);
      if (eventSource) eventSource.close();
      clearInterval(timer);
    };
  }, [soundEnabled]);

  // Toggle sound
  const handleToggleSound = () => {
    if (!soundEnabled) {
      playOrderChime();
      setSoundEnabled(true);
    } else {
      setSoundEnabled(false);
    }
  };

  // Status transitions
  const handleAdvanceStatus = async (orderId: string, nextStatus: OrderStatus) => {
    // 1. Instant Optimistic React State Update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: nextStatus,
              payment_status: nextStatus === "preparing" ? "paid" : o.payment_status,
              updated_at: new Date().toISOString(),
            }
          : o
      )
    );

    // 2. Safe local store update
    try {
      if (nextStatus === "preparing") {
        noaStore.updatePaymentStatus(orderId, "paid");
      }
      noaStore.updateOrderStatus(orderId, nextStatus, undefined, undefined, "Mutfak");
    } catch (e) {}

    // 3. Server API + Firestore persistence
    try {
      const res = await fetch("/api/admin/order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          status: nextStatus,
          payment_status: nextStatus === "preparing" ? "paid" : undefined,
          staff_name: "Mutfak",
        }),
      });
      const data = await res.json();
      if (data.order) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      }
    } catch (e) {}
  };

  // Print Order Receipt Function matching reference design
  const handlePrintOrder = (order: OrderRecord) => {
    const printWindow = window.open("", "_blank", "width=380,height=650");
    if (!printWindow) return;

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

    const totalAmount =
      order.total ||
      order.subtotal ||
      order.items.reduce((sum, it) => sum + (it.total_price || 0), 0);

    const itemsHtml = order.items
      .map((it) => {
        const optionsHtml = (it.options || [])
          .map(
            (o) =>
              `<div style="font-size: 11.5px; font-weight: 600; color: #222; padding-left: 10px; margin-top: 2px;">↳ ${
                o.option_group_name ? `${o.option_group_name}: ` : ""
              }<strong>${o.option_value_name}</strong></div>`
          )
          .join("");

        const noteHtml = it.item_note
          ? `<div style="font-size: 11px; font-weight: bold; color: #b45309; padding-left: 10px; margin-top: 3px;">[NOT]: ${it.item_note}</div>`
          : "";

        return `
          <div style="margin-bottom: 10px;">
            <div style="font-size: 13.5px; font-weight: 900; border-bottom: 2px solid #000; padding-bottom: 3px; display: flex; justify-content: space-between; align-items: baseline; gap: 8px;">
              <span style="flex: 1; line-height: 1.25;">${it.quantity}x ${it.product_name.toUpperCase()}</span>
              <span style="white-space: nowrap; flex-shrink: 0; text-align: right;">${it.total_price} TL</span>
            </div>
            ${optionsHtml}
            ${noteHtml}
          </div>
        `;
      })
      .join("");

    const noteBlock = order.general_note
      ? `<div style="border-top: 1px dashed #000; padding: 6px 0; font-size: 11.5px;"><strong>MÜŞTERİ NOTU:</strong> ${order.general_note}</div>`
      : "";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Mutfak Fişi - ${order.order_number}</title>
          <style>
            @page { margin: 4mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Courier New', monospace;
              padding: 8px 12px;
              margin: 0 auto;
              color: #000;
              font-size: 13px;
              max-width: 320px;
            }
            .brand-wrap {
              text-align: center;
              margin: 0 0 6px 0;
            }
            .brand-logo {
              width: 44px;
              height: 44px;
              border-radius: 50%;
              display: block;
              margin: 0 auto 3px auto;
              object-fit: cover;
            }
            .brand-title {
              font-family: system-ui, -apple-system, sans-serif;
              font-size: 20px;
              font-weight: 900;
              letter-spacing: 1.5px;
            }
            .header-box {
              border: 2px solid #000;
              padding: 5px;
              text-align: center;
              font-weight: 900;
              font-size: 12px;
              letter-spacing: 1px;
              margin: 8px 0 14px 0;
            }
            .meta-table {
              width: 100%;
              font-size: 12px;
              font-weight: 700;
              margin-bottom: 10px;
              border-collapse: collapse;
            }
            .meta-table td {
              padding: 2px 0;
            }
            .meta-label {
              color: #444;
              letter-spacing: 0.5px;
            }
            .meta-value {
              text-align: right;
              font-weight: 900;
            }
            .dashed-divider {
              border-top: 1px dashed #000;
              margin: 10px 0;
            }
            .footer-sign {
              text-align: center;
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 2px;
              color: #444;
              margin-top: 16px;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <div class="brand-wrap">
            <img class="brand-logo" src="${window.location.origin}/noa_icon.jpg" alt="NOA Icon" />
            <div class="brand-title">NOA CROISSANT</div>
          </div>

          <div class="header-box">MUTFAK SİPARİŞİ / KITCHEN ORDER</div>
          
          <table class="meta-table">
            <tr>
              <td class="meta-label">TARİH / DATE:</td>
              <td class="meta-value">${formattedDate}</td>
            </tr>
            <tr>
              <td class="meta-label">SAAT / TIME:</td>
              <td class="meta-value">${formattedTime}</td>
            </tr>
            <tr>
              <td class="meta-label">SİPARİŞ NO / ORDER NO:</td>
              <td class="meta-value">#${order.order_number}</td>
            </tr>
          </table>

          <div class="dashed-divider"></div>

          <div style="margin: 12px 0;">
            ${itemsHtml}
          </div>

          ${noteBlock}

          <div class="dashed-divider"></div>

          <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 900; padding: 4px 0;">
            <span>TOPLAM TUTAR:</span>
            <span>${totalAmount} TL</span>
          </div>

          <div class="dashed-divider"></div>

          <div class="footer-sign">NOA CROISSANT</div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Only orders that are approved/paid (preparing, ready, served, cancelled) exist in the kitchen scope
  const kitchenOrders = orders.filter(
    (o) => o.status === "preparing" || o.status === "ready" || o.status === "served" || o.status === "cancelled"
  );

  const filteredOrders = kitchenOrders.filter((o) => {
    if (activeFilter === "active") {
      return o.status === "preparing";
    }
    if (activeFilter === "ready") {
      return o.status === "ready";
    }
    if (activeFilter === "completed") {
      return o.status === "served" || o.status === "cancelled";
    }
    return true;
  });

  const activeCount = kitchenOrders.filter((o) => o.status === "preparing").length;
  const readyCount = kitchenOrders.filter((o) => o.status === "ready").length;
  const completedCount = kitchenOrders.filter((o) => o.status === "served" || o.status === "cancelled").length;

  return (
    <div className="min-h-screen bg-black text-stone-100 flex flex-col font-sans">
      {/* Kitchen Top Navigation Bar */}
      <header className="bg-[#0A0A0A] border-b border-[#222222] px-4 py-3 shrink-0 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center">
          <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 shadow-xs border border-white/20">
            <Image
              src="/noa_icon.jpg"
              alt="NOA Icon"
              fill
              sizes="36px"
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#111111] p-1 rounded-xl border border-[#222222]">
          <button
            onClick={() => setActiveFilter("active")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeFilter === "active"
                ? "bg-[#D35400] text-white shadow"
                : "text-stone-300 hover:bg-[#1A1A1A]"
            }`}
          >
            <span>Hazırlanacak</span>
            {activeCount > 0 && (
              <span
                className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black shadow-xs ${
                  activeFilter === "active"
                    ? "bg-white text-[#D35400]"
                    : "bg-[#DC2626] text-white border border-white/20"
                }`}
              >
                {activeCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveFilter("ready")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeFilter === "ready"
                ? "bg-emerald-600 text-white shadow"
                : "text-stone-300 hover:bg-[#1A1A1A]"
            }`}
          >
            <span>Hazır</span>
            {readyCount > 0 && (
              <span
                className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black shadow-xs ${
                  activeFilter === "ready"
                    ? "bg-white text-emerald-700"
                    : "bg-[#DC2626] text-white border border-white/20"
                }`}
              >
                {readyCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveFilter("completed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeFilter === "completed"
                ? "bg-stone-800 text-white"
                : "text-stone-300 hover:bg-[#1A1A1A]"
            }`}
          >
            <span>Tamamlananlar</span>
            {completedCount > 0 && (
              <span
                className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black shadow-xs ${
                  activeFilter === "completed"
                    ? "bg-white text-stone-900"
                    : "bg-stone-700 text-white border border-white/20"
                }`}
              >
                {completedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeFilter === "all"
                ? "bg-stone-800 text-white"
                : "text-stone-300 hover:bg-[#1A1A1A]"
            }`}
          >
            Tümü ({kitchenOrders.length})
          </button>
        </div>

        {/* Action Controls (Sound, Admin Link) */}
        <div className="flex items-center gap-2">
          {/* Sound Notification Control */}
          <button
            onClick={handleToggleSound}
            aria-label={soundEnabled ? "Sesi Kapat" : "Sesi Aç"}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              soundEnabled
                ? "bg-emerald-600 text-white shadow"
                : "bg-[#141414] text-stone-400 hover:bg-[#222222]"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline">{soundEnabled ? "Ses Açık" : "Sesi Aç"}</span>
          </button>

          {/* Link to Admin (Red Button with Icon) */}
          <Link
            href="/admin"
            className="px-3.5 py-1.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-xs font-bold text-white transition-all shadow-xs active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-white" />
            <span>Yönetim Paneli</span>
          </Link>
        </div>
      </header>

      {/* Mobile Filter Tabs */}
      <div className="sm:hidden flex items-center gap-1 p-2 bg-[#0A0A0A] border-b border-[#222222] overflow-x-auto">
        <button
          onClick={() => setActiveFilter("active")}
          className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 ${
            activeFilter === "active" ? "bg-[#D35400] text-white" : "bg-[#141414] text-stone-400"
          }`}
        >
          <span>Hazırlanacak</span>
          {activeCount > 0 && (
            <span
              className={`w-4 h-4 rounded-full text-[9.5px] flex items-center justify-center font-black ${
                activeFilter === "active"
                  ? "bg-white text-[#D35400]"
                  : "bg-[#DC2626] text-white"
              }`}
            >
              {activeCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveFilter("ready")}
          className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 ${
            activeFilter === "ready" ? "bg-emerald-600 text-white" : "bg-[#141414] text-stone-400"
          }`}
        >
          <span>Hazır</span>
          {readyCount > 0 && (
            <span
              className={`w-4 h-4 rounded-full text-[9.5px] flex items-center justify-center font-black ${
                activeFilter === "ready"
                  ? "bg-white text-emerald-700"
                  : "bg-[#DC2626] text-white"
              }`}
            >
              {readyCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveFilter("completed")}
          className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
            activeFilter === "completed" ? "bg-stone-800 text-white" : "bg-[#141414] text-stone-400"
          }`}
        >
          Tamamlananlar
        </button>
      </div>

      {/* Order Cards Grid */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-black">
        {filteredOrders.length === 0 ? (
          <div className="h-full min-h-[50vh] flex flex-col items-center justify-center text-stone-500 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-stone-700" />
            <p className="text-sm font-medium">Bu filtrede bekleyen sipariş bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
            {filteredOrders.map((order) => {
              const isCancelled = order.status === "cancelled";
              const isServed = order.status === "served";
              const isReady = order.status === "ready";

              // Elapsed time calculation in minutes
              const orderTimeMs = new Date(order.created_at).getTime();
              const elapsedMinutes = (nowTimestamp - orderTimeMs) / (1000 * 60);

              const isOverdue = !isServed && !isCancelled && elapsedMinutes >= 15;
              const isWarning = !isServed && !isCancelled && elapsedMinutes >= 10 && elapsedMinutes < 15;

              // Dynamic Color States:
              // 1. Red (Alarm / Cancelled): isCancelled || 15+ mins
              // 2. Orange (Warning): 10-15 mins
              // 3. Green (Fresh / Ready / Completed): 0-10 mins || ready || served
              const isRed = isCancelled || isOverdue;
              const isOrange = isWarning;
              const isGreen = !isRed && !isOrange;

              const themeBorder = isRed
                ? "border-red-600 shadow-[0_12px_40px_rgba(220,38,38,0.35)]"
                : isOrange
                ? "border-[#D35400] shadow-[0_12px_36px_rgba(211,84,0,0.25)]"
                : "border-emerald-500 shadow-[0_12px_36px_rgba(16,185,129,0.2)]";

              const themeHeaderBorder = isRed
                ? "border-red-600/40"
                : isOrange
                ? "border-[#D35400]/40"
                : "border-emerald-500/40";

              const themeHeaderText = isRed
                ? "text-red-500"
                : isOrange
                ? "text-[#D35400]"
                : "text-emerald-400";

              const themeTimerPill = isRed
                ? "bg-[#380808] border-red-500/60 text-red-400"
                : isOrange
                ? "bg-[#2B1405] border-[#D35400]/60 text-amber-400"
                : "bg-[#072412] border-[#22C55E]/40 text-[#22C55E]";

              const themeTimerDot = isRed
                ? "bg-red-500"
                : isOrange
                ? "bg-amber-400"
                : "bg-[#22C55E]";

              const themeItemBorder = isRed
                ? "border-red-600/40"
                : isOrange
                ? "border-[#D35400]/50"
                : "border-emerald-500/40";

              const themeItemText = isRed
                ? "text-red-400"
                : isOrange
                ? "text-[#D35400]"
                : "text-emerald-400";

              const themeBullseyeBorder = isRed
                ? "border-red-500"
                : isOrange
                ? "border-[#D35400]"
                : "border-emerald-500";

              const themeBullseyeDot = isRed
                ? "bg-red-500"
                : isOrange
                ? "bg-[#D35400]"
                : "bg-emerald-500";

              const themeTreeBranch = isRed
                ? "border-red-600/30"
                : isOrange
                ? "border-[#D35400]/40"
                : "border-emerald-500/30";

              const themeBranchLine = isRed
                ? "bg-red-600/40"
                : isOrange
                ? "bg-[#D35400]/40"
                : "bg-emerald-500/40";

              const themeFooterBorder = isRed
                ? "border-red-600/30"
                : isOrange
                ? "border-[#D35400]/30"
                : "border-emerald-500/30";

              return (
                <div
                  key={order.id}
                  className={`rounded-[26px] border-2 bg-[#0A0A0A] overflow-hidden flex flex-col justify-between transition-all ${themeBorder}`}
                >
                  {/* Card Header (Matches Reference) */}
                  <div className={`p-4 sm:p-5 flex items-center justify-between border-b gap-3 bg-[#0A0A0A] ${themeHeaderBorder}`}>
                    {/* Left: Order Number + Date/Time */}
                    <div className="flex flex-col min-w-0">
                      <span className={`text-xl sm:text-2xl font-black tracking-tight ${themeHeaderText}`}>
                        #{order.order_number || order.id}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-stone-300 font-mono mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>{formatDateTime(order.created_at)}</span>
                      </div>
                    </div>

                    {/* Right: Elapsed Pill + Print Button + Item Counter */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Live Elapsed Timer */}
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-black shadow-xs border ${themeTimerPill}`}>
                        <span className={`w-2 h-2 rounded-full animate-pulse ${themeTimerDot}`} />
                        <span>{formatElapsedMMSS(order.created_at)}</span>
                        {isOverdue && <span className="text-[9px] uppercase tracking-wider font-extrabold ml-0.5">GECİKTİ</span>}
                      </div>

                      {/* Print Receipt Button */}
                      <button
                        onClick={() => setPrintingOrder(order)}
                        title="Fişi Yazdır"
                        className="px-3.5 py-1.5 rounded-xl bg-[#FAF0E4] hover:bg-white text-[#381D05] font-black text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                      >
                        <Printer className="w-4 h-4 text-[#8C5828]" />
                        <span className="hidden sm:inline">FİŞİ YAZDIR</span>
                      </button>

                      {/* Item Counter */}
                      <div className="px-3 py-1.5 rounded-xl bg-[#181818] text-stone-200 border border-[#333333] text-xs font-mono font-black">
                        {order.items.length}/{order.items.length}
                      </div>
                    </div>
                  </div>

                  {/* Card Body: Item Boxes */}
                  <div className="p-4 sm:p-5 space-y-3.5 flex-1 bg-[#0A0A0A]">
                    {order.items.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className={`rounded-2xl border bg-[#040404] p-4 relative overflow-hidden shadow-inner ${themeItemBorder}`}
                      >
                        {/* Item Top Title Row */}
                        <div className="flex items-center gap-2.5 relative z-10">
                          {/* Bullseye Icon */}
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${themeBullseyeBorder}`}>
                            <div className={`w-2 h-2 rounded-full ${themeBullseyeDot}`} />
                          </div>

                          <div className="flex items-baseline gap-1.5 min-w-0">
                            <span className={`font-black text-base sm:text-lg ${themeItemText}`}>
                              {item.quantity}×
                            </span>
                            <span className="text-white font-black text-base sm:text-lg tracking-tight truncate">
                              {item.product_name}
                            </span>
                          </div>
                        </div>

                        {/* Options Tree Branch Structure */}
                        {item.options && item.options.length > 0 && (
                          <div className={`ml-2.5 pl-4 border-l-2 mt-3 space-y-2 relative z-10 ${themeTreeBranch}`}>
                            {item.options.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                className="relative flex items-center text-xs sm:text-sm font-semibold text-stone-200"
                              >
                                <span className={`absolute -left-4 w-3.5 h-[2px] ${themeBranchLine}`} />
                                <span>
                                  {opt.option_group_name}: <strong className="text-white font-black">{opt.option_value_name}</strong>
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Item Specific Note */}
                        {item.item_note && (
                          <div className="ml-6 mt-2.5 p-2 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs font-bold relative z-10">
                            ⚠️ Özel Not: {item.item_note}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* General Order Note */}
                    {order.general_note && (
                      <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                        <span className="font-black text-amber-400 block uppercase tracking-wider">
                          Sipariş Notu:
                        </span>
                        <p className="font-medium">{order.general_note}</p>
                      </div>
                    )}

                    {/* Cancelled Reason if present */}
                    {order.status === "cancelled" && order.cancelled_reason && (
                      <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs space-y-1">
                        <span className="font-black text-red-400 block uppercase tracking-wider">
                          İptal Nedeni:
                        </span>
                        <p className="font-medium">{order.cancelled_reason}</p>
                      </div>
                    )}
                  </div>

                  {/* Card Action Footer */}
                  <div className={`p-4 bg-[#0A0A0A] border-t ${themeFooterBorder}`}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPrintingOrder(order)}
                        title="Adisyon Yazdır (80mm)"
                        className="px-3.5 py-3 rounded-2xl bg-[#1C1C1C] hover:bg-[#2A2A2A] text-stone-200 font-black text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0 border border-stone-800"
                      >
                        <Printer className="w-4 h-4" />
                        <span className="hidden sm:inline">Fiş</span>
                      </button>

                      <div className="flex-1">
                        {order.status === "preparing" && (
                          <button
                            onClick={() => handleAdvanceStatus(order.id, "ready")}
                            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Hazırlandı</span>
                          </button>
                        )}

                        {order.status === "ready" && (
                          <button
                            onClick={() => handleAdvanceStatus(order.id, "served")}
                            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Teslim Et</span>
                          </button>
                        )}

                        {order.status === "served" && (
                          <div className="w-full py-3 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 font-black text-sm flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Teslim Edildi</span>
                          </div>
                        )}

                        {order.status === "cancelled" && (
                          <div className="w-full py-3 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-400 font-black text-sm flex items-center justify-center gap-2">
                            <XCircle className="w-5 h-5" />
                            <span>İptal Edildi</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Thermal Receipt Print Modal */}
      {printingOrder && (
        <ThermalReceipt
          order={printingOrder}
          onClose={() => setPrintingOrder(null)}
        />
      )}
    </div>
  );
}
