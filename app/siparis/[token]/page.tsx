"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Sparkles,
  AlertCircle,
  CreditCard,
  Banknote,
  QrCode,
  ArrowLeft,
  ShoppingBag,
  Volume2,
  Star,
  XCircle,
  Check,
  Bell,
  BellRing,
  Loader2,
  UtensilsCrossed,
  Coffee,
  Flame,
  PartyPopper,
  Smile,
  ChevronLeft,
  BookOpen,
  Utensils,
  LayoutGrid,
  Instagram,
  ExternalLink,
} from "lucide-react";
import { BUSINESS_INFO } from "@/lib/businessConfig";
import { OrderRecord, OrderStatus } from "@/lib/types";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { noaStore } from "@/lib/store";
import {
  Language,
  getTranslation,
  detectDeviceLanguage,
} from "@/lib/i18n/translations";
import {
  resolveLocalizedText,
  formatLocalizedPrice,
  getSortedAndFormattedOptionsLocalized,
} from "@/lib/i18n/resolver";

function playReadyNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    // Melodic French Bakery Bell: D5 -> F#5 -> A5 -> D6
    const notes = [
      { freq: 587.33, time: 0.0, duration: 0.4 },   // D5
      { freq: 739.99, time: 0.18, duration: 0.4 },  // F#5
      { freq: 880.00, time: 0.36, duration: 0.5 },  // A5
      { freq: 1174.66, time: 0.54, duration: 1.4 }, // D6 (long bell ring)
    ];

    notes.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

      gain.gain.setValueAtTime(0, ctx.currentTime + time);
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + duration + 0.1);
    });
  } catch (e) {
    console.warn("Audio chime playback:", e);
  }
}

function triggerReadyNotification(orderNumber: string, tableNumber?: number, language: Language = "tr") {
  // 1. Play chime sound
  playReadyNotificationSound();

  // 2. Mobile vibration (distinct double pulse)
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate([300, 150, 300, 150, 500]);
  }

  // 3. Native Push Notification (via ServiceWorker or window.Notification)
  const isEn = language === "en";
  const title = isEn
    ? "NOA Croissant • Your Order is Ready! 🥐✨"
    : "NOA Croissant • Siparişiniz Hazır! 🥐✨";
  const body = tableNumber
    ? (isEn
        ? `Table ${tableNumber}: Your freshly baked croissants and order are ready, serving to your table!`
        : `Masa ${tableNumber}: Kruvasanlarınız ve siparişiniz fırından yeni çıktı, masanıza servis ediliyor!`)
    : (isEn
        ? `Order #${orderNumber} is ready! Enjoy your meal!`
        : `Sipariş #${orderNumber} hazırlandı, afiyet olsun!`);
  const icon = "/brand/logo-192.png";

  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then((reg) => {
          reg.showNotification(title, {
            body,
            icon,
            badge: "/brand/favicon-32x32.png",
            vibrate: [300, 150, 300, 150, 500],
            tag: "noa-order-ready",
          } as any);
        })
        .catch(() => {
          new Notification(title, { body, icon });
        });
    } else {
      new Notification(title, { body, icon });
    }
  }
}



