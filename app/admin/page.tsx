"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Grid,
  QrCode,
  Sparkles,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  Banknote,
  Search,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Printer,
  Settings,
  Gift,
  AlertCircle,
  Eye,
  TrendingUp,
  Database,
  Server,
  Cloud,
  ShieldCheck,
  Check,
  ChefHat,
  BookOpen,
  Lock,
  KeyRound,
  LogOut,
  RotateCcw,
  Loader2,
  Bell,
  BarChart3,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { noaStore } from "@/lib/store";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { seedAllDataToFirestore } from "@/lib/firebase/firestore";
import {
  DiningTable,
  Product,
  Category,
  OrderRecord,
  OrderStatus,
  Promotion,
  BusinessSettings,
  StaffRole,
} from "@/lib/types";
import { formatPrice, formatDateTime, formatFullDateTime, playOrderChime } from "@/lib/utils";
import { ThermalReceipt } from "@/components/ThermalReceipt";
import { BRAND_ASSETS } from "@/lib/images";

function AdminDashboardContent() {
  // Admin PIN Protection (Server Verified)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkServerAuth = async () => {
      try {
        const res = await fetch("/api/admin/auth");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        }
      } catch (e) {}
      setIsAuthLoading(false);
    };
    checkServerAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", pin: pinInput }),
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
    setPinInput("");
    setPinError(null);
  };

  // Navigation tab state (Clean & Focused)
  const [activeTab, setActiveTab] = useState<
    "orders" | "menu" | "tables" | "promotions" | "settings" | "database"
  >("orders");

  // Store state
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(noaStore.getSettings());
  const prevOrdersCountRef = useRef<number>(0);

  // Firebase sync state
  const [isSyncingDb, setIsSyncingDb] = useState(false);
  const [syncDbMessage, setSyncDbMessage] = useState<{ success: boolean; text: string } | null>(null);

  const handleSeedFirestore = async () => {
    setIsSyncingDb(true);
    setSyncDbMessage(null);
    try {
      const res = await seedAllDataToFirestore({
        categories: noaStore.getCategories(),
        products: noaStore.getProducts(),
        tables: noaStore.getTables(),
        settings: noaStore.getSettings(),
      });
      setSyncDbMessage({ success: res.success, text: res.message });
    } catch (err: any) {
      setSyncDbMessage({ success: false, text: err?.message || "Hata oluştu." });
    } finally {
      setIsSyncingDb(false);
    }
  };

  // Search & Filter
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [menuSearchQuery, setMenuSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");

  // Selected order modal for detail and cancel
  const [isClearingOrders, setIsClearingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [cancelModalOrderId, setCancelModalOrderId] = useState<string | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState("");
  const [isZReportOpen, setIsZReportOpen] = useState(false);
  const [printingOrder, setPrintingOrder] = useState<OrderRecord | null>(null);

  // Product edit modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Admin PIN Protection for Actions (Edit, Add, Delete)
  const [actionPinModal, setActionPinModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onSuccess: () => void;
  } | null>(null);
  const [actionPinInput, setActionPinInput] = useState("");
  const [actionPinError, setActionPinError] = useState<string | null>(null);

  const requestAdminAuth = (title: string, description: string, onSuccess: () => void) => {
    setActionPinInput("");
    setActionPinError(null);
    setActionPinModal({
      isOpen: true,
      title,
      description,
      onSuccess,
    });
  };

  const handleVerifyActionPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionPinError(null);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_action", pin: actionPinInput }),
      });
      const data = await res.json();
      if (res.ok && data.authorized) {
        const cb = actionPinModal?.onSuccess;
        setActionPinModal(null);
        setActionPinInput("");
        setActionPinError(null);
        if (cb) cb();
      } else {
        setActionPinError(data.error || "Hatalı admin parolası! Lütfen tekrar deneyiniz.");
      }
    } catch (e) {
      setActionPinError("Doğrulama başarısız oldu.");
    }
  };

  // Helper to safely merge order lists without losing any existing orders
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

  // Sync with store, API, and Real-Time events
  useEffect(() => {
    const syncLocalData = () => {
      setOrders(noaStore.getOrders());
      setTables(noaStore.getTables());
      setCategories(noaStore.getCategories());
      setProducts(noaStore.getProducts());
      setPromotions(noaStore.getPromotions());
      setSettings(noaStore.getSettings());
    };

    syncLocalData();
    const unsubscribeStore = noaStore.subscribe(syncLocalData);

    // 1. Direct Server API Fetch for 100% Guaranteed Freshness
    const fetchServerData = async () => {
      try {
        const res = await fetch("/api/admin/orders");
        if (res.ok) {
          const data = await res.json();
          if (data.orders && Array.isArray(data.orders)) {
            setOrders(data.orders);
            if (data.orders.length > prevOrdersCountRef.current && prevOrdersCountRef.current > 0) {
              try {
                playOrderChime();
              } catch (e) {}
            }
            prevOrdersCountRef.current = data.orders.length;
          }
          if (data.tables && Array.isArray(data.tables)) {
            setTables(data.tables);
          }
        }
      } catch (e) {}
    };

    fetchServerData();

    // 2. Fast 1-Second Active Background Polling
    const pollInterval = setInterval(fetchServerData, 1000);

    // 3. Instant revalidation on window focus / tab visibility
    const handleFocus = () => fetchServerData();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchServerData();
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    // 4. Real-time 0ms Server-Sent Events (SSE) Stream
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/orders/stream");
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.orders && Array.isArray(payload.orders)) {
            setOrders(payload.orders);
            if (payload.orders.length > prevOrdersCountRef.current && prevOrdersCountRef.current > 0) {
              try {
                playOrderChime();
              } catch (e) {}
            }
            prevOrdersCountRef.current = payload.orders.length;
          }
        } catch (e) {}
      };
      eventSource.onerror = () => {
        // SSE disconnected, fallback to immediate fetch
        fetchServerData();
      };
    } catch (e) {}

    // 5. Cross-tab Broadcast Channel
    let broadcast: BroadcastChannel | null = null;
    try {
      broadcast = new BroadcastChannel("noa_realtime_bus");
      broadcast.onmessage = () => {
        fetchServerData();
      };
    } catch (e) {}

    return () => {
      unsubscribeStore();
      clearInterval(pollInterval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (eventSource) eventSource.close();
      if (broadcast) broadcast.close();
    };
  }, []);

  // Daily statistics
  const stats = useMemo(() => {
    const activeOrders = orders.filter(
      (o) => o.status === "received" || o.status === "preparing" || o.status === "ready"
    );
    const completedOrders = orders.filter((o) => o.status === "served");
    const cancelledOrders = orders.filter((o) => o.status === "cancelled");
    const totalRevenue = orders
      .filter((o) => o.status !== "cancelled" && o.payment_status === "paid")
      .reduce((sum, o) => sum + o.total, 0);
    const unpaidRevenue = orders
      .filter((o) => o.status !== "cancelled" && o.payment_status === "unpaid")
      .reduce((sum, o) => sum + o.total, 0);

    return {
      activeCount: activeOrders.length,
      completedCount: completedOrders.length,
      cancelledCount: cancelledOrders.length,
      totalOrders: orders.length,
      totalRevenue,
      unpaidRevenue,
    };
  }, [orders]);

  // Order Actions (Safe with optimistic UI and error-proof API sync)
  const handleUpdateStatus = async (orderId: string, status: OrderStatus, note?: string) => {
    // 1. Optimistic React update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status, updated_at: new Date().toISOString() } : o
      )
    );

    // 2. Safe local store update
    try {
      noaStore.updateOrderStatus(orderId, status, note, undefined, "Yönetici");
    } catch (e) {}

    // 3. Server API + Firestore update
    try {
      const res = await fetch("/api/admin/order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, status, note, staff_name: "Yönetici" }),
      });
      const data = await res.json();
      if (data.order) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(data.order);
        }
      }
    } catch (e) {}
  };

  const handleTogglePayment = async (orderId: string, current: "paid" | "unpaid") => {
    const next = current === "paid" ? "unpaid" : "paid";
    
    // 1. Optimistic React update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              payment_status: next,
              status: next === "paid" ? (o.status === "received" ? "preparing" : o.status) : "received",
              updated_at: new Date().toISOString(),
            }
          : o
      )
    );

    // 2. Safe local store update
    try {
      noaStore.updatePaymentStatus(orderId, next);
      if (next === "paid") {
        noaStore.updateOrderStatus(orderId, "preparing", "Ödeme onaylandı, hazırlanıyor", undefined, "Yönetici");
      } else {
        noaStore.updateOrderStatus(orderId, "received", "Ödeme iptal edildi, kasada ödeme bekleniyor", undefined, "Yönetici");
      }
    } catch (e) {}

    // 3. Server API + Firestore update
    try {
      const res = await fetch("/api/admin/order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, payment_status: next, staff_name: "Yönetici" }),
      });
      const data = await res.json();
      if (data.order) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(data.order);
        }
      }
    } catch (e) {}
  };

  const handleCancelOrder = (orderId: string) => {
    setCancelModalOrderId(orderId);
    setCancelReasonInput("");
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalOrderId) return;
    const reason = cancelReasonInput.trim() || "Yönetici tarafından iptal edildi";
    
    // 1. Optimistic React update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === cancelModalOrderId
          ? { ...o, status: "cancelled", cancelled_reason: reason, updated_at: new Date().toISOString() }
          : o
      )
    );

    // 2. Safe local store update
    try {
      noaStore.updateOrderStatus(
        cancelModalOrderId,
        "cancelled",
        undefined,
        reason,
        "Yönetici"
      );
    } catch (e) {}

    // 3. Server API update
    try {
      await fetch("/api/admin/order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: cancelModalOrderId, status: "cancelled", cancelled_reason: reason, staff_name: "Yönetici" }),
      });
    } catch (e) {}

    setCancelModalOrderId(null);
    setCancelReasonInput("");
  };

  const handleExportCSV = () => {
    if (orders.length === 0) return;
    const headers = [
      "Siparis No",
      "Tarih",
      "Saat",
      "Masa",
      "Urunler",
      "Tutar (TL)",
      "Odeme Yontemi",
      "Odeme Durumu",
      "Siparis Durumu",
      "Iptal Nedeni",
      "Musteri Notu",
    ];

    const rows = orders.map((o) => {
      const dateObj = new Date(o.created_at);
      const dateStr = dateObj.toLocaleDateString("tr-TR");
      const timeStr = dateObj.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
      const itemsSummary = o.items.map((it) => `${it.quantity}x ${it.product_name}`).join(" + ");
      const paymentMethod = o.payment_method === "credit_card" ? "Kredi Karti" : "Nakit";
      const paymentStatus = o.payment_status === "paid" ? "Odendi" : "Odenmedi";
      const statusMap: Record<string, string> = {
        received: "Kasada Bekliyor",
        preparing: "Hazirlaniyor",
        ready: "Musteri Bekleniyor",
        served: "Teslim Edildi",
        cancelled: "Iptal Edildi",
      };

      return [
        o.order_number,
        dateStr,
        timeStr,
        `Masa ${o.table_number || "01"}`,
        `"${itemsSummary.replace(/"/g, '""')}"`,
        o.total,
        paymentMethod,
        paymentStatus,
        statusMap[o.status] || o.status,
        `"${(o.cancelled_reason || "").replace(/"/g, '""')}"`,
        `"${(o.general_note || "").replace(/"/g, '""')}"`,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `noa_croissant_siparis_raporu_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearAllOrders = async () => {
    if (!window.confirm("Tüm siparişleri sıfırlamak ve silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
      return;
    }
    setIsClearingOrders(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_all" }),
      });
      if (res.ok) {
        setOrders([]);
        prevOrdersCountRef.current = 0;
        noaStore.clearOrders();
      }
    } catch (e) {
      alert("Siparişler temizlenirken bir hata oluştu.");
    } finally {
      setIsClearingOrders(false);
    }
  };

  const handlePrintZReport = () => {
    const printWindow = window.open("", "_blank", "width=380,height=650");
    if (!printWindow) return;

    const paidOrders = orders.filter((o) => o.payment_status === "paid");
    const totalSales = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const cardSales = paidOrders.filter((o) => o.payment_method === "credit_card").reduce((sum, o) => sum + (o.total || 0), 0);
    const cashSales = paidOrders.filter((o) => o.payment_method === "cash").reduce((sum, o) => sum + (o.total || 0), 0);
    const servedCount = orders.filter((o) => o.status === "served").length;
    const cancelledCount = orders.filter((o) => o.status === "cancelled").length;

    const productCounts: Record<string, { qty: number; total: number }> = {};
    orders.forEach((o) => {
      if (o.status !== "cancelled") {
        o.items.forEach((it) => {
          if (!productCounts[it.product_name]) {
            productCounts[it.product_name] = { qty: 0, total: 0 };
          }
          productCounts[it.product_name].qty += it.quantity;
          productCounts[it.product_name].total += (it.total_price || 0);
        });
      }
    });

    const topRanked = Object.entries(productCounts)
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 5);

    const now = new Date();
    const dateStr = now.toLocaleDateString("tr-TR");
    const timeStr = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>NOA - GÜN SONU Z-RAPORU</title>
          <style>
            @page { margin: 4mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Courier New', monospace;
              padding: 8px 12px;
              color: #000;
              font-size: 13px;
              max-width: 320px;
              margin: 0 auto;
            }
            .center { text-align: center; }
            .bold { font-weight: 900; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .double-divider { border-top: 2px solid #000; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; margin: 4px 0; }
          </style>
        </head>
        <body>
          <div class="center bold" style="font-size: 18px; letter-spacing: 1px;">NOA CROISSANT</div>
          <div class="center bold" style="font-size: 11px; margin-top: 2px;">GÜN SONU KASA KAPANIŞ (Z-RAPORU)</div>
          <div class="center" style="font-size: 11px; margin-bottom: 6px;">${dateStr} - ${timeStr}</div>
          <div class="double-divider"></div>
          
          <div class="bold" style="margin-bottom: 4px; font-size: 12px;">TAHSİLAT ÖZETİ</div>
          <div class="row"><span>Kredi Kartı:</span><span class="bold">${cardSales.toLocaleString("tr-TR")} TL</span></div>
          <div class="row"><span>Nakit:</span><span class="bold">${cashSales.toLocaleString("tr-TR")} TL</span></div>
          <div class="divider"></div>
          <div class="row bold" style="font-size: 15px;"><span>TOPLAM CİRO:</span><span>${totalSales.toLocaleString("tr-TR")} TL</span></div>
          <div class="double-divider"></div>

          <div class="bold" style="margin-bottom: 4px; font-size: 12px;">SİPARİŞ İSTATİSTİKLERİ</div>
          <div class="row"><span>Toplam Sipariş:</span><span class="bold">${orders.length}</span></div>
          <div class="row"><span>Teslim Edilen:</span><span class="bold">${servedCount}</span></div>
          <div class="row"><span>İptal Edilen:</span><span class="bold">${cancelledCount}</span></div>
          <div class="divider"></div>

          <div class="bold" style="margin-bottom: 4px; font-size: 12px;">EN ÇOK SATANLAR (TOP 5)</div>
          ${topRanked.map(([name, data], idx) => `
            <div class="row" style="font-size: 11.5px;">
              <span>${idx + 1}. ${name} (${data.qty}x)</span>
              <span class="bold">${data.total.toLocaleString("tr-TR")} TL</span>
            </div>
          `).join("")}

          <div class="double-divider"></div>
          <div class="center" style="font-size: 10px; margin-top: 10px; color: #555;">
            *** NOA CROISSANT KASA RAPORU SONU ***
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
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

  // Regenerate Table Token
  const handleRegenerateToken = (tableId: string) => {
    if (confirm("Bu masanın QR kodunu yenilemek istediğinize emin misiniz? Eski QR kodlar geçersiz olacaktır.")) {
      noaStore.regenerateTableToken(tableId);
    }
  };

  // Toggle Product Availability
  const handleToggleAvailability = async (prod: Product) => {
    const nextVal = !prod.is_available;
    noaStore.updateProduct({ id: prod.id, is_available: nextVal });
    setProducts((prev) => prev.map((p) => (p.id === prod.id ? { ...p, is_available: nextVal } : p)));
    try {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", product: { id: prod.id, is_available: nextVal } }),
      });
    } catch (e) {}
  };

  // Toggle Product Featured
  const handleToggleFeatured = (prod: Product) => {
    noaStore.updateProduct({ id: prod.id, is_featured: !prod.is_featured });
  };

  // Save edited or new product
  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const category_id = formData.get("category_id") as string;
    const base_price = parseFloat(formData.get("base_price") as string);
    const description = formData.get("description") as string;
    const ingredients = formData.get("ingredients") as string;
    const image_url = formData.get("image_url") as string;
    const card_density = editingProduct?.card_density || "large";

    if (editingProduct?.id) {
      const payload = {
        id: editingProduct.id,
        name,
        category_id,
        base_price,
        description: description || undefined,
        ingredients: ingredients || undefined,
        image_url: image_url || undefined,
        card_density,
      };
      noaStore.updateProduct(payload);
      setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? { ...p, ...payload } : p)));
      try {
        await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update", product: payload }),
        });
      } catch (e) {}
    } else {
      const payload = {
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        category_id,
        base_price,
        description: description || undefined,
        ingredients: ingredients || undefined,
        image_url: image_url || undefined,
        card_density: card_density || "large",
        is_available: true,
        display_order: products.length + 1,
      };
      const created = noaStore.addProduct(payload);
      setProducts((prev) => [...prev, created]);
      try {
        await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create", product: created }),
        });
      } catch (e) {}
    }

    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchQuery =
        o.order_number.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        o.table_label.toLowerCase().includes(orderSearchQuery.toLowerCase());

      const matchStatus =
        orderStatusFilter === "all" || o.status === orderStatusFilter;

      return matchQuery && matchStatus;
    });
  }, [orders, orderSearchQuery, orderStatusFilter]);

  // Filtered menu products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchQuery =
        p.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
        p.ingredients?.toLowerCase().includes(menuSearchQuery.toLowerCase());

      const matchCat =
        selectedCategoryFilter === "all" || p.category_id === selectedCategoryFilter;

      return matchQuery && matchCat;
    });
  }, [products, menuSearchQuery, selectedCategoryFilter]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#683B0C] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl p-8 border border-[#683B0C]/20 shadow-[0_20px_50px_rgba(56,29,5,0.08)] flex flex-col items-center text-center space-y-6">
          {/* Logo */}
          <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-md border-2 border-[#683B0C]/15">
            <Image
              src="/noa_icon.jpg"
              alt="NOA Icon"
              fill
              sizes="80px"
              className="object-cover"
              priority
            />
          </div>

          <div>
            <span className="text-xs font-black tracking-widest uppercase text-[#8C5828] block">
              NOA CROISSANT
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div className="space-y-2">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  if (pinError) setPinError(null);
                }}
                placeholder=""
                autoFocus
                className={`w-full py-3.5 px-4 text-center tracking-[0.5em] font-mono text-2xl font-black rounded-2xl bg-[#FAF7F2] border transition-all focus:outline-none focus:ring-2 focus:ring-[#DC2626] text-[#381D05] ${
                  pinError ? "border-red-500 ring-2 ring-red-200" : "border-[#683B0C]/20"
                }`}
              />

              {pinError && (
                <p className="text-xs font-bold text-red-600 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{pinError}</span>
                </p>
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

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#381D05] flex flex-col font-sans">
      {/* Admin Top Header */}
      <header className="bg-white border-b border-[#683B0C]/15 px-4 sm:px-6 py-3.5 sticky top-0 z-30 flex items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 shadow-xs border border-[#683B0C]/15">
              <Image
                src="/noa_icon.jpg"
                alt="NOA Icon"
                fill
                sizes="40px"
                className="object-cover transition-transform duration-200 group-hover:scale-105"
                priority
              />
            </div>
            <div className="relative h-8 w-32 sm:w-40 shrink-0">
              <Image
                src="/noa_text.png"
                alt="NOA CROISSANT"
                fill
                sizes="160px"
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Quick links & Logout */}
        <div className="flex items-center gap-2">
          <Link
            href="/mutfak"
            className="px-4 py-2 rounded-[14px] bg-[#FAF0E4] hover:bg-white text-[#381D05] border border-[#683B0C]/20 font-black text-xs flex items-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <ChefHat className="w-4 h-4 text-[#8C5828]" />
            <span>Mutfak Ekranı</span>
          </Link>

          <button
            onClick={handleLogout}
            title="Çıkış Yap"
            className="px-3.5 py-2 rounded-[14px] bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-700 border border-stone-200 hover:border-red-200 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Navigation Tabs (Only Core Tabs) + Action Tools */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-[#683B0C]/15">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-5 py-2.5 rounded-[16px] text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "orders"
                  ? "bg-[#381D05] text-white shadow-sm"
                  : "bg-white text-[#5C3818] border border-[#683B0C]/15 hover:bg-[#FAF4EE]"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Siparişler ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("menu")}
              className={`px-5 py-2.5 rounded-[16px] text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "menu"
                  ? "bg-[#381D05] text-white shadow-sm"
                  : "bg-white text-[#5C3818] border border-[#683B0C]/15 hover:bg-[#FAF4EE]"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Menü & Ürünler ({products.length})</span>
            </button>
          </div>

          {/* Right Action Tools: Z-Raporu, Excel Export & Clear Orders */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearAllOrders}
              disabled={isClearingOrders || orders.length === 0}
              className="px-4 py-2.5 rounded-[16px] bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-40 text-white text-xs font-black flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              title="Tüm siparişleri sıfırlar ve temizler"
            >
              <Trash2 className="w-4 h-4 text-white" />
              <span>{isClearingOrders ? "Temizleniyor..." : "Siparişleri Temizle"}</span>
            </button>

            <button
              onClick={() => setIsZReportOpen(true)}
              className="px-4 py-2.5 rounded-[16px] bg-[#381D05] hover:bg-[#251202] text-[#FAF0E4] border border-[#683B0C]/40 text-xs font-black flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-[#D1A37A]" />
              <span>Gün Sonu (Z-Raporu)</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-[16px] bg-[#15803D] hover:bg-[#166534] text-white text-xs font-black flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Excel / CSV İndir</span>
            </button>
          </div>
        </div>

        {/* TAB 1: ORDERS DASHBOARD */}
        {activeTab === "orders" && (
          <div className="space-y-6 animate-fadeIn">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-white p-5 rounded-[24px] border border-[#683B0C]/15 shadow-xs space-y-2">
                <span className="text-[11px] text-[#8C5828] font-bold uppercase tracking-wider block">Aktif Siparişler</span>
                <div className="font-editorial text-3xl font-black text-[#DC2626]">
                  {stats.activeCount}
                </div>
              </div>

              <div className="bg-white p-5 rounded-[24px] border border-[#683B0C]/15 shadow-xs space-y-2">
                <span className="text-[11px] text-[#8C5828] font-bold uppercase tracking-wider block">Tamamlanan</span>
                <div className="font-editorial text-3xl font-black text-[#15803D]">
                  {stats.completedCount}
                </div>
              </div>

              <div className="bg-white p-5 rounded-[24px] border border-[#683B0C]/15 shadow-xs space-y-2">
                <span className="text-[11px] text-[#8C5828] font-bold uppercase tracking-wider block">İptal Edilenler</span>
                <div className="font-editorial text-3xl font-black text-[#DC2626]">
                  {stats.cancelledCount}
                </div>
              </div>

              <div className="bg-white p-5 rounded-[24px] border border-[#683B0C]/15 shadow-xs space-y-2">
                <span className="text-[11px] text-[#8C5828] font-bold uppercase tracking-wider block">Tahsil Edilen Ciro</span>
                <div className="font-sans text-2xl font-black text-[#15803D]">
                  {formatPrice(stats.totalRevenue)}
                </div>
              </div>

              <div className="bg-white p-5 rounded-[24px] border border-[#683B0C]/15 shadow-xs space-y-2">
                <span className="text-[11px] text-[#8C5828] font-bold uppercase tracking-wider block">Bekleyen Tahsilat</span>
                <div className="font-sans text-2xl font-black text-[#DC2626]">
                  {formatPrice(stats.unpaidRevenue)}
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-[24px] border border-[#683B0C]/15 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C5828]" />
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="Sipariş no ara (#NOA-...)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-[14px] bg-[#FAF0E4] border border-[#683B0C]/15 text-xs focus:outline-none focus:bg-white text-[#381D05] font-medium"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
                {[
                  { id: "all", label: "Tümü", activeColor: "bg-[#381D05] text-white" },
                  { id: "received", label: "Kasada Bekliyor", activeColor: "bg-orange-600 text-white" },
                  { id: "preparing", label: "Hazırlanıyor", activeColor: "bg-[#B45309] text-white" },
                  { id: "ready", label: "Müşteri Bekleniyor", activeColor: "bg-[#EA580C] text-white" },
                  { id: "served", label: "Teslim Edildi", activeColor: "bg-[#15803D] text-white" },
                  { id: "cancelled", label: "İptaller", activeColor: "bg-red-600 text-white" },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setOrderStatusFilter(st.id)}
                    className={`px-3.5 py-2 rounded-[14px] text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                      orderStatusFilter === st.id
                        ? `${st.activeColor} shadow-xs`
                        : "bg-[#FAF0E4] text-[#5C3818] hover:bg-white border border-[#683B0C]/15"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-[24px] border border-[#683B0C]/15 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#683B0C]/10 bg-[#FAF7F2] text-[10.5px] font-black uppercase text-[#8C5828] tracking-wider">
                      <th className="p-4">Sipariş No</th>
                      <th className="p-4">Tarih / Saat</th>
                      <th className="p-4">Ürünler</th>
                      <th className="p-4">Tutar & Ödeme Yöntemi</th>
                      <th className="p-4">Durum</th>
                      <th className="p-4 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#683B0C]/10 text-xs">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-stone-500 font-medium">
                          {orderSearchQuery ? "Aramaya uygun sipariş bulunamadı." : "Henüz bu filtrede sipariş bulunmuyor."}
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                          <td className="p-4 font-mono font-black text-xs text-[#381D05] whitespace-nowrap">
                            {order.order_number}
                          </td>
                          <td className="p-4 text-[#8C5828] font-bold text-xs whitespace-nowrap">
                            {formatDateTime(order.created_at)}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-[#381D05] line-clamp-1">
                              {order.items[0]?.quantity}x {order.items[0]?.product_name}
                              {order.items.length > 1 && (
                                <span className="text-[10px] text-[#8C5828] font-bold ml-1.5">
                                  +{order.items.length - 1} ürün daha
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-sm text-[#15803D] font-sans">
                                {formatPrice(order.total)}
                              </span>
                              {order.payment_method === "credit_card" ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-emerald-50 text-[#15803D] border border-[#15803D]/30 shadow-2xs">
                                  <CreditCard className="w-3.5 h-3.5 text-[#15803D]" />
                                  Kredi Kartı
                                </span>
                              ) : order.payment_method === "cash" ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-emerald-50 text-[#15803D] border border-[#15803D]/30 shadow-2xs">
                                  <Banknote className="w-3.5 h-3.5 text-[#15803D]" />
                                  Nakit
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-black bg-emerald-50 text-[#15803D] border border-[#15803D]/30">
                                  Kasada
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1.5 rounded-full text-[11px] font-black inline-flex items-center gap-1.5 whitespace-nowrap shadow-2xs ${
                                order.status === "received"
                                  ? "bg-red-50 text-[#DC2626] border border-red-300"
                                  : order.status === "preparing"
                                  ? "bg-[#FEF3C7] text-[#B45309] border border-[#FCD34D]"
                                  : order.status === "ready"
                                  ? "bg-[#EA580C] text-white shadow-xs"
                                  : order.status === "served"
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "bg-red-600 text-white shadow-xs"
                              }`}
                            >
                              {order.status === "served" ? (
                                <Check className="w-3.5 h-3.5 text-white stroke-[3] shrink-0" />
                              ) : order.status === "cancelled" ? (
                                <XCircle className="w-3.5 h-3.5 text-white stroke-[2.5] shrink-0" />
                              ) : order.status === "ready" ? (
                                <Bell className="w-3.5 h-3.5 text-white stroke-[2.5] shrink-0" />
                              ) : order.status === "received" ? (
                                <Loader2 className="w-3.5 h-3.5 text-[#DC2626] animate-spin shrink-0" />
                              ) : (
                                <ChefHat className="w-3.5 h-3.5 text-[#B45309] stroke-[2.5] shrink-0" />
                              )}
                              {order.status === "received" && "Ödeme Bekleniyor"}
                              {order.status === "preparing" && "Hazırlanıyor"}
                              {order.status === "ready" && "Müşteri Bekleniyor"}
                              {order.status === "served" && "Teslim Edildi"}
                              {order.status === "cancelled" && "İptal Edildi"}
                            </span>
                          </td>
                          <td className="p-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5 whitespace-nowrap flex-nowrap">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="px-3 py-1.5 rounded-[12px] bg-[#381D05] hover:bg-[#251202] text-white font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs whitespace-nowrap"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#F5DEB3]" />
                                <span>Detay</span>
                              </button>

                              <button
                                onClick={() => setPrintingOrder(order)}
                                title="Adisyon Yazdır (80mm)"
                                className="px-3 py-1.5 rounded-[12px] bg-stone-100 hover:bg-stone-200 text-stone-800 font-black text-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs whitespace-nowrap border border-stone-200"
                              >
                                <Printer className="w-3.5 h-3.5 text-[#683B0C]" />
                                <span>Fiş</span>
                              </button>

                              {/* Ödeme Onaylama / İptal Etme */}
                              {order.status !== "served" && order.status !== "cancelled" && (
                                order.payment_status === "unpaid" ? (
                                  <button
                                    onClick={() => handleTogglePayment(order.id, order.payment_status)}
                                    className="px-3.5 py-1.5 rounded-[12px] bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs whitespace-nowrap"
                                  >
                                    <CreditCard className="w-3.5 h-3.5" />
                                    <span>Ödemeyi Onayla</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleTogglePayment(order.id, order.payment_status)}
                                    className="px-3 py-1.5 rounded-[12px] bg-white hover:bg-[#FAF7F2] text-[#381D05] hover:text-red-600 border border-[#683B0C]/15 hover:border-red-300 font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs whitespace-nowrap"
                                    title="Ödeme durumunu geri al"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5 text-[#8C5828]" />
                                    <span>Ödenmedi Yap</span>
                                  </button>
                                )
                              )}

                              {/* Hazırlandı / Teslim Et Butonu */}
                              {order.status !== "served" && order.status !== "cancelled" && (
                                order.payment_status === "paid" ? (
                                  order.status === "preparing" ? (
                                    <button
                                      onClick={() => handleUpdateStatus(order.id, "ready")}
                                      className="px-3.5 py-1.5 rounded-[12px] bg-[#15803D] hover:bg-[#166534] text-white font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs whitespace-nowrap"
                                      title="Teslim Alabilirsiniz Olarak İşaretle"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Hazırlandı</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUpdateStatus(order.id, "served")}
                                      className="px-3.5 py-1.5 rounded-[12px] bg-[#15803D] hover:bg-[#166534] text-white font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs whitespace-nowrap"
                                      title="Teslim Edildi Olarak İşaretle"
                                    >
                                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                                      <span>Teslim Et</span>
                                    </button>
                                  )
                                ) : null
                              )}

                              {/* Siparişi İptal Et Butonu */}
                              {order.status !== "cancelled" && order.status !== "served" && (
                                <button
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="w-7 h-7 rounded-full bg-stone-100 hover:bg-red-50 text-stone-400 hover:text-red-600 flex items-center justify-center transition-all cursor-pointer shrink-0 ml-1"
                                  title="Siparişi İptal Et"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 20 TABLES & QR TOKEN MANAGEMENT */}
        {activeTab === "tables" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between bg-white p-5 rounded-3xl border border-noa-caramel/25 shadow-subtle">
              <div>
                <h2 className="font-editorial text-xl font-bold text-noa-chocolate">
                  NOA Masa Yönetimi (20 Masa)
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Her masa için özel güvenli QR token üretilir. Masa tokenlarını tek tek yenileyebilir
                  veya tüm masaların baskı kartlarını yazdırabilirsiniz.
                </p>
              </div>

              <Link
                href="/admin/qr-print"
                className="px-4 py-2.5 rounded-2xl bg-noa-chocolate text-white font-bold text-xs flex items-center gap-2 hover:bg-noa-chocolate-dark transition-colors shadow"
              >
                <Printer className="w-4 h-4 text-noa-caramel-light" />
                <span>Yazdırılabilir 20 Masa Kartı</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tables.map((table) => {
                const activeTableOrders = orders.filter(
                  (o) =>
                    o.table_id === table.id &&
                    (o.status === "received" || o.status === "preparing" || o.status === "ready")
                );

                return (
                  <div
                    key={table.id}
                    className="bg-white rounded-3xl border border-noa-caramel/25 p-4 shadow-subtle flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-editorial text-xl font-bold text-noa-chocolate">
                        {table.label}
                      </span>
                      {activeTableOrders.length > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] animate-pulse">
                          {activeTableOrders.length} Aktif Sipariş
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                          Boş
                        </span>
                      )}
                    </div>

                    <div className="p-2.5 rounded-2xl bg-noa-ivory/60 border border-noa-caramel/20 space-y-1">
                      <span className="text-[10px] text-stone-500 font-semibold uppercase block">
                        QR Token
                      </span>
                      <code className="text-[11px] font-mono text-noa-chocolate font-bold block truncate">
                        {table.qr_token}
                      </code>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-noa-ivory-dark">
                      <Link
                        href={`/?t=${table.qr_token}`}
                        target="_blank"
                        className="text-xs font-bold text-noa-caramel-dark hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Menüyü Aç</span>
                      </Link>

                      <button
                        onClick={() => handleRegenerateToken(table.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[11px] font-bold text-stone-700 flex items-center gap-1 transition-colors"
                        title="Yeni Token Üret"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Yenile</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: MENU & PRODUCTS CRUD */}
        {activeTab === "menu" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-noa-caramel/25 shadow-subtle">
              <div>
                <h2 className="font-editorial text-xl font-bold text-noa-chocolate">
                  Menü & Ürün Yönetimi
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Fiyatları, açıklamaları ve stok durumlarını canlı olarak güncelleyin. Müşteri menüsü anında yenilenir.
                </p>
              </div>

              <button
                onClick={() => {
                  requestAdminAuth("Yeni Ürün Ekleme", "Yeni ürün eklemek için lütfen 6 haneli admin parolasını giriniz.", () => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  });
                }}
                className="px-4 py-2.5 rounded-2xl bg-noa-chocolate text-white font-bold text-xs flex items-center gap-2 hover:bg-noa-chocolate-dark transition-colors shadow shrink-0"
              >
                <Plus className="w-4 h-4 text-noa-caramel-light" />
                <span>Yeni Ürün Ekle</span>
              </button>
            </div>

            {/* Filter */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={menuSearchQuery}
                  onChange={(e) => setMenuSearchQuery(e.target.value)}
                  placeholder="Ürün adı veya içerik ara..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-noa-caramel/30 text-xs focus:outline-none text-noa-chocolate shadow-subtle"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                <button
                  onClick={() => setSelectedCategoryFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap ${
                    selectedCategoryFilter === "all"
                      ? "bg-noa-chocolate text-white"
                      : "bg-white text-noa-chocolate border border-noa-caramel/20"
                  }`}
                >
                  Tüm Kategoriler
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategoryFilter(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap ${
                      selectedCategoryFilter === c.id
                        ? "bg-noa-chocolate text-white"
                        : "bg-white text-noa-chocolate border border-noa-caramel/20"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className={`bg-white rounded-3xl border border-noa-caramel/25 p-4 shadow-subtle flex flex-col justify-between space-y-3 ${
                    !prod.is_available ? "opacity-60 bg-stone-50" : ""
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden relative shrink-0 bg-[#FAF4EE] border border-[#683B0C]/15">
                      <Image
                        src={prod.image_url || "/noa_icon.jpg"}
                        alt={prod.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-bold text-sm text-noa-chocolate truncate">
                          {prod.name}
                        </h3>
                        <span className="font-bold text-sm text-noa-chocolate shrink-0">
                          {formatPrice(prod.base_price)}
                        </span>
                      </div>

                      {prod.ingredients && (
                        <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">
                          {prod.ingredients}
                        </p>
                      )}

                      {prod.description && !prod.ingredients && (
                        <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">
                          {prod.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Toggles */}
                  <div className="pt-3 border-t border-[#683B0C]/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleAvailability(prod)}
                        className={`px-3 py-1 rounded-[10px] text-xs font-black transition-colors ${
                          prod.is_available
                            ? "bg-emerald-100 text-[#15803D] hover:bg-emerald-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {prod.is_available ? "Satışta" : "Tükendi"}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          requestAdminAuth(
                            "Ürünü Düzenle",
                            `"${prod.name}" ürününü düzenlemek için lütfen 6 haneli admin parolasını giriniz.`,
                            () => {
                              setEditingProduct(prod);
                              setIsProductModalOpen(true);
                            }
                          );
                        }}
                        className="p-1.5 rounded-lg text-stone-600 hover:bg-noa-ivory hover:text-noa-chocolate transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          requestAdminAuth(
                            "Ürünü Sil",
                            `"${prod.name}" ürününü silmek için lütfen 6 haneli admin parolasını giriniz.`,
                            async () => {
                              noaStore.deleteProduct(prod.id);
                              setProducts((prev) => prev.filter((p) => p.id !== prod.id));
                              try {
                                await fetch("/api/products", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ action: "delete", id: prod.id }),
                                });
                              } catch (e) {}
                            }
                          );
                        }}
                        className="p-1.5 rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PROMOTIONS */}
        {activeTab === "promotions" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-6 rounded-3xl border border-noa-caramel/25 shadow-subtle space-y-4">
              <h2 className="font-editorial text-xl font-bold text-noa-chocolate">
                Promosyon Yönetimi
              </h2>

              <div className="space-y-4">
                {promotions.map((promo) => (
                  <div
                    key={promo.id}
                    className="p-4 rounded-2xl bg-noa-ivory/60 border border-noa-caramel/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-amber-700" />
                        <span className="font-bold text-sm text-noa-chocolate">{promo.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-noa-chocolate text-white">
                          {promo.code}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 max-w-xl">{promo.description}</p>
                    </div>

                    <button
                      onClick={() => noaStore.updatePromotion(promo.id, !promo.is_active)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                        promo.is_active
                          ? "bg-emerald-600 text-white shadow"
                          : "bg-stone-300 text-stone-700"
                      }`}
                    >
                      {promo.is_active ? "Aktif / Menüde Göster" : "Pasif"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BUSINESS SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-6 rounded-3xl border border-noa-caramel/25 shadow-subtle max-w-2xl space-y-4">
              <h2 className="font-editorial text-xl font-bold text-noa-chocolate">
                İşletme Bilgileri
              </h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  noaStore.updateSettings({
                    brand_name: fd.get("brand_name") as string,
                    tagline: fd.get("tagline") as string,
                    address: fd.get("address") as string,
                    phone: fd.get("phone") as string,
                  });
                  alert("Ayarlar başarıyla kaydedildi.");
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase mb-1">
                    Marka Adı
                  </label>
                  <input
                    type="text"
                    name="brand_name"
                    defaultValue={settings.brand_name}
                    className="w-full p-2.5 rounded-xl border border-noa-caramel/30 text-xs bg-noa-ivory/40 focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase mb-1">
                    Slogan (Tagline)
                  </label>
                  <input
                    type="text"
                    name="tagline"
                    defaultValue={settings.tagline}
                    className="w-full p-2.5 rounded-xl border border-noa-caramel/30 text-xs bg-noa-ivory/40 focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase mb-1">
                    Adres
                  </label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={settings.address}
                    className="w-full p-2.5 rounded-xl border border-noa-caramel/30 text-xs bg-noa-ivory/40 focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase mb-1">
                    Telefon
                  </label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={settings.phone}
                    className="w-full p-2.5 rounded-xl border border-noa-caramel/30 text-xs bg-noa-ivory/40 focus:outline-none focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-noa-chocolate text-white font-bold text-xs shadow hover:bg-noa-chocolate-dark transition-colors"
                >
                  Ayarları Kaydet
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 6: FIREBASE & DATABASE MANAGEMENT */}
        {activeTab === "database" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Connection Status Banner */}
            <div className={`p-6 rounded-3xl border shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              isFirebaseConfigured
                ? "bg-emerald-50/80 border-emerald-200"
                : "bg-amber-50/80 border-amber-200"
            }`}>
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs ${
                  isFirebaseConfigured ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"
                }`}>
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-editorial text-lg font-bold text-noa-chocolate">
                      Cloud Firestore Veritabanı
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider ${
                      isFirebaseConfigured
                        ? "bg-emerald-200 text-emerald-900"
                        : "bg-amber-200 text-amber-900"
                    }`}>
                      {isFirebaseConfigured ? "● Bağlandı & Canlı" : "○ Yapılandırma Bekleniyor"}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5 max-w-xl">
                    {isFirebaseConfigured
                      ? "Tüm ürünler, kategoriler, masalar ve siparişler gerçek zamanlı Firestore veritabanı ile senkronize çalışıyor."
                      : "Firebase API anahtarları henüz .env.local içine girilmedi. Şu anda yerleşik reaktif bellek deposu kullanılıyor."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSeedFirestore}
                disabled={isSyncingDb}
                className="px-5 py-3 rounded-2xl bg-noa-chocolate hover:bg-noa-chocolate-dark text-white font-bold text-xs shadow transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncingDb ? "animate-spin" : ""}`} />
                <span>{isSyncingDb ? "Aktarılıyor..." : "Tüm Menüyü Firestore'a Yükle (Seed)"}</span>
              </button>
            </div>

            {/* Sync Feedback Message */}
            {syncDbMessage && (
              <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 animate-fadeIn ${
                syncDbMessage.success
                  ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                  : "bg-red-100 border-red-300 text-red-900"
              }`}>
                {syncDbMessage.success ? (
                  <Check className="w-4 h-4 shrink-0 text-emerald-700 stroke-[2.5]" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
                )}
                <span className="font-bold">{syncDbMessage.text}</span>
              </div>
            )}

            {/* Data Schema Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-noa-caramel/25 shadow-subtle space-y-1.5">
                <span className="text-[11px] font-bold text-noa-caramel uppercase tracking-wider block">Koleksiyon</span>
                <h3 className="font-editorial text-xl font-bold text-noa-chocolate">products</h3>
                <p className="text-xs text-stone-600">{products.length} Aktif Ürün</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-noa-caramel/25 shadow-subtle space-y-1.5">
                <span className="text-[11px] font-bold text-noa-caramel uppercase tracking-wider block">Koleksiyon</span>
                <h3 className="font-editorial text-xl font-bold text-noa-chocolate">categories</h3>
                <p className="text-xs text-stone-600">{categories.length} Menü Kategorisi</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-noa-caramel/25 shadow-subtle space-y-1.5">
                <span className="text-[11px] font-bold text-noa-caramel uppercase tracking-wider block">Koleksiyon</span>
                <h3 className="font-editorial text-xl font-bold text-noa-chocolate">tables</h3>
                <p className="text-xs text-stone-600">{tables.length} Masa & QR Token</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-noa-caramel/25 shadow-subtle space-y-1.5">
                <span className="text-[11px] font-bold text-noa-caramel uppercase tracking-wider block">Koleksiyon</span>
                <h3 className="font-editorial text-xl font-bold text-noa-chocolate">orders</h3>
                <p className="text-xs text-stone-600">{orders.length} Toplam Sipariş</p>
              </div>
            </div>

            {/* Setup Guide Card */}
            <div className="bg-white p-6 rounded-3xl border border-noa-caramel/25 shadow-subtle space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="font-editorial text-base font-bold text-noa-chocolate">
                  Firebase Entegrasyon Rehberi (.env.local)
                </h3>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                Firebase Console üzerinden oluşturduğunuz projenin Web SDK anahtarlarını projenizin kök dizinindeki <code className="bg-noa-ivory px-1.5 py-0.5 rounded font-mono text-[11px] text-noa-chocolate">.env.local</code> dosyasına eklediğiniz anda tüm sistem otomatik olarak Firebase Firestore&apos;a bağlanacaktır:
              </p>

              <div className="bg-[#1E293B] text-[#E2E8F0] p-4 rounded-2xl font-mono text-[11px] space-y-1 overflow-x-auto">
                <div className="text-stone-400"># .env.local</div>
                <div>NEXT_PUBLIC_FIREBASE_API_KEY=&quot;AIzaSy...&quot;</div>
                <div>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=&quot;noa-croissant.firebaseapp.com&quot;</div>
                <div>NEXT_PUBLIC_FIREBASE_PROJECT_ID=&quot;noa-croissant&quot;</div>
                <div>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=&quot;noa-croissant.appspot.com&quot;</div>
                <div>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=&quot;1234567890&quot;</div>
                <div>NEXT_PUBLIC_FIREBASE_APP_ID=&quot;1:1234567890:web:abcdef&quot;</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Add/Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            onClick={() => setIsProductModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 z-10 shadow-2xl space-y-5 border border-[#683B0C]/20 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#683B0C]/10 pb-3">
              <h2 className="font-editorial text-2xl font-black text-[#381D05]">
                {editingProduct ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
              </h2>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-sm transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#381D05] block mb-1.5">Ürün Adı</label>
                <input
                  name="name"
                  defaultValue={editingProduct?.name || ""}
                  required
                  placeholder="Örn: Antep Fıstıklı Kruvasan"
                  className="w-full p-3 rounded-2xl border border-[#683B0C]/20 focus:border-[#381D05] focus:outline-none bg-[#FAF7F2]/50 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#381D05] block mb-1.5">Kategori</label>
                  <select
                    name="category_id"
                    defaultValue={editingProduct?.category_id || categories[0]?.id}
                    className="w-full p-3 rounded-2xl border border-[#683B0C]/20 focus:border-[#381D05] focus:outline-none bg-[#FAF7F2]/50 text-xs font-bold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#381D05] block mb-1.5">Fiyat (TL)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="base_price"
                    defaultValue={editingProduct?.base_price ?? 100}
                    required
                    placeholder="Örn: 350"
                    className="w-full p-3 rounded-2xl border border-[#683B0C]/20 focus:border-[#381D05] focus:outline-none bg-[#FAF7F2]/50 text-sm font-black"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#381D05] block mb-1.5">Ürün Açıklaması</label>
                <textarea
                  name="description"
                  defaultValue={editingProduct?.description || ""}
                  rows={2}
                  placeholder="Örn: Kat kat çıtır kruvasan; yoğun Antep fıstığı kreması ve Antep fıstığı parçalarıyla hazırlanır."
                  className="w-full p-3 rounded-2xl border border-[#683B0C]/20 focus:border-[#381D05] focus:outline-none bg-[#FAF7F2]/50 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="font-bold text-[#381D05] block mb-1.5">İçindekiler / Malzemeler</label>
                <input
                  name="ingredients"
                  defaultValue={editingProduct?.ingredients || ""}
                  placeholder="Örn: Antep fıstığı kreması, parça fıstık, tereyağlı kruvasan hamuru"
                  className="w-full p-3 rounded-2xl border border-[#683B0C]/20 focus:border-[#381D05] focus:outline-none bg-[#FAF7F2]/50 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[#381D05] block mb-1.5">Görsel URL / Dosya Yolu</label>
                <input
                  name="image_url"
                  defaultValue={editingProduct?.image_url || ""}
                  placeholder="Örn: /Antep Fıstıklı Kruvasan.jpg"
                  className="w-full p-3 rounded-2xl border border-[#683B0C]/20 focus:border-[#381D05] focus:outline-none bg-[#FAF7F2]/50 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#683B0C]/10">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#381D05] hover:bg-[#251202] text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal with Timeline */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            onClick={() => setSelectedOrder(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 z-10 shadow-floating space-y-4 border border-noa-caramel/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#683B0C]/15">
              <div>
                <span className="text-[11px] font-bold text-[#8C5828] uppercase tracking-wider block">
                  Sipariş Detayı
                </span>
                <h2 className="font-editorial text-2xl font-bold text-[#381D05]">
                  #{selectedOrder.order_number}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPrintingOrder(selectedOrder)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#FAF0E4] hover:bg-[#F3E5D4] text-[#381D05] border border-[#683B0C]/20 font-black text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#8C5828]" />
                  <span>Fişi Yazdır</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-full bg-[#FAF0E4] border border-[#683B0C]/15 flex items-center justify-center text-[#381D05] hover:bg-[#F3E5D4] cursor-pointer active:scale-95 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Cancelled Reason Alert Banner */}
            {selectedOrder.status === "cancelled" && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-1">
                <div className="flex items-center gap-1.5 font-black text-red-700 uppercase tracking-wider text-[11px]">
                  <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>İptal Edilme Nedeni</span>
                </div>
                <p className="font-bold text-red-950 pl-5">
                  {selectedOrder.cancelled_reason || "Yönetici tarafından iptal edildi"}
                </p>
              </div>
            )}

            {/* Items */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase text-stone-500">Ürünler</h3>
              {selectedOrder.items.map((it) => (
                <div key={it.id} className="p-3 rounded-xl bg-noa-ivory/50 border border-noa-caramel/20 flex justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-noa-chocolate">
                      {it.quantity}x {it.product_name}
                    </div>
                    {it.options && it.options.length > 0 && (
                      <div className="space-y-0.5 mt-1 text-[11px] text-[#8C5828]">
                        {it.options.map((o, idx) => (
                          <div key={idx} className="flex items-center gap-1 leading-snug">
                            <span className="text-[#8C5828]/60 text-[10px]">↳</span>
                            <span>
                              {o.option_group_name ? `${o.option_group_name}: ` : ""}
                              <strong className="text-[#381D05]">{o.option_value_name}</strong>
                              {o.price_modifier > 0 && (
                                <span className="text-[#15803D] font-bold ml-1 text-[10.5px]">
                                  (+{o.price_modifier} TL)
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {it.item_note && (
                      <div className="text-[10.5px] text-amber-800 mt-1 font-semibold pl-2">
                        Not: {it.item_note}
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-xs text-noa-chocolate shrink-0">
                    {it.is_complimentary ? "İkram" : formatPrice(it.total_price)}
                  </span>
                </div>
              ))}
            </div>

            {/* General Note if present */}
            {selectedOrder.general_note && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold block text-amber-800 uppercase tracking-wider text-[10.5px]">
                  Müşteri Notu:
                </span>
                <p>{selectedOrder.general_note}</p>
              </div>
            )}

            {/* Total Amount Summary Box */}
            <div className="pt-3.5 border-t border-[#683B0C]/15 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-[#8C5828] uppercase tracking-wider block">
                  Toplam Tutar
                </span>
              </div>
              <span className="text-2xl font-black text-[#15803D]">
                {formatPrice(
                  selectedOrder.total ||
                    selectedOrder.subtotal ||
                    selectedOrder.items.reduce((s, it) => s + (it.total_price || 0), 0)
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Reason Modal */}
      {cancelModalOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            onClick={() => setCancelModalOrderId(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 z-10 shadow-floating space-y-4 border border-noa-caramel/30">
            <h2 className="font-editorial text-lg font-bold text-red-900">Siparişi İptal Et</h2>
            <p className="text-xs text-stone-600">
              Lütfen bu siparişin iptal edilme gerekçesini belirtiniz:
            </p>
            <input
              type="text"
              value={cancelReasonInput}
              onChange={(e) => setCancelReasonInput(e.target.value)}
              placeholder="Örn: Müşteri talebi, stok tükendi..."
              className="w-full p-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalOrderId(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 font-bold text-xs"
              >
                Vazgeç
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs shadow hover:bg-red-700"
              >
                İptali Onayla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Action PIN Verification Modal */}
      {actionPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            onClick={() => setActionPinModal(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 z-10 shadow-2xl space-y-4 border border-[#683B0C]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF4EE] border border-[#683B0C]/15 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-[#381D05]" />
              </div>
              <div>
                <h2 className="font-editorial text-lg font-black text-[#381D05]">
                  {actionPinModal.title}
                </h2>
                <span className="text-[10px] font-bold text-[#8C5828] uppercase tracking-wider">
                  Yetkili Parolası Gerekli
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              {actionPinModal.description}
            </p>

            <form onSubmit={handleVerifyActionPin} className="space-y-3">
              <div>
                <input
                  type="password"
                  autoFocus
                  maxLength={10}
                  value={actionPinInput}
                  onChange={(e) => {
                    setActionPinInput(e.target.value);
                    if (actionPinError) setActionPinError(null);
                  }}
                  placeholder="Admin parolasını giriniz"
                  className="w-full p-3 text-center tracking-widest text-lg font-black rounded-2xl border border-[#683B0C]/25 bg-[#FAF7F2]/60 focus:outline-none focus:border-[#381D05]"
                />
                {actionPinError && (
                  <p className="text-xs font-bold text-red-600 mt-1.5 text-center">
                    {actionPinError}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionPinModal(null)}
                  className="px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-[#381D05] hover:bg-[#251202] text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Onayla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Z-Report End-of-Day Register Closure Modal */}
      {isZReportOpen && (() => {
        const paidOrders = orders.filter((o) => o.payment_status === "paid");
        const totalSales = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const cardSales = paidOrders.filter((o) => o.payment_method === "credit_card").reduce((sum, o) => sum + (o.total || 0), 0);
        const cashSales = paidOrders.filter((o) => o.payment_method === "cash").reduce((sum, o) => sum + (o.total || 0), 0);
        const servedCount = orders.filter((o) => o.status === "served").length;
        const cancelledCount = orders.filter((o) => o.status === "cancelled").length;

        const productCounts: Record<string, { qty: number; total: number }> = {};
        orders.forEach((o) => {
          if (o.status !== "cancelled") {
            o.items.forEach((it) => {
              if (!productCounts[it.product_name]) {
                productCounts[it.product_name] = { qty: 0, total: 0 };
              }
              productCounts[it.product_name].qty += it.quantity;
              productCounts[it.product_name].total += (it.total_price || 0);
            });
          }
        });

        const topRanked = Object.entries(productCounts)
          .sort((a, b) => b[1].qty - a[1].qty)
          .slice(0, 5);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div
              onClick={() => setIsZReportOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 z-10 shadow-2xl space-y-5 border border-[#683B0C]/20 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#683B0C]/15">
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 shadow-xs border border-[#683B0C]/20 bg-white">
                    <Image
                      src="/noa_icon.jpg"
                      alt="NOA Logo"
                      fill
                      sizes="44px"
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div>
                    <h2 className="font-editorial text-lg font-black text-[#381D05]">
                      Gün Sonu Z-Raporu
                    </h2>
                    <span className="text-[10.5px] font-bold text-[#8C5828] uppercase tracking-wider">
                      Kasa Kapanış & Günlük Ciro Özeti
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsZReportOpen(false)}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Revenue Breakdown */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#683B0C]/10 space-y-1 text-center">
                  <span className="text-[10px] font-bold uppercase text-[#8C5828]">Toplam Ciro</span>
                  <div className="text-base font-black text-[#15803D]">{formatPrice(totalSales)}</div>
                </div>
                <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#683B0C]/10 space-y-1 text-center">
                  <span className="text-[10px] font-bold uppercase text-[#8C5828]">Kredi Kartı</span>
                  <div className="text-base font-black text-[#381D05]">{formatPrice(cardSales)}</div>
                </div>
                <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#683B0C]/10 space-y-1 text-center">
                  <span className="text-[10px] font-bold uppercase text-[#8C5828]">Nakit</span>
                  <div className="text-base font-black text-[#381D05]">{formatPrice(cashSales)}</div>
                </div>
              </div>

              {/* Order Statistics */}
              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#683B0C]/10 space-y-2">
                <div className="text-xs font-black uppercase text-[#381D05] tracking-wider mb-2">
                  Sipariş İstatistikleri
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                  <span>Toplam Oluşturulan Sipariş:</span>
                  <span className="font-black text-[#381D05]">{orders.length} Adet</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                  <span>Teslim Edilen (Tamamlanan):</span>
                  <span className="font-black text-[#15803D]">{servedCount} Adet</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                  <span>İptal Edilen Siparişler:</span>
                  <span className="font-black text-red-600">{cancelledCount} Adet</span>
                </div>
              </div>

              {/* Top 5 Products */}
              <div className="space-y-2">
                <div className="text-xs font-black uppercase text-[#381D05] tracking-wider">
                  En Çok Satan Kruvasan & İçecekler (Top 5)
                </div>
                <div className="divide-y divide-[#683B0C]/10 border border-[#683B0C]/10 rounded-2xl overflow-hidden bg-white text-xs">
                  {topRanked.length === 0 ? (
                    <div className="p-4 text-center text-stone-500 font-medium">Henüz satış kaydı yok.</div>
                  ) : (
                    topRanked.map(([name, data], idx) => (
                      <div key={idx} className="p-2.5 px-3 flex items-center justify-between font-semibold">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#FAF0E4] text-[#8C5828] text-[10px] font-black flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-[#381D05]">{name}</span>
                          <span className="text-[10px] text-[#8C5828] font-bold">({data.qty} Adet)</span>
                        </div>
                        <span className="font-black text-[#15803D]">{formatPrice(data.total)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#683B0C]/15">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-4 py-2.5 rounded-2xl bg-[#15803D] hover:bg-[#166534] text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>CSV İndir</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintZReport}
                  className="px-5 py-2.5 rounded-2xl bg-[#381D05] hover:bg-[#251202] text-white font-black text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#D1A37A]" />
                  <span>80mm Z-Raporu Yazdır</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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

export default function AdminDashboardPage() {
  return (
    <React.Suspense fallback={null}>
      <AdminDashboardContent />
    </React.Suspense>
  );
}
