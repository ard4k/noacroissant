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
  Lock,
  KeyRound,
  LogOut,
  Loader2,
  ShieldCheck,
  ChefHat,
  AlertCircle,
} from "lucide-react";
import { noaStore } from "@/lib/store";
import { OrderRecord, OrderStatus } from "@/lib/types";
import { formatPrice, formatDateTime, playOrderChime } from "@/lib/utils";
import { ThermalReceipt } from "@/components/ThermalReceipt";
import { printThermalHtml } from "@/lib/printUtils";
import { subscribeToOrders } from "@/lib/firebase/firestore";

function formatOrderDuration(order: OrderRecord) {
  const isCompleted = order.status === "served" || order.status === "ready";
  const start = new Date(order.created_at).getTime();
  if (isNaN(start)) return "00:00";

  let end = Date.now();
  if (isCompleted) {
    const finishTimeStr = order.ready_at || order.updated_at || order.created_at;
    const finishTime = new Date(finishTimeStr).getTime();
    if (!isNaN(finishTime) && finishTime > start) {
      end = finishTime;
    } else {
      end = start;
    }
  }

  const diffSec = Math.max(0, Math.floor((end - start) / 1000));
  const m = Math.floor(diffSec / 60);
  const s = diffSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function KitchenPage() {
  // Staff Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [activeFilter, setActiveFilter] = useState<"active" | "ready" | "completed" | "all">("active");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [nowTimestamp, setNowTimestamp] = useState(Date.now());
  const [printingOrder, setPrintingOrder] = useState<OrderRecord | null>(null);
  const prevOrderCountRef = useRef(0);

  // Check Staff Auth Status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/auth?role=kitchen");
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(Boolean(data.authenticated));
        } else {
          setIsAuthenticated(false);
        }
      } catch (e) {
        setIsAuthenticated(false);
      } finally {
        setIsAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", pin: pinInput, role: "kitchen" }),
      });
      const data = await res.json();
      if (res.ok && data.authenticated) {
        setIsAuthenticated(true);
        setPinError(null);
        setPinInput("");
      } else {
        setPinError(data.error || "Hatalı şifre! Lütfen tekrar deneyiniz.");
      }
    } catch (e) {
      setPinError("Giriş yapılamadı, lütfen tekrar deneyiniz.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } catch (e) {}
    setIsAuthenticated(false);
    setOrders([]);
    setPinInput("");
    setPinError(null);
  };

  // Load orders and subscribe to real-time events ONLY when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

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

    // Stable Order State Updater that eliminates UI flicker/re-renders when data has not changed
    const applyOrdersUpdate = (incoming: OrderRecord[]) => {
      if (!incoming || !Array.isArray(incoming)) return;
      setOrders((prev) => {
        const merged = mergeOrderLists(prev, incoming);
        if (prev.length === merged.length) {
          let isIdentical = true;
          for (let i = 0; i < prev.length; i++) {
            const a = prev[i];
            const b = merged[i];
            if (
              a.id !== b.id ||
              a.status !== b.status ||
              a.payment_status !== b.payment_status ||
              a.updated_at !== b.updated_at ||
              a.total !== b.total ||
              a.order_number !== b.order_number
            ) {
              isIdentical = false;
              break;
            }
          }
          if (isIdentical) return prev;
        }

        noaStore.setOrders(merged);

        if (merged.length > prevOrderCountRef.current && prevOrderCountRef.current > 0) {
          if (soundEnabled) {
            playOrderChime();
          }
        }
        prevOrderCountRef.current = merged.length;
        return merged;
      });
    };

    const syncOrders = () => {
      const all = noaStore.getOrders();
      applyOrdersUpdate(all);
    };

    // 0. Direct Firestore Real-Time Listeners (0ms cloud push across all devices)
    let unsubscribeFirestore: (() => void) | null = null;

    try {
      unsubscribeFirestore = subscribeToOrders((firestoreOrders) => {
        if (firestoreOrders && Array.isArray(firestoreOrders)) {
          applyOrdersUpdate(firestoreOrders);
        }
      });
    } catch (e) {}

    const fetchServerOrders = async () => {
      try {
        const res = await fetch("/api/admin/orders");
        if (res.ok) {
          const data = await res.json();
          if (data.orders && Array.isArray(data.orders)) {
            applyOrdersUpdate(data.orders);
          }
        }
      } catch (e) {}
    };

    syncOrders();
    const unsubStore = noaStore.subscribe(syncOrders);
    fetchServerOrders();
    const interval = setInterval(fetchServerOrders, 3000);

    const handleFocus = () => fetchServerOrders();
    window.addEventListener("focus", handleFocus);

    // 0ms Real-Time Server-Sent Events (SSE) Stream
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/orders/stream");
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.orders && Array.isArray(payload.orders)) {
            applyOrdersUpdate(payload.orders);
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
      if (unsubscribeFirestore) unsubscribeFirestore();
      unsubStore();
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      if (eventSource) eventSource.close();
      clearInterval(timer);
    };
  }, [soundEnabled, isAuthenticated]);

  // Toggle sound
  const handleToggleSound = () => {
    setSoundEnabled((prev) => !prev);
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
    const dateObj = new Date(order.created_at);
    const formattedDate = dateObj.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const formattedTime = dateObj.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const isSelfService =
      order.table_number === 0 ||
      order.table_number === undefined ||
      order.table_label?.toLowerCase().includes("self");

    const totalAmount = order.total || order.subtotal || 0;

    const itemsHtml = order.items
      .map((it) => {
        const optionsHtml = (it.options || [])
          .map(
            (o) =>
              `<div style="font-size: 11px; color: #444; padding-left: 10px; margin-top: 2px;">• ${
                o.option_group_name ? o.option_group_name + ": " : ""
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

    const html = `
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
            .dashed-divider {
              border-top: 1px dashed #000;
              margin: 6px 0;
            }
            .meta-table {
              width: 100%;
              font-size: 12px;
              margin: 4px 0;
            }
            .meta-table td {
              padding: 1.5px 0;
            }
            .meta-label {
              font-weight: bold;
              width: 45%;
            }
            .meta-value {
              text-align: right;
              font-weight: 900;
            }
            .footer-sign {
              text-align: center;
              font-size: 11px;
              font-weight: 900;
              margin-top: 10px;
              letter-spacing: 1px;
            }
          </style>
        </head>
        <body>
          <div class="brand-wrap">
            <img src="/noa_icon.jpg" class="brand-logo" alt="NOA" />
            <div class="brand-title">NOA CROISSANT</div>
            <div style="font-size: 11px; font-weight: bold; letter-spacing: 0.5px;">MUTFAK SİPARİŞ FİŞİ</div>
          </div>

          <div class="dashed-divider"></div>

          <table class="meta-table">
            <tr>
              <td class="meta-label">TARİH / SAAT:</td>
              <td class="meta-value">${formattedDate} ${formattedTime}</td>
            </tr>
            <tr>
              <td class="meta-label">SİPARİŞ TÜRÜ:</td>
              <td class="meta-value" style="font-size: 14px; font-weight: 900;">GEL-AL / SELF SERVİS</td>
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
        </body>
      </html>
    `;

    printThermalHtml(html);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#D35400]" />
        <p className="text-sm font-medium text-stone-400">Mutfak paneli yükleniyor...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4 text-white font-sans">
        <div className="w-full max-w-sm bg-[#141414] rounded-3xl p-8 border border-[#262626] shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col items-center text-center space-y-6">
          {/* Logo */}
          <div className="relative w-20 h-20 shrink-0">
            <Image
              src="/brand/noa-icon.png"
              alt="NOA Emblem"
              fill
              sizes="80px"
              className="object-contain"
              priority
            />
          </div>

          <div>
            <span className="text-xs font-black tracking-widest uppercase text-[#D1A37A] block">
              NOA CROISSANT
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div className="space-y-2">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  if (pinError) setPinError(null);
                }}
                placeholder="Şifreyi giriniz"
                autoFocus
                className={`w-full py-3.5 px-4 text-center tracking-[0.25em] font-mono text-xl font-bold rounded-2xl bg-[#1A1A1A] border transition-all focus:outline-none focus:ring-2 focus:ring-[#DC2626] text-white ${
                  pinError ? "border-red-500 ring-2 ring-red-900/40" : "border-[#333333]"
                }`}
              />

              {pinError && (
                <div className="p-3 rounded-2xl bg-red-950/50 border border-red-800 text-xs font-bold text-red-400 flex items-center gap-3 text-left shadow-2xs">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <div className="flex-1 flex flex-col justify-center leading-tight">
                    {pinError.includes("15 dakika") ? (
                      <>
                        <span className="block font-bold text-xs text-red-400">Çok fazla hatalı giriş denemesi.</span>
                        <span className="block font-semibold text-[11px] text-red-300 mt-0.5">Güvenlik nedeniyle 15 dakika kilitlendi.</span>
                      </>
                    ) : (
                      <span>{pinError}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Giriş Yap</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

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

        {/* Action Controls (Sound, Admin Link, Logout) */}
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

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Güvenli Çıkış Yap"
            className="p-2 rounded-xl bg-[#141414] hover:bg-[#222222] text-stone-400 hover:text-red-400 transition-all border border-[#222222] cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
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
                      <div className="text-xs text-stone-300 font-mono mt-0.5">
                        <span>{formatDateTime(order.created_at)}</span>
                      </div>
                    </div>

                    {/* Right: Elapsed Pill + Print Button + Item Counter */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Live Elapsed / Preparation Duration Timer */}
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-black shadow-xs border ${themeTimerPill}`}>
                        <span className={`w-2 h-2 rounded-full ${!isGreen ? "animate-pulse " + themeTimerDot : themeTimerDot}`} />
                        <span>{formatOrderDuration(order)}</span>
                        {isOverdue && !isGreen && (
                          <span className="text-[9px] uppercase tracking-wider font-extrabold ml-0.5">GECİKTİ</span>
                        )}
                      </div>

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
