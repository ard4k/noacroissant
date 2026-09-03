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
  Minus,
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
  BellRing,
  BellOff,
  Volume2,
  VolumeX,
  BarChart3,
  Download,
  FileSpreadsheet,
  Save,
  Wifi,
  Coffee,
  Award,
  X,
} from "lucide-react";
import { noaStore } from "@/lib/store";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { seedAllDataToFirestore, subscribeToOrders } from "@/lib/firebase/firestore";
import { printThermalHtml } from "@/lib/printUtils";
import {
  LoyaltyCard,
  fetchLoyaltyCard,
  addStampsToCustomer,
  removeStampFromCustomer,
  redeemFreeCoffee,
  formatPhoneNumberTR,
  toE164PhoneTR,
} from "@/lib/loyalty";
import {
  DiningTable,
  Product,
  Category,
  OrderRecord,
  OrderStatus,
  PaymentStatus,
  Promotion,
  BusinessSettings,
  StaffRole,
  ServiceRequest,
  SupportedLocale,
  LocalizedText,
} from "@/lib/types";
import { formatPrice, formatDateTime, formatFullDateTime, playOrderChime } from "@/lib/utils";
import { SUPPORTED_LOCALES, resolveLocalizedText } from "@/lib/i18n/resolver";
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
    "orders" | "menu" | "ingredients" | "loyalty" | "tables" | "promotions" | "settings" | "database"
  >("orders");

  // Store state
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(noaStore.getSettings());
  const [disabledIngredients, setDisabledIngredients] = useState<string[]>([]);
  const [newIngredientInput, setNewIngredientInput] = useState<string>("");
  const [ingredientSaveSuccess, setIngredientSaveSuccess] = useState<boolean>(false);
  const [isSavingIngredients, setIsSavingIngredients] = useState<boolean>(false);
  const [wifiSsid, setWifiSsid] = useState<string>("Noa Croissant");
  const [wifiPassword, setWifiPassword] = useState<string>("noa330738");
  const [wifiSaveSuccess, setWifiSaveSuccess] = useState<boolean>(false);
  const [businessSaveSuccess, setBusinessSaveSuccess] = useState<boolean>(false);
  const [loyaltySaveSuccess, setLoyaltySaveSuccess] = useState<boolean>(false);
  const [loyaltyRequiredStamps, setLoyaltyRequiredStamps] = useState<number>(noaStore.getSettings()?.loyalty_required_stamps || 5);
  const prevOrdersCountRef = useRef<number>(0);

  // Loyalty customer state for admin
  const [loyaltySearchPhone, setLoyaltySearchPhone] = useState<string>("");
  const [adminLoyaltyCard, setAdminLoyaltyCard] = useState<LoyaltyCard | null>(null);
  const [isLoyaltySearching, setIsLoyaltySearching] = useState<boolean>(false);
  const [loyaltyActionMsg, setLoyaltyActionMsg] = useState<string | null>(null);

  // Firebase sync state
  const [isSyncingDb, setIsSyncingDb] = useState(false);
  const [syncDbMessage, setSyncDbMessage] = useState<{ success: boolean; text: string } | null>(null);

  // Global in-page toast notifications (replaces browser alert())
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ msg, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  };

  // Sound and Browser Desktop Notifications State (Default to false unless explicitly granted / enabled)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(false);
  const pendingStatusUpdatesRef = useRef<Map<string, { status?: OrderStatus; payment_status?: PaymentStatus; timestamp: number }>>(new Map());

  // Load sound and notification settings based on real browser state
  useEffect(() => {
    try {
      const savedSound = localStorage.getItem("noa_admin_sound_enabled");
      if (savedSound !== null) {
        setSoundEnabled(savedSound === "true");
      } else {
        setSoundEnabled(false);
      }

      const savedNotif = localStorage.getItem("noa_admin_notification_enabled");
      const hasBrowserPermission =
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted";

      if (hasBrowserPermission && savedNotif === "true") {
        setNotificationEnabled(true);
      } else {
        setNotificationEnabled(false);
      }
    } catch (e) {}
  }, []);

  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    try {
      localStorage.setItem("noa_admin_sound_enabled", String(nextVal));
    } catch (e) {}

    if (nextVal) {
      try {
        playOrderChime();
      } catch (e) {}
      showToast("Sipariş sesli uyarıları açıldı.");
    } else {
      showToast("Sipariş sesli uyarıları kapatıldı.", "error");
    }
  };

  const handleToggleNotification = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      showToast("Bu tarayıcı masaüstü bildirimlerini desteklemiyor.", "error");
      return;
    }

    if (!notificationEnabled) {
      // Trying to enable: check or request actual browser permission
      if (Notification.permission === "granted") {
        setNotificationEnabled(true);
        localStorage.setItem("noa_admin_notification_enabled", "true");
        showToast("Masaüstü sipariş bildirimleri açıldı.");
      } else if (Notification.permission === "denied") {
        showToast("Tarayıcı bildirimleri engellenmiş. Lütfen adres çubuğundan izin verin.", "error");
        setNotificationEnabled(false);
        localStorage.setItem("noa_admin_notification_enabled", "false");
      } else {
        try {
          const perm = await Notification.requestPermission();
          if (perm === "granted") {
            setNotificationEnabled(true);
            localStorage.setItem("noa_admin_notification_enabled", "true");
            showToast("Masaüstü sipariş bildirimleri açıldı.");
          } else {
            setNotificationEnabled(false);
            localStorage.setItem("noa_admin_notification_enabled", "false");
            showToast("Bildirim izni verilmedi.", "error");
          }
        } catch (e) {
          setNotificationEnabled(false);
        }
      }
    } else {
      // Disable
      setNotificationEnabled(false);
      localStorage.setItem("noa_admin_notification_enabled", "false");
      showToast("Masaüstü sipariş bildirimleri kapatıldı.", "error");
    }
  };

  // Helper to trigger chime & desktop notification on new orders
  const notifyNewOrder = (incomingOrders: OrderRecord[]) => {
    if (soundEnabled) {
      try {
        playOrderChime();
      } catch (e) {}
    }

    if (notificationEnabled && typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        const latest = incomingOrders[0];
        if (latest) {
          const tableText = latest.table_label || (latest.table_number ? `Masa ${latest.table_number}` : "Kasa");
          new Notification("🔔 Yeni Sipariş Geldi!", {
            body: `Sipariş: ${latest.order_number || "#NOA"} (${latest.total} TL) - ${tableText}`,
            icon: "/noa_icon.jpg",
          });
        }
      } catch (e) {}
    }
  };

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
  const [adminEditLocale, setAdminEditLocale] = useState<SupportedLocale>("tr");
  const [editNameI18n, setEditNameI18n] = useState<Partial<Record<SupportedLocale, string>>>({});
  const [editDescI18n, setEditDescI18n] = useState<Partial<Record<SupportedLocale, string>>>({});
  const [editIngrI18n, setEditIngrI18n] = useState<Partial<Record<SupportedLocale, string>>>({});

  const openProductModal = (prod: Product | null) => {
    setEditingProduct(prod);
    setAdminEditLocale("tr");
    if (prod) {
      setEditNameI18n(prod.name_i18n ? { ...prod.name_i18n, tr: prod.name_i18n.tr || prod.name } : { tr: prod.name });
      setEditDescI18n(prod.description_i18n ? { ...prod.description_i18n, tr: prod.description_i18n.tr || prod.description || "" } : { tr: prod.description || "" });
      setEditIngrI18n(prod.ingredients_i18n ? { ...prod.ingredients_i18n, tr: prod.ingredients_i18n.tr || prod.ingredients || "" } : { tr: prod.ingredients || "" });
    } else {
      setEditNameI18n({ tr: "" });
      setEditDescI18n({ tr: "" });
      setEditIngrI18n({ tr: "" });
    }
    setIsProductModalOpen(true);
  };

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

  // Safe merge incoming orders without overwriting pending user actions
  const mergeIncomingOrders = (incoming: OrderRecord[]): OrderRecord[] => {
    const now = Date.now();
    for (const [id, val] of pendingStatusUpdatesRef.current.entries()) {
      if (now - val.timestamp > 10000) {
        pendingStatusUpdatesRef.current.delete(id);
      }
    }

    return incoming.map((inc) => {
      const pending = pendingStatusUpdatesRef.current.get(inc.id);
      if (pending) {
        if (
          (!pending.status || inc.status === pending.status) &&
          (!pending.payment_status || inc.payment_status === pending.payment_status)
        ) {
          pendingStatusUpdatesRef.current.delete(inc.id);
          return inc;
        }
        return {
          ...inc,
          ...(pending.status ? { status: pending.status } : {}),
          ...(pending.payment_status ? { payment_status: pending.payment_status } : {}),
        };
      }
      return inc;
    });
  };

  // Stable Order State Updater that eliminates UI flicker/re-renders when data has not changed
  const applyOrdersUpdate = (incoming: OrderRecord[]) => {
    if (!incoming || !Array.isArray(incoming)) return;
    setOrders((prev) => {
      const merged = mergeOrderLists(prev, incoming);
      const finalOrders = mergeIncomingOrders(merged);

      if (prev.length === finalOrders.length) {
        let isIdentical = true;
        for (let i = 0; i < prev.length; i++) {
          const a = prev[i];
          const b = finalOrders[i];
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

      noaStore.setOrders(finalOrders);
      if (finalOrders.length > prevOrdersCountRef.current && prevOrdersCountRef.current > 0) {
        notifyNewOrder(finalOrders);
      }
      prevOrdersCountRef.current = finalOrders.length;
      return finalOrders;
    });
  };

  // Sync with store, API, and Real-Time events ONLY when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const syncLocalData = () => {
      const currentStoreOrders = noaStore.getOrders();
      if (currentStoreOrders && currentStoreOrders.length > 0) {
        applyOrdersUpdate(currentStoreOrders);
      }
      setTables(noaStore.getTables());
      setCategories(noaStore.getCategories());
      setProducts(noaStore.getProducts());
      setPromotions(noaStore.getPromotions());
      const st = noaStore.getSettings();
      setSettings(st);
      if (st.disabled_ingredients) {
        setDisabledIngredients(st.disabled_ingredients);
      }
      if (st.wifi_ssid) setWifiSsid(st.wifi_ssid);
      if (st.wifi_password) setWifiPassword(st.wifi_password);
      if (st.loyalty_required_stamps) setLoyaltyRequiredStamps(st.loyalty_required_stamps);
    };

    syncLocalData();
    const unsubscribeStore = noaStore.subscribe(syncLocalData);

    // 0. Direct Firestore Real-Time Listeners (0ms cloud push across all devices)
    let unsubscribeFirestore: (() => void) | null = null;

    try {
      unsubscribeFirestore = subscribeToOrders((firestoreOrders) => {
        if (firestoreOrders && Array.isArray(firestoreOrders) && firestoreOrders.length > 0) {
          applyOrdersUpdate(firestoreOrders);
        }
      });
    } catch (e) {}

    // 1. Direct Server API Fetch for 100% Guaranteed Freshness
    const fetchServerData = async () => {
      try {
        const res = await fetch("/api/admin/orders");
        if (res.ok) {
          const data = await res.json();
          if (data.orders && Array.isArray(data.orders)) {
            applyOrdersUpdate(data.orders);
          }
          if (data.tables && Array.isArray(data.tables)) {
            setTables(data.tables);
          }
        }
      } catch (e) {}
    };

    fetchServerData();

    // 2. Continuous Polling Fallback (5s interval when tab is active)
    const pollInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchServerData();
      }
    }, 5000);

    // 3. Window focus event
    const handleFocus = () => fetchServerData();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchServerData();
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    // 4. Server-Sent Events (SSE) Stream
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/orders/stream");
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.orders && Array.isArray(payload.orders) && payload.orders.length > 0) {
            applyOrdersUpdate(payload.orders);
          }
        } catch (e) {}
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
      if (unsubscribeFirestore) unsubscribeFirestore();
      unsubscribeStore();
      clearInterval(pollInterval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (eventSource) eventSource.close();
      if (broadcast) broadcast.close();
    };
  }, [isAuthenticated]);

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

  // Order Actions (Safe with optimistic UI and race-condition immunity)
  const handleUpdateStatus = async (orderId: string, status: OrderStatus, note?: string) => {
    // Record pending update to prevent background polling from reverting UI
    pendingStatusUpdatesRef.current.set(orderId, {
      status,
      timestamp: Date.now(),
    });

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
        credentials: "include",
        body: JSON.stringify({ order_id: orderId, status, note, staff_name: "Yönetici" }),
      });
      const data = await res.json();
      if (data.order) {
        pendingStatusUpdatesRef.current.delete(orderId);
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(data.order);
        }
      }
    } catch (e) {}
  };

  const handleTogglePayment = async (orderId: string, current: "paid" | "unpaid") => {
    const next = current === "paid" ? "unpaid" : "paid";
    const nextStatus = next === "paid" ? "preparing" : "received";

    pendingStatusUpdatesRef.current.set(orderId, {
      payment_status: next,
      status: nextStatus,
      timestamp: Date.now(),
    });

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
        credentials: "include",
        body: JSON.stringify({ order_id: orderId, payment_status: next, staff_name: "Yönetici" }),
      });
      const data = await res.json();
      if (data.order) {
        pendingStatusUpdatesRef.current.delete(orderId);
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
        credentials: "include",
        body: JSON.stringify({ order_id: cancelModalOrderId, status: "cancelled", cancelled_reason: reason, staff_name: "Yönetici" }),
      });
    } catch (e) {}

    setCancelModalOrderId(null);
    setCancelReasonInput("");
  };

  const handleExportCSV = () => {
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
      const itemsSummary = (o.items || []).map((it) => `${it.quantity}x ${it.product_name}`).join(" + ");
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
        o.order_number || "",
        dateStr,
        timeStr,
        "Gel-Al / Self Servis",
        `"${itemsSummary.replace(/"/g, '""')}"`,
        o.total || 0,
        paymentMethod,
        paymentStatus,
        statusMap[o.status] || o.status,
        `"${(o.cancelled_reason || "").replace(/"/g, '""')}"`,
        `"${(o.general_note || "").replace(/"/g, '""')}"`,
      ].join(";");
    });

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().split("T")[0];
    link.href = url;
    link.download = `noa_croissant_siparis_raporu_${today}.csv`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1000);
  };

  const handleClearAllOrders = () => {
    requestAdminAuth(
      "Siparişleri Temizle",
      "Tüm sipariş geçmişini ve adisyonları sıfırlamak için lütfen admin parolasını giriniz. Bu işlem geri alınamaz.",
      async () => {
        setIsClearingOrders(true);
        try {
          const res = await fetch("/api/admin/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ action: "clear_all" }),
          });
          if (res.ok) {
            setOrders([]);
            prevOrdersCountRef.current = 0;
            noaStore.clearOrders();
          } else {
            showToast("Siparişler temizlenirken bir hata oluştu.", "error");
          }
        } catch (e) {
          showToast("Siparişler temizlenirken bir hata oluştu.", "error");
        } finally {
          setIsClearingOrders(false);
        }
      }
    );
  };

  const handlePrintZReport = () => {
    const paidOrders = orders.filter((o) => o.payment_status === "paid");
    const totalSales = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const cardSales = paidOrders.filter((o) => o.payment_method === "credit_card").reduce((sum, o) => sum + (o.total || 0), 0);
    const cashSales = paidOrders.filter((o) => o.payment_method === "cash").reduce((sum, o) => sum + (o.total || 0), 0);
    const servedCount = orders.filter((o) => o.status === "served").length;
    const cancelledCount = orders.filter((o) => o.status === "cancelled").length;

    const productCounts: Record<string, { qty: number; total: number }> = {};
    orders.forEach((o) => {
      if (o.status !== "cancelled") {
        (o.items || []).forEach((it) => {
          if (!productCounts[it.product_name]) {
            productCounts[it.product_name] = { qty: 0, total: 0 };
          }
          productCounts[it.product_name].qty += it.quantity;
          productCounts[it.product_name].total += (it.total_price || 0);
        });
      }
    });

    const soldProducts = Object.entries(productCounts)
      .sort((a, b) => b[1].qty - a[1].qty);
    const totalItemsCount = soldProducts.reduce((sum, [, data]) => sum + data.qty, 0);

    const now = new Date();
    const dateStr = now.toLocaleDateString("tr-TR");
    const timeStr = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

    const html = `
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

          <div class="bold" style="margin-bottom: 4px; font-size: 12px;">GÜNÜN SATILAN ÜRÜNLERİ (${soldProducts.length} Çeşit - ${totalItemsCount} Adet)</div>
          ${soldProducts.length > 0 ? soldProducts.map(([name, data], idx) => `
            <div class="row" style="font-size: 11.5px;">
              <span>${idx + 1}. ${name} (${data.qty}x)</span>
              <span class="bold">${data.total.toLocaleString("tr-TR")} TL</span>
            </div>
          `).join("") : '<div style="font-size: 11px; color: #666; text-align: center; padding: 4px 0;">Henüz satış kaydı bulunmuyor.</div>'}

          <div class="double-divider"></div>
          <div class="center" style="font-size: 10px; margin-top: 10px; color: #555;">
            *** NOA CROISSANT KASA RAPORU SONU ***
          </div>
        </body>
      </html>
    `;

    printThermalHtml(html);
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
      second: "2-digit",
    });

    const totalAmount =
      order.total ||
      order.subtotal ||
      (order.items || []).reduce((sum, it) => sum + (it.total_price || 0), 0);

    const itemsHtml = (order.items || [])
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

    const origin = typeof window !== "undefined" ? window.location.origin : "";

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
            <img class="brand-logo" src="${origin}/noa_icon.jpg" alt="NOA Icon" />
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
        </body>
      </html>
    `;

    printThermalHtml(html);
  };

  // Regenerate Table Token
  const handleRegenerateToken = (tableId: string) => {
    if (confirm("Bu masanın QR kodunu yenilemek istediğinize emin misiniz? Eski QR kodlar geçersiz olacaktır.")) {
      noaStore.regenerateTableToken(tableId);
    }
  };

  const [isSyncingAll, setIsSyncingAll] = useState(false);

  // Sync All Products & Availability to Server / Firestore
  const handleSyncAllProducts = () => {
    requestAdminAuth(
      "Menü Değişikliklerini Kaydet",
      "Tüm menü ve stok değişikliklerini canlıya aktarmak için lütfen admin parolasını giriniz.",
      async () => {
        setIsSyncingAll(true);
        try {
          const currentProducts = noaStore.getProducts();
          const res = await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ action: "sync_all", products: currentProducts }),
          });
          if (res.ok) {
            showToast("Tüm menü ürünleri ve stok durumları başarıyla kaydedildi!");
          } else {
            showToast("Kaydetme sırasında bir hata oluştu, lütfen tekrar deneyiniz.", "error");
          }
        } catch (err) {
          showToast("Bağlantı hatası: Kaydedilemedi.", "error");
        } finally {
          setIsSyncingAll(false);
        }
      }
    );
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
        credentials: "include",
        body: JSON.stringify({ action: "update", product: { id: prod.id, is_available: nextVal } }),
      });
    } catch (e) {
      console.warn("Product availability toggle sync error:", e);
    }
  };

  // Toggle Product Featured
  const handleToggleFeatured = (prod: Product) => {
    noaStore.updateProduct({ id: prod.id, is_featured: !prod.is_featured });
  };

  // Save edited or new product
  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const category_id = formData.get("category_id") as string;
    const base_price = parseFloat(formData.get("base_price") as string);
    const image_url = formData.get("image_url") as string;
    const card_density = editingProduct?.card_density || "large";

    // Cleaned strings for current active locale
    const currentName = (formData.get("name") as string || "").trim();
    const currentDesc = (formData.get("description") as string || "").trim();
    const currentIngr = (formData.get("ingredients") as string || "").trim();

    const mergedNameI18n = { ...editNameI18n, [adminEditLocale]: currentName };
    const mergedDescI18n = { ...editDescI18n, [adminEditLocale]: currentDesc };
    const mergedIngrI18n = { ...editIngrI18n, [adminEditLocale]: currentIngr };

    const trName = mergedNameI18n.tr || currentName;
    const trDesc = mergedDescI18n.tr || currentDesc;
    const trIngr = mergedIngrI18n.tr || currentIngr;

    if (editingProduct?.id) {
      const payload: Partial<Product> & { id: string } = {
        id: editingProduct.id,
        name: trName || editingProduct.name,
        name_i18n: mergedNameI18n,
        category_id,
        base_price,
        description: trDesc || undefined,
        description_i18n: mergedDescI18n,
        ingredients: trIngr || undefined,
        ingredients_i18n: mergedIngrI18n,
        image_url: image_url || undefined,
        card_density,
      };
      noaStore.updateProduct(payload);
      setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? { ...p, ...payload } : p)));
      try {
        await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ action: "update", product: payload }),
        });
      } catch (e) {}
    } else {
      const payload: Omit<Product, "id"> = {
        name: trName,
        name_i18n: mergedNameI18n,
        slug: trName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        category_id,
        base_price,
        description: trDesc || undefined,
        description_i18n: mergedDescI18n,
        ingredients: trIngr || undefined,
        ingredients_i18n: mergedIngrI18n,
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
          credentials: "include",
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

  // Toggle Ingredient Out of Stock / In Stock
  const handleToggleIngredient = async (ingredient: string) => {
    const updated = noaStore.toggleIngredient(ingredient);
    setDisabledIngredients([...updated]);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ disabled_ingredients: updated }),
      });
    } catch (e) {}
  };

  // Explicit Save All Ingredients & Sync with Menu
  const handleSaveAllIngredients = () => {
    requestAdminAuth(
      "Stok Değişikliklerini Kaydet",
      "Malzeme ve stok durumlarını kaydetmek için lütfen admin parolasını giriniz.",
      async () => {
        setIsSavingIngredients(true);
        setIngredientSaveSuccess(false);
        noaStore.updateSettings({
          disabled_ingredients: disabledIngredients,
        });
        try {
          const res = await fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ disabled_ingredients: disabledIngredients }),
          });
          if (res.ok) {
            setIngredientSaveSuccess(true);
            showToast("Malzeme ve stok durumları başarıyla kaydedildi!");
            setTimeout(() => setIngredientSaveSuccess(false), 3500);
          }
        } catch (e) {
          showToast("Stok ayarları kaydedilemedi.", "error");
        } finally {
          setIsSavingIngredients(false);
        }
      }
    );
  };

  // Reset all ingredients to in stock
  const handleResetAllIngredients = () => {
    requestAdminAuth(
      "Stokları Sıfırla",
      "Tüm malzemeleri tekrar stokta olarak işaretlemek için lütfen admin parolasını giriniz.",
      async () => {
        setIsSavingIngredients(true);
        setDisabledIngredients([]);
        noaStore.updateSettings({
          disabled_ingredients: [],
        });
        try {
          const res = await fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ disabled_ingredients: [] }),
          });
          if (res.ok) {
            setIngredientSaveSuccess(true);
            showToast("Tüm malzemeler stokta olarak güncellendi!");
            setTimeout(() => setIngredientSaveSuccess(false), 3500);
          }
        } catch (e) {
        } finally {
          setIsSavingIngredients(false);
        }
      }
    );
  };

  // Add custom ingredient to monitor
  const handleAddCustomIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredientInput.trim()) return;
    const ing = newIngredientInput.trim();
    if (!disabledIngredients.includes(ing)) {
      handleToggleIngredient(ing);
    }
    setNewIngredientInput("");
  };

  const [isSavingWifi, setIsSavingWifi] = useState(false);
  const [isSavingBusiness, setIsSavingBusiness] = useState(false);

  // Save Wi-Fi Settings
  const handleSaveWifiSettings = (e: React.FormEvent) => {
    e.preventDefault();
    requestAdminAuth(
      "Wi-Fi Ayarlarını Kaydet",
      "Dükkan misafir Wi-Fi bilgilerini güncellemek için lütfen admin parolasını giriniz.",
      async () => {
        setIsSavingWifi(true);
        noaStore.updateSettings({
          wifi_ssid: wifiSsid,
          wifi_password: wifiPassword,
        });
        try {
          const res = await fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              wifi_ssid: wifiSsid,
              wifi_password: wifiPassword,
            }),
          });
          if (res.ok) {
            showToast("Wi-Fi bilgileri başarıyla kaydedildi ve canlıya aktarıldı!");
          } else {
            showToast("Wi-Fi ayarları kaydedilemedi, lütfen tekrar deneyiniz.", "error");
          }
        } catch (e) {
          showToast("Bağlantı hatası: Wi-Fi ayarları kaydedilemedi.", "error");
        } finally {
          setIsSavingWifi(false);
        }
      }
    );
  };

  // Save Business Info Settings
  const handleSaveBusinessInfo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const updatedData = {
      brand_name: (fd.get("brand_name") as string) || "NOA Croissant",
      address: (fd.get("address") as string) || "Saray, Yunus Emre Cd., 07400 Alanya/Antalya",
      phone: (fd.get("phone") as string) || "0540 423 33 07",
      instagram_handle: (fd.get("instagram_handle") as string) || "@noacroissant",
    };

    requestAdminAuth(
      "İşletme Bilgilerini Kaydet",
      "İşletme resmi bilgilerini güncellemek için lütfen admin parolasını giriniz.",
      async () => {
        setIsSavingBusiness(true);
        noaStore.updateSettings(updatedData);
        setSettings((prev) => ({ ...prev, ...updatedData }));
        try {
          const res = await fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(updatedData),
          });
          if (res.ok) {
            showToast("İşletme iletişim bilgileri başarıyla kaydedildi!");
          } else {
            showToast("İşletme bilgileri kaydedilemedi, lütfen tekrar deneyiniz.", "error");
          }
        } catch (err) {
          showToast("Bağlantı hatası: İşletme bilgileri kaydedilemedi.", "error");
        } finally {
          setIsSavingBusiness(false);
        }
      }
    );
  };

  // Search Customer Loyalty Card (Admin / Barista)
  const handleSearchCustomerLoyalty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loyaltySearchPhone.trim()) return;
    setIsLoyaltySearching(true);
    setLoyaltyActionMsg(null);
    try {
      const e164 = toE164PhoneTR(loyaltySearchPhone);
      const res = await fetch(`/api/loyalty?phone=${encodeURIComponent(e164)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.card) {
          setAdminLoyaltyCard(data.card);
        }
      } else {
        const c = await fetchLoyaltyCard(e164);
        setAdminLoyaltyCard(c);
      }
    } catch (e) {
      const e164 = toE164PhoneTR(loyaltySearchPhone);
      const c = await fetchLoyaltyCard(e164);
      setAdminLoyaltyCard(c);
    } finally {
      setIsLoyaltySearching(false);
    }
  };

  // Save Loyalty Program Configuration (Stamp count, reward name, active status)
  const handleSaveLoyaltySettings = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const updatedData: Partial<BusinessSettings> = {
      loyalty_enabled: fd.get("loyalty_enabled") === "on",
      loyalty_required_stamps: Number(loyaltyRequiredStamps) || 5,
      loyalty_reward_name: (fd.get("loyalty_reward_name") as string)?.trim() || "Hediye Kahve",
      loyalty_stamp_item_type: (fd.get("loyalty_stamp_item_type") as string)?.trim() || "Kahve",
    };

    requestAdminAuth(
      "Sadakat Programı Ayarları",
      "Sadakat programı kural ve ödül ayarlarını kaydetmek için lütfen admin parolasını giriniz.",
      async () => {
        setLoyaltySaveSuccess(false);
        noaStore.updateSettings(updatedData);
        setSettings((prev) => ({ ...prev, ...updatedData }));
        try {
          const res = await fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(updatedData),
          });
          if (res.ok) {
            setLoyaltySaveSuccess(true);
            showToast("Sadakat programı ayarları başarıyla kaydedildi!");
            setTimeout(() => setLoyaltySaveSuccess(false), 3000);
          } else {
            showToast("Sadakat ayarları kaydedilemedi.", "error");
          }
        } catch (err) {
          showToast("Bağlantı hatası: Kaydedilemedi.", "error");
        }
      }
    );
  };

  // Add Stamp as Barista / Admin
  const handleAdminAddStamp = async (count: number = 1) => {
    if (!adminLoyaltyCard) return;
    setIsLoyaltySearching(true);
    const requiredStamps = settings.loyalty_required_stamps || 5;
    const rewardName = settings.loyalty_reward_name || "Hediye Kahve";
    try {
      const res = await fetch("/api/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "add_stamp",
          phone: adminLoyaltyCard.phone_number,
          count,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAdminLoyaltyCard(data.card);
        setLoyaltyActionMsg(`+${count} damga başarıyla eklendi!`);
      } else {
        const updated = await addStampsToCustomer(adminLoyaltyCard.phone_number, count, requiredStamps, rewardName);
        setAdminLoyaltyCard(updated);
        setLoyaltyActionMsg(`+${count} damga başarıyla eklendi!`);
      }
      setTimeout(() => setLoyaltyActionMsg(null), 4000);
    } catch (e) {}
    setIsLoyaltySearching(false);
  };

  // Remove Stamp as Barista / Admin
  const handleAdminRemoveStamp = async (count: number = 1) => {
    if (!adminLoyaltyCard || adminLoyaltyCard.stamps <= 0) return;
    setIsLoyaltySearching(true);
    try {
      const res = await fetch("/api/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "remove_stamp",
          phone: adminLoyaltyCard.phone_number,
          count,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAdminLoyaltyCard(data.card);
        setLoyaltyActionMsg(`-${count} damga silindi.`);
      } else {
        const updated = await removeStampFromCustomer(adminLoyaltyCard.phone_number, count);
        setAdminLoyaltyCard(updated);
        setLoyaltyActionMsg(`-${count} damga silindi.`);
      }
      setTimeout(() => setLoyaltyActionMsg(null), 4000);
    } catch (e) {}
    setIsLoyaltySearching(false);
  };

  // Redeem Free Coffee as Barista / Admin
  const handleAdminRedeemReward = async () => {
    if (!adminLoyaltyCard || adminLoyaltyCard.rewards_count <= 0) return;
    setIsLoyaltySearching(true);
    const rewardName = settings.loyalty_reward_name || "Hediye Kahve";
    try {
      const res = await fetch("/api/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "redeem",
          phone: adminLoyaltyCard.phone_number,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAdminLoyaltyCard(data.card);
        setLoyaltyActionMsg(`${rewardName} başarıyla teslim edildi!`);
      } else {
        const updated = await redeemFreeCoffee(adminLoyaltyCard.phone_number);
        setAdminLoyaltyCard(updated);
        setLoyaltyActionMsg(`${rewardName} başarıyla teslim edildi!`);
      }
      setTimeout(() => setLoyaltyActionMsg(null), 4000);
    } catch (e) {}
    setIsLoyaltySearching(false);
  };

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
            <span className="text-xs font-black tracking-widest uppercase text-[#8C5828] block">
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
                className={`w-full py-3.5 px-4 text-center tracking-[0.25em] font-mono text-xl font-bold rounded-2xl bg-[#FAF7F2] border transition-all focus:outline-none focus:ring-2 focus:ring-[#DC2626] text-[#381D05] ${
                  pinError ? "border-red-500 ring-2 ring-red-200" : "border-[#683B0C]/20"
                }`}
              />

              {pinError && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 flex items-center gap-3 text-left shadow-2xs">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <div className="flex-1 flex flex-col justify-center leading-tight">
                    {pinError.includes("15 dakika") ? (
                      <>
                        <span className="block font-bold text-xs text-red-600">Çok fazla hatalı giriş denemesi.</span>
                        <span className="block font-semibold text-[11px] text-red-500 mt-0.5">Güvenlik nedeniyle 15 dakika kilitlendi.</span>
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

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#381D05] flex flex-col font-sans">
      {/* ── In-page Toast Notification ── */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-white text-xs sm:text-sm font-bold max-w-md animate-[slideInRight_0.25s_ease-out] border ${
            toast.type === "error"
              ? "bg-red-600 border-red-500 shadow-red-900/20"
              : "bg-[#15803D] border-emerald-500 shadow-emerald-900/20"
          }`}
          style={{ animation: "slideInRight 0.25s ease-out" }}
        >
          {toast.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-white shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          )}
          <span className="flex-1 leading-snug">{toast.msg}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer shrink-0 text-white"
            title="Kapat"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}

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
            <span className="hidden sm:inline">Mutfak Ekranı</span>
          </Link>

          {/* Sound Notification Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            title={soundEnabled ? "Sesli Uyarı Açık (Kapatmak için tıklayın)" : "Sesli Uyarı Kapalı (Açmak için tıklayın)"}
            className={`px-3 py-2 rounded-[14px] border font-black text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer ${
              soundEnabled
                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300"
                : "bg-red-50 hover:bg-red-100 text-red-800 border-red-300"
            }`}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-700 animate-pulse" />
                <span className="hidden sm:inline font-bold">Ses Açık</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-red-600" />
                <span className="hidden sm:inline font-bold">Ses Kapalı</span>
              </>
            )}
          </button>

          {/* Notifications Toggle */}
          <button
            type="button"
            onClick={handleToggleNotification}
            title={notificationEnabled ? "Masaüstü Bildirimleri Açık (Kapatmak için tıklayın)" : "Masaüstü Bildirimleri Kapalı (Açmak için tıklayın)"}
            className={`px-3 py-2 rounded-[14px] border font-black text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer ${
              notificationEnabled
                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300"
                : "bg-red-50 hover:bg-red-100 text-red-800 border-red-300"
            }`}
          >
            {notificationEnabled ? (
              <>
                <BellRing className="w-4 h-4 text-emerald-700 animate-pulse" />
                <span className="hidden sm:inline font-bold">Bildirim Açık</span>
              </>
            ) : (
              <>
                <BellOff className="w-4 h-4 text-red-600" />
                <span className="hidden sm:inline font-bold">Bildirim Kapalı</span>
              </>
            )}
          </button>

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

        {/* Navigation Toolbar (Tabs & Action Tools) */}
        <div className="bg-white p-2 sm:p-2.5 rounded-3xl border border-[#683B0C]/15 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Navigation Tab Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar p-1">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === "orders"
                  ? "bg-[#381D05] text-white shadow-sm"
                  : "bg-[#FAF7F2] text-[#5C3818] hover:bg-[#F3ECE4]"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Siparişler ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("loyalty")}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === "loyalty"
                  ? "bg-[#381D05] text-white shadow-sm"
                  : "bg-[#FAF7F2] text-[#5C3818] hover:bg-[#F3ECE4]"
              }`}
            >
              <div className="w-4 h-4 rounded-full overflow-hidden shrink-0">
                <Image
                  src="/noa_icon.jpg"
                  alt="NOA"
                  width={16}
                  height={16}
                  className="object-cover w-full h-full"
                />
              </div>
              <span>Sadakat & Damga</span>
            </button>

            <button
              onClick={() => setActiveTab("ingredients")}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === "ingredients"
                  ? "bg-[#381D05] text-white shadow-sm"
                  : "bg-[#FAF7F2] text-[#5C3818] hover:bg-[#F3ECE4]"
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>Malzeme & Stok {disabledIngredients.length > 0 && `(${disabledIngredients.length} Tükendi)`}</span>
            </button>

            <button
              onClick={() => setActiveTab("menu")}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === "menu"
                  ? "bg-[#381D05] text-white shadow-sm"
                  : "bg-[#FAF7F2] text-[#5C3818] hover:bg-[#F3ECE4]"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Menü ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === "settings"
                  ? "bg-[#381D05] text-white shadow-sm"
                  : "bg-[#FAF7F2] text-[#5C3818] hover:bg-[#F3ECE4]"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Ayarlar</span>
            </button>
          </div>

          {/* Right Action Tools: Z-Raporu & Excel Export */}
          <div className="flex items-center gap-2 justify-end shrink-0 p-1 border-t lg:border-t-0 border-[#683B0C]/10">
            <button
              onClick={() => setIsZReportOpen(true)}
              className="px-3.5 sm:px-4 py-2.5 rounded-2xl bg-[#381D05] hover:bg-[#251202] text-[#FAF0E4] border border-[#683B0C]/40 text-xs font-black flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#D1A37A]" />
              <span>Gün Sonu (Z-Raporu)</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 sm:px-4 py-2.5 rounded-2xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-white" />
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
                <div className="font-editorial text-3xl font-black text-[#EA580C]">
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
                <div className="font-sans text-2xl font-black text-[#EA580C]">
                  {formatPrice(stats.unpaidRevenue)}
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-[24px] border border-[#683B0C]/15 shadow-xs flex flex-col lg:flex-row gap-3 items-center justify-between">
              <div className="relative w-full lg:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C5828]" />
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="Sipariş no ara (#NOA-...)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-[14px] bg-white border border-[#683B0C]/20 text-xs focus:outline-none focus:ring-2 focus:ring-[#8C5828]/15 focus:border-[#683B0C]/40 text-[#381D05] placeholder:text-[#8C5828]/50 font-medium shadow-2xs transition-all"
                />
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
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

                <div className="h-6 w-[1px] bg-[#683B0C]/15 hidden sm:block mx-1" />

                {/* Siparişleri Temizle Button on the far right */}
                <button
                  type="button"
                  onClick={handleClearAllOrders}
                  disabled={isClearingOrders || orders.length === 0}
                  className="px-3.5 py-2 rounded-[14px] bg-[#DC2626] hover:bg-[#B91C1C] text-white disabled:opacity-40 text-xs font-black flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shrink-0"
                  title="Tüm sipariş geçmişini temizler"
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{isClearingOrders ? "Temizleniyor..." : "Siparişleri Temizle"}</span>
                </button>
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

        {/* TAB 2: MENU & PRODUCTS CRUD */}
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

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleSyncAllProducts}
                  disabled={isSyncingAll}
                  className="px-4 py-2.5 rounded-2xl bg-[#15803D] hover:bg-[#166534] text-white font-bold text-xs flex items-center gap-2 transition-all shadow cursor-pointer active:scale-95 disabled:opacity-50"
                  title="Tüm menü ve stok değişikliklerini canlıya kaydet"
                >
                  {isSyncingAll ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{isSyncingAll ? "Kaydediliyor..." : "Tümünü Kaydet"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    requestAdminAuth("Yeni Ürün Ekleme", "Yeni ürün eklemek için lütfen admin parolasını giriniz.", () => {
                      openProductModal(null);
                    });
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-noa-chocolate text-white font-bold text-xs flex items-center gap-2 hover:bg-noa-chocolate-dark transition-colors shadow shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-noa-caramel-light" />
                  <span>Yeni Ürün Ekle</span>
                </button>
              </div>
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
                            `"${prod.name}" ürününü düzenlemek için lütfen admin parolasını giriniz.`,
                            () => {
                              openProductModal(prod);
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
                            `"${prod.name}" ürününü silmek için lütfen admin parolasını giriniz.`,
                            async () => {
                              noaStore.deleteProduct(prod.id);
                              setProducts((prev) => prev.filter((p) => p.id !== prod.id));
                              try {
                                await fetch("/api/products", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  credentials: "include",
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

        {/* TAB 3: COMMON INGREDIENTS & STOCK OUT-OF-STOCK TOGGLE */}
        {activeTab === "ingredients" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Global Action & Sync Bar */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#683B0C]/15 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="font-editorial text-xl font-bold text-[#381D05]">
                    Malzeme & Stok Yönetimi
                  </h2>
                  {disabledIngredients.length > 0 && (
                    <span className="px-3 py-1 rounded-full bg-red-100 border border-red-300 text-red-800 text-xs font-black">
                      {disabledIngredients.length} Malzeme Tükendi
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Mutfakta tükenen malzemeleri işaretleyin ve &quot;Tümünü Kaydet&quot; butonuna basarak menüde anında kilitleyin.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleResetAllIngredients}
                  disabled={isSavingIngredients || disabledIngredients.length === 0}
                  className="flex-1 md:flex-none px-4 py-3 rounded-2xl bg-[#FAF7F2] hover:bg-stone-200 border border-stone-300 disabled:opacity-40 text-stone-700 font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4 text-stone-500" />
                  <span>Tümünü Stokta Yap</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAllIngredients}
                  disabled={isSavingIngredients}
                  className="flex-1 md:flex-none px-6 py-3 rounded-2xl bg-[#15803D] hover:bg-[#166534] disabled:opacity-50 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSavingIngredients ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Kaydediliyor...</span>
                    </>
                  ) : ingredientSaveSuccess ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3] text-white" />
                      <span>Tüm Değişiklikler Kaydedildi!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-white" />
                      <span>Tüm Stok Değişikliklerini Kaydet</span>
                    </>
                  )}
                </button>
              </div>
            </div>



            <div className="bg-white p-6 rounded-3xl border border-[#683B0C]/20 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#683B0C]/10">
                <div>
                  <h3 className="font-editorial text-lg font-bold text-[#381D05]">
                    Hızlı Malzeme Seçim Kartları
                  </h3>
                  <p className="text-xs text-stone-600">
                    Kartın üzerine tıklayarak veya yanındaki butona basarak durumu değiştirebilirsiniz.
                  </p>
                </div>
              </div>

              {/* Fast Common Ingredient Toggle Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                {[
                  { name: "Nutella", desc: "Nutellalı kruvasan, amora ve waffle sosları" },
                  { name: "Sütlü Belçika Çikolatası", desc: "Sütlü Belçika çikolatalı tüm amora & roll çeşitleri" },
                  { name: "Beyaz Belçika Çikolatası", desc: "Beyaz çikolata sosu ve dolguları" },
                  { name: "Bitter Belçika Çikolatası", desc: "Bitter çikolata sosları ve kaplamaları" },
                  { name: "Antep Fıstığı", desc: "Fıstık kreması, fıstık tozu ve Twissy fıstıklı çeşitleri" },
                  { name: "Lotus Biscoff", desc: "Lotus kreması ve Lotus bisküvi parçacıkları" },
                  { name: "Çilek", desc: "Taze çilek dilimleri ve meyveli seçenekler" },
                  { name: "Muz", desc: "Taze muz dilimleri" },
                  { name: "Dondurma", desc: "Vanilyalı artisan dondurma topu" },
                  { name: "Labne", desc: "Labneli kruvasan dolguları ve kahvaltı tabakları" },
                  { name: "Avokado", desc: "Avokadolu kruvasan ve bruschetta çeşitleri" },
                  { name: "Dana Kaburga", desc: "Füme kaburga kruvasan & sandviçler" },
                ].map((item) => {
                  const isOut = disabledIngredients.some((ing) => ing.toLowerCase() === item.name.toLowerCase());
                  return (
                    <div
                      key={item.name}
                      onClick={() => handleToggleIngredient(item.name)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                        isOut
                          ? "bg-red-50/90 border-red-400 shadow-sm"
                          : "bg-[#FAF7F2] border-[#683B0C]/15 hover:border-[#15803D]/60 hover:bg-white"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-sm text-[#381D05] leading-tight">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-stone-500 mt-1 line-clamp-1">
                          {item.desc}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleIngredient(item.name);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer shadow-xs ${
                          isOut
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-[#15803D] text-white hover:bg-[#166534]"
                        }`}
                      >
                        {isOut ? "Tükendi" : "Stokta"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB: DIGITAL LOYALTY CLUB & STAMP POS MANAGEMENT */}
        {activeTab === "loyalty" && (
          <div className="space-y-6 animate-fadeIn">
            {/* 2-Column Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: ⚙️ SADAKAT PROGRAMI AYARLARI (5 Cols) */}
              <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-[#683B0C]/15 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] text-[#381D05] border border-[#683B0C]/15 flex items-center justify-center shadow-2xs shrink-0">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[#381D05] tracking-tight">
                        Program Kural & Ödül Ayarı
                      </h3>
                      <p className="text-xs text-stone-500 font-medium">
                        Hedef damga sayısı ve hediye ürününü değiştirin
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSaveLoyaltySettings} className="space-y-4">
                  {/* Toggle: Loyalty Enabled */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#683B0C]/10">
                    <div>
                      <span className="text-xs font-black text-[#381D05] block">Sadakat Kulübü Durumu</span>
                      <span className="text-[11px] text-stone-500">Müşteriler menüde sadakat kartını görebilir ve damga toplayabilir</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="loyalty_enabled"
                        defaultChecked={settings.loyalty_enabled !== false}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#15803D]" />
                    </label>
                  </div>

                  {/* Required Stamps Interactive Range Slider (1 to 10) */}
                  <div className="space-y-3 p-4 rounded-2xl bg-[#FAF7F2] border border-[#683B0C]/10">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black text-[#381D05] uppercase tracking-wider">
                        Ödül İçin Gerekli Damga Sayısı
                      </label>
                      <span className="px-3.5 py-1 rounded-xl bg-[#381D05] text-amber-300 font-mono font-black text-sm shadow-xs">
                        {loyaltyRequiredStamps} Damga
                      </span>
                    </div>

                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={loyaltyRequiredStamps}
                      onChange={(e) => setLoyaltyRequiredStamps(Number(e.target.value))}
                      className="w-full h-3 bg-stone-300 rounded-lg appearance-none cursor-pointer accent-[#381D05]"
                    />

                    {/* Step numbers 1 to 10 */}
                    <div className="flex justify-between items-center text-xs font-mono font-bold pt-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setLoyaltyRequiredStamps(n)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer text-[10px] ${
                            loyaltyRequiredStamps === n
                              ? "bg-[#381D05] text-white font-black scale-110 shadow-xs"
                              : "hover:bg-stone-200 text-stone-600"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>

                    <p className="text-[11px] text-stone-500 mt-1">
                      Örn: {loyaltyRequiredStamps} seçilirse, müşteri <strong>{loyaltyRequiredStamps}</strong> damga topladığında otomatik olarak 1 adet hediye kuponu kazanır.
                    </p>
                  </div>

                  {/* Reward Name Input */}
                  <div>
                    <label className="block text-[11px] font-black text-[#381D05] uppercase tracking-wider mb-1.5">
                      Hediye / Ödül Ürün Adı
                    </label>
                    <input
                      type="text"
                      name="loyalty_reward_name"
                      defaultValue={settings.loyalty_reward_name || "Hediye Kahve"}
                      placeholder="Örn: Hediye Kahve veya Tatlı Kruvasan"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-[#FAF7F2] text-xs font-bold text-[#381D05] focus:bg-white focus:outline-none focus:border-[#381D05] focus:ring-2 focus:ring-[#381D05]/10"
                    />
                  </div>

                  {/* Save Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-[#381D05] hover:bg-[#251202] text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{loyaltySaveSuccess ? "Ayarlar Kaydedildi!" : "Ayarları Kaydet"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* RIGHT COLUMN: ☕ KASADA MÜŞTERİ SORGULA & DAMGA BAS (7 Cols) */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-[#683B0C]/15 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                      <Image
                        src="/noa_icon.jpg"
                        alt="NOA"
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[#381D05] tracking-tight">
                        Kasada Müşteri Sorgula & Damga İşlemleri
                      </h3>
                      <p className="text-xs text-stone-500 font-medium">
                        Müşterinin telefonunu yazıp anında işlem yapın
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phone Search Bar */}
                <form onSubmit={handleSearchCustomerLoyalty} className="flex flex-col sm:flex-row items-stretch gap-3">
                  <div className="relative flex-1">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-black text-[#8C5828] border-r border-stone-300 pr-2 pointer-events-none">
                      <span>🇹🇷</span>
                      <span>+90</span>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={loyaltySearchPhone}
                      onChange={(e) => setLoyaltySearchPhone(formatPhoneNumberTR(e.target.value))}
                      placeholder="(5XX) XXX XX XX"
                      className="w-full pl-20 pr-4 py-3 rounded-2xl border border-stone-300 bg-[#FAF7F2] text-sm font-mono font-bold text-[#381D05] focus:bg-white focus:outline-none focus:border-[#381D05] focus:ring-2 focus:ring-[#381D05]/10 shadow-2xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoyaltySearching || loyaltySearchPhone.replace(/\D/g, "").length < 10}
                    className="px-6 py-3 rounded-2xl bg-[#381D05] hover:bg-[#251202] disabled:opacity-50 text-white font-black text-xs shadow transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    {isLoyaltySearching ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-[#D1A37A]" />
                    ) : (
                      <>
                        <Search className="w-4 h-4 text-[#D1A37A]" />
                        <span>Müşteri Sorgula</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Action Feedback Banner */}
                {loyaltyActionMsg && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-black text-emerald-900 flex items-center gap-2 shadow-2xs animate-fadeIn">
                    <Check className="w-4 h-4 text-emerald-600 stroke-[3] shrink-0" />
                    <span>{loyaltyActionMsg}</span>
                  </div>
                )}

                {/* Found Customer Details & POS Actions */}
                {adminLoyaltyCard ? (
                  <div className="p-5 sm:p-6 rounded-2xl bg-[#FAF7F2] border border-[#683B0C]/15 shadow-xs space-y-5 animate-fadeIn">
                    {/* Customer Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full overflow-hidden border border-[#D1A37A]/40 bg-[#FAF7F2] flex items-center justify-center shadow-2xs shrink-0">
                          <Image
                            src="/noa_icon.jpg"
                            alt="NOA"
                            width={44}
                            height={44}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-base font-black text-[#381D05]">
                              {adminLoyaltyCard.phone_number}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                              Aktif Üye
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            Toplam: <strong className="text-[#381D05]">{adminLoyaltyCard.total_stamps_all_time}</strong> damga | Teslim Kodu: <strong className="font-mono text-[#8C5828]">#NOA-{adminLoyaltyCard.redeem_code || "7842"}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Reward Badge */}
                      {adminLoyaltyCard.rewards_count > 0 && (() => {
                        const rawName = settings.loyalty_reward_name || "Hediye Kahve";
                        let prodName = rawName
                          .replace(/^1\s*adet\s*/i, "")
                          .replace(/^1\s*/i, "")
                          .replace(/^hediye\s*/i, "")
                          .trim()
                          .toLocaleUpperCase("tr-TR");
                        if (!prodName) prodName = "KAHVE";

                        return (
                          <div className="px-3.5 py-1.5 rounded-2xl bg-[#15803D] text-white text-xs font-black shadow-sm flex items-center gap-1.5 animate-bounce-subtle shrink-0">
                            <Gift className="w-4 h-4 text-emerald-200 shrink-0" />
                            <span>
                              {adminLoyaltyCard.rewards_count} ADET HEDİYE {prodName} KAZANDI!
                            </span>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Dynamic Visual Stamp Card */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#381D05] text-white border border-[#683B0C]/40 shadow-md space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest">
                          DİJİTAL DAMGA KARTI DURUMU
                        </span>
                        <span className="text-xs font-mono text-stone-300 font-bold">
                          {adminLoyaltyCard.stamps} / {loyaltyRequiredStamps} Tamamlandı
                        </span>
                      </div>

                      <div
                        className="grid gap-2"
                        style={{
                          gridTemplateColumns: `repeat(${Math.min(loyaltyRequiredStamps, 6)}, minmax(0, 1fr))`,
                        }}
                      >
                        {Array.from({ length: loyaltyRequiredStamps }, (_, i) => i + 1).map((slot) => {
                          const isStamped = adminLoyaltyCard.stamps >= slot;
                          const isGift = slot === loyaltyRequiredStamps;
                          return (
                            <div
                              key={slot}
                              className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-1 border transition-all ${
                                isStamped
                                  ? "bg-[#15803D] border-[#22C55E] text-white shadow-xs"
                                  : isGift
                                  ? "bg-[#251202] border-dashed border-emerald-500/70 text-emerald-300"
                                  : "bg-[#2A1503] border-dashed border-[#683B0C] text-[#D1A37A]"
                              }`}
                            >
                              {isStamped ? (
                                <>
                                  <Check className="w-5 h-5 stroke-[3] text-white" />
                                  <span className="text-[9px] font-black mt-0.5 text-white">#{slot}</span>
                                </>
                              ) : isGift ? (
                                <>
                                  <Gift className="w-5 h-5 text-emerald-300" />
                                  <span className="text-[8px] font-black uppercase mt-0.5 text-emerald-300">HEDİYE</span>
                                </>
                              ) : (
                                <>
                                  <div className="w-4 h-4 rounded-full overflow-hidden opacity-50 shrink-0">
                                    <Image
                                      src="/noa_icon.jpg"
                                      alt="NOA"
                                      width={16}
                                      height={16}
                                      className="object-cover w-full h-full"
                                    />
                                  </div>
                                  <span className="text-[8px] font-bold text-[#D1A37A] mt-0.5">{slot}</span>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Barista Actions: Damga Ekle & Sil & Teslim Et */}
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-black text-[#381D05] uppercase tracking-wider">
                        Damga İşlemleri
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <button
                          type="button"
                          disabled={isLoyaltySearching}
                          onClick={() => handleAdminAddStamp(1)}
                          className="py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-[#15803D] font-black text-xs shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                        >
                          <Plus className="w-4 h-4 shrink-0 stroke-[2.5]" />
                          <span>1 Damga Ekle</span>
                        </button>

                        <button
                          type="button"
                          disabled={isLoyaltySearching || adminLoyaltyCard.stamps <= 0}
                          onClick={() => handleAdminRemoveStamp(1)}
                          className="py-3 px-4 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-black text-xs shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-40"
                        >
                          <Minus className="w-4 h-4 shrink-0 stroke-[2.5]" />
                          <span>1 Damga Sil</span>
                        </button>

                        <button
                          type="button"
                          disabled={isLoyaltySearching || adminLoyaltyCard.rewards_count <= 0}
                          onClick={handleAdminRedeemReward}
                          className="py-3 px-4 rounded-2xl bg-[#15803D] hover:bg-[#166534] disabled:opacity-40 text-white font-black text-xs shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                        >
                          <Gift className="w-4 h-4 text-emerald-200 shrink-0" />
                          <span>Ödülü Teslim Et</span>
                        </button>
                      </div>
                    </div>

                    {/* Customer History */}
                    {adminLoyaltyCard.history && adminLoyaltyCard.history.length > 0 && (
                      <div className="pt-3 border-t border-stone-200 space-y-2">
                        <h5 className="text-[11px] font-bold text-stone-500">Müşteri İşlem Geçmişi</h5>
                        <div className="bg-white rounded-xl p-3 border border-stone-200 max-h-40 overflow-y-auto space-y-2">
                          {adminLoyaltyCard.history.map((h) => (
                            <div key={h.id} className="flex items-start justify-between text-xs pb-1.5 border-b border-stone-100 last:border-0 last:pb-0">
                              <div className="flex items-center gap-2">
                                <span className="text-amber-600 font-bold">•</span>
                                <span className="font-semibold text-[#381D05]">
                                  {h.description
                                    .replace(/NOA Sadakat Kartı/gi, "NOA LOYALTY CARD")
                                    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, "")
                                    .trim()}
                                </span>
                              </div>
                              <span className="text-[10px] text-stone-400 font-mono shrink-0 ml-2">
                                {new Date(h.date).toLocaleDateString("tr-TR", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Empty state guide */
                  <div className="p-8 rounded-2xl text-center space-y-3">
                    <div className="w-14 h-14 rounded-full overflow-hidden mx-auto">
                      <Image
                        src="/noa_icon.jpg"
                        alt="NOA"
                        width={56}
                        height={56}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <h4 className="font-editorial text-base font-bold text-[#381D05]">
                      Müşteri kartı sorgulamak için telefon numarası girin.
                    </h4>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      Kasada müşterinizin telefon numarasını yazarak mevcut damga durumunu görebilir, tek tıkla yeni damga basabilir veya kazandığı hediyeyi teslim edebilirsiniz.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BUSINESS SETTINGS & WI-FI */}
        {activeTab === "settings" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Card 1: Wi-Fi Fast Connect Configuration */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-6">
                  <div className="flex items-start gap-3.5 pb-5 border-b border-stone-100">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center shadow-2xs shrink-0 mt-0.5">
                      <Wifi className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-[#381D05] tracking-tight">
                        Dükkan Misafir Wi-Fi Ağı
                      </h2>
                      <p className="text-xs text-stone-500 font-medium mt-0.5 leading-relaxed">
                        Menü başlığındaki Wi-Fi butonuna basıldığında müşterilerin şifresiz tek dokunuşla bağlanmasını sağlar.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveWifiSettings} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-black text-[#381D05] uppercase tracking-wider mb-1.5">
                        Wi-Fi Ağ Adı (SSID)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={wifiSsid}
                          onChange={(e) => setWifiSsid(e.target.value)}
                          placeholder="Örn: Noa Croissant"
                          className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF7F2] text-sm font-bold text-[#381D05] placeholder:text-stone-400 focus:bg-white focus:border-[#381D05] focus:ring-2 focus:ring-[#381D05]/10 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-[#381D05] uppercase tracking-wider mb-1.5">
                        Wi-Fi Şifresi
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={wifiPassword}
                          onChange={(e) => setWifiPassword(e.target.value)}
                          placeholder="Örn: noa330738"
                          className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF7F2] text-sm font-mono font-bold text-[#381D05] placeholder:text-stone-400 focus:bg-white focus:border-[#381D05] focus:ring-2 focus:ring-[#381D05]/10 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Quick Wi-Fi Preview Badge */}
                    <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between text-xs">
                      <span className="text-emerald-900 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Aktif Müşteri Ağı: <span className="font-mono font-black">{wifiSsid || "Belirtilmedi"}</span>
                      </span>
                      <span className="font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md text-[11px] font-bold">
                        {wifiPassword || "Şifresiz"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isSavingWifi}
                        className="px-5 py-2.5 rounded-2xl bg-[#15803D] hover:bg-[#166534] text-white font-bold text-xs flex items-center gap-2 transition-all shadow cursor-pointer active:scale-95 disabled:opacity-50"
                        title="Wi-Fi ayarlarını kaydet"
                      >
                        {isSavingWifi ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>{isSavingWifi ? "Kaydediliyor..." : "Wi-Fi Bilgilerini Kaydet"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Card 2: General Business Info */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-6">
                  <div className="flex items-start gap-3.5 pb-5 border-b border-stone-100">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF0E4] text-[#8C5828] border border-[#683B0C]/20 flex items-center justify-center shadow-2xs shrink-0 mt-0.5">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-[#381D05] tracking-tight">
                        İşletme İletişim & Lokasyon
                      </h2>
                      <p className="text-xs text-stone-500 font-medium mt-0.5 leading-relaxed">
                        Menü altbilgisi, fiş çıktıları ve harita butonlarında yer alan resmi işletme bilgileri.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveBusinessInfo} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-black text-[#381D05] uppercase tracking-wider mb-1.5">
                          Marka Adı
                        </label>
                        <input
                          type="text"
                          name="brand_name"
                          defaultValue={settings.brand_name || "NOA Croissant"}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-[#FAF7F2] text-sm font-bold text-[#381D05] focus:bg-white focus:border-[#381D05] focus:ring-2 focus:ring-[#381D05]/10 outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-[#381D05] uppercase tracking-wider mb-1.5">
                          Telefon Numarası
                        </label>
                        <input
                          type="text"
                          name="phone"
                          defaultValue={settings.phone || "0540 423 33 07"}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-[#FAF7F2] text-sm font-mono font-bold text-[#381D05] focus:bg-white focus:border-[#381D05] focus:ring-2 focus:ring-[#381D05]/10 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-[#381D05] uppercase tracking-wider mb-1.5">
                        Adres
                      </label>
                      <input
                        type="text"
                        name="address"
                        defaultValue={settings.address || "Saray, Yunus Emre Cd., 07400 Alanya/Antalya"}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-[#FAF7F2] text-xs font-semibold text-[#381D05] focus:bg-white focus:border-[#381D05] focus:ring-2 focus:ring-[#381D05]/10 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-[#381D05] uppercase tracking-wider mb-1.5">
                        Instagram Hesabı
                      </label>
                      <input
                        type="text"
                        name="instagram_handle"
                        defaultValue={settings.instagram_handle || "@noacroissant"}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-[#FAF7F2] text-sm font-bold text-[#381D05] focus:bg-white focus:border-[#381D05] focus:ring-2 focus:ring-[#381D05]/10 outline-none transition-all"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isSavingBusiness}
                        className="px-5 py-2.5 rounded-2xl bg-[#15803D] hover:bg-[#166534] text-white font-bold text-xs flex items-center gap-2 transition-all shadow cursor-pointer active:scale-95 disabled:opacity-50"
                        title="İşletme bilgilerini kaydet"
                      >
                        {isSavingBusiness ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>{isSavingBusiness ? "Kaydediliyor..." : "İşletme Bilgilerini Kaydet"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
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
          <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 z-10 shadow-2xl space-y-5 border border-[#683B0C]/20 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#683B0C]/10 pb-3">
              <div>
                <h2 className="font-editorial text-2xl font-black text-[#381D05]">
                  {editingProduct ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  {(() => {
                    const filledCount = SUPPORTED_LOCALES.filter(
                      (loc) => Boolean(editNameI18n[loc]?.trim())
                    ).length;
                    const isAllFilled = filledCount === SUPPORTED_LOCALES.length;
                    return (
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                          isAllFilled
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-amber-100 text-amber-800 border-amber-300"
                        }`}
                      >
                        🌍 {filledCount}/{SUPPORTED_LOCALES.length} Dil Çevirisi
                      </span>
                    );
                  })()}
                </div>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Multilingual Tabs Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#8C5828]">
                <span>Düzenleme Dili:</span>
                {adminEditLocale !== "tr" && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditNameI18n((prev) => ({ ...prev, [adminEditLocale]: prev.tr || "" }));
                      setEditDescI18n((prev) => ({ ...prev, [adminEditLocale]: prev.tr || "" }));
                      setEditIngrI18n((prev) => ({ ...prev, [adminEditLocale]: prev.tr || "" }));
                    }}
                    className="text-[#15803D] hover:underline font-black cursor-pointer"
                  >
                    ↳ Türkçe&apos;den Kopyala
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { code: "tr" as SupportedLocale, flag: "🇹🇷", label: "TR" },
                  { code: "en" as SupportedLocale, flag: "🇬🇧", label: "EN" },
                  { code: "de" as SupportedLocale, flag: "🇩🇪", label: "DE" },
                  { code: "ru" as SupportedLocale, flag: "🇷🇺", label: "RU" },
                  { code: "nl" as SupportedLocale, flag: "🇳🇱", label: "NL" },
                  { code: "sv" as SupportedLocale, flag: "🇸🇪", label: "SV" },
                  { code: "no" as SupportedLocale, flag: "🇳🇴", label: "NO" },
                  { code: "fi" as SupportedLocale, flag: "🇫🇮", label: "FI" },
                  { code: "pl" as SupportedLocale, flag: "🇵🇱", label: "PL" },
                  { code: "ar" as SupportedLocale, flag: "🇸🇦", label: "AR" },
                ].map((lang) => {
                  const isSelected = adminEditLocale === lang.code;
                  const hasContent = Boolean(editNameI18n[lang.code]?.trim());
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setAdminEditLocale(lang.code)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#381D05] text-white shadow-xs"
                          : hasContent
                          ? "bg-[#FAF0E4] text-[#683B0C] border border-[#683B0C]/20 hover:bg-[#F3E5D4]"
                          : "bg-stone-100 text-stone-400 hover:bg-stone-200"
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                      {hasContent && !isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#381D05] block mb-1.5">
                  Ürün Adı ({adminEditLocale.toUpperCase()})
                </label>
                <input
                  name="name"
                  value={editNameI18n[adminEditLocale] || ""}
                  onChange={(e) =>
                    setEditNameI18n((prev) => ({
                      ...prev,
                      [adminEditLocale]: e.target.value,
                    }))
                  }
                  required={adminEditLocale === "tr"}
                  placeholder={
                    adminEditLocale === "tr"
                      ? "Örn: Antep Fıstıklı Kruvasan"
                      : adminEditLocale === "en"
                      ? "e.g. Pistachio Croissant"
                      : `Ürün adı (${adminEditLocale.toUpperCase()})`
                  }
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
                <label className="font-bold text-[#381D05] block mb-1.5">
                  Ürün Açıklaması ({adminEditLocale.toUpperCase()})
                </label>
                <textarea
                  name="description"
                  value={editDescI18n[adminEditLocale] || ""}
                  onChange={(e) =>
                    setEditDescI18n((prev) => ({
                      ...prev,
                      [adminEditLocale]: e.target.value,
                    }))
                  }
                  rows={2}
                  placeholder={
                    adminEditLocale === "tr"
                      ? "Örn: Kat kat çıtır kruvasan; yoğun Antep fıstığı kremasıyla..."
                      : adminEditLocale === "en"
                      ? "e.g. Crispy layered croissant with rich pistachio cream..."
                      : `Açıklama (${adminEditLocale.toUpperCase()})`
                  }
                  className="w-full p-3 rounded-2xl border border-[#683B0C]/20 focus:border-[#381D05] focus:outline-none bg-[#FAF7F2]/50 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="font-bold text-[#381D05] block mb-1.5">
                  İçindekiler / Malzemeler ({adminEditLocale.toUpperCase()})
                </label>
                <input
                  name="ingredients"
                  value={editIngrI18n[adminEditLocale] || ""}
                  onChange={(e) =>
                    setEditIngrI18n((prev) => ({
                      ...prev,
                      [adminEditLocale]: e.target.value,
                    }))
                  }
                  placeholder={
                    adminEditLocale === "tr"
                      ? "Örn: Antep fıstığı kreması, parça fıstık"
                      : adminEditLocale === "en"
                      ? "e.g. Pistachio cream, crushed pistachios"
                      : `İçindekiler (${adminEditLocale.toUpperCase()})`
                  }
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
                  className="px-5 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
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
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#381D05] border border-[#683B0C]/20 font-black text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#8C5828]" />
                  <span>Fişi Yazdır</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-full bg-white border border-[#683B0C]/15 flex items-center justify-center text-[#381D05] hover:bg-[#FAF7F2] cursor-pointer active:scale-95 transition-all shadow-2xs"
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
              <div className="relative w-11 h-11 rounded-2xl overflow-hidden border border-[#683B0C]/15 bg-white shadow-xs shrink-0">
                <Image
                  src="/noa_icon.jpg"
                  alt="NOA Logo"
                  fill
                  sizes="44px"
                  className="object-cover"
                />
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
                  <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 flex items-center gap-3 text-left shadow-2xs mt-2">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <div className="flex-1 flex flex-col justify-center leading-tight">
                      {actionPinError.includes("15 dakika") ? (
                        <>
                          <span className="block font-bold text-xs text-red-600">Çok fazla hatalı giriş denemesi.</span>
                          <span className="block font-semibold text-[11px] text-red-500 mt-0.5">Güvenlik nedeniyle 15 dakika kilitlendi.</span>
                        </>
                      ) : (
                        <span>{actionPinError}</span>
                      )}
                    </div>
                  </div>
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

        const soldProducts = Object.entries(productCounts)
          .sort((a, b) => b[1].qty - a[1].qty);
        const totalItemsCount = soldProducts.reduce((sum, [, data]) => sum + data.qty, 0);

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

              {/* All Sold Products */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black uppercase text-[#381D05] tracking-wider">
                    Günün Satılan Ürünleri {soldProducts.length > 0 && `(${soldProducts.length} Çeşit, ${totalItemsCount} Adet)`}
                  </div>
                </div>
                <div className="divide-y divide-[#683B0C]/10 border border-[#683B0C]/10 rounded-2xl overflow-hidden bg-white text-xs max-h-60 overflow-y-auto">
                  {soldProducts.length === 0 ? (
                    <div className="p-4 text-center text-stone-500 font-medium">Henüz bugün satılan ürün kaydı yok.</div>
                  ) : (
                    soldProducts.map(([name, data], idx) => (
                      <div key={idx} className="p-2.5 px-3 flex items-center justify-between font-semibold hover:bg-[#FAF7F2]/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#FAF0E4] text-[#8C5828] text-[10px] font-black flex items-center justify-center shrink-0">
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
