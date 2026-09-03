"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  Coffee,
  Gift,
  Check,
  Sparkles,
  Phone,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  LogOut,
  ChevronRight,
  Clock,
  Award,
  AlertCircle,
  QrCode,
} from "lucide-react";
import { auth, isFirebaseConfigured } from "@/lib/firebase/config";
import {
  LoyaltyCard,
  formatPhoneNumberTR,
  toE164PhoneTR,
  getStoredCustomerPhone,
  setStoredCustomerPhone,
  fetchLoyaltyCard,
  redeemFreeCoffee,
} from "@/lib/loyalty";
import {
  Language,
  getTranslation,
  translateLoyaltyRewardName,
  translateLoyaltyHistory,
} from "@/lib/i18n/translations";

interface LoyaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardUpdated?: (card: LoyaltyCard) => void;
  requiredStamps?: number;
  rewardName?: string;
  language?: Language;
}

const DATE_LOCALE_MAP: Record<Language, string> = {
  tr: "tr-TR",
  en: "en-US",
  de: "de-DE",
  ru: "ru-RU",
  nl: "nl-NL",
  sv: "sv-SE",
  no: "nb-NO",
  fi: "fi-FI",
  pl: "pl-PL",
  ar: "ar-SA",
};

export function LoyaltyModal({
  isOpen,
  onClose,
  onCardUpdated,
  requiredStamps = 7,
  rewardName = "Kahve",
  language = "tr",
}: LoyaltyModalProps) {
  const targetStamps = requiredStamps > 0 ? requiredStamps : 7;
  const t = (key: string, fallback?: string) => getTranslation(language, key, fallback);
  const cleanRewardName = translateLoyaltyRewardName(rewardName, language);

  // Authentication & Phone State
  const [phoneInput, setPhoneInput] = useState<string>("");
  const [otpInput, setOtpInput] = useState<string>("");
  const [step, setStep] = useState<"phone" | "otp" | "card">("phone");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // Active Loyalty Card Data
  const [card, setCard] = useState<LoyaltyCard | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [redeemSuccess, setRedeemSuccess] = useState<boolean>(false);

  const recaptchaVerifierRef = useRef<any>(null);

  // Load existing session on open
  useEffect(() => {
    if (!isOpen) return;

    const storedPhone = getStoredCustomerPhone();
    if (storedPhone) {
      setIsLoading(true);
      fetchLoyaltyCard(storedPhone)
        .then((c) => {
          setCard(c);
          setStep("card");
          if (onCardUpdated) onCardUpdated(c);
        })
        .catch(() => {
          setStep("phone");
        })
        .finally(() => setIsLoading(false));
    } else {
      setStep("phone");
    }
  }, [isOpen]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Phone input formatting handler
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setPhoneInput(formatPhoneNumberTR(raw));
    setErrorMsg(null);
  };

  // Step 1: Send SMS Code via Firebase Phone Auth
  const handleSendSms = async (e: React.FormEvent) => {
    if (e && "preventDefault" in e) e.preventDefault();
    setErrorMsg(null);

    const digits = phoneInput.replace(/\D/g, "");
    if (digits.length < 10) {
      setErrorMsg(
        t(
          "invalidPhoneError",
          "Lütfen geçerli bir 10 haneli cep telefonu numarası giriniz (5XX XXX XX XX)."
        )
      );
      return;
    }

    const e164 = toE164PhoneTR(phoneInput);
    setIsLoading(true);

    try {
      if (isFirebaseConfigured && auth && typeof window !== "undefined") {
        const { RecaptchaVerifier, signInWithPhoneNumber } = await import("firebase/auth");

        auth.languageCode = language || "tr";

        // localhost does NOT support Firebase Phone Auth (Google restriction).
        // Enable test mode so reCAPTCHA is bypassed on localhost/dev.
        const isLocalhost =
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1";
        if (isLocalhost) {
          // @ts-ignore
          auth.settings.appVerificationDisabledForTesting = true;
        }

        // Reset verifier if it exists (needed for resend)
        if (recaptchaVerifierRef.current) {
          try { recaptchaVerifierRef.current.clear(); } catch {}
          recaptchaVerifierRef.current = null;
        }

        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: () => {},
          "expired-callback": () => {
            recaptchaVerifierRef.current = null;
            setErrorMsg(
              t(
                "securityTimeoutError",
                "Güvenlik doğrulaması zaman aşımına uğradı. Lütfen tekrar deneyin."
              )
            );
          },
        });

        const confirmation = await signInWithPhoneNumber(auth, e164, recaptchaVerifierRef.current);
        setConfirmationResult(confirmation);
        setStep("otp");
        setResendTimer(60);
      } else {
        // Firebase not configured — local dev mode (no real SMS)
        setStep("otp");
        setResendTimer(60);
      }
    } catch (err: any) {
      // Reset verifier so user can retry
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch {}
        recaptchaVerifierRef.current = null;
      }

      const code = err?.code || "";
      console.error("Firebase SMS error:", code, err);

      if (code === "auth/invalid-phone-number") {
        setErrorMsg(
          t(
            "invalidPhoneErrorShort",
            "Geçersiz telefon numarası. Lütfen 05XX ile başlayan numaranızı girin."
          )
        );
      } else if (code === "auth/too-many-requests") {
        setErrorMsg(
          t(
            "tooManySmsError",
            "Bu numaraya çok fazla SMS gönderildi. Lütfen birkaç dakika bekleyin."
          )
        );
      } else if (code === "auth/quota-exceeded") {
        setErrorMsg(
          t("quotaExceededError", "SMS kotası doldu. Lütfen daha sonra tekrar deneyin.")
        );
      } else if (code === "auth/captcha-check-failed" || code === "auth/missing-app-credential") {
        setErrorMsg(
          t(
            "securityCheckFailed",
            "Güvenlik doğrulaması başarısız. Sayfayı yenileyip tekrar deneyin."
          )
        );
      } else if (code === "auth/app-not-authorized" || code === "auth/unauthorized-domain") {
        setErrorMsg(
          t(
            "unauthorizedDomainError",
            "Bu domain SMS gönderimine yetkili değil. Lütfen yöneticiyle iletişime geçin."
          )
        );
      } else {
        setErrorMsg(
          t("smsSendFailed", "SMS gönderilemedi. Lütfen tekrar deneyin.")
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify 6-digit OTP Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (otpInput.trim().length < 6) {
      setErrorMsg(
        t(
          "incompleteOtpError",
          "Lütfen 6 haneli doğrulama kodunu eksiksiz giriniz."
        )
      );
      return;
    }

    setIsLoading(true);
    const e164 = toE164PhoneTR(phoneInput);

    try {
      if (confirmationResult) {
        // Firebase Phone Auth — strict OTP check
        await confirmationResult.confirm(otpInput.trim());
        const userCard = await fetchLoyaltyCard(e164);
        setCard(userCard);
        setStoredCustomerPhone(e164);
        setStep("card");
        if (onCardUpdated) onCardUpdated(userCard);
      } else {
        // Firebase not configured (local dev) — skip OTP verification
        const userCard = await fetchLoyaltyCard(e164);
        setCard(userCard);
        setStoredCustomerPhone(e164);
        setStep("card");
        if (onCardUpdated) onCardUpdated(userCard);
      }
    } catch (err: any) {
      const errorCode = err?.code || "";
      const errorMsgText = String(err?.message || "");

      if (
        errorCode === "auth/invalid-verification-code" ||
        errorMsgText.includes("invalid-verification-code") ||
        errorCode === "auth/missing-code"
      ) {
        setErrorMsg(
          t(
            "invalidOtpError",
            "Girdiğiniz kod hatalı. Lütfen SMS'teki 6 haneli kodu kontrol edin."
          )
        );
      } else if (errorCode === "auth/code-expired" || errorMsgText.includes("code-expired")) {
        setErrorMsg(
          t(
            "otpExpiredError",
            "Doğrulama kodunun süresi doldu. Lütfen yeni kod isteyin."
          )
        );
      } else if (errorCode === "auth/too-many-requests" || errorMsgText.includes("too-many-requests")) {
        setErrorMsg(
          t(
            "tooManyAttemptsError",
            "Çok fazla deneme yapıldı. Lütfen birkaç dakika bekleyin."
          )
        );
      } else {
        setErrorMsg(
          t("verificationFailed", "Doğrulama başarısız. Kodu kontrol edip tekrar deneyin.")
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Refresh Card Stamps
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefreshCard = async () => {
    if (!card || !card.phone_number) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/loyalty?phone=${encodeURIComponent(card.phone_number)}&_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.card) {
          setCard(data.card);
          if (onCardUpdated) onCardUpdated(data.card);
        }
      } else {
        const refreshed = await fetchLoyaltyCard(card.phone_number);
        setCard(refreshed);
        if (onCardUpdated) onCardUpdated(refreshed);
      }
    } catch (e) {
      const refreshed = await fetchLoyaltyCard(card.phone_number);
      setCard(refreshed);
      if (onCardUpdated) onCardUpdated(refreshed);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Step 4: Redeem free coffee voucher at cashier
  const handleRedeem = async () => {
    if (!card || card.rewards_count <= 0) return;
    setIsLoading(true);
    try {
      const updated = await redeemFreeCoffee(card.phone_number);
      setCard(updated);
      setRedeemSuccess(true);
      setTimeout(() => setRedeemSuccess(false), 4000);
      if (onCardUpdated) onCardUpdated(updated);
    } catch (e: any) {
      setErrorMsg(
        e?.message ||
          t("rewardRedeemError", "Hediye kahve teslim işlemi gerçekleştirilemedi.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 5: Logout customer from this device
  const handleLogout = () => {
    setStoredCustomerPhone(null);
    setCard(null);
    setPhoneInput("");
    setOtpInput("");
    setStep("phone");
    if (onCardUpdated) {
      onCardUpdated({
        id: "",
        phone_number: "",
        stamps: 0,
        rewards_count: 0,
        total_stamps_all_time: 0,
        history: [],
        created_at: "",
        updated_at: "",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      {/* Invisible reCAPTCHA container required by Firebase Phone Auth */}
      <div id="recaptcha-container" />

      <div className="relative w-full max-w-md bg-[#FAF7F2] border border-[#683B0C]/15 rounded-[28px] shadow-[0_20px_60px_rgba(56,29,5,0.2)] overflow-hidden flex flex-col max-h-[92vh] text-[#381D05]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-[#683B0C]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#D1A37A]/40 bg-[#FAF7F2] shadow-xs shrink-0 flex items-center justify-center">
              <Image
                src="/noa_icon.jpg"
                alt="NOA"
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <h3 className="font-editorial text-base font-black tracking-wide text-[#381D05]">
                {t("loyaltyCardClub", "NOA KAHVE KARTI")}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
            title={t("close", "Kapat")}
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: PHONE NUMBER INPUT */}
          {step === "phone" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center space-y-3 pt-1">
                <div className="w-20 h-20 rounded-full overflow-hidden border border-[#D1A37A]/40 bg-[#FAF7F2] mx-auto shadow-sm flex items-center justify-center">
                  <Image
                    src="/noa_icon.jpg"
                    alt="NOA"
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <h4 className="font-editorial text-2xl font-black text-[#381D05]">
                    {t("digitalCoffeeCard", "Dijital Kahve Kartınız")}
                  </h4>
                  <div className="text-xs sm:text-[13px] text-stone-600 leading-relaxed max-w-md mx-auto mt-2 space-y-1">
                    <p className="font-semibold text-stone-500">
                      {language === "tr" ? "Fiziksel kart taşıma derdine son!" : ""}
                    </p>
                    <p className="text-stone-700">
                      {language === "tr" ? (
                        <>
                          Her kahvede <strong className="font-extrabold text-[#381D05]">1 damga</strong> toplayın, <strong className="font-extrabold text-[#381D05]">{targetStamps} damgaya</strong> ulaştığınızda dilediğiniz kahveyi <strong className="font-extrabold text-[#15803D]">hediye</strong> kazanın.
                        </>
                      ) : (
                        t(
                          "loyaltyDescription",
                          "Fiziksel kart taşıma derdine son! NOA'da aldığınız her kahvede 1 damga toplayın, {targetStamps} damgaya ulaştığınızda dilediğiniz kahveyi hediye kazanın."
                        ).replace("{targetStamps}", targetStamps.toString())
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSendSms} className="space-y-4 pt-1">
                <div>
                  <label className="block text-[11px] font-black text-[#381D05] uppercase tracking-wider mb-2">
                    {t("phoneNumberLabel", "Cep Telefon Numaranız")}
                  </label>
                  
                  {/* Clean Non-Overlapping Input with Dedicated Country Pill */}
                  <div className="flex items-center rounded-2xl bg-white border border-[#683B0C]/20 focus-within:border-[#381D05] focus-within:ring-2 focus-within:ring-[#381D05]/10 overflow-hidden transition-all shadow-xs">
                    <div className="pl-4 pr-3 py-3.5 flex items-center gap-1.5 text-xs font-black text-[#381D05] border-r border-[#683B0C]/15 select-none shrink-0">
                      <span>🇹🇷</span>
                      <span className="font-mono font-bold">+90</span>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phoneInput}
                      onChange={handlePhoneChange}
                      placeholder="(5XX) XXX XX XX"
                      maxLength={15}
                      autoFocus
                      className="w-full px-4 py-3.5 bg-transparent text-[#381D05] font-mono font-bold text-sm sm:text-base placeholder:text-stone-400 focus:outline-none tracking-wider"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                    <span>{t("smsNotice", "Giriş yaptığınızda telefonunuza 6 haneli SMS onay kodu iletilir.")}</span>
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold flex items-center gap-2 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || phoneInput.replace(/\D/g, "").length < 10}
                  className="w-full py-4 rounded-2xl bg-[#381D05] hover:bg-[#251202] disabled:opacity-50 text-white font-black text-xs shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#D1A37A]" />
                  ) : (
                    <>
                      <span>{t("sendSmsCode", "SMS Doğrulama Kodu Gönder")}</span>
                      <ArrowRight className="w-4 h-4 text-[#D1A37A]" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: SMS OTP VERIFICATION */}
          {step === "otp" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center space-y-2 pt-1">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-[#D1A37A]/40 bg-[#FAF7F2] mx-auto shadow-sm flex items-center justify-center">
                  <Image
                    src="/noa_icon.jpg"
                    alt="NOA"
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
                <h4 className="font-editorial text-2xl font-black text-[#381D05]">
                  {t("enterSmsCode", "SMS Onay Kodunu Girin")}
                </h4>
                <p className="text-xs text-stone-600">
                  {t("smsSentNotice", "adresine 6 haneli güvenlik kodu iletildi.").replace(
                    "{phone}",
                    phoneInput || ""
                  )}
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1">
                <div>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => {
                      setOtpInput(e.target.value.replace(/\D/g, ""));
                      setErrorMsg(null);
                    }}
                    placeholder="••••••"
                    autoFocus
                    className="w-full py-4 px-4 rounded-2xl border-2 border-stone-300 bg-white text-center text-2xl font-mono font-black tracking-[0.4em] text-[#381D05] focus:outline-none focus:border-[#381D05] focus:ring-2 focus:ring-[#381D05]/10 shadow-xs"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold flex items-center gap-2 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || otpInput.trim().length < 6}
                  className="w-full py-4 rounded-2xl bg-[#15803D] hover:bg-[#166534] disabled:opacity-50 text-white font-black text-xs shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{t("verifyCodeAndOpenCard", "Kodu Doğrula & Kartımı Aç")}</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("phone");
                      setErrorMsg(null);
                    }}
                    className="text-stone-500 hover:text-[#381D05] font-bold transition-colors cursor-pointer"
                  >
                    {t("changeNumber", "← Numarayı Değiştir")}
                  </button>

                  <button
                    type="button"
                    disabled={resendTimer > 0 || isLoading}
                    onClick={handleSendSms}
                    className="text-[#8C5828] hover:text-[#381D05] font-bold disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    {resendTimer > 0
                      ? t("resendInSeconds", `Tekrar Gönder (${resendTimer}s)`).replace(
                          "{n}",
                          resendTimer.toString()
                        )
                      : t("resendCode", "Kodu Tekrar Gönder")}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: AUTHENTICATED LUXURY DIGITAL STAMP CARD */}
          {step === "card" && card && (
            <div className="space-y-5 animate-fadeIn">
              {/* Luxury Digital Card */}
              <div className="relative rounded-3xl bg-[#381D05] p-5 text-white shadow-xl border border-[#683B0C]/30 overflow-hidden space-y-4">
                {/* Card Top Row */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-[#D1A37A]/40 bg-[#FAF7F2]">
                      <Image
                        src="/noa_icon.jpg"
                        alt="NOA"
                        width={36}
                        height={36}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest block">
                        {t("loyaltyCardClub", "NOA LOYALTY CARD")}
                      </span>
                      <span className="font-mono text-xs text-stone-300 font-bold">
                        {card.phone_number}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRefreshCard}
                    disabled={isRefreshing}
                    title={t("refreshStamps", "Damgaları Yenile")}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-stone-300 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-300" : ""}`} />
                  </button>
                </div>

                {/* DYNAMIC STAMP SLOTS */}
                <div className="space-y-2 relative z-10 pt-1">
                  <div
                    className="grid gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${Math.min(targetStamps, 6)}, minmax(0, 1fr))`,
                    }}
                  >
                    {Array.from({ length: targetStamps }, (_, i) => i + 1).map((slotNumber) => {
                      const isStamped = card.stamps >= slotNumber;
                      const isGiftSlot = slotNumber === targetStamps;

                      return (
                        <div
                          key={slotNumber}
                          className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-1 border transition-all ${
                            isStamped
                              ? "bg-[#15803D] border-[#22C55E] text-white shadow-xs"
                              : isGiftSlot
                              ? "bg-[#251202] border-dashed border-emerald-500/70 text-emerald-300"
                              : "bg-[#2A1503] border-dashed border-[#683B0C] text-[#D1A37A]"
                          }`}
                        >
                          {isStamped ? (
                            <div className="flex flex-col items-center">
                              <Check className="w-4 h-4 stroke-[3] text-white" />
                              <span className="text-[9px] font-black mt-0.5 text-white">#{slotNumber}</span>
                            </div>
                          ) : isGiftSlot ? (
                            <div className="flex flex-col items-center text-emerald-300">
                              <Gift className="w-4 h-4" />
                              <span className="text-[8px] font-black uppercase mt-0.5 text-emerald-300">
                                {t("gift", "HEDİYE")}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <div className="w-4 h-4 rounded-full overflow-hidden opacity-50 shrink-0">
                                <Image
                                  src="/noa_icon.jpg"
                                  alt="NOA"
                                  width={16}
                                  height={16}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                              <span className="text-[8px] font-bold text-[#D1A37A] mt-0.5">{slotNumber}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress message */}
                  <div className="text-center pt-1">
                    <p className="text-xs font-bold text-stone-300">
                      {card.stamps === 0 ? (
                        t(
                          "stampsZeroMsg",
                          `Her siparişte 1 damga kazanın, ${targetStamps}. damgada ${cleanRewardName} hediye!`
                        )
                          .replace("{targetStamps}", targetStamps.toString())
                          .replace("{rewardName}", cleanRewardName)
                      ) : card.stamps < targetStamps ? (
                        <span>
                          {t(
                            "stampsProgressMsg",
                            `{stamps} / {targetStamps} Damga — {remaining} damga sonra {rewardName}!`
                          )
                            .replace("{stamps}", card.stamps.toString())
                            .replace("{targetStamps}", targetStamps.toString())
                            .replace("{remaining}", (targetStamps - card.stamps).toString())
                            .replace("{rewardName}", cleanRewardName)}
                        </span>
                      ) : (
                        <span className="text-emerald-300 font-black">
                          {t(
                            "stampsCompletedMsg",
                            `Tebrikler! ${targetStamps} damgayı tamamladınız!`
                          ).replace("{targetStamps}", targetStamps.toString())}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* EARNED FREE COFFEE VOUCHER (IF AVAILABLE) */}
              {card.rewards_count > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-[#381D05] shadow-lg border border-amber-300 space-y-3 animate-bounce-subtle">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="w-6 h-6 text-[#381D05]" />
                      <div>
                        <h5 className="font-editorial text-sm font-black uppercase tracking-wider text-[#381D05]">
                          {t(
                            "freeRewardVoucherTitle",
                            `1 Adet Hediye ${cleanRewardName} Kuponu (${card.rewards_count} Adet)`
                          )
                            .replace("{rewardName}", cleanRewardName)
                            .replace("{count}", card.rewards_count.toString())}
                        </h5>
                        <p className="text-[11px] font-semibold text-[#381D05]/80">
                          {t(
                            "freeRewardVoucherSubtitle",
                            "Kasada baristaya bu kodu göstererek dilediğiniz kahveyi ücretsiz alın."
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/90 p-3 rounded-xl flex items-center justify-between border border-amber-600/30">
                    <div>
                      <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest block">
                        {t("codeForCashier", "KASAYA GÖSTERİLECEK KOD")}
                      </span>
                      <span className="font-mono text-xl font-black text-[#381D05] tracking-wider">
                        #NOA-{card.redeem_code || "7842"}
                      </span>
                    </div>

                    <button
                      onClick={handleRedeem}
                      disabled={isLoading}
                      className="px-4 py-2 rounded-xl bg-[#381D05] hover:bg-[#251202] text-white font-black text-xs shadow transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />
                      <span>{t("markAsRedeemed", "Kullanıldı Yap")}</span>
                    </button>
                  </div>

                  {redeemSuccess && (
                    <div className="text-center text-xs font-black text-emerald-900 bg-emerald-100/90 py-1.5 rounded-lg border border-emerald-300">
                      {t("rewardRedeemedSuccess", "Hediye kahveniz teslim alındı! Afiyet olsun.")}
                    </div>
                  )}
                </div>
              )}

              {/* HOW IT WORKS ACCORDION */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#683B0C]/15 space-y-1.5 text-xs">
                <div className="text-[#381D05] font-black">
                  <span>{t("howToCollectStamps", "Nasıl Damga Toplarım?")}</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  {t(
                    "howToCollectStampsDesc",
                    `Kasada sipariş verirken telefon numaranızı (${card.phone_number}) baristaya iletebilir veya dijital sipariş vererek her kahvenizde otomatik damga kazanabilirsiniz.`
                  ).replace("{phone}", card.phone_number)}
                </p>
              </div>

              {/* HISTORY TOGGLE */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowHistory((prev) => !prev)}
                  className="w-full py-2 text-xs font-bold text-[#8C5828] hover:text-[#381D05] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{showHistory ? t("hideHistory", "Geçmişi Gizle") : t("viewHistory", "İşlem Geçmişini Görüntüle")}</span>
                </button>

                {showHistory && (
                  <div className="bg-white rounded-2xl p-3 border border-[#683B0C]/15 max-h-44 overflow-y-auto space-y-2 text-xs">
                    {card.history && card.history.length > 0 ? (
                      card.history.map((h) => (
                        <div key={h.id} className="pb-2 border-b border-stone-100 last:border-0 last:pb-0 flex items-start gap-2">
                          <span className="text-amber-600 font-bold mt-0.5">•</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[#381D05] text-[11px]">
                              {translateLoyaltyHistory(h.description, language)}
                            </p>
                            <span className="text-[9px] text-stone-400 font-mono">
                              {new Date(h.date).toLocaleDateString(
                                DATE_LOCALE_MAP[language] || "tr-TR",
                                {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-stone-400 text-center py-2 text-[11px]">
                        {t("noHistoryRecords", "Henüz işlem kaydı bulunmuyor.")}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* CARD FOOTER (LOGOUT) */}
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs">
                <span className="text-[11px] text-stone-500 font-medium">
                  {t("totalStampsAllTime", "Toplam Damga:")}{" "}
                  <strong className="text-[#381D05]">{card.total_stamps_all_time}</strong>
                </span>

                <button
                  onClick={handleLogout}
                  className="text-stone-500 hover:text-red-700 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t("logout", "Çıkış Yap")}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