export default function OrderTrackingPage() {
  const params = useParams();
  const token = params.token as string;

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [notificationPerm, setNotificationPerm] = useState<string>("default");
  const [language, setLanguage] = useState<Language>(() => detectDeviceLanguage());
  const [instagramConcept, setInstagramConcept] = useState<1 | 2 | 3>(1);

  // Automatically adapt to the language used when placing the order, or device locale
  useEffect(() => {
    if (order?.language) {
      setLanguage(order.language);
    } else {
      setLanguage(detectDeviceLanguage());
    }
  }, [order?.language]);

  const t = (key: string, fallback?: string) => getTranslation(language, key, fallback);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPerm(Notification.permission);
    }
  }, []);
  const handleRequestNotification = async () => {
    // 1. Warm up audio context on user interaction
    try {
      playReadyNotificationSound();
    } catch (e) {}

    // 2. Mobile vibration feedback
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch (e) {}
    }

    // 3. Browser notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        if (Notification.permission === "granted") {
          setNotificationPerm("granted");
          return;
        }

        // Support both modern Promise and legacy Callback signatures
        let perm: NotificationPermission = "default";
        try {
          const promiseResult = Notification.requestPermission();
          if (promiseResult && typeof promiseResult.then === "function") {
            perm = await promiseResult;
          } else {
            perm = await new Promise((resolve) => {
              Notification.requestPermission((p) => resolve(p));
            });
          }
        } catch (err) {
          perm = await new Promise((resolve) => {
            Notification.requestPermission((p) => resolve(p));
          });
        }

        if (perm === "denied") {
          alert("Bildirimler tarayıcınızda engellenmiş görünüyor. Lütfen tarayıcı / site ayarlarından bildirim iznini açınız.");
          setNotificationPerm("denied");
        } else {
          setNotificationPerm(perm || "granted");
        }
      } catch (e) {
        // Fallback for browsers where Notification.requestPermission throws
        setNotificationPerm("granted");
      }
    } else {
      // Fallback for browsers without native Web Notifications (Audio & In-App chime active)
      setNotificationPerm("granted");
    }
  };

  // Ensure scroll is free on tracking page mount
  useEffect(() => {
    document.body.style.overflow = "auto";
    document.body.style.position = "static";
    document.documentElement.style.overflow = "auto";
  }, []);

  // Fetch and poll / subscribe to order updates
  useEffect(() => {
    if (!token) return;

    // Immediate check 1: In-memory store
    const inMemory = noaStore.getOrderByTrackingToken(token);
    if (inMemory) {
      setOrder({ ...inMemory });
      setIsLoading(false);
    } else if (typeof window !== "undefined") {
      // Immediate check 2: localStorage cache
      try {
        const cached = localStorage.getItem(`noa_order_${token}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.id || parsed.tracking_token === token)) {
            setOrder(parsed);
            noaStore.hydrateOrder(parsed);
            setIsLoading(false);
          }
        }
      } catch (e) {}
    }

    const fetchOrder = () => {
      fetch(`/api/order/track?token=${encodeURIComponent(token)}`)
        .then((res) => {
          if (!res.ok) throw new Error("Order not found");
          return res.json();
        })
        .then((data) => {
          if (data.order) {
            setOrder(data.order);
            setError(null);
            noaStore.hydrateOrder(data.order);
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem(`noa_order_${token}`, JSON.stringify(data.order));
              } catch (e) {}
            }
          }
        })
        .catch(() => {
          setOrder((current) => {
            if (!current) {
              setError("Sipariş bilgisine ulaşılamadı veya henüz sunucuya yansımadı.");
            }
            return current;
          });
        })
        .finally(() => setIsLoading(false));
    };

    fetchOrder();

    const unsubscribe = noaStore.subscribe(() => {
      const live = noaStore.getOrderByTrackingToken(token);
      if (live) setOrder({ ...live });
    });
    const interval = setInterval(fetchOrder, 3000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [token]);

  // Generate QR for Cashier
  useEffect(() => {
    if (!order) return;
    const qrPayload = JSON.stringify({
      order_id: order.id,
      order_number: order.order_number,
      total: order.total,
      payment_method: order.payment_method,
      tracking_token: order.tracking_token,
    });
    QRCode.toDataURL(qrPayload, {
      width: 220,
      margin: 2,
      color: { dark: "#381D05", light: "#FFFFFF" },
    })
      .then((url) => setQrDataUrl(url))
      .catch((e) => console.error("QR error:", e));
  }, [order]);

  const prevStatusRef = useRef<string | null>(null);

  // Trigger repeating sound chime, vibration, notification, and confetti while order is READY
  useEffect(() => {
    if (!order) return;
    const currentStatus = order.status;
    const prevStatus = prevStatusRef.current;

    if (currentStatus === "ready") {
      const orderNum = order.order_number
        ? order.order_number.toString().padStart(3, "0")
        : order.id.slice(-4);

      // Fire notification & confetti on initial change to ready
      if (prevStatus !== "ready") {
        triggerReadyNotification(orderNum, order.table_number, language);
        try {
          confetti({
            particleCount: 70,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#15803D", "#D1A37A", "#683B0C", "#F8F1EB"],
          });
        } catch (e) {
          // ignore
        }
      } else {
        playReadyNotificationSound();
      }

      // Repeat chime every 3.5 seconds until status changes (e.g. served)
      const chimeInterval = setInterval(() => {
        playReadyNotificationSound();
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
      }, 3500);

      return () => {
        clearInterval(chimeInterval);
      };
    }

    prevStatusRef.current = currentStatus;
  }, [order?.status, order?.order_number]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-4 sm:p-6 text-center">
        <div className="w-full max-w-sm bg-white rounded-[32px] p-8 border border-[#683B0C]/15 shadow-[0_20px_50px_rgba(56,29,5,0.08)] flex flex-col items-center space-y-5 animate-fadeIn">
          {/* Circular NOA Emblem with Subtle Badge */}
          <div className="relative">
            <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-md border-2 border-[#683B0C]/15 bg-white">
              <Image
                src="/noa_icon.jpg"
                alt="NOA Croissant"
                fill
                sizes="80px"
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs border-2 border-white">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-black tracking-widest uppercase text-[#8C5828] block">
              NOA CROISSANT
            </span>
            <h1 className="font-editorial text-2xl font-bold text-[#381D05]">
              {language === "tr" ? "Sipariş Bulunamadı" : "Order Not Found"}
            </h1>
            <p className="text-xs text-[#5C3818] max-w-[260px] mx-auto leading-relaxed">
              {language === "tr"
                ? "Aradığınız sipariş kaydına ulaşılamadı veya takip süresi sona ermiş olabilir."
                : "The order record could not be found or tracking session has expired."}
            </p>
          </div>

          <div className="w-full space-y-2 pt-2">
            <Link
              href="/"
              className="w-full py-3.5 px-5 rounded-2xl bg-[#381D05] hover:bg-[#251202] text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{t("backToMenu", "Menüye Dön")}</span>
            </Link>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-5 rounded-2xl bg-[#FAF0E4] hover:bg-[#F5E6D3] text-[#381D05] border border-[#683B0C]/15 font-bold text-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              {t("refreshPage", "Sayfayı Yenile")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return <div className="min-h-screen bg-[#FAF7F2]" />;
  }

  const isCancelled = order.status === "cancelled";
  const isReady = !isCancelled && order.status === "ready";
  const isServed = !isCancelled && order.status === "served";
  const isPreparing = !isCancelled && order.status === "preparing";
  const isUnpaid = !isCancelled && order.status === "received";

  return (
    <div className="min-h-[100dvh] bg-[#FAF7F2] pt-6 pb-[max(3rem,calc(env(safe-area-inset-bottom)+1.5rem))] px-4 sm:px-6">
      <div className="max-w-md mx-auto space-y-5">
        {/* Top Header Bar with Menu link (Only shown when order is completed or cancelled) */}
        {(isServed || isCancelled) && (
          <div className="flex items-center justify-between pb-1 animate-fadeIn">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-black text-[#8C5828] hover:text-[#381D05] transition-all cursor-pointer py-1 group active:scale-95"
            >
              <span className="text-sm leading-none transition-transform group-hover:-translate-x-0.5">←</span>
              <span className="underline decoration-[#8C5828]/40 underline-offset-4 font-black">
                {t("backToMenu", "Menüye Dön")}
              </span>
            </Link>
          </div>
        )}

        {/* Push Notification Banner */}
        {!isCancelled && !isServed && (
          <div className={`rounded-2xl p-4 flex items-center justify-between gap-3 animate-fadeIn transition-all shadow-md border-0 text-white ${
            notificationPerm === "granted"
              ? "bg-[#15803D]"
              : "bg-[#DC2626]"
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 relative">
                <Image
                  src="/brand/noa-icon.png"
                  alt="NOA Logo"
                  fill
                  sizes="40px"
                  className="object-contain brightness-0 invert"
                />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-white">
                  {notificationPerm === "granted"
                    ? t("notificationsActive", "Bildirimler aktif.")
                    : t("enableNotifications", "Sipariş bildirimlerini aç.")}
                </p>
                <p className="text-[11px] font-medium leading-tight text-white/95">
                  {notificationPerm === "granted"
                    ? t("notificationActiveDesc", "Kruvasanınız fırından çıkınca telefonunuz titreyecektir.")
                    : t("notificationDesc", "Ekran kilitliyken bile sesli bildirim alın.")}
                </p>
              </div>
            </div>

            {notificationPerm !== "granted" && (
              <button
                onClick={handleRequestNotification}
                className="px-4 py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-black rounded-xl shrink-0 shadow-sm flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer border border-white/20"
              >
                <BellRing className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t("enableBtn", "Aç")}</span>
              </button>
            )}
          </div>
        )}

        {/* Order Status Card */}
        <div className={`bg-white rounded-[28px] p-6 shadow-md border text-center space-y-4 ${isCancelled ? "border-red-300" : "border-[#683B0C]/15"}`}>
          {/* Brand Emblem & Order Number Badge */}
          <div className="flex flex-col items-center space-y-1.5">
            <div className="relative w-12 h-12">
              <Image
                src="/brand/noa-icon.png"
                alt="NOA Logo"
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#8C5828]">
              {t("orderNumber", "Sipariş Numaranız")}
            </span>
            <div className={`text-2xl sm:text-3xl font-black font-sans tracking-tight whitespace-nowrap ${isCancelled ? "text-red-700 line-through decoration-red-500/60" : "text-[#381D05]"}`}>
              #{order.order_number ? order.order_number.toString().padStart(3, "0") : order.id.slice(-4)}
            </div>
          </div>

          {/* Dynamic Status Alert Banner */}
          {isCancelled && (
            <div className="p-5 rounded-2xl bg-red-50 border-2 border-red-300 text-red-950 space-y-2.5 text-center shadow-xs animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center shadow-xs">
                <XCircle className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div className="font-black text-lg text-red-700">
                {t("cancelled", "Siparişiniz iptal edildi.")}
              </div>
              <p className="text-xs text-red-800 leading-relaxed font-medium">
                {t("cancelledMsg", "Bu sipariş kasa veya işletme yöneticisi tarafından iptal edilmiştir.")}
              </p>
              {order.cancelled_reason && (
                <div className="pt-2.5 mt-2 border-t border-red-200 text-xs text-red-900">
                  <span className="text-red-700 block text-[11px] uppercase tracking-wider font-black mb-1">
                    {t("cancelReasonLabel", "İptal Gerekçesi:")}
                  </span>
                  <span className="font-bold bg-white px-3 py-1.5 rounded-xl border border-red-200 inline-block shadow-xs">
                    {order.cancelled_reason}
                  </span>
                </div>
              )}
            </div>
          )}

          {isUnpaid && (
            <div className="p-4 rounded-2xl bg-[#EA580C] text-white space-y-2 text-center shadow-md border-0">
              <div className="font-black text-base text-white flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 text-white animate-spin stroke-[2.5]" />
                <span>{t("paymentWaiting", "Ödeme bekleniyor...")}</span>
              </div>
              <p className="text-xs text-white/95 leading-relaxed font-medium">
                {language === "en" ? (
                  <>
                    Please go to the cashier, provide your order number{" "}
                    <strong className="font-black text-white">
                      (#{order.order_number ? order.order_number.toString().padStart(3, "0") : order.id.slice(-4)})
                    </strong>{" "}
                    or show the QR code, and complete your payment with{" "}
                    <strong className="font-black text-white">
                      {order.payment_method === "credit_card" ? "Credit Card" : "Cash"}
                    </strong>.
                  </>
                ) : language === "ru" ? (
                  <>
                    Пожалуйста, подойдите к кассе, назовите номер заказа{" "}
                    <strong className="font-black text-white">
                      (#{order.order_number ? order.order_number.toString().padStart(3, "0") : order.id.slice(-4)})
                    </strong>{" "}
                    или покажите QR-код и оплатите с помощью{" "}
                    <strong className="font-black text-white">
                      {order.payment_method === "credit_card" ? "Банковской картой" : "Наличными"}
                    </strong>.
                  </>
                ) : (
                  <>
                    Lütfen kasaya giderek sipariş numaranızı{" "}
                    <strong className="font-black text-white">
                      (#{order.order_number ? order.order_number.toString().padStart(3, "0") : order.id.slice(-4)})
                    </strong>{" "}
                    belirtiniz veya QR kodu kasaya gösteriniz ve{" "}
                    <strong className="font-black text-white">
                      {order.payment_method === "credit_card" ? "Kredi Kartı" : "Nakit"}
                    </strong>{" "}
                    ile ödemenizi tamamlayınız.
                  </>
                )}
              </p>
            </div>
          )}

          {isPreparing && (
            <div className="p-4 rounded-2xl bg-[#F59E0B] text-white space-y-1.5 text-center shadow-md border-0">
              <div className="font-black text-base text-white flex items-center justify-center gap-2">
                <ChefHat className="w-5 h-5 text-white stroke-[2.5]" />
                <span>{t("preparing", "Ödeme onaylandı, sipariş hazırlanıyor...")}</span>
              </div>
              <p className="text-xs text-white/95 font-medium leading-relaxed">
                {t(
                  "preparingMsg",
                  "Ödemeniz kasada onaylandı! Şeflerimiz siparişinizi fırından taze olarak hazırlıyor. Hazırlandıktan sonra teslim almanız için sizi bu ekrandan ve sesli bildirimle bilgilendireceğiz."
                )}
              </p>
            </div>
          )}

          {isReady && (
            <div className="p-5 rounded-2xl bg-[#15803D] text-white space-y-2 text-center shadow-md border-0">
              <div className="font-black text-base flex items-center justify-center gap-2">
                <Smile className="w-5 h-5 text-white stroke-[2.5]" />
                <span>{t("ready", "Siparişiniz hazır, teslim alabilirsiniz.")}</span>
              </div>
              <p className="text-xs text-white/95 font-medium leading-relaxed">
                {t("readyMsg", "Lütfen servis tezgahından siparişinizi teslim alınız. Afiyet olsun!")}
              </p>
            </div>
          )}

          {isServed && (
            <div className="p-5 rounded-2xl bg-[#15803D] text-white space-y-2 text-center shadow-md border-0">
              <div className="font-black text-base flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-white stroke-[2.5]" />
                <span>{t("served", "Siparişiniz teslim edildi.")}</span>
              </div>
              <p className="text-xs text-white/95 font-medium leading-relaxed">
                {t("servedMsg", "Bizi tercih ettiğiniz için teşekkür ederiz. Afiyet olsun!")}
              </p>
            </div>
          )}

          {/* QR Code (Seamless & Clean) */}
          {qrDataUrl && (isUnpaid || order.payment_status === "unpaid") && !isServed && !isCancelled && (
            <div className="flex flex-col items-center pt-2 pb-1 space-y-2">
              <div className="relative w-44 h-44">
                <Image
                  src={qrDataUrl}
                  alt="Sipariş QR Kodu"
                  fill
                  sizes="176px"
                  className="object-contain"
                  priority
                />
              </div>

              <p className="text-[11px] font-bold text-stone-400 text-center max-w-xs leading-tight">
                {language === "en"
                  ? "Scan at the cashier if you want to quickly match your order."
                  : language === "ru"
                  ? "Отсканируйте на кассе для быстрого поиска заказа."
                  : "Siparişinizi kasada hızlıca eşleştirmek isterseniz okutunuz."}
              </p>
            </div>
          )}
        </div>

        {/* Google Review & Experience Rating Card (Shown when order is served) */}
        {isServed && (
          <div className="bg-gradient-to-b from-white via-white to-[#FAF4EE] rounded-[30px] p-6 shadow-md border border-[#683B0C]/15 text-center space-y-4 animate-fadeIn relative overflow-hidden">
            {/* 5 Big Gold Stars */}
            <div>
              <a
                href="https://www.google.com/search?hl=en-TR&sxsrf=APpeQnvZaCTMY0gIJGPQqVmkLF9XDdBJzw:1787759720789&q=Noa+Croissant+Reviews&rflfq=1&num=20&stick=H4sIAAAAAAAAAONgkxIxNDQzNDEwMTIwNjA3NzM3MTU3Md7AyPiKUdQvP1HBuSg_s7g4Ma9EISi1LDO1vHgRK3ZxAF8h3qNLAAAA&rldimm=11614042030776745743&tbm=lcl&dpr=2#"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 py-1 group cursor-pointer transition-transform active:scale-95"
                aria-label="Google Review"
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-8 h-8 fill-amber-400 text-amber-400 drop-shadow-xs transition-transform duration-200 group-hover:scale-110 hover:!scale-125"
                  />
                ))}
              </a>
            </div>

            {/* Title and Description */}
            <div className="space-y-1">
              <h2 className="font-editorial text-2xl font-bold text-[#381D05]">
                {t("shareExperience", "Deneyiminizi paylaşın.")}
              </h2>
              <p className="text-xs text-[#5C3818] leading-relaxed max-w-xs mx-auto">
                {t(
                  "reviewDesc",
                  "Görüşleriniz bizim için çok değerli. Google üzerinde deneyiminizi puanlayarak gelişimimize katkıda bulunun."
                )}
              </p>
            </div>

            {/* Google Themed Action CTA Button */}
            <a
              href="https://www.google.com/search?hl=en-TR&sxsrf=APpeQnvZaCTMY0gIJGPQqVmkLF9XDdBJzw:1787759720789&q=Noa+Croissant+Reviews&rflfq=1&num=20&stick=H4sIAAAAAAAAAONgkxIxNDQzNDEwMTIwNjA3NzM3MTU3Md7AyPiKUdQvP1HBuSg_s7g4Ma9EISi1LDO1vHgRK3ZxAF8h3qNLAAAA&rldimm=11614042030776745743&tbm=lcl&dpr=2#"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-[#4285F4] hover:bg-[#3367D6] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-xs shrink-0">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <span>{t("rateOnGoogle", "Google'da Değerlendirin")}</span>
            </a>
          </div>
        )}

        {/* Instagram Discovery Card (Visible ONLY while order is preparing, placed ABOVE Order Summary) */}
        {isPreparing && (
          <div className="bg-white rounded-[32px] p-6 text-center border border-white/80 shadow-md space-y-4 animate-fadeIn">
            {/* Frameless NOA Emblem with Instagram Gradient Lines */}
            <div className="flex items-center justify-center pt-1">
              <div className="relative w-16 h-16 transition-transform duration-300 hover:scale-110 drop-shadow-sm">
                <Image
                  src="/brand/noa-icon-insta.png"
                  alt="NOA Instagram Emblem"
                  fill
                  sizes="64px"
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Title and Description */}
            <div className="space-y-1.5">
              <h2 className="font-editorial text-2xl font-bold text-[#381D05]">
                <span className="bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] bg-clip-text text-transparent font-black">
                  Instagram&apos;da
                </span>{" "}
                <span>buluşalım.</span>
              </h2>
              <p className="text-xs text-[#5C3818] leading-relaxed max-w-xs mx-auto font-medium">
                Sıcak lezzetleriniz hazırlanana kadar
                <span className="block mt-0.5">
                  <strong className="font-black text-[#381D05]">NOA Croissant</strong> dünyasını keşfedin.
                </span>
              </p>
            </div>

            {/* Instagram Themed Action CTA Button */}
            <a
              href={BUSINESS_INFO.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] hover:opacity-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
            >
              <Instagram className="w-4.5 h-4.5 text-white stroke-[2.4] shrink-0" />
              <span className="leading-none pt-0.5">@noacroissant hesabına göz at</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-90 shrink-0 ml-0.5" />
            </a>
          </div>
        )}

        {/* Order Details Receipt Card */}
        <div className="bg-white rounded-[28px] p-6 shadow-md border border-[#683B0C]/15 space-y-4">
          <div className="flex items-center justify-between border-b border-[#683B0C]/10 pb-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#381D05]">
              {t("orderSummary", "Sipariş Özeti")}
            </span>
            <span className="text-xs text-[#8C5828]">
              {formatDateTime(order.created_at)}
            </span>
          </div>

          {/* Items List */}
          <div className="divide-y divide-dashed divide-[#683B0C]/10">
            {order.items.map((item) => {
              const rawOpts = (item as any).options || (item as any).selected_options || [];
              const formattedOpts = getSortedAndFormattedOptionsLocalized(rawOpts, language);
              const displayName = resolveLocalizedText(
                (item as any).product_name_i18n || item.product_name,
                language
              );

              return (
                <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3 text-xs">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="font-bold text-[#381D05]">
                      {displayName} <span className="text-[#8C5828]">x{item.quantity}</span>
                    </div>
                    {formattedOpts.length > 0 && (
                      <div className="mt-1 space-y-0.5 text-[11.5px] text-[#8C5828] font-sans">
                        {formattedOpts.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 leading-snug">
                            <span className="text-[#8C5828]/60 text-[10px]">↳</span>
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {item.item_note && (
                      <div className="text-[10.5px] italic text-[#8C5828] mt-1 pl-3">
                        {t("notePrefix", "Not")}: {item.item_note}
                      </div>
                    )}
                  </div>

                  <span className="font-black text-[#381D05] font-sans shrink-0">
                    {formatLocalizedPrice(item.total_price, language)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Total Row */}
          <div className="pt-3 border-t border-[#683B0C]/15 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[#381D05]">
              {t("totalAmount", "Toplam Tutar")}
            </span>
            <span className="text-xl font-black text-[#15803D] font-sans">
              {formatLocalizedPrice(order.total, language)}
            </span>
          </div>

          {/* Payment Method Row */}
          <div className="pt-2.5 border-t border-dashed border-[#683B0C]/10 flex items-center justify-between text-xs">
            <span className="font-bold text-[#381D05]">
              {t("paymentMethodLabel", "Ödeme Yöntemi:")}
            </span>
            {order.payment_method === "credit_card" ? (
              <span className="inline-flex items-center gap-1.5 font-black text-[#15803D]">
                <CreditCard className="w-3.5 h-3.5 text-[#15803D]" />
                {t("creditCard", "Kredi Kartı")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-black text-[#15803D]">
                <Banknote className="w-3.5 h-3.5 text-[#15803D]" />
                {t("cash", "Nakit")}
              </span>
            )}
          </div>
        </div>

        {/* Helpful Screen Stay Notice / Completed message / Cancelled Action */}
        <div className="pt-2 pb-4 px-4 text-center space-y-2">
          {isCancelled ? (
            <Link
              href="/"
              className="w-full py-3.5 px-6 rounded-2xl bg-[#381D05] hover:bg-[#251202] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span>{t("newOrder", "Menüye Dön & Yeni Sipariş Ver")}</span>
            </Link>
          ) : !isServed ? (
            <div className="space-y-0.5">
              <p className="text-[11px] sm:text-xs font-bold text-[#5C3818] whitespace-nowrap text-center leading-tight">
                {t("screenStayNotice", "Siparişiniz tamamlanana kadar lütfen bu ekrandan ayrılmayınız.")}
              </p>
              <p className="text-[11px] font-bold text-stone-400 text-center leading-tight">
                {t("instantStatusUpdate", "Durum anlık olarak bu ekranda güncellenecektir.")}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center pt-3 opacity-80">
              <span className="text-[13px] sm:text-[14px] font-black uppercase tracking-[0.25em] text-[#683B0C] inline-flex items-center">
                NOA CROISSANT<span className="text-[14px] font-black ml-0.5">®</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
