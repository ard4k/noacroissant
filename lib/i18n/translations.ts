export type Language = "tr" | "en" | "de" | "ru" | "nl" | "sv" | "no" | "fi" | "pl" | "ar";

export interface LanguageInfo {
  code: Language;
  name: string;
  flag: string;
  nativeName: string;
  isRtl?: boolean;
}

export const LANGUAGES: LanguageInfo[] = [
  {
    "code": "tr",
    "name": "Türkçe",
    "flag": "🇹🇷",
    "nativeName": "Türkçe"
  },
  {
    "code": "en",
    "name": "English",
    "flag": "🇬🇧",
    "nativeName": "English"
  },
  {
    "code": "de",
    "name": "Deutsch",
    "flag": "🇩🇪",
    "nativeName": "Deutsch"
  },
  {
    "code": "ru",
    "name": "Русский",
    "flag": "🇷🇺",
    "nativeName": "Русский"
  },
  {
    "code": "nl",
    "name": "Nederlands",
    "flag": "🇳🇱",
    "nativeName": "Nederlands"
  },
  {
    "code": "sv",
    "name": "Svenska",
    "flag": "🇸🇪",
    "nativeName": "Svenska"
  },
  {
    "code": "no",
    "name": "Norsk",
    "flag": "🇳🇴",
    "nativeName": "Norsk"
  },
  {
    "code": "fi",
    "name": "Suomi",
    "flag": "🇫🇮",
    "nativeName": "Suomi"
  },
  {
    "code": "pl",
    "name": "Polski",
    "flag": "🇵🇱",
    "nativeName": "Polski"
  },
  {
    "code": "ar",
    "name": "العربية",
    "flag": "🇸🇦",
    "nativeName": "العربية",
    "isRtl": true
  }
];

export const SUPPORTED_LANGUAGES: Language[] = ["tr", "en", "de", "ru", "nl", "sv", "no", "fi", "pl", "ar"];
export const LANGUAGE_OPTIONS = LANGUAGES;

export function detectDeviceLanguage(): Language {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "tr";
  }

  // 1. If user previously chose a language manually, respect their preference
  try {
    const saved =
      localStorage.getItem("noa_preferred_lang") ||
      localStorage.getItem("noa_language");
    if (saved && (SUPPORTED_LANGUAGES as string[]).includes(saved)) {
      return saved as Language;
    }
  } catch (e) {}

  // 2. Detect phone / device OS language from navigator
  const browserLangs = navigator.languages && navigator.languages.length > 0
    ? navigator.languages
    : [navigator.language || (navigator as any).userLanguage || ""];

  for (const langStr of browserLangs) {
    if (!langStr || typeof langStr !== "string") continue;
    const cleanLang = langStr.toLowerCase().split("-")[0].split("_")[0].trim();

    if (cleanLang === "tr") return "tr";
    if (cleanLang === "en") return "en";
    if (cleanLang === "de") return "de";
    if (cleanLang === "ru") return "ru";
    if (cleanLang === "nl") return "nl";
    if (cleanLang === "sv") return "sv";
    if (cleanLang === "no" || cleanLang === "nb" || cleanLang === "nn") return "no";
    if (cleanLang === "fi") return "fi";
    if (cleanLang === "pl") return "pl";
    if (cleanLang === "ar") return "ar";
  }

  return "tr";
}

export function savePreferredLanguage(lang: Language) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("noa_preferred_lang", lang);
    localStorage.setItem("noa_language", lang);
    document.cookie = `noa_lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  } catch (e) {}
}

export const UI_TRANSLATIONS: Record<Language, Record<string, string>> = {
  "tr": {
    "searchPlaceholder": "Ürün veya lezzet ara...",
    "menuTitle": "NOA Menü & Sipariş",
    "myCart": "Sepetim",
    "emptyCart": "Sepetiniz Boş",
    "emptyCartDesc": "Menüden dilediğiniz lezzetleri seçerek sepetinize ekleyebilirsiniz.",
    "showToCashier": "Kasaya Göster",
    "completeOrder": "Siparişi Tamamla",
    "clearCart": "Sepeti Temizle",
    "total": "Toplam",
    "subtotal": "Ara Toplam",
    "addToCart": "Sepete Ekle",
    "customize": "Tıkla & Özelleştir",
    "quickAdd": "Hızlı Ekle",
    "smartUpsellTitle": "Kruvasanının yanına nefis bir eşlikçi!",
    "smartUpsellAdd": "Ekle",
    "orderNumber": "Sipariş Numaranız",
    "paymentWaiting": "Ödeme bekleniyor...",
    "preparing": "Ödeme onaylandı, sipariş hazırlanıyor...",
    "ready": "Siparişiniz hazır, teslim alabilirsiniz.",
    "served": "Siparişiniz teslim edildi.",
    "cancelled": "Siparişiniz iptal edildi.",
    "orderSummary": "Sipariş Özeti",
    "paymentMethod": "Ödeme Yöntemi",
    "creditCard": "Kredi Kartı",
    "cash": "Nakit",
    "backToMenu": "Menüye Dön",
    "newOrder": "Menüye Dön & Yeni Sipariş Ver",
    "freeTeaBadge": "Tuzlu kruvasanınızın yanında sıcak ikram çayınızı seçebilirsiniz!",
    "freeTeaOption": "İkram Çayımı İstiyorum",
    "dailyFresh": "GÜNLÜK TAZE ÜRETİLMEKTEDİR.",
    "prepTime": "10-15 DAKİKA HAZIRLANMA SÜRESİ VARDIR.",
    "noaMenusNotice": "NOA ÖZEL FORMÜLLÜ SPESİYAL MENÜLER VE KENDİN OLUŞTUR SEÇENEKLERİ.",
    "amoraNotice": "NOA İKONİK KALP FORMUNDA ÖZEL ÇİKOLATALI VE DOLGULU KRUVASANLAR.",
    "freshPastry": "FRANSIZ TEREYAĞI İLE HER SABAH FIRINDAN TAZE ÇIKAN LEZZETLER.",
    "rollNotice": "SİLİNDİRİK FRANSIZ ROLL HAMURU VE AKIŞKAN DOLGU İLE SERVİS EDİLİR.",
    "cubeNotice": "GEOMETRİK KÜP FORMUNDA ÖZEL FIRINLANMIŞ KATMANLI KRUVASANLAR.",
    "twissyNotice": "BURGULU ÇITIR TWISSY DOKUSU VE ÖZEL KAPLAMALAR.",
    "danishNotice": "TAZE BAHÇE MEYVELERİ VE ÖZEL PASTACI KREMASI İLE HAZIRLANIR.",
    "classicCroissantNotice": "TÜM KRUVASANLARIMIZ HAKİKİ FRANSIZ TEREYAĞI İLE HER GÜN TAZE PİŞİRİLMEKTEDİR.",
    "dietaryFilters": "Beslenme & Alerjen:",
    "allergenAll": "Tümü",
    "filterNutFree": "Fıstıksız",
    "filterDairyFree": "Laktozsuz",
    "filterVegetarian": "Vejetaryen",
    "pairingsTitle": "Yanında İyi Gider",
    "add": "+ Ekle",
    "added": "✓ Eklendi",
    "orderNote": "Sipariş Notu (İsteğe bağlı)",
    "orderNotePlaceholder": "Örn: Çikolatası bol olsun, sıcak servis...",
    "completeRequiredSelections": "Lütfen tüm zorunlu seçimleri tamamlayınız.",
    "selected": "✓ Seçildi",
    "required": "Zorunlu",
    "oneChoice": "1 Seçim",
    "optional": "İsteğe Bağlı",
    "maxChoices": "En fazla {n} seçim",
    "perItem": "/ adet",
    "notePrefix": "Not",
    "orderConfirmation": "Sipariş Onayı",
    "selectPaymentMethod": "Ödeme Yöntemi Seçiniz",
    "payWithCardAtCashier": "Kasada Kartla Öde",
    "payWithCashAtCashier": "Kasada Nakit Öde",
    "amountToPay": "Ödenecek Tutar",
    "creatingOrder": "Sipariş Oluşturuluyor...",
    "confirmOrder": "Siparişi Onayla",
    "stepGetNumber": "Sipariş Numaranızı Alın",
    "stepPayAtCashier": "Kasada Ödemenizi Tamamlayın",
    "stepPreparationNotice": "Ödemeniz kasada onaylandığında mutfak ekibimiz siparişinizi hemen taze olarak hazırlamaya başlayacaktır.",
    "enableNotifications": "Sipariş bildirimlerini aç.",
    "notificationsActive": "Bildirimler aktif.",
    "notificationDesc": "Ekran kilitliyken bile sesli bildirim alın.",
    "notificationActiveDesc": "Kruvasanınız fırından çıkınca telefonunuz titreyecektir.",
    "enableBtn": "Aç",
    "activeBtn": "Açık",
    "paymentWaitingMsg": "Lütfen kasaya giderek Sipariş Numaranızı ({orderNumber}) belirtiniz ve {method} ile ödemenizi tamamlayınız.",
    "preparingMsg": "Ödemeniz kasada onaylandı! Şeflerimiz siparişinizi fırından taze olarak hazırlıyor. Hazırlandıktan sonra teslim almanız için sizi bu ekrandan ve sesli bildirimle bilgilendireceğiz.",
    "readyMsg": "Lütfen servis tezgahından siparişinizi teslim alınız. Afiyet olsun!",
    "servedMsg": "Bizi tercih ettiğiniz için teşekkür ederiz. Afiyet olsun!",
    "cancelledMsg": "Bu sipariş kasa veya işletme yöneticisi tarafından iptal edilmiştir.",
    "cancelReasonLabel": "İptal Gerekçesi:",
    "paymentMethodLabel": "Ödeme Yöntemi:",
    "totalAmount": "Toplam Tutar",
    "shareExperience": "Deneyiminizi paylaşın.",
    "reviewDesc": "Görüşleriniz bizim için çok değerli. Google üzerinde deneyiminizi puanlayarak gelişimimize katkıda bulunun.",
    "rateOnGoogle": "Google'da Değerlendirin",
    "screenStayNotice": "Siparişiniz tamamlanana kadar lütfen bu ekrandan ayrılmayınız.",
    "instantStatusUpdate": "Durum anlık olarak bu ekranda güncellenecektir.",
    "refreshPage": "Sayfayı Yenile",
    "loyaltyCardTitle": "NOA Kahve Kartı",
    "loyaltyCardClub": "NOA KAHVE KARTI",
    "openLoyaltyCard": "Kahve Kartını Aç",
    "digitalCoffeeCard": "Dijital Kahve Kartınız",
    "loyaltyDescription": "Fiziksel kart taşıma derdine son! NOA'da aldığınız her kahvede 1 damga toplayın, {targetStamps} damgaya ulaştığınızda dilediğiniz kahveyi hediye kazanın.",
    "phoneNumberLabel": "Cep Telefon Numaranız",
    "smsNotice": "Giriş yaptığınızda telefonunuza 6 haneli SMS onay kodu iletilir.",
    "sendSmsCode": "SMS Doğrulama Kodu Gönder",
    "enterSmsCode": "SMS Onay Kodunu Girin",
    "smsSentNotice": "adresine 6 haneli güvenlik kodu iletildi.",
    "verifyCodeAndOpenCard": "Kodu Doğrula & Kartımı Aç",
    "changeNumber": "← Numarayı Değiştir",
    "resendCode": "Kodu Tekrar Gönder",
    "resendInSeconds": "Tekrar Gönder ({n}s)",
    "refreshStamps": "Damgaları Yenile",
    "gift": "HEDİYE",
    "stampsZeroMsg": "Her siparişte 1 damga kazanın, {targetStamps}. damgada {rewardName} hediye!",
    "stampsProgressMsg": "{stamps} / {targetStamps} Damga — {remaining} damga sonra {rewardName}!",
    "stampsCompletedMsg": "Tebrikler! {targetStamps} damgayı tamamladınız!",
    "freeRewardVoucherTitle": "1 Adet Hediye {rewardName} Kuponu ({count} Adet)",
    "freeRewardVoucherSubtitle": "Kasada baristaya bu kodu göstererek dilediğiniz kahveyi ücretsiz alın.",
    "codeForCashier": "KASAYA GÖSTERİLECEK KOD",
    "markAsRedeemed": "Kullanıldı Yap",
    "rewardRedeemedSuccess": "Hediye kahveniz teslim alındı! Afiyet olsun.",
    "rewardRedeemError": "Hediye kahve teslim işlemi gerçekleştirilemedi.",
    "howToCollectStamps": "Nasıl Damga Toplarım?",
    "howToCollectStampsDesc": "Kasada sipariş verirken telefon numaranızı ({phone}) baristaya iletebilir veya dijital sipariş vererek her kahvenizde otomatik damga kazanabilirsiniz.",
    "viewHistory": "İşlem Geçmişini Görüntüle",
    "hideHistory": "Geçmişi Gizle",
    "noHistoryRecords": "Henüz işlem kaydı bulunmuyor.",
    "totalStampsAllTime": "Toplam Damga:",
    "logout": "Çıkış Yap",
    "invalidPhoneError": "Lütfen geçerli bir 10 haneli cep telefonu numarası giriniz (5XX XXX XX XX).",
    "incompleteOtpError": "Lütfen 6 haneli doğrulama kodunu eksiksiz giriniz.",
    "securityTimeoutError": "Güvenlik doğrulaması zaman aşımına uğradı. Lütfen tekrar deneyin.",
    "invalidPhoneErrorShort": "Geçersiz telefon numarası. Lütfen 05XX ile başlayan numaranızı girin.",
    "cookieTitle": "Çerez & Gizlilik Tercihleri",
    "cookieNotice": "Sitemizde en iyi deneyimi sunmak, siparişlerinizi ve masa oturumunuzu güvenle yönetmek için zorunlu ve işlevsel çerezler kullanılmaktadır.",
    "cookieAccept": "Tümünü Kabul Et",
    "cookieEssential": "Yalnızca Zorunlu",
    "tooManySmsError": "Bu numaraya çok fazla SMS gönderildi. Lütfen birkaç dakika bekleyin.",
    "quotaExceededError": "SMS kotası doldu. Lütfen daha sonra tekrar deneyin.",
    "securityCheckFailed": "Güvenlik doğrulaması başarısız. Sayfayı yenileyip tekrar deneyin.",
    "unauthorizedDomainError": "Bu domain SMS gönderimine yetkili değil. Lütfen yöneticiyle iletişime geçin.",
    "smsSendFailed": "SMS gönderilemedi. Lütfen tekrar deneyin.",
    "otpExpiredError": "Doğrulama kodunun süresi doldu. Lütfen yeni kod isteyin.",
    "invalidOtpError": "Girdiğiniz kod hatalı. Lütfen SMS'teki 6 haneli kodu kontrol edin.",
    "tooManyAttemptsError": "Çok fazla deneme yapıldı. Lütfen birkaç dakika bekleyin.",
    "verificationFailed": "Doğrulama başarısız. Kodu kontrol edip tekrar deneyin.",
    "rewardCoffeeName": "Hediye Kahve"
 ,
    "ourStory": "Hikayemiz",
    "exploreMenu": "Menüyü Keşfet",
    "viewMenu": "Menüyü İncele",
    "continue": "Devam Et",
    "next": "İleri",
    "wifiConnectTitle": "Misafir Wi-Fi Ağı",
    "wifiScanPrompt": "Kameranızla okutarak şifresiz otomatik bağlanın",
    "networkName": "Ağ Adı (SSID)",
    "wifiPassword": "Wi-Fi Şifresi",
    "wifiQrAlt": "Wi-Fi QR Kodu",
    "generatingQr": "QR Üretiliyor...",
    "copied": "Kopyalandı!",
    "copy": "Kopyala",
    "searchTitle": "Ürün Arama",
    "searchEmptyPrompt": "Aramak istediğiniz ürün veya içeriği yazabilirsiniz.",
    "noResultsFound": "ile eşleşen ürün bulunamadı.",
    "tryDifferentSearch": "Farklı bir arama terimi deneyebilirsiniz.",
    "clear": "Temizle",
    "closeModal": "Pencereyi Kapat" },
  "en": {
    "searchPlaceholder": "Search croissants or drinks...",
    "menuTitle": "NOA Menu & Order",
    "myCart": "My Cart",
    "emptyCart": "Your Cart is Empty",
    "emptyCartDesc": "Select delicious croissants and drinks from our menu to add to your cart.",
    "showToCashier": "Show at Cashier",
    "completeOrder": "Complete Order",
    "clearCart": "Clear Cart",
    "total": "Total",
    "subtotal": "Subtotal",
    "addToCart": "Add to Cart",
    "customize": "Customize & Order",
    "quickAdd": "Quick Add",
    "smartUpsellTitle": "A Delicious Pairing for Your Croissant!",
    "smartUpsellAdd": "Add",
    "orderNumber": "Your Order Number",
    "paymentWaiting": "Awaiting payment at cashier...",
    "preparing": "Payment approved • Preparing...",
    "ready": "Your order is ready • You can pick it up.",
    "served": "Your order has been served.",
    "cancelled": "Your order was cancelled.",
    "orderSummary": "Order Summary",
    "paymentMethod": "Payment Method",
    "creditCard": "Credit / Debit Card",
    "cash": "Cash",
    "backToMenu": "Back to Menu",
    "newOrder": "Back to Menu & New Order",
    "freeTeaBadge": "Enjoy a complimentary hot Turkish tea with your savoury croissant!",
    "freeTeaOption": "I want my complimentary tea",
    "dailyFresh": "FRESHLY BAKED EVERY DAY.",
    "prepTime": "10-15 MINUTES PREPARATION TIME.",
    "noaMenusNotice": "NOA SIGNATURE SPECIAL COMBOS & BUILD-YOUR-OWN EXPERIENCES.",
    "amoraNotice": "NOA ICONIC HEART-SHAPED FILLED CROISSANTS WITH BELGIAN CHOCOLATE.",
    "freshPastry": "BAKED FRESH EVERY MORNING WITH PURE FRENCH BUTTER.",
    "rollNotice": "SERVED WITH CYLINDRICAL FRENCH ROLL DOUGH AND RICH FLOWING FILLING.",
    "cubeNotice": "SIGNATURE LAYERED FLAKY CROISSANTS BAKED IN GEOMETRIC CUBE FORM.",
    "twissyNotice": "CRISPY TWISTED TWISSY TEXTURE WITH ARTISANAL GLAZE COATINGS.",
    "danishNotice": "PREPARED FRESH DAILY WITH GARDEN BERRIES AND ARTISANAL PASTRY CREAM.",
    "classicCroissantNotice": "ALL OUR CROISSANTS ARE BAKED FRESH DAILY WITH AUTHENTIC FRENCH BUTTER.",
    "dietaryFilters": "Dietary & Allergens:",
    "allergenAll": "All",
    "filterNutFree": "Nut-Free",
    "filterDairyFree": "Dairy-Free",
    "filterVegetarian": "Vegetarian",
    "pairingsTitle": "Pairs Well With",
    "add": "+ Add",
    "added": "✓ Added",
    "orderNote": "Order Note (Optional)",
    "orderNotePlaceholder": "e.g., Extra chocolate, serve warm...",
    "completeRequiredSelections": "Please complete all required selections.",
    "selected": "✓ Selected",
    "required": "Required",
    "oneChoice": "1 Choice",
    "optional": "Optional",
    "maxChoices": "Up to {n} choices",
    "perItem": "/ item",
    "notePrefix": "Note",
    "orderConfirmation": "Order Confirmation",
    "selectPaymentMethod": "Select Payment Method",
    "payWithCardAtCashier": "Pay with card at cashier",
    "payWithCashAtCashier": "Pay with cash at cashier",
    "amountToPay": "Total to Pay",
    "creatingOrder": "Creating Order...",
    "confirmOrder": "Confirm Order",
    "stepGetNumber": "Get Your Order Number",
    "stepPayAtCashier": "Complete Payment at Cashier",
    "stepPreparationNotice": "Once your payment is approved at the cashier, our kitchen team will start preparing your order fresh right away.",
    "enableNotifications": "Enable order notifications.",
    "notificationsActive": "Notifications active.",
    "notificationDesc": "Receive sound alerts even when screen is locked.",
    "notificationActiveDesc": "Your phone will alert you when your order is ready.",
    "enableBtn": "Enable",
    "activeBtn": "Active",
    "paymentWaitingMsg": "Please visit the cashier with your Order Number ({orderNumber}) and complete payment via {method}.",
    "preparingMsg": "Payment approved! Our chefs are preparing your order fresh from the oven. You will be notified here once ready.",
    "readyMsg": "Please pick up your order from the serving counter. Enjoy!",
    "servedMsg": "Thank you for visiting NOA Croissant. Enjoy your meal!",
    "cancelledMsg": "This order was cancelled by the cashier or store management.",
    "cancelReasonLabel": "Cancellation Reason:",
    "paymentMethodLabel": "Payment Method:",
    "totalAmount": "Total Amount",
    "shareExperience": "Share your experience.",
    "reviewDesc": "Your feedback is invaluable to us. Rate your experience on Google to help us improve.",
    "rateOnGoogle": "Rate on Google",
    "screenStayNotice": "Please stay on this screen until your order is completed.",
    "instantStatusUpdate": "Status will update live on this screen.",
    "refreshPage": "Refresh Page",
    "loyaltyCardTitle": "NOA Coffee Loyalty Card",
    "loyaltyCardClub": "NOA LOYALTY CARD",
    "openLoyaltyCard": "Open Coffee Card",
    "digitalCoffeeCard": "Your Digital Coffee Card",
    "loyaltyDescription": "No more physical cards! Collect 1 stamp for every coffee you buy at NOA. Reach {targetStamps} stamps and enjoy a complimentary coffee on us.",
    "phoneNumberLabel": "Mobile Phone Number",
    "smsNotice": "A 6-digit SMS verification code will be sent to your phone upon login.",
    "sendSmsCode": "Send SMS Verification Code",
    "enterSmsCode": "Enter SMS Verification Code",
    "smsSentNotice": "A 6-digit security code has been sent to {phone}.",
    "verifyCodeAndOpenCard": "Verify Code & Open Card",
    "changeNumber": "← Change Phone Number",
    "resendCode": "Resend Code",
    "resendInSeconds": "Resend in ({n}s)",
    "refreshStamps": "Refresh Stamps",
    "gift": "GIFT",
    "stampsZeroMsg": "Earn 1 stamp with each coffee, get {rewardName} free on the {targetStamps}th stamp!",
    "stampsProgressMsg": "{stamps} / {targetStamps} Stamps — {remaining} more for {rewardName}!",
    "stampsCompletedMsg": "Congratulations! You completed {targetStamps} stamps!",
    "freeRewardVoucherTitle": "1 Complimentary {rewardName} Voucher ({count} Available)",
    "freeRewardVoucherSubtitle": "Present this code to the barista at the cashier to claim your complimentary coffee.",
    "codeForCashier": "CODE FOR CASHIER",
    "markAsRedeemed": "Mark as Redeemed",
    "rewardRedeemedSuccess": "Your complimentary coffee has been claimed! Enjoy!",
    "rewardRedeemError": "Unable to process reward redemption.",
    "howToCollectStamps": "How Do I Collect Stamps?",
    "howToCollectStampsDesc": "Provide your phone number ({phone}) to the barista at the counter or place a digital order to automatically earn 1 stamp on every coffee.",
    "viewHistory": "View Activity History",
    "hideHistory": "Hide History",
    "noHistoryRecords": "No transaction records found yet.",
    "totalStampsAllTime": "Total Stamps:",
    "logout": "Log Out",
    "invalidPhoneError": "Please enter a valid 10-digit mobile number (5XX XXX XX XX).",
    "incompleteOtpError": "Please enter the full 6-digit verification code.",
    "securityTimeoutError": "Security verification timed out. Please try again.",
    "invalidPhoneErrorShort": "Invalid phone number. Please enter your mobile number starting with 05XX.",
    "cookieTitle": "Cookie & Privacy Preferences",
    "cookieNotice": "We use essential and functional cookies to provide you with the best experience and securely manage your orders.",
    "cookieAccept": "Accept All",
    "cookieEssential": "Essential Only",
    "tooManySmsError": "Too many SMS sent to this number. Please wait a few minutes.",
    "quotaExceededError": "SMS quota exceeded. Please try again later.",
    "securityCheckFailed": "Security verification failed. Please refresh and retry.",
    "unauthorizedDomainError": "This domain is not authorized for SMS. Please contact support.",
    "smsSendFailed": "SMS could not be sent. Please try again.",
    "otpExpiredError": "Verification code has expired. Please request a new code.",
    "invalidOtpError": "Invalid code entered. Please check the 6-digit SMS code.",
    "tooManyAttemptsError": "Too many attempts. Please wait a few minutes.",
    "verificationFailed": "Verification failed. Please check the code and retry.",
    "rewardCoffeeName": "Complimentary Coffee"
 ,
    "ourStory": "Our Story",
    "exploreMenu": "Explore Menu",
    "viewMenu": "View Menu",
    "continue": "Continue",
    "next": "Next",
    "wifiConnectTitle": "Guest Wi-Fi Network",
    "wifiScanPrompt": "Scan with your camera to connect automatically",
    "networkName": "Network Name (SSID)",
    "wifiPassword": "Wi-Fi Password",
    "wifiQrAlt": "Wi-Fi QR Code",
    "generatingQr": "Generating QR...",
    "copied": "Copied!",
    "copy": "Copy",
    "searchTitle": "Search Products",
    "searchEmptyPrompt": "Type to search for croissants, drinks, or ingredients.",
    "noResultsFound": "no matching products found.",
    "tryDifferentSearch": "Try searching with a different keyword.",
    "clear": "Clear",
    "closeModal": "Close Window" },
  "de": {
    "searchPlaceholder": "Croissants oder Getränke suchen...",
    "menuTitle": "NOA Menü & Bestellen",
    "myCart": "Warenkorb",
    "emptyCart": "Ihr Warenkorb ist leer",
    "emptyCartDesc": "Wählen Sie köstliche Croissants und Getränke aus unserem Menü.",
    "showToCashier": "An der Kasse vorzeigen",
    "completeOrder": "Bestellung abschließen",
    "clearCart": "Warenkorb leeren",
    "total": "Gesamt",
    "subtotal": "Zwischensumme",
    "addToCart": "In den Warenkorb",
    "customize": "Auswählen & Anpassen",
    "quickAdd": "Schnell hinzufügen",
    "smartUpsellTitle": "Perfekt passend zu Ihrem Croissant!",
    "smartUpsellAdd": "Hinzufügen",
    "orderNumber": "Ihre Bestellnummer",
    "paymentWaiting": "Warten auf Zahlung an der Kasse...",
    "preparing": "Zahlung bestätigt • Wird zubereitet...",
    "ready": "Ihre Bestellung ist abholbereit.",
    "served": "Ihre Bestellung wurde serviert.",
    "cancelled": "Ihre Bestellung wurde storniert.",
    "orderSummary": "Bestellübersicht",
    "paymentMethod": "Zahlungsart",
    "creditCard": "Kredit- / EC-Karte",
    "cash": "Bargeld",
    "backToMenu": "Zurück zum Menü",
    "newOrder": "Zurück zum Menü & Neue Bestellung",
    "freeTeaBadge": "Kostenloser heißer Tee zu Ihrem herzhaften Croissant!",
    "freeTeaOption": "Kostenlosen Tee hinzufügen",
    "dailyFresh": "TÄGLICH FRISCH GEBACKEN.",
    "prepTime": "10-15 MINUTEN ZUBEREITUNGSZEIT.",
    "noaMenusNotice": "SPEZIELLE NOA MENÜS & INDIVIDUELL ZUSAMMENSTELLBARE KREATIONEN.",
    "amoraNotice": "NOA HERZFÖRMIGE CROISSANTS MIT BELGISCHER SCHOKOLADE.",
    "freshPastry": "JEDEN MORGEN FRISCH MIT ECHTER FRANZÖSISCHER BUTTER GEBACKEN.",
    "rollNotice": "SERVIERT MIT ZYLINDRISCHEM FRANZÖSISCHEM ROLLTEIG UND FLÜSSIGER FÜLLUNG.",
    "cubeNotice": "BESONDERE BLÄTTERTEIG-CROISSANTS IN GEOMETRISCHER WÜRFELFORM GEBACKEN.",
    "twissyNotice": "KNUSPRIGE GEDREHTE TWISSY-TEXTUR MIT FEINSTEN GLASUREN.",
    "danishNotice": "TÄGLICH FRISCH ZUBEREITET MIT GARTENBEEREN UND PATISSERIECREME.",
    "classicCroissantNotice": "ALLE UNSERE CROISSANTS WERDEN TÄGLICH FRISCH MIT ECHTER FRANZÖSISCHER BUTTER GEBACKEN.",
    "dietaryFilters": "Ernährung & Allergene:",
    "allergenAll": "Alle",
    "filterNutFree": "Ohne Nüsse",
    "filterDairyFree": "Laktosefrei",
    "filterVegetarian": "Vegetarisch",
    "pairingsTitle": "Passt gut dazu",
    "add": "+ Hinzufügen",
    "added": "✓ Hinzugefügt",
    "orderNote": "Bestellhinweis (Optional)",
    "orderNotePlaceholder": "z.B. Extra Schokolade, warm servieren...",
    "completeRequiredSelections": "Bitte treffen Sie alle erforderlichen Auswahlen.",
    "selected": "✓ Ausgewählt",
    "required": "Erforderlich",
    "oneChoice": "1 Auswahl",
    "optional": "Optional",
    "maxChoices": "Bis zu {n} Auswahlen",
    "perItem": "/ Stück",
    "notePrefix": "Hinweis",
    "orderConfirmation": "Bestellbestätigung",
    "selectPaymentMethod": "Zahlungsart wählen",
    "payWithCardAtCashier": "Kartenzahlung an der Kasse",
    "payWithCashAtCashier": "Barzahlung an der Kasse",
    "amountToPay": "Zu zahlender Betrag",
    "creatingOrder": "Bestellung wird erstellt...",
    "confirmOrder": "Bestellung bestätigen",
    "stepGetNumber": "Bestellnummer erhalten",
    "stepPayAtCashier": "Zahlung an der Kasse abschließen",
    "stepPreparationNotice": "Sobald Ihre Zahlung an der Kasse bestätigt ist, bereitet unser Küchenteam Ihre Bestellung frisch zu.",
    "enableNotifications": "Bestellbenachrichtigungen aktivieren.",
    "notificationsActive": "Benachrichtigungen aktiv.",
    "notificationDesc": "Erhalten Sie Tonbenachrichtigungen auch bei gesperrtem Bildschirm.",
    "notificationActiveDesc": "Ihr Telefon benachrichtigt Sie, wenn die Bestellung fertig ist.",
    "enableBtn": "Aktivieren",
    "activeBtn": "Aktiv",
    "paymentWaitingMsg": "Bitte gehen Sie zur Kasse mit Ihrer Bestellnummer ({orderNumber}) und zahlen Sie mit {method}.",
    "preparingMsg": "Zahlung bestätigt! Unsere Bäcker bereiten Ihre Bestellung frisch zu.",
    "readyMsg": "Bitte holen Sie Ihre Bestellung an der Theke ab. Guten Appetit!",
    "servedMsg": "Vielen Dank für Ihren Besuch bei NOA Croissant. Guten Appetit!",
    "cancelledMsg": "Diese Bestellung wurde von der Kasse oder dem Management storniert.",
    "cancelReasonLabel": "Stornierungsgrund:",
    "paymentMethodLabel": "Zahlungsart:",
    "totalAmount": "Gesamtbetrag",
    "shareExperience": "Teilen Sie Ihre Erfahrung.",
    "reviewDesc": "Ihre Meinung ist uns wichtig. Bewerten Sie uns auf Google.",
    "rateOnGoogle": "Auf Google bewerten",
    "screenStayNotice": "Bitte verlassen Sie diesen Bildschirm nicht, bis die Bestellung fertig ist.",
    "instantStatusUpdate": "Der Status wird auf diesem Bildschirm live aktualisiert.",
    "refreshPage": "Seite aktualisieren",
    "loyaltyCardTitle": "NOA Kaffee-Treuekarte",
    "loyaltyCardClub": "NOA TREUEKARTE",
    "openLoyaltyCard": "Kaffeekarte öffnen",
    "digitalCoffeeCard": "Ihre digitale Kaffeekarte",
    "loyaltyDescription": "Schluss mit Plastikkarten! Sammeln Sie 1 Stempel für jeden Kaffee bei NOA. Bei {targetStamps} Stempeln erhalten Sie einen Gratis-Kaffee.",
    "phoneNumberLabel": "Mobilfunknummer",
    "smsNotice": "Beim Login wird Ihnen ein 6-stelliger SMS-Bestätigungscode zugesendet.",
    "sendSmsCode": "SMS-Bestätigungscode senden",
    "enterSmsCode": "SMS-Bestätigungscode eingeben",
    "smsSentNotice": "Ein 6-stelliger Sicherheitscode wurde an {phone} gesendet.",
    "verifyCodeAndOpenCard": "Code bestätigen & Karte öffnen",
    "changeNumber": "← Nummer ändern",
    "resendCode": "Code erneut senden",
    "resendInSeconds": "Erneut senden in ({n}s)",
    "refreshStamps": "Stempel aktualisieren",
    "gift": "GRATIS",
    "stampsZeroMsg": "Sammeln Sie 1 Stempel pro Kaffee – der {targetStamps}. Stempel schenkt Ihnen {rewardName}!",
    "stampsProgressMsg": "{stamps} / {targetStamps} Stempel — noch {remaining} bis {rewardName}!",
    "stampsCompletedMsg": "Herzlichen Glückwunsch! Sie haben {targetStamps} Stempel gesammelt!",
    "freeRewardVoucherTitle": "1 Gratis {rewardName} Gutschein ({count} verfügbar)",
    "freeRewardVoucherSubtitle": "Zeigen Sie diesen Code dem Barista an der Kasse, um Ihren Gratis-Kaffee zu erhalten.",
    "codeForCashier": "CODE FÜR DIE KASSE",
    "markAsRedeemed": "Als eingelöst markieren",
    "rewardRedeemedSuccess": "Ihr Gratis-Kaffee wurde erfolgreich eingelöst! Guten Appetit!",
    "rewardRedeemError": "Einlösung des Gratis-Kaffees fehlgeschlagen.",
    "howToCollectStamps": "Wie sammle ich Stempel?",
    "howToCollectStampsDesc": "Nennen Sie Ihre Telefonnummer ({phone}) dem Barista oder bestellen Sie digital, um bei jedem Kaffee automatisch Stempel zu sammeln.",
    "viewHistory": "Aktivitätsverlauf anzeigen",
    "hideHistory": "Verlauf ausblenden",
    "noHistoryRecords": "Noch keine Transaktionen vorhanden.",
    "totalStampsAllTime": "Gesamtstempel:",
    "logout": "Abmelden",
    "invalidPhoneError": "Bitte geben Sie eine gültige 10-stellige Handynummer ein (5XX XXX XX XX).",
    "incompleteOtpError": "Bitte geben Sie den vollständigen 6-stelligen Code ein.",
    "securityTimeoutError": "Sicherheitsüberprüfung abgelaufen. Bitte erneut versuchen.",
    "invalidPhoneErrorShort": "Ungültige Telefonnummer. Bitte mit 05XX beginnen.",
    "cookieTitle": "Cookie- & Datenschutzeinstellungen",
    "cookieNotice": "Wir verwenden notwendige und funktionale Cookies, um Ihnen das beste Erlebnis zu bieten und Ihre Bestellungen sicher zu verwalten.",
    "cookieAccept": "Alle akzeptieren",
    "cookieEssential": "Nur essenzielle",
    "tooManySmsError": "Zu viele SMS an diese Nummer gesendet. Bitte warten Sie einige Minuten.",
    "quotaExceededError": "SMS-Kontingent erschöpft. Bitte später erneut versuchen.",
    "securityCheckFailed": "Sicherheitsüberprüfung fehlgeschlagen. Bitte aktualisieren und wiederholen.",
    "unauthorizedDomainError": "Diese Domain ist nicht für SMS autorisiert. Bitte Support kontaktieren.",
    "smsSendFailed": "SMS konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
    "otpExpiredError": "Der Bestätigungscode ist abgelaufen. Bitte neuen Code anfordern.",
    "invalidOtpError": "Ungültiger Code. Bitte überprüfen Sie den 6-stelligen SMS-Code.",
    "tooManyAttemptsError": "Zu viele Versuche. Bitte warten Sie einige Minuten.",
    "verificationFailed": "Verifizierung fehlgeschlagen. Bitte erneut versuchen.",
    "rewardCoffeeName": "Gratis-Kaffee"
 ,
    "ourStory": "Unsere Geschichte",
    "exploreMenu": "Menü Entdecken",
    "viewMenu": "Menü Ansehen",
    "continue": "Weiter",
    "next": "Weiter",
    "wifiConnectTitle": "Gäste-WLAN-Netzwerk",
    "wifiScanPrompt": "Mit der Kamera scannen, um automatisch zu verbinden",
    "networkName": "Netzwerkname (SSID)",
    "wifiPassword": "WLAN-Passwort",
    "wifiQrAlt": "WLAN-QR-Code",
    "generatingQr": "QR-Code wird generiert...",
    "copied": "Kopiert!",
    "copy": "Kopieren",
    "searchTitle": "Produktsuche",
    "searchEmptyPrompt": "Tippen Sie, um nach Croissants, Getränken oder Zutaten zu suchen.",
    "noResultsFound": "keine passenden Produkte gefunden.",
    "tryDifferentSearch": "Versuchen Sie es mit einem anderen Suchbegriff.",
    "clear": "Löschen",
    "closeModal": "Fenster Schließen" },
  "ru": {
    "searchPlaceholder": "Поиск круассанов и напитков...",
    "menuTitle": "NOA Меню и Заказ",
    "myCart": "Корзина",
    "emptyCart": "Ваша корзина пуста",
    "emptyCartDesc": "Выберите круассаны и напитки из меню, чтобы добавить в корзину.",
    "showToCashier": "Показать на кассе",
    "completeOrder": "Оформить заказ",
    "clearCart": "Очистить корзину",
    "total": "Итого",
    "subtotal": "Подытог",
    "addToCart": "В корзину",
    "customize": "Выбрать и настроить",
    "quickAdd": "Быстро добавить",
    "smartUpsellTitle": "Идеальное дополнение к вашему круассану!",
    "smartUpsellAdd": "Добавить",
    "orderNumber": "Номер вашего заказа",
    "paymentWaiting": "Ожидание оплаты на кассе...",
    "preparing": "Оплата подтверждена • Готовится...",
    "ready": "Ваш заказ готов • Можете забрать.",
    "served": "Ваш заказ выдан.",
    "cancelled": "Ваш заказ был отменен.",
    "orderSummary": "Детали заказа",
    "paymentMethod": "Способ оплаты",
    "creditCard": "Банковская карта",
    "cash": "Наличные",
    "backToMenu": "Назад в меню",
    "newOrder": "В меню и новый заказ",
    "freeTeaBadge": "Горячий турецкий чай в подарок к сытному круассану!",
    "freeTeaOption": "Хочу бесплатный чай",
    "dailyFresh": "ВЫПЕКАЕТСЯ СВЕЖИМ КАЖДЫЙ ДЕНЬ.",
    "prepTime": "ВРЕМЯ ПРИГОТОВЛЕНИЯ 10-15 МИНУТ.",
    "noaMenusNotice": "ФИРМЕННЫЕ КОМБО И ВОЗМОЖНОСТЬ СОБРАТЬ СВОЙ КРУАССАН.",
    "amoraNotice": "ФИРМЕННЫЕ КРУАССАНЫ В ФОРМЕ СЕРДЦА С БЕЛЬГИЙСКИМ ШОКОЛАДОМ.",
    "freshPastry": "КАЖДОЕ УТРО НА ФРАНЦУЗСКОМ СЛИВОЧНОМ МАСЛЕ.",
    "rollNotice": "ПОДАЕТСЯ С ЦИЛИНДРИЧЕСКИМ ФРАНЦУЗСКИМ РОЛЛ-ТЕСТОМ И ЖИДКОЙ НАЧИНКОЙ.",
    "cubeNotice": "СЛОЕНЫЕ КРУАССАНЫ ОСОБОЙ ВЫПЕЧКИ В ФОРМЕ ГЕОМЕТРИЧЕСКОГО КУБА.",
    "twissyNotice": "ХРУСТЯЩАЯ СКРУЧЕННАЯ ТЕКСТУРА ТВИССИ С АВТОРСКИМИ ПОКРЫТИЯМИ.",
    "danishNotice": "ГОТОВИТСЯ ЕЖЕДНЕВНО СВЕЖИМ С САДОВЫМИ ЯГОДАМИ И ЗАВАРНЫМ КРЕМОМ.",
    "classicCroissantNotice": "ВСЕ НАШИ КРУАССАНЫ ВЫПЕКАЮТСЯ ЕЖЕДНЕВНО СО СВЕЖИМ НАСТОЯЩИМ ФРАНЦУЗСКИМ МАСЛОМ.",
    "dietaryFilters": "Диета и аллергены:",
    "allergenAll": "Все",
    "filterNutFree": "Без орехов",
    "filterDairyFree": "Без лактозы",
    "filterVegetarian": "Вегетарианское",
    "pairingsTitle": "Идеально сочетается с",
    "add": "+ Добавить",
    "added": "✓ Добавлено",
    "orderNote": "Примечание к заказу (Необязательно)",
    "orderNotePlaceholder": "Например: больше шоколада, подать теплым...",
    "completeRequiredSelections": "Пожалуйста, сделайте все обязательные выборы.",
    "selected": "✓ Выбрано",
    "required": "Обязательно",
    "oneChoice": "1 выбор",
    "optional": "Необязательно",
    "maxChoices": "До {n} вариантов",
    "perItem": "/ шт",
    "notePrefix": "Прим.",
    "orderConfirmation": "Подтверждение заказа",
    "selectPaymentMethod": "Выберите способ оплаты",
    "payWithCardAtCashier": "Оплата картой на кассе",
    "payWithCashAtCashier": "Оплата наличными на кассе",
    "amountToPay": "Сумма к оплате",
    "creatingOrder": "Создание заказа...",
    "confirmOrder": "Подтвердить заказ",
    "stepGetNumber": "Получите номер заказа",
    "stepPayAtCashier": "Оплатите на кассе",
    "stepPreparationNotice": "Как только оплата подтвердится на кассе, наша кухня сразу начнет готовить ваш заказ.",
    "enableNotifications": "Включить уведомления о заказе.",
    "notificationsActive": "Уведомления включены.",
    "notificationDesc": "Получайте звуковые оповещения даже при заблокированном экране.",
    "notificationActiveDesc": "Телефон оповестит вас о готовности заказа.",
    "enableBtn": "Включить",
    "activeBtn": "Включено",
    "paymentWaitingMsg": "Пожалуйста, подойдите к кассе с номером заказа ({orderNumber}) и оплатите через {method}.",
    "preparingMsg": "Оплата подтверждена! Повара готовят ваш заказ со свежей выпечкой.",
    "readyMsg": "Пожалуйста, заберите заказ на стойке выдачи. Приятного аппетита!",
    "servedMsg": "Спасибо, что выбрали NOA Croissant. Приятного аппетита!",
    "cancelledMsg": "Этот заказ был отменен администратором или на кассе.",
    "cancelReasonLabel": "Причина отмены:",
    "paymentMethodLabel": "Способ оплаты:",
    "totalAmount": "Итоговая сумма",
    "shareExperience": "Поделитесь впечатлениями.",
    "reviewDesc": "Ваш отзыв очень важен для нас. Оцените нас в Google.",
    "rateOnGoogle": "Оценить в Google",
    "screenStayNotice": "Пожалуйста, оставайтесь на этом экране до завершения заказа.",
    "instantStatusUpdate": "Статус обновится здесь в режиме реального времени.",
    "refreshPage": "Обновить страницу",
    "loyaltyCardTitle": "Карта лояльности NOA Кофе",
    "loyaltyCardClub": "NOA КАРТА ЛОЯЛЬНОСТИ",
    "openLoyaltyCard": "Открыть карту кофе",
    "digitalCoffeeCard": "Ваша цифровая кофейная карта",
    "loyaltyDescription": "Забудьте о бумажных карточках! Собирайте 1 штамп за каждый кофе в NOA. Накопите {targetStamps} штампов и получите бесплатный кофе в подарок.",
    "phoneNumberLabel": "Номер мобильного телефона",
    "smsNotice": "При входе на ваш телефон будет отправлен 6-значный SMS-код.",
    "sendSmsCode": "Отправить код подтверждения по SMS",
    "enterSmsCode": "Введите SMS-код подтверждения",
    "smsSentNotice": "6-значный код безопасности отправлен на {phone}.",
    "verifyCodeAndOpenCard": "Подтвердить код и открыть карту",
    "changeNumber": "← Изменить номер",
    "resendCode": "Отправить код повторно",
    "resendInSeconds": "Повторить через ({n}с)",
    "refreshStamps": "Обновить штампы",
    "gift": "ПОДАРОК",
    "stampsZeroMsg": "Получайте 1 штамп за каждый кофе, на {targetStamps}-й штамп {rewardName} в подарок!",
    "stampsProgressMsg": "{stamps} / {targetStamps} штампов — ещё {remaining} до {rewardName}!",
    "stampsCompletedMsg": "Поздравляем! Вы собрали {targetStamps} штампов!",
    "freeRewardVoucherTitle": "1 ваучер на бесплатный {rewardName} (В наличии: {count})",
    "freeRewardVoucherSubtitle": "Покажите этот код бариста на кассе, чтобы забрать ваш бесплатный кофе.",
    "codeForCashier": "КОД ДЛЯ КАССИРА",
    "markAsRedeemed": "Использовать купон",
    "rewardRedeemedSuccess": "Ваш подарок успешно получен! Приятного аппетита.",
    "rewardRedeemError": "Не удалось применить купон на подарок.",
    "howToCollectStamps": "Как собирать штампы?",
    "howToCollectStampsDesc": "Назовите свой номер ({phone}) бариста на кассе или заказывайте через приложение, чтобы автоматически получать штампы за каждый кофе.",
    "viewHistory": "История операций",
    "hideHistory": "Скрыть историю",
    "noHistoryRecords": "Записей об операциях пока нет.",
    "totalStampsAllTime": "Всего штампов:",
    "logout": "Выйти",
    "invalidPhoneError": "Пожалуйста, введите корректный 10-значный номер мобильного телефона.",
    "incompleteOtpError": "Пожалуйста, введите полный 6-значный проверочный код.",
    "securityTimeoutError": "Время проверки безопасности истекло. Попробуйте снова.",
    "invalidPhoneErrorShort": "Неверный номер телефона. Пожалуйста, начните с 05XX.",
    "cookieTitle": "Настройки файлов cookie",
    "cookieNotice": "Мы используем обязательные и функциональные файлы cookie для наилучшего обслуживания и безопасного управления заказами.",
    "cookieAccept": "Принять все",
    "cookieEssential": "Только обязательные",
    "tooManySmsError": "Слишком много SMS отправлено на этот номер. Пожалуйста, подождите.",
    "quotaExceededError": "Лимит SMS исчерпан. Пожалуйста, попробуйте позже.",
    "securityCheckFailed": "Ошибка проверки безопасности. Обновите страницу и повторите попытку.",
    "unauthorizedDomainError": "Домен не авторизован для SMS. Свяжитесь с администрацией.",
    "smsSendFailed": "Не удалось отправить SMS. Пожалуйста, попробуйте снова.",
    "otpExpiredError": "Срок действия кода истек. Запросите новый код.",
    "invalidOtpError": "Неверный код. Проверьте 6-значный код из SMS.",
    "tooManyAttemptsError": "Слишком много попыток. Пожалуйста, подождите несколько минут.",
    "verificationFailed": "Ошибка проверки. Проверьте код и повторите попытку.",
    "rewardCoffeeName": "Кофе в подарок"
 ,
    "ourStory": "Наша История",
    "exploreMenu": "Смотреть Меню",
    "viewMenu": "Открыть Меню",
    "continue": "Продолжить",
    "next": "Далее",
    "wifiConnectTitle": "Гостевая Сеть Wi-Fi",
    "wifiScanPrompt": "Отсканируйте камерой для автоподключения без пароля",
    "networkName": "Имя Сети (SSID)",
    "wifiPassword": "Пароль Wi-Fi",
    "wifiQrAlt": "QR-код Wi-Fi",
    "generatingQr": "Создание QR-кода...",
    "copied": "Скопировано!",
    "copy": "Копировать",
    "searchTitle": "Поиск Продуктов",
    "searchEmptyPrompt": "Введите название круассана, напитка или ингредиента.",
    "noResultsFound": "совпадающих продуктов не найдено.",
    "tryDifferentSearch": "Попробуйте изменить поисковый запрос.",
    "clear": "Очистить",
    "closeModal": "Закрыть Окно" },
  "nl": {
    "searchPlaceholder": "Zoek croissants of drankjes...",
    "menuTitle": "NOA Menu & Bestellen",
    "myCart": "Winkelwagen",
    "emptyCart": "Uw winkelwagen is leeg",
    "emptyCartDesc": "Kies heerlijke croissants en drankjes uit ons menu.",
    "showToCashier": "Tonen aan kassa",
    "completeOrder": "Bestelling afronden",
    "clearCart": "Winkelwagen legen",
    "total": "Totaal",
    "subtotal": "Subtotaal",
    "addToCart": "In winkelmand",
    "customize": "Kies & Pas aan",
    "quickAdd": "Snel toevoegen",
    "smartUpsellTitle": "Heerlijke combinatie bij uw croissant!",
    "smartUpsellAdd": "Toevoegen",
    "orderNumber": "Uw bestelnummer",
    "paymentWaiting": "Wachten op betaling aan de kassa...",
    "preparing": "Betaling goedgekeurd • Wordt bereid...",
    "ready": "Uw bestelling is klaar om op te halen.",
    "served": "Uw bestelling is geserveerd.",
    "cancelled": "Uw bestelling is geannuleerd.",
    "orderSummary": "Besteloverzicht",
    "paymentMethod": "Betaalmethode",
    "creditCard": "Pin / Creditcard",
    "cash": "Contant",
    "backToMenu": "Terug naar Menu",
    "newOrder": "Terug naar Menu & Nieuwe bestelling",
    "freeTeaBadge": "Gratis warme thee bij uw hartige croissant!",
    "freeTeaOption": "Gratis thee toevoegen",
    "dailyFresh": "DAGELIJKS VERS GEBAKKEN.",
    "prepTime": "BEREIDINGSTIJD 10-15 MINUTEN.",
    "noaMenusNotice": "SPECIALE NOA MENU'S EN ZELF SAMENSTELLEN.",
    "amoraNotice": "NOA HARTVORMIGE CROISSANTS MET BELGISCHE CHOCOLADE.",
    "freshPastry": "ELKE OCHTEND VERS GEBAKKEN MET FRANSE BOTER.",
    "rollNotice": "GESERVEERD MET CILINDRISCH FRANS ROLL-DEEG EN VLOEIENDE VULLING.",
    "cubeNotice": "LAAGJES BLADERDEEG CROISSANTS SPECIAAL GEBAKKEN IN KUBUSVORM.",
    "twissyNotice": "KROKANTE GEDRAAIDE TWISSY TEXTUUR MET AMBACHTELIJKE TOPPINGS.",
    "danishNotice": "DAGELIJKS VERS BEREID MET TUINVRUCHTEN EN BANKETBAKKERSROOM.",
    "classicCroissantNotice": "AL ONZE CROISSANTS WORDEN DAGELIJKS VERS GEBAKKEN MET ECHTE FRANSE BOTER.",
    "dietaryFilters": "Dieet & Allergenen:",
    "allergenAll": "Alles",
    "filterNutFree": "Notenvrij",
    "filterDairyFree": "Lactosevrij",
    "filterVegetarian": "Vegetarisch",
    "pairingsTitle": "Past goed bij",
    "add": "+ Toevoegen",
    "added": "✓ Toegevoegd",
    "orderNote": "Bestelnotitie (Optioneel)",
    "orderNotePlaceholder": "bijv. Extra chocolade, warm serveren...",
    "completeRequiredSelections": "Maak alstublieft alle verplichte keuzes.",
    "selected": "✓ Geselecteerd",
    "required": "Verplicht",
    "oneChoice": "1 keuze",
    "optional": "Optioneel",
    "maxChoices": "Maximaal {n} keuzes",
    "perItem": "/ stuk",
    "notePrefix": "Notitie",
    "orderConfirmation": "Bestelbevestiging",
    "selectPaymentMethod": "Kies betaalmethode",
    "payWithCardAtCashier": "Pinnen aan de kassa",
    "payWithCashAtCashier": "Contant aan de kassa",
    "amountToPay": "Te betalen bedrag",
    "creatingOrder": "Bestelling aanmaken...",
    "confirmOrder": "Bestelling bevestigen",
    "stepGetNumber": "Ontvang uw bestelnummer",
    "stepPayAtCashier": "Rond betaling af aan de kassa",
    "stepPreparationNotice": "Zodra uw betaling is goedgekeurd aan de kassa, begint onze keuken direct met de verse bereiding.",
    "enableNotifications": "Bestelmeldingen inschakelen.",
    "notificationsActive": "Meldingen actief.",
    "notificationDesc": "Ontvang geluidswaarschuwingen ook bij vergrendeld scherm.",
    "notificationActiveDesc": "Uw telefoon trilt wanneer de bestelling klaar is.",
    "enableBtn": "Inschakelen",
    "activeBtn": "Actief",
    "paymentWaitingMsg": "Ga naar de kassa met uw bestelnummer ({orderNumber}) en betaal via {method}.",
    "preparingMsg": "Betaling goedgekeurd! Onze chefs bereiden uw bestelling vers uit de oven.",
    "readyMsg": "Haal uw bestelling op bij de balie. Eet smakelijk!",
    "servedMsg": "Bedankt voor uw bezoek aan NOA Croissant. Eet smakelijk!",
    "cancelledMsg": "Deze bestelling is geannuleerd door de kassa of het management.",
    "cancelReasonLabel": "Annuleringsreden:",
    "paymentMethodLabel": "Betaalmethode:",
    "totalAmount": "Totaalbedrag",
    "shareExperience": "Deel uw ervaring.",
    "reviewDesc": "Uw mening is waardevol voor ons. Beoordeel ons op Google.",
    "rateOnGoogle": "Beoordeel op Google",
    "screenStayNotice": "Blijf op dit scherm tot uw bestelling is afgerond.",
    "instantStatusUpdate": "De status wordt hier live bijgewerkt.",
    "refreshPage": "Pagina vernieuwen",
    "loyaltyCardTitle": "NOA Koffie Spaarkaart",
    "loyaltyCardClub": "NOA SPAARKAART",
    "openLoyaltyCard": "Koffiekaart openen",
    "digitalCoffeeCard": "Uw Digitale Koffiekaart",
    "loyaltyDescription": "Geen fysieke pasjes meer nodig! Spaar 1 stempel bij elke koffie bij NOA. Bij {targetStamps} stempels geniet u van een gratis koffie.",
    "phoneNumberLabel": "Mobiel Telefoonnummer",
    "smsNotice": "Bij het inloggen ontvangt u een 6-cijferige SMS-verificatiecode.",
    "sendSmsCode": "SMS-verificatiecode verzenden",
    "enterSmsCode": "Voer SMS-verificatiecode in",
    "smsSentNotice": "Er is een 6-cijferige beveiligingscode verzonden naar {phone}.",
    "verifyCodeAndOpenCard": "Code verifiëren & Kaart openen",
    "changeNumber": "← Nummer wijzigen",
    "resendCode": "Code opnieuw verzenden",
    "resendInSeconds": "Opnieuw verzenden over ({n}s)",
    "refreshStamps": "Stempels vernieuwen",
    "gift": "CADEAU",
    "stampsZeroMsg": "Verdien 1 stempel bij elke koffie, ontvang {rewardName} gratis bij stempel {targetStamps}!",
    "stampsProgressMsg": "{stamps} / {targetStamps} Stempels — nog {remaining} voor {rewardName}!",
    "stampsCompletedMsg": "Gefeliciteerd! U heeft {targetStamps} stempels compleet!",
    "freeRewardVoucherTitle": "1 Gratis {rewardName} Voucher ({count} beschikbaar)",
    "freeRewardVoucherSubtitle": "Toon deze code aan de barista bij de kassa om uw gratis koffie op te halen.",
    "codeForCashier": "CODE VOOR KASSA",
    "markAsRedeemed": "Als gebruikt markeren",
    "rewardRedeemedSuccess": "Uw gratis koffie is verzilverd! Geniet ervan!",
    "rewardRedeemError": "Het inwisselen van de beloning is mislukt.",
    "howToCollectStamps": "Hoe spaar ik stempels?",
    "howToCollectStampsDesc": "Geef uw telefoonnummer ({phone}) door aan de barista bij de kassa of bestel digitaal om automatisch stempels te sparen.",
    "viewHistory": "Transactiegeschiedenis bekijken",
    "hideHistory": "Geschiedenis verbergen",
    "noHistoryRecords": "Nog geen transacties gevonden.",
    "totalStampsAllTime": "Totaal Stempels:",
    "logout": "Uitloggen",
    "invalidPhoneError": "Voer een geldig mobiel telefoonnummer van 10 cijfers in.",
    "incompleteOtpError": "Voer de volledige 6-cijferige verificatiecode in.",
    "securityTimeoutError": "Veiligheidscontrole verlopen. Probeer het opnieuw.",
    "invalidPhoneErrorShort": "Ongeldig telefoonnummer. Begin met 05XX.",
    "cookieTitle": "Cookie- en privacyvoorkeuren",
    "cookieNotice": "Wij gebruiken essentiële en functionele cookies om u de beste ervaring te bieden en uw bestellingen veilig te beheren.",
    "cookieAccept": "Alles accepteren",
    "cookieEssential": "Alleen noodzakelijk",
    "tooManySmsError": "Te veel SMS naar dit nummer verzonden. Wacht een paar minuten.",
    "quotaExceededError": "SMS-limiet overschreden. Probeer het later opnieuw.",
    "securityCheckFailed": "Beveiligingsverificatie mislukt. Vernieuw de pagina en probeer opnieuw.",
    "unauthorizedDomainError": "Domein niet gemachtigd voor SMS. Neem contact op met beheer.",
    "smsSendFailed": "SMS kon niet worden verzonden. Probeer het opnieuw.",
    "otpExpiredError": "Verificatiecode is verlopen. Vraag een nieuwe code aan.",
    "invalidOtpError": "Ongeldige code. Controleer de 6-cijferige SMS-code.",
    "tooManyAttemptsError": "Te veel pogingen. Wacht een paar minuten.",
    "verificationFailed": "Verificatie mislukt. Controleer de code en probeer het opnieuw.",
    "rewardCoffeeName": "Gratis Koffie"
 ,
    "ourStory": "Ons Verhaal",
    "exploreMenu": "Menu Bekijken",
    "viewMenu": "Menu Bekijken",
    "continue": "Doorgaan",
    "next": "Volgende",
    "wifiConnectTitle": "Gast Wi-Fi Netwerk",
    "wifiScanPrompt": "Scan met uw camera om automatisch te verbinden",
    "networkName": "Netwerknaam (SSID)",
    "wifiPassword": "Wi-Fi Wachtwoord",
    "wifiQrAlt": "Wi-Fi QR-code",
    "generatingQr": "QR-code genereren...",
    "copied": "Gekopieerd!",
    "copy": "Kopiëren",
    "searchTitle": "Producten Zoeken",
    "searchEmptyPrompt": "Typ om croissants, drankjes of ingrediënten te zoeken.",
    "noResultsFound": "geen overeenkomende producten gevonden.",
    "tryDifferentSearch": "Probeer een andere zoekterm.",
    "clear": "Wissen",
    "closeModal": "Venster Sluiten" },
  "sv": {
    "searchPlaceholder": "Sök croissanter eller drycker...",
    "menuTitle": "NOA Meny & Beställning",
    "myCart": "Varukorg",
    "emptyCart": "Din varukorg är tom",
    "emptyCartDesc": "Välj läckra croissanter och drycker från menyn.",
    "showToCashier": "Visa i kassan",
    "completeOrder": "Slutför beställning",
    "clearCart": "Töm varukorg",
    "total": "Totalt",
    "subtotal": "Delsumma",
    "addToCart": "Lägg i varukorg",
    "customize": "Välj & Anpassa",
    "quickAdd": "Snabbtillägg",
    "smartUpsellTitle": "Perfekt tillbehör till din croissant!",
    "smartUpsellAdd": "Lägg till",
    "orderNumber": "Ditt beställningsnummer",
    "paymentWaiting": "Väntar på betalning i kassan...",
    "preparing": "Betalning godkänd • Tillagas...",
    "ready": "Din beställning är klar att hämtas.",
    "served": "Din beställning har levererats.",
    "cancelled": "Din beställning har avbrutits.",
    "orderSummary": "Beställningsöversikt",
    "paymentMethod": "Betalningsmetod",
    "creditCard": "Kortbetalning",
    "cash": "Kontant",
    "backToMenu": "Tillbaka till menyn",
    "newOrder": "Till menyn & Ny beställning",
    "freeTeaBadge": "Gratis varmt te ingår till ditt matiga croissant!",
    "freeTeaOption": "Jag vill ha gratis te",
    "dailyFresh": "FÄRSKBAKAT VARJE DAG.",
    "prepTime": "TILLAGNINGSTID 10-15 MINUTER.",
    "noaMenusNotice": "NOA SPECIALMENYER OCH SKAPA DIN EGEN CROISSANT.",
    "amoraNotice": "HJÄRTFORMADE NOA CROISSANTER MED BELGISK CHOKLAD.",
    "freshPastry": "BAKAS VARJE MORGON MED ÄKTA FRANSKT SMÖR.",
    "rollNotice": "SERVERAS MED CYLINDRISK FRANSK ROLLDEG OCH KRÄMIG FYLLNING.",
    "cubeNotice": "FRASIGA LAGER-PÅ-LAGER CROISSANTER BAKADE I KUBFORM.",
    "twissyNotice": "FRASIG SNURRAD TWISSY-STRUKTUR MED SMAKRIKA TOPPINGS.",
    "danishNotice": "TILLAGAS DAGLIGEN FÄRSK MED TRÄDGÅRDSBÄR OCH VANILJKRÄM.",
    "classicCroissantNotice": "ALLA VÅRA CROISSANTER BAKAS DAGLIGEN FÄRSKA MED ÄKTA FRANSKT SMÖR.",
    "dietaryFilters": "Kost & Allergener:",
    "allergenAll": "Alla",
    "filterNutFree": "Nötfri",
    "filterDairyFree": "Laktosfri",
    "filterVegetarian": "Vegetariskt",
    "pairingsTitle": "Passar bra till",
    "add": "+ Lägg till",
    "added": "✓ Tillagd",
    "orderNote": "Beställningsnotering (Valfritt)",
    "orderNotePlaceholder": "t.ex. Extra choklad, servera varmt...",
    "completeRequiredSelections": "Vänligen gör alla obligatoriska val.",
    "selected": "✓ Vald",
    "required": "Obligatorisk",
    "oneChoice": "1 val",
    "optional": "Valfritt",
    "maxChoices": "Upp till {n} val",
    "perItem": "/ st",
    "notePrefix": "Notering",
    "orderConfirmation": "Orderbekräftelse",
    "selectPaymentMethod": "Välj betalningsmetod",
    "payWithCardAtCashier": "Betala med kort i kassan",
    "payWithCashAtCashier": "Betala kontant i kassan",
    "amountToPay": "Att betala",
    "creatingOrder": "Skapar beställning...",
    "confirmOrder": "Bekräfta beställning",
    "stepGetNumber": "Få ditt ordernummer",
    "stepPayAtCashier": "Slutför betalning i kassan",
    "stepPreparationNotice": "När betalningen är godkänd i kassan börjar köket förbereda din beställning direkt.",
    "enableNotifications": "Aktivera orderaviseringar.",
    "notificationsActive": "Aviseringar aktiva.",
    "notificationDesc": "Få ljudaviseringar även när skärmen är låst.",
    "notificationActiveDesc": "Din telefon meddelar dig när din beställning är klar.",
    "enableBtn": "Aktivera",
    "activeBtn": "Aktiv",
    "paymentWaitingMsg": "Vänligen gå till kassan med ditt beställningsnummer ({orderNumber}) och betala med {method}.",
    "preparingMsg": "Betalning godkänd! Kockarna tillagar din beställning färsk.",
    "readyMsg": "Vänligen hämta din beställning vid serveringsdisken. Smaklig måltid!",
    "servedMsg": "Tack för att du valde NOA Croissant. Smaklig måltid!",
    "cancelledMsg": "Denna beställning avbröts av kassan eller ledningen.",
    "cancelReasonLabel": "Orsak till avbokning:",
    "paymentMethodLabel": "Betalningsmetod:",
    "totalAmount": "Totalbelopp",
    "shareExperience": "Dela din upplevelse.",
    "reviewDesc": "Din åsikt är mycket värdefull för oss. Betygsätt oss på Google.",
    "rateOnGoogle": "Betygsätt på Google",
    "screenStayNotice": "Stanna kvar på den här skärmen tills din beställning är klar.",
    "instantStatusUpdate": "Statusen uppdateras live på den här skärmen.",
    "refreshPage": "Uppdatera sidan",
    "loyaltyCardTitle": "NOA Kaffestämpelkort",
    "loyaltyCardClub": "NOA STÄMPELKORT",
    "openLoyaltyCard": "Öppna kaffekort",
    "digitalCoffeeCard": "Ditt digitala kaffekort",
    "loyaltyDescription": "Slipp fysiska kort! Samla 1 stämpel för varje kaffe hos NOA. Vid {targetStamps} stämplar bjuder vi på en valfri kaffe.",
    "phoneNumberLabel": "Mobiltelefonnummer",
    "smsNotice": "En 6-siffrig SMS-verifieringskod skickas till din telefon.",
    "sendSmsCode": "Skicka SMS-verifieringskod",
    "enterSmsCode": "Ange SMS-verifieringskod",
    "smsSentNotice": "En 6-siffrig säkerhetskod har skickats till {phone}.",
    "verifyCodeAndOpenCard": "Verifiera kod & Öppna kort",
    "changeNumber": "← Ändra nummer",
    "resendCode": "Skicka koden igen",
    "resendInSeconds": "Skicka igen om ({n}s)",
    "refreshStamps": "Uppdatera stämplar",
    "gift": "GÅVA",
    "stampsZeroMsg": "Samla 1 stämpel per kaffe, få {rewardName} på köpet vid {targetStamps}:e stämpeln!",
    "stampsProgressMsg": "{stamps} / {targetStamps} Stämplar — {remaining} kvar till {rewardName}!",
    "stampsCompletedMsg": "Grattis! Du har fyllt alla {targetStamps} stämplar!",
    "freeRewardVoucherTitle": "1 Gratis {rewardName} Kupong ({count} st)",
    "freeRewardVoucherSubtitle": "Visa denna kod för baristan i kassan för att hämta din gratis kaffe.",
    "codeForCashier": "KASSENS KOD",
    "markAsRedeemed": "Markera som använd",
    "rewardRedeemedSuccess": "Ditt gratisfika har hämtats! Smaklig måltid!",
    "rewardRedeemError": "Kunde inte lösa in din gåva.",
    "howToCollectStamps": "Hur samlar jag stämplar?",
    "howToCollectStampsDesc": "Uppge ditt telefonnummer ({phone}) till baristan i kassan eller beställ digitalt för att automatiskt få stämplar.",
    "viewHistory": "Visa aktivitetshistorik",
    "hideHistory": "Dölj historik",
    "noHistoryRecords": "Inga händelser registrerade än.",
    "totalStampsAllTime": "Totalt antal stämplar:",
    "logout": "Logga ut",
    "invalidPhoneError": "Ange ett giltigt 10-siffrigt mobilnummer.",
    "incompleteOtpError": "Ange hela den 6-siffriga koden.",
    "securityTimeoutError": "Säkerhetsverifieringen tog för lång tid. Försök igen.",
    "invalidPhoneErrorShort": "Ogiltigt telefonnummer. Börja med 05XX.",
    "cookieTitle": "Cookie- och sekretessinställningar",
    "cookieNotice": "Vi använder nödvändiga och funktionella cookies för att ge dig den bästa upplevelsen och hantera dina beställningar säkert.",
    "cookieAccept": "Acceptera alla",
    "cookieEssential": "Endast nödvändiga",
    "tooManySmsError": "För många SMS skickade till detta nummer. Vänta några minuter.",
    "quotaExceededError": "SMS-kvot överskriden. Försök igen senare.",
    "securityCheckFailed": "Säkerhetsverifieringen misslyckades. Ladda om sidan.",
    "unauthorizedDomainError": "Domänen är inte auktoriserad för SMS.",
    "smsSendFailed": "Kunde inte skicka SMS. Försök igen.",
    "otpExpiredError": "Koden har löpt ut. Begär en ny kod.",
    "invalidOtpError": "Felaktig kod. Kontrollera koden i ditt SMS.",
    "tooManyAttemptsError": "För många försök. Vänta några minuter.",
    "verificationFailed": "Verifieringen misslyckades. Kontrollera koden och försök igen.",
    "rewardCoffeeName": "Gratis Kaffe"
 ,
    "ourStory": "Vår Historia",
    "exploreMenu": "Utforska Menyn",
    "viewMenu": "Visa Menyn",
    "continue": "Fortsätt",
    "next": "Nästa",
    "wifiConnectTitle": "Gäst-Wi-Fi",
    "wifiScanPrompt": "Skanna med kameran för automatisk anslutning",
    "networkName": "Nätverksnamn (SSID)",
    "wifiPassword": "Wi-Fi-lösenord",
    "wifiQrAlt": "Wi-Fi QR-kod",
    "generatingQr": "Skapar QR-kod...",
    "copied": "Kopierat!",
    "copy": "Kopiera",
    "searchTitle": "Sök Produkter",
    "searchEmptyPrompt": "Skriv för att söka efter croissanter, drycker eller ingredienser.",
    "noResultsFound": "inga matchande produkter hittades.",
    "tryDifferentSearch": "Prova att söka med ett annat sökord.",
    "clear": "Rensa",
    "closeModal": "Stäng Fönster" },
  "no": {
    "searchPlaceholder": "Søk croissanter eller drikke...",
    "menuTitle": "NOA Meny & Bestilling",
    "myCart": "Handlekurv",
    "emptyCart": "Handlekurven din er tom",
    "emptyCartDesc": "Velg croissanter og drikke fra menyen vår.",
    "showToCashier": "Vis i kassen",
    "completeOrder": "Fullfør bestilling",
    "clearCart": "Tøm handlekurv",
    "total": "Totalt",
    "subtotal": "Delsum",
    "addToCart": "Legg i handlekurv",
    "customize": "Velg & Tilpass",
    "quickAdd": "Hurtigtillegg",
    "smartUpsellTitle": "Perfekt tilbehør til din croissant!",
    "smartUpsellAdd": "Legg til",
    "orderNumber": "Ditt ordrenummer",
    "paymentWaiting": "Venter på betaling i kassen...",
    "preparing": "Betaling godkjent • Tilberedes...",
    "ready": "Bestillingen din er klar til henting.",
    "served": "Bestillingen din er levert.",
    "cancelled": "Bestillingen din ble kansellert.",
    "orderSummary": "Ordresammendrag",
    "paymentMethod": "Betalingsmåte",
    "creditCard": "Kortbetaling",
    "cash": "Kontanter",
    "backToMenu": "Tilbake til meny",
    "newOrder": "Til meny & Ny bestilling",
    "freeTeaBadge": "Gratis varm te følger med din salte croissant!",
    "freeTeaOption": "Jeg vil ha gratis te",
    "dailyFresh": "FERSKBAKT HVER DAG.",
    "prepTime": "TILBEREDNINGSTID 10-15 MINUTTER.",
    "noaMenusNotice": "NOA SPESIALMENYER OG BYGG DIN EGEN CROISSANT.",
    "amoraNotice": "HJERTEFORMEDE NOA CROISSANTER MED BELGISK SJOKOLADE.",
    "freshPastry": "BAKES HVER MORGEN MED FRANSK SMØR.",
    "rollNotice": "SERVERES MED SYLINDRISK FRANSK ROLLDEIG OG FLYTENDE FYLL.",
    "cubeNotice": "SPRØ LAGDELTE CROISSANTER BAKT I GEOMETRISK KUBEFORM.",
    "twissyNotice": "SPRØ SNURRET TWISSY-STRUKTUR MED SMAKFULLE GLASURER.",
    "danishNotice": "TILBEREDES DAGLIG FERSK MED HAGEBÆR OG KONDITORKREM.",
    "classicCroissantNotice": "ALLE VÅRE CROISSANTER BAKES DAGLIG FERSKE MED EKTE FRANSK SMØR.",
    "dietaryFilters": "Kosthold & Allergener:",
    "allergenAll": "Alle",
    "filterNutFree": "Nøttefri",
    "filterDairyFree": "Laktosefri",
    "filterVegetarian": "Vegetarisk",
    "pairingsTitle": "Passer godt til",
    "add": "+ Legg til",
    "added": "✓ Lagt til",
    "orderNote": "Bestillingsnotat (Valgfritt)",
    "orderNotePlaceholder": "f.eks. Ekstra sjokolade, server varmt...",
    "completeRequiredSelections": "Vennligst fullfør alle obligatoriske valg.",
    "selected": "✓ Valgt",
    "required": "Obligatorisk",
    "oneChoice": "1 valg",
    "optional": "Valgfritt",
    "maxChoices": "Opptil {n} valg",
    "perItem": "/ stk",
    "notePrefix": "Notat",
    "orderConfirmation": "Ordrebekreftelse",
    "selectPaymentMethod": "Velg betalingsmåte",
    "payWithCardAtCashier": "Betal med kort i kassen",
    "payWithCashAtCashier": "Betal kontant i kassen",
    "amountToPay": "Beløp å betale",
    "creatingOrder": "Oppretter bestilling...",
    "confirmOrder": "Bekreft bestilling",
    "stepGetNumber": "Få ditt ordrenummer",
    "stepPayAtCashier": "Fullfør betaling i kassen",
    "stepPreparationNotice": "Så snart betalingen er godkjent i kassen, begynner kjøkkenet vårt å tilberede bestillingen din.",
    "enableNotifications": "Aktiver ordrevarsler.",
    "notificationsActive": "Varsler aktive.",
    "notificationDesc": "Få lydvarsler selv når skjermen er låst.",
    "notificationActiveDesc": "Telefonen varsler deg når bestillingen er klar.",
    "enableBtn": "Aktiver",
    "activeBtn": "Aktiv",
    "paymentWaitingMsg": "Vennligst gå til kassen med ordrenummeret ditt ({orderNumber}) og betal med {method}.",
    "preparingMsg": "Betaling godkjent! Kokkene tilbereder bestillingen din fersk.",
    "readyMsg": "Vennligst hent bestillingen din ved disken. Vel bekomme!",
    "servedMsg": "Takk for at du valgte NOA Croissant. Vel bekomme!",
    "cancelledMsg": "Denne bestillingen ble kansellert av kassen eller ledelsen.",
    "cancelReasonLabel": "Kanselleringsgrunn:",
    "paymentMethodLabel": "Betalingsmåte:",
    "totalAmount": "Totalbeløp",
    "shareExperience": "Del din opplevelse.",
    "reviewDesc": "Din tilbakemelding betyr mye for oss. Vurder oss på Google.",
    "rateOnGoogle": "Vurder på Google",
    "screenStayNotice": "Vennligst bli på denne skjermen til bestillingen er fullført.",
    "instantStatusUpdate": "Statusen oppdateres fortløpende på denne skjermen.",
    "refreshPage": "Oppdater siden",
    "loyaltyCardTitle": "NOA Kaffestempelkort",
    "loyaltyCardClub": "NOA STEMPELKORT",
    "openLoyaltyCard": "Åpne kaffekort",
    "digitalCoffeeCard": "Ditt digitale kaffekort",
    "loyaltyDescription": "Slipp fysiske stempelkort! Samle 1 stempel for hver kaffe hos NOA. Ved {targetStamps} stempler får du en valgfri gratis kaffe.",
    "phoneNumberLabel": "Mobiltelefonnummer",
    "smsNotice": "En 6-sifret SMS-kode sendes til telefonen din ved innlogging.",
    "sendSmsCode": "Send SMS-verifiseringskode",
    "enterSmsCode": "Skriv inn SMS-bekreftelseskode",
    "smsSentNotice": "En 6-sifret sikkerhetskode er sendt til {phone}.",
    "verifyCodeAndOpenCard": "Bekreft kode & Åpne kort",
    "changeNumber": "← Endre nummer",
    "resendCode": "Send koden på nytt",
    "resendInSeconds": "Send på nytt om ({n}s)",
    "refreshStamps": "Oppdater stempler",
    "gift": "GAVE",
    "stampsZeroMsg": "Tjen 1 stempel per kaffe, få gratis {rewardName} på det {targetStamps}. stempelet!",
    "stampsProgressMsg": "{stamps} / {targetStamps} Stempler — {remaining} igjen til {rewardName}!",
    "stampsCompletedMsg": "Gratulerer! Du har samlet alle {targetStamps} stemplene!",
    "freeRewardVoucherTitle": "1 Gratis {rewardName} Kupong ({count} stk)",
    "freeRewardVoucherSubtitle": "Vis denne koden til baristaen i kassen for å hente din gratis kaffe.",
    "codeForCashier": "KODE TIL KASSEN",
    "markAsRedeemed": "Marker som brukt",
    "rewardRedeemedSuccess": "Din gratis kaffe er hentet! Kos deg!",
    "rewardRedeemError": "Kunne ikke løse inn kaffekupongen.",
    "howToCollectStamps": "Hvordan samler jeg stempler?",
    "howToCollectStampsDesc": "Oppgi telefonnummeret ditt ({phone}) til baristaen i kassen eller bestill digitalt for å automatisk få stempel for hver kaffe.",
    "viewHistory": "Vis aktivitetshistorikk",
    "hideHistory": "Skjul historikk",
    "noHistoryRecords": "Ingen aktivitet registrert ennå.",
    "totalStampsAllTime": "Totalt antall stempler:",
    "logout": "Logg ut",
    "invalidPhoneError": "Vennligst oppgi et gyldig 10-sifret mobilnummer.",
    "incompleteOtpError": "Vennligst fyll ut hele den 6-sifrede koden.",
    "securityTimeoutError": "Sikkerhetsverifiseringen utløp. Vennligst prøv igjen.",
    "invalidPhoneErrorShort": "Ugyldig telefonnummer. Start med 05XX.",
    "cookieTitle": "Informasjonskapsler og personvern",
    "cookieNotice": "Vi bruker nødvendige og funksjonelle informasjonskapsler for å gi deg best mulig opplevelse og trygg bestilling.",
    "cookieAccept": "Godta alle",
    "cookieEssential": "Kun nødvendige",
    "tooManySmsError": "For mange SMS sendt til dette nummeret. Vent noen minutter.",
    "quotaExceededError": "SMS-kvoten er nådd. Prøv igjen senere.",
    "securityCheckFailed": "Sikkerhetsverifiseringen mislyktes. Oppdater siden.",
    "unauthorizedDomainError": "Domenet er ikke autorisert for SMS-sending.",
    "smsSendFailed": "SMS kunne ikke sendes. Prøv igjen.",
    "otpExpiredError": "Bekreftelseskoden er utløpt. Be om ny kode.",
    "invalidOtpError": "Feil kode. Sjekk koden du mottok på SMS.",
    "tooManyAttemptsError": "For mange forsøk. Vennligst vent noen minutter.",
    "verificationFailed": "Verifisering mislyktes. Sjekk koden og prøv igjen.",
    "rewardCoffeeName": "Gratis Kaffe"
 ,
    "ourStory": "Vår Historie",
    "exploreMenu": "Utforsk Menyen",
    "viewMenu": "Se Menyen",
    "continue": "Fortsett",
    "next": "Neste",
    "wifiConnectTitle": "Gjeste-Wi-Fi",
    "wifiScanPrompt": "Skann med kameraet for å koble til automatisk",
    "networkName": "Nettverksnavn (SSID)",
    "wifiPassword": "Wi-Fi-passord",
    "wifiQrAlt": "Wi-Fi QR-kode",
    "generatingQr": "Genererer QR-kode...",
    "copied": "Kopiert!",
    "copy": "Kopier",
    "searchTitle": "Søk Produkter",
    "searchEmptyPrompt": "Skriv for å søke etter croissanter, drikker eller ingredienser.",
    "noResultsFound": "ingen matchende produkter funnet.",
    "tryDifferentSearch": "Prøv å søke med et annet søkeord.",
    "clear": "Fjern",
    "closeModal": "Lukk Vindu" },
  "fi": {
    "searchPlaceholder": "Hae croissantteja tai juomia...",
    "menuTitle": "NOA Menu & Tilaus",
    "myCart": "Ostoskori",
    "emptyCart": "Ostoskorisi on tyhjä",
    "emptyCartDesc": "Valitse herkulliset croissantit ja juomat ruokalistaltamme.",
    "showToCashier": "Näytä kassalla",
    "completeOrder": "Viimeistele tilaus",
    "clearCart": "Tyhjennä ostoskori",
    "total": "Yhteensä",
    "subtotal": "Välisumma",
    "addToCart": "Lisää ostoskoriin",
    "customize": "Valitse & Muokkaa",
    "quickAdd": "Pikalisäys",
    "smartUpsellTitle": "Täydellinen pari croissantillesi!",
    "smartUpsellAdd": "Lisää",
    "orderNumber": "Tilausnumerosi",
    "paymentWaiting": "Odottaa maksua kassalla...",
    "preparing": "Maksu hyväksytty • Valmistetaan...",
    "ready": "Tilauksesi on valmis noudettavaksi.",
    "served": "Tilauksesi on toimitettu.",
    "cancelled": "Tilauksesi on peruutettu.",
    "orderSummary": "Tilauksen yhteenveto",
    "paymentMethod": "Maksutapa",
    "creditCard": "Maksukortti",
    "cash": "Käteinen",
    "backToMenu": "Takaisin menuun",
    "newOrder": "Menuun & Uusi tilaus",
    "freeTeaBadge": "Ilmainen kuuma tee suolaisen croissantin kanssa!",
    "freeTeaOption": "Haluan ilmaisen teen",
    "dailyFresh": "TUOREENA LEIVOTTU JOKA PÄIVÄ.",
    "prepTime": "VALMISTUSAIKA 10-15 MINUUTTIA.",
    "noaMenusNotice": "NOA ERIKOISMENUT JA RAKENNA OMA CROISSANTTISI.",
    "amoraNotice": "SYDÄMENMUOTOISET NOA CROISSANTIT BELGIALAISELLA SUKLAALLA.",
    "freshPastry": "LEIVOTAAN JOKA AAMU AIDOSTA RANSKALAISVOISTA.",
    "rollNotice": "TARJOILLAAN SYLINTERINMUOTOISELLA RANSKALAISELLA TAIKINALLA JA JUOKSEVALLA TÄYTTEELLÄ.",
    "cubeNotice": "ERIKOISLEIVOTUT KERROKSELLISET CROISSANTIT GEOMETRISESSA KUUTIOMUODOSSA.",
    "twissyNotice": "RAPEA KIERRETTY TWISSY-RAKENNE JA ERIKOISKUORRUTTEET.",
    "danishNotice": "VALMISTETTU PÄIVITTÄIN TUOREISTA PUUTARHAN MARJOISTA JA KREEMISTÄ.",
    "classicCroissantNotice": "KAIKKI CROISSANTTIMME LEIVOTAAN PÄIVITTÄIN TUOREENA AIDOLLA RANSKALAISVOILLA.",
    "dietaryFilters": "Ruokavalio & Allergeenit:",
    "allergenAll": "Kaikki",
    "filterNutFree": "Pähkinätön",
    "filterDairyFree": "Laktoositon",
    "filterVegetarian": "Kasvis",
    "pairingsTitle": "Sopii hyvin yhteen",
    "add": "+ Lisää",
    "added": "✓ Lisätty",
    "orderNote": "Tilaushuomautus (Valinnainen)",
    "orderNotePlaceholder": "esim. Lisää suklaata, tarjoile lämpimänä...",
    "completeRequiredSelections": "Ole hyvä ja tee kaikki pakolliset valinnat.",
    "selected": "✓ Valittu",
    "required": "Pakollinen",
    "oneChoice": "1 valinta",
    "optional": "Valinnainen",
    "maxChoices": "Enintään {n} valintaa",
    "perItem": "/ kpl",
    "notePrefix": "Huom",
    "orderConfirmation": "Tilausvahvistus",
    "selectPaymentMethod": "Valitse maksutapa",
    "payWithCardAtCashier": "Maksa kortilla kassalla",
    "payWithCashAtCashier": "Maksa käteisellä kassalla",
    "amountToPay": "Maksettava summa",
    "creatingOrder": "Luodaan tilausta...",
    "confirmOrder": "Vahvista tilaus",
    "stepGetNumber": "Hanki tilausnumerosi",
    "stepPayAtCashier": "Suorita maksu kassalla",
    "stepPreparationNotice": "Kun maksu on hyväksytty kassalla, keittiömme alkaa valmistaa tilaustasi tuoreena heti.",
    "enableNotifications": "Ota tilausilmoitukset käyttöön.",
    "notificationsActive": "Ilmoitukset käytössä.",
    "notificationDesc": "Vastaanota äänihälytyksiä myös näytön ollessa lukittuna.",
    "notificationActiveDesc": "Puhelimesi ilmoittaa, kun tilaus on valmis.",
    "enableBtn": "Ota käyttöön",
    "activeBtn": "Käytössä",
    "paymentWaitingMsg": "Mene kassalle tilausnumerosi ({orderNumber}) kanssa ja maksa maksutavalla {method}.",
    "preparingMsg": "Maksu hyväksytty! Kokkimme valmistavat tilauksesi tuoreena uunista.",
    "readyMsg": "Nouda tilauksesi tarjoilutiskiltä. Hyvää ruokahalua!",
    "servedMsg": "Kiitos käynnistäsi NOA Croissantissa. Hyvää ruokahalua!",
    "cancelledMsg": "Tilaus peruutettiin kassan tai johdon toimesta.",
    "cancelReasonLabel": "Peruutuksen syy:",
    "paymentMethodLabel": "Maksutapa:",
    "totalAmount": "Kokonaissumma",
    "shareExperience": "Jaa kokemuksesi.",
    "reviewDesc": "Mielipiteesi on meille tärkeä. Arvioi meidät Googlessa.",
    "rateOnGoogle": "Arvioi Googlessa",
    "screenStayNotice": "Pysy tällä näytöllä, kunnes tilauksesi on valmis.",
    "instantStatusUpdate": "Tila päivittyy tällä näytöllä reaaliajassa.",
    "refreshPage": "Päivitä sivu",
    "loyaltyCardTitle": "NOA Kahvipassikortti",
    "loyaltyCardClub": "NOA KAHVIPASSI",
    "openLoyaltyCard": "Avaa kahvipassi",
    "digitalCoffeeCard": "Digitaalinen kahvipassisi",
    "loyaltyDescription": "Ei enää paperisia passikortteja! Kerää 1 leima jokaisesta NOA-kahvista. Kun saavutat {targetStamps} leimaa, saat vapaavalintaisen ilmaisen kahvin.",
    "phoneNumberLabel": "Matkapuhelinnumero",
    "smsNotice": "Saat 6-numeroisen vahvistuskoodin tekstiviestillä kirjautuessasi.",
    "sendSmsCode": "Lähetä tekstiviestikoodi",
    "enterSmsCode": "Syötä tekstiviestin vahvistuskoodi",
    "smsSentNotice": "6-numeroinen turvakoodi on lähetetty numeroon {phone}.",
    "verifyCodeAndOpenCard": "Vahvista koodi ja avaa passi",
    "changeNumber": "← Vaihda numeroa",
    "resendCode": "Lähetä koodi uudelleen",
    "resendInSeconds": "Lähetä uudelleen ({n}s)",
    "refreshStamps": "Päivitä leimat",
    "gift": "LAHJA",
    "stampsZeroMsg": "Ansaitse 1 leima jokaisesta kahvista – {targetStamps}. leimalla ilmainen {rewardName}!",
    "stampsProgressMsg": "{stamps} / {targetStamps} leimaa — vielä {remaining} leimaa ja saat {rewardName}!",
    "stampsCompletedMsg": "Onnittelut! Olet kerännyt kaikki {targetStamps} leimaa!",
    "freeRewardVoucherTitle": "1 Ilmainen {rewardName} -kuponki ({count} kpl)",
    "freeRewardVoucherSubtitle": "Näytä tämä koodi baristalle kassalla lunastaaksesi ilmaisen kahvisi.",
    "codeForCashier": "KASSALLE NÄYTETTÄVÄ KOODI",
    "markAsRedeemed": "Merkitse käytetyksi",
    "rewardRedeemedSuccess": "Ilmainen kahvisi on lunastettu! Nauti!",
    "rewardRedeemError": "Palkinnon lunastus epäonnistui.",
    "howToCollectStamps": "Miten kerään leimoja?",
    "howToCollectStampsDesc": "Ilmoita puhelinnumerosi ({phone}) baristalle kassalla tai tee digitaalinen tilaus ansaitaksesi automaattisesti leiman jokaisesta kahvista.",
    "viewHistory": "Näytä tapahtumahistoria",
    "hideHistory": "Piilota historia",
    "noHistoryRecords": "Ei vielä tapahtumamerkintöjä.",
    "totalStampsAllTime": "Leimoja yhteensä:",
    "logout": "Kirjaudu ulos",
    "invalidPhoneError": "Syötä kelvollinen 10-numeroinen matkapuhelinnumero.",
    "incompleteOtpError": "Syötä koko 6-numeroinen vahvistuskoodi.",
    "securityTimeoutError": "Turvatarkistus aikakatkaistiin. Yritä uudelleen.",
    "invalidPhoneErrorShort": "Virheellinen puhelinnumero. Aloita 05XX.",
    "cookieTitle": "Eväste- ja tietosuoja-asetukset",
    "cookieNotice": "Käytämme välttämättömiä ja toiminnallisia evästeitä parhaan käyttökokemuksen takaamiseksi ja tilausten turvalliseen hallintaan.",
    "cookieAccept": "Hyväksy kaikki",
    "cookieEssential": "Vain välttämättömät",
    "tooManySmsError": "Tähän numeroon on lähetetty liian monta tekstiviestiä. Odota hetki.",
    "quotaExceededError": "Tekstiviestikiintiö täynnä. Yritä myöhemmin uudelleen.",
    "securityCheckFailed": "Turvatarkistus epäonnistui. Päivitä sivu.",
    "unauthorizedDomainError": "Verkkotunnus ei ole valtuutettu tekstiviestien lähettämiseen.",
    "smsSendFailed": "Tekstiviestiä ei voitu lähettää. Yritä uudelleen.",
    "otpExpiredError": "Vahvistuskoodi on vanhentunut. Pyydä uusi koodi.",
    "invalidOtpError": "Virheellinen koodi. Tarkista tekstiviestin 6-numeroinen koodi.",
    "tooManyAttemptsError": "Liian monta yritystä. Odota muutama minuutti.",
    "verificationFailed": "Vahvistus epäonnistui. Tarkista koodi ja yritä uudelleen.",
    "rewardCoffeeName": "Ilmainen Kahvi"
 ,
    "ourStory": "Tarinamme",
    "exploreMenu": "Tutustu Menuun",
    "viewMenu": "Katso Menu",
    "continue": "Jatka",
    "next": "Seuraava",
    "wifiConnectTitle": "Vieras Wi-Fi -verkko",
    "wifiScanPrompt": "Skannaa kameralla yhdistääksesi automaattisesti",
    "networkName": "Verkon Nimi (SSID)",
    "wifiPassword": "Wi-Fi-salasana",
    "wifiQrAlt": "Wi-Fi QR-koodi",
    "generatingQr": "Luodaan QR-koodia...",
    "copied": "Kopioitu!",
    "copy": "Kopioi",
    "searchTitle": "Hae Tuotteita",
    "searchEmptyPrompt": "Kirjoita hakeaksesi croissanteja, juomia tai ainesosia.",
    "noResultsFound": "vastaavia tuotteita ei löytynyt.",
    "tryDifferentSearch": "Kokeile toista hakusanaa.",
    "clear": "Tyhjennä",
    "closeModal": "Sulje Ikkuna" },
  "pl": {
    "searchPlaceholder": "Szukaj croissantów lub napojów...",
    "menuTitle": "NOA Menu & Zamówienie",
    "myCart": "Twój Koszyk",
    "emptyCart": "Twój koszyk jest pusty",
    "emptyCartDesc": "Wybierz pyszne croissanty i napoje z naszego menu.",
    "showToCashier": "Pokaż przy kasie",
    "completeOrder": "Złóż zamówienie",
    "clearCart": "Wyczyść koszyk",
    "total": "Suma",
    "subtotal": "Podsuma",
    "addToCart": "Do koszyka",
    "customize": "Wybierz & Dostosuj",
    "quickAdd": "Szybkie dodanie",
    "smartUpsellTitle": "Pyszny dodatek do Twojego croissanta!",
    "smartUpsellAdd": "Dodaj",
    "orderNumber": "Numer Twojego zamówienia",
    "paymentWaiting": "Oczekiwanie na płatność przy kasie...",
    "preparing": "Płatność zatwierdzona • Przygotowywanie...",
    "ready": "Twoje zamówienie jest gotowe do odbioru.",
    "served": "Twoje zamówienie zostało wydane.",
    "cancelled": "Twoje zamówienie zostało anulowane.",
    "orderSummary": "Podsumowanie zamówienia",
    "paymentMethod": "Metoda płatności",
    "creditCard": "Karta płatnicza",
    "cash": "Gotówka",
    "backToMenu": "Wróć do menu",
    "newOrder": "Do menu & Nowe zamówienie",
    "freeTeaBadge": "Darmowa gorąca herbata do wytrawnego croissanta!",
    "freeTeaOption": "Chcę darmową herbatę",
    "dailyFresh": "ŚWIEŻO PIECZONE KAŻDEGO DNIA.",
    "prepTime": "CZAS PRZYGOTOWANIA 10-15 MINUT.",
    "noaMenusNotice": "SPECJALNE ZESTAWY NOA ORAZ STWÓRZ WŁASNEGO CROISSANTA.",
    "amoraNotice": "SERCOWE CROISSANTY NOA Z BELGIJSKĄ CZEKOLADĄ.",
    "freshPastry": "PIECZONE KAŻDEGO RANKA NA PRAWDZIWYM FRANCUSKIM MAŚLE.",
    "rollNotice": "PODAWANY Z CYLINDRYCZNYM FRANCUSKIM CIASTEM ROLL I PŁYNNYM NADZIENIEM.",
    "cubeNotice": "CHRUPIĄCE CROISSANTY PIECZONE W GEOMETRYCZNYM KSZTAŁCIE SZEŚCIANU.",
    "twissyNotice": "CHRUPIĄCA ZAKRĘCONA STRUKTURA TWISSY Z AUTORSKIMI POLEWAMI.",
    "danishNotice": "PRZYGOTOWYWANY CODZIENNIE ZE ŚWIEŻYMI OWOCAMI OGRODOWYMI I KREMEM CUKIERNICZYM.",
    "classicCroissantNotice": "WSZYSTKIE NASZE CROISSANTY SĄ PIECZONE CODZIENNIE ZE ŚWIEŻEGO FRANCUSKIEGO MASŁA.",
    "dietaryFilters": "Dieta i alergeny:",
    "allergenAll": "Wszystko",
    "filterNutFree": "Bez orzechów",
    "filterDairyFree": "Bez laktozy",
    "filterVegetarian": "Wegetariańskie",
    "pairingsTitle": "Doskonale pasuje do",
    "add": "+ Dodaj",
    "added": "✓ Dodano",
    "orderNote": "Uwagi do zamówienia (Opcjonalnie)",
    "orderNotePlaceholder": "np. Więcej czekolady, podawać na ciepło...",
    "completeRequiredSelections": "Proszę dokonać wszystkich wymaganych wyborów.",
    "selected": "✓ Wybrano",
    "required": "Wymagane",
    "oneChoice": "1 wybór",
    "optional": "Opcjonalnie",
    "maxChoices": "Do {n} wyborów",
    "perItem": "/ szt.",
    "notePrefix": "Uwagi",
    "orderConfirmation": "Potwierdzenie zamówienia",
    "selectPaymentMethod": "Wybierz metodę płatności",
    "payWithCardAtCashier": "Płatność kartą przy kasie",
    "payWithCashAtCashier": "Płatność gotówką przy kasie",
    "amountToPay": "Kwota do zapłaty",
    "creatingOrder": "Tworzenie zamówienia...",
    "confirmOrder": "Potwierdź zamówienie",
    "stepGetNumber": "Odbierz numer zamówienia",
    "stepPayAtCashier": "Dokończ płatność przy kasie",
    "stepPreparationNotice": "Gdy płatność zostanie zatwierdzona przy kasie, zespół kuchni natychmiast rozpocznie przygotowywanie zamówienia.",
    "enableNotifications": "Włącz powiadomienia o zamówieniu.",
    "notificationsActive": "Powiadomienia aktywne.",
    "notificationDesc": "Otrzymuj alerty dźwiękowe nawet przy zablokowanym ekranie.",
    "notificationActiveDesc": "Twój telefon powiadomi Cię, gdy zamówienie będzie gotowe.",
    "enableBtn": "Włącz",
    "activeBtn": "Aktywne",
    "paymentWaitingMsg": "Podejdź do kasy z numerem zamówienia ({orderNumber}) i zapłać: {method}.",
    "preparingMsg": "Płatność zatwierdzona! Szefowie kuchni przygotowują świeże wypieki.",
    "readyMsg": "Odbierz zamówienie przy ladzie wydawczej. Smacznego!",
    "servedMsg": "Dziękujemy za wizytę w NOA Croissant. Smacznego!",
    "cancelledMsg": "Zamówienie zostało anulowane przez kasę lub obsługę.",
    "cancelReasonLabel": "Powód anulowania:",
    "paymentMethodLabel": "Metoda płatności:",
    "totalAmount": "Całkowita kwota",
    "shareExperience": "Podziel się wrażeniami.",
    "reviewDesc": "Twoja opinia jest dla nas bezcenna. Oceń nas w Google.",
    "rateOnGoogle": "Oceń w Google",
    "screenStayNotice": "Prosimy pozostać na tym ekranie do momentu ukończenia zamówienia.",
    "instantStatusUpdate": "Status będzie aktualizowany na bieżąco na tym ekranie.",
    "refreshPage": "Odśwież stronę",
    "loyaltyCardTitle": "Karta Lojalnościowa NOA Kawa",
    "loyaltyCardClub": "NOA KARTA KAWY",
    "openLoyaltyCard": "Otwórz kartę kawy",
    "digitalCoffeeCard": "Twoja Cyfrowa Karta Kawowa",
    "loyaltyDescription": "Koniec z noszeniem kart! Zbieraj 1 pieczątkę za każdą kawę w NOA. Zbierz {targetStamps} pieczątek i odbierz darmową kawę.",
    "phoneNumberLabel": "Numer Telefonu Komórkowego",
    "smsNotice": "6-cyfrowy kod SMS zostanie wysłany na Twój telefon.",
    "sendSmsCode": "Wyślij Kod Weryfikacyjny SMS",
    "enterSmsCode": "Wprowadź Kod SMS",
    "smsSentNotice": "6-cyfrowy kod bezpieczeństwa został wysłany na {phone}.",
    "verifyCodeAndOpenCard": "Zweryfikuj Kod i Otwórz Kartę",
    "changeNumber": "← Zmień numer",
    "resendCode": "Wyślij kod ponownie",
    "resendInSeconds": "Wyślij ponownie za ({n}s)",
    "refreshStamps": "Odśwież pieczątki",
    "gift": "PREZENT",
    "stampsZeroMsg": "Zbieraj 1 pieczątkę za każdą kawę, a {targetStamps}. pieczątka to darmowa {rewardName}!",
    "stampsProgressMsg": "{stamps} / {targetStamps} Pieczątek — jeszcze {remaining} do {rewardName}!",
    "stampsCompletedMsg": "Gratulacje! Ukończono {targetStamps} pieczątek!",
    "freeRewardVoucherTitle": "1 Kupon na Darmową {rewardName} ({count} szt.)",
    "freeRewardVoucherSubtitle": "Pokaż ten kod bariście przy kasie, aby odebrać darmową kawę.",
    "codeForCashier": "KOD DLA KASY",
    "markAsRedeemed": "Oznacz jako wykorzystany",
    "rewardRedeemedSuccess": "Darmowa kawa została odebrana! Smacznego!",
    "rewardRedeemError": "Nie udało się zrealizować kuponu.",
    "howToCollectStamps": "Jak zbierać pieczątki?",
    "howToCollectStampsDesc": "Podaj swój numer telefonu ({phone}) bariście przy kasie lub złóż zamówienie cyfrowe, aby automatycznie zbierać pieczątki.",
    "viewHistory": "Zobacz historię aktywności",
    "hideHistory": "Ukryj historię",
    "noHistoryRecords": "Brak wpisów w historii.",
    "totalStampsAllTime": "Wszystkie pieczątki:",
    "logout": "Wyloguj się",
    "invalidPhoneError": "Wprowadź prawidłowy 10-cyfrowy numer telefonu.",
    "incompleteOtpError": "Wprowadź pełny 6-cyfrowy kod weryfikacyjny.",
    "securityTimeoutError": "Weryfikacja wygasła. Spróbuj ponownie.",
    "invalidPhoneErrorShort": "Nieprawidłowy numer telefonu. Zacznij od 05XX.",
    "cookieTitle": "Preferencje plików cookie i prywatności",
    "cookieNotice": "Używamy niezbędnych i funkcjonalnych plików cookie, aby zapewnić najlepszą jakość obsługi i bezpiecznie realizować zamówienia.",
    "cookieAccept": "Zaakceptuj wszystkie",
    "cookieEssential": "Tylko niezbędne",
    "tooManySmsError": "Zbyt wiele SMS-ów wysłanych na ten numer. Poczekaj kilka minut.",
    "quotaExceededError": "Limit SMS wyczerpany. Spróbuj później.",
    "securityCheckFailed": "Weryfikacja bezpieczeństwa nie powiodła się. Odśwież stronę.",
    "unauthorizedDomainError": "Domena nie jest autoryzowana do wysyłania SMS-ów.",
    "smsSendFailed": "Nie udało się wysłać SMS-a. Spróbuj ponownie.",
    "otpExpiredError": "Kod weryfikacyjny wygasł. Poproś o nowy kod.",
    "invalidOtpError": "Nieprawidłowy kod. Sprawdź 6-cyfrowy kod z wiadomości SMS.",
    "tooManyAttemptsError": "Zbyt wiele prób. Odczekaj kilka minut.",
    "verificationFailed": "Weryfikacja nie powiodła się. Sprawdź kod i spróbuj ponownie.",
    "rewardCoffeeName": "Darmowa Kawa"
 ,
    "ourStory": "Nasza Historia",
    "exploreMenu": "Odkryj Menu",
    "viewMenu": "Zobacz Menu",
    "continue": "Kontynuuj",
    "next": "Dalej",
    "wifiConnectTitle": "Sieć Wi-Fi dla Gości",
    "wifiScanPrompt": "Zeskanuj aparatem, aby połączyć się automatycznie",
    "networkName": "Nazwa Sieci (SSID)",
    "wifiPassword": "Hasło do Wi-Fi",
    "wifiQrAlt": "Kod QR Wi-Fi",
    "generatingQr": "Generowanie kodu QR...",
    "copied": "Skopiowano!",
    "copy": "Kopiuj",
    "searchTitle": "Szukaj Produktów",
    "searchEmptyPrompt": "Wpisz, aby wyszukać croissanty, napoje lub składniki.",
    "noResultsFound": "nie znaleziono pasujących produktów.",
    "tryDifferentSearch": "Spróbuj wyszukać inne słowo kluczowe.",
    "clear": "Wyczyść",
    "closeModal": "Zamknij Okno" },
  "ar": {
    "searchPlaceholder": "البحث عن الكرواسان أو المشروبات...",
    "menuTitle": "قائمة نوا والطلب",
    "myCart": "سلتي",
    "emptyCart": "سلتك فارغة",
    "emptyCartDesc": "اختر أشهى الكرواسان والمشروبات من القائمة لإضافتها إلى السلة.",
    "showToCashier": "إظهار عند الكاشير",
    "completeOrder": "إتمام الطلب",
    "clearCart": "تفريغ السلة",
    "total": "المجموع",
    "subtotal": "المجموع الفرعي",
    "addToCart": "إضافة إلى السلة",
    "customize": "تخصيص الطلب",
    "quickAdd": "إضافة سريعة",
    "smartUpsellTitle": "مشروب رائع يكتمل به الكرواسان!",
    "smartUpsellAdd": "إضافة",
    "orderNumber": "رقم طلبك",
    "paymentWaiting": "بانتظار الدفع عند الكاشير...",
    "preparing": "تم تأكيد الدفع • جاري التحضير...",
    "ready": "طلبك جاهز • يمكنك الاستلام.",
    "served": "تم تسليم الطلب.",
    "cancelled": "تم إلغاء الطلب.",
    "orderSummary": "ملخص الطلب",
    "paymentMethod": "طريقة الدفع",
    "creditCard": "بطاقة بنكية",
    "cash": "نقداً",
    "backToMenu": "العودة للقائمة",
    "newOrder": "العودة للقائمة وطلب جديد",
    "freeTeaBadge": "شاي تركي ساخن مجاناً مع كل كرواسان مالح!",
    "freeTeaOption": "أريد الشاي المجاني",
    "dailyFresh": "طازج ومخبوز يومياً.",
    "prepTime": "مدة التحضير من 10 إلى 15 دقيقة.",
    "noaMenusNotice": "قوائم نوا الخاصة وإمكانية ابتكار كرواسانك المفضل.",
    "amoraNotice": "كرواسان عمورا الأيقوني على شكل قلب بالشوكولاتة البلجيكية.",
    "freshPastry": "مخبوز كل صباح بالزبدة الفرنسية الفاخرة.",
    "rollNotice": "يُقدم بعجينة الرول الفرنسية الأسطوانية مع حشوة غنية وسلسة.",
    "cubeNotice": "كرواسون مورق مخبوز بشكل مميز على هيئة مكعب هندسي.",
    "twissyNotice": "قوام التويسي المقرمش الملتوي مع تغطيات خاصة ومميزة.",
    "danishNotice": "يُحضر يومياً طازجاً مع توت وثمار الحديقة وكريمة الباتيسيير.",
    "classicCroissantNotice": "جميع أنواع الكرواسون تُخبز يومياً طازجة بالزبدة الفرنسية الأصيلة.",
    "dietaryFilters": "الحمية والحساسية:",
    "allergenAll": "الكل",
    "filterNutFree": "خالٍ من المكسرات",
    "filterDairyFree": "خالٍ من اللاكتوز",
    "filterVegetarian": "نباتي",
    "pairingsTitle": "يناسب تماماً مع",
    "add": "+ إضافة",
    "added": "✓ تمت الإضافة",
    "orderNote": "ملاحظة الطلب (اختياري)",
    "orderNotePlaceholder": "مثال: شوكولاتة إضافية، يُقدم دافئاً...",
    "completeRequiredSelections": "يرجى استكمال جميع الخيارات المطلوبة.",
    "selected": "✓ تم الاختيار",
    "required": "مطلوب",
    "oneChoice": "خيار واحد",
    "optional": "اختياري",
    "maxChoices": "حتى {n} خيارات",
    "perItem": "/ قطعة",
    "notePrefix": "ملاحظة",
    "orderConfirmation": "تأكيد الطلب",
    "selectPaymentMethod": "اختر طريقة الدفع",
    "payWithCardAtCashier": "الدفع بالبطاقة عند الكاشير",
    "payWithCashAtCashier": "الدفع نقداً عند الكاشير",
    "amountToPay": "المبلغ المطلوب",
    "creatingOrder": "جاري إنشاء الطلب...",
    "confirmOrder": "تأكيد الطلب",
    "stepGetNumber": "استلم رقم طلبك",
    "stepPayAtCashier": "أتمم الدفع عند الكاشير",
    "stepPreparationNotice": "بمجرد تأكيد الدفع عند الكاشير، سيبدأ فريق المطبخ فوراً في تحضير طلبك طازجاً.",
    "enableNotifications": "تفعيل إشعارات الطلب.",
    "notificationsActive": "الإشعارات مفعلة.",
    "notificationDesc": "استلم تنبيهات صوتية حتى عند قفل الشاشة.",
    "notificationActiveDesc": "سيهتز هاتفك فور خروج طلبك من الفرن.",
    "enableBtn": "تفعيل",
    "activeBtn": "مفعل",
    "paymentWaitingMsg": "يرجى التوجه إلى الكاشير برقم طلبك ({orderNumber}) وإتمام الدفع بواسطة {method}.",
    "preparingMsg": "تم تأكيد الدفع! يقوم طهاتنا بتحضير طلبك طازجاً من الفرن.",
    "readyMsg": "يرجى استلام طلبك من مكتب التسليم. بالهناء والشفاء!",
    "servedMsg": "شكراً لزيارتكم كرواسان نوا. بالهناء والشفاء!",
    "cancelledMsg": "تم إلغاء هذا الطلب من قبل الكاشير أو الإدارة.",
    "cancelReasonLabel": "سبب الإلغاء:",
    "paymentMethodLabel": "طريقة الدفع:",
    "totalAmount": "المبلغ الإجمالي",
    "shareExperience": "شاركنا تجربتك.",
    "reviewDesc": "رأيكم يهمنا جداً. يرجى تقييم تجربتكم على جوجل.",
    "rateOnGoogle": "التقييم على جوجل",
    "screenStayNotice": "يرجى البقاء في هذه الصفحة حتى اكتمال تجهيز طلبك.",
    "instantStatusUpdate": "سيتم تحديث الحالة مباشرة في هذه الشاشة.",
    "refreshPage": "تحديث الصفحة",
    "loyaltyCardTitle": "بطاقة ولاء قهوة نوا",
    "loyaltyCardClub": "بطاقة ولاء نوا",
    "openLoyaltyCard": "افتح بطاقة القهوة",
    "digitalCoffeeCard": "بطاقة القهوة الرقمية الخاصة بك",
    "loyaltyDescription": "لا داعي للبطاقات الورقية! اجمع ختمًا واحدًا مع كل قهوة تطلبها في نوا، وعند الوصول إلى {targetStamps} أختام ستحصل على قهوة مجانية من اختيارك.",
    "phoneNumberLabel": "رقم الهاتف المحمول",
    "smsNotice": "سيتم إرسال رمز تحقق مكون من 6 أرقام عبر رسالة SMS إلى هاتفك.",
    "sendSmsCode": "إرسال رمز التحقق عبر SMS",
    "enterSmsCode": "أدخل رمز التحقق المرسل عبر SMS",
    "smsSentNotice": "تم إرسال رمز أمان مكون من 6 أرقام إلى {phone}.",
    "verifyCodeAndOpenCard": "تأكيد الرمز وفتح البطاقة",
    "changeNumber": "← تغيير الرقم",
    "resendCode": "إعادة إرسال الرمز",
    "resendInSeconds": "إعادة الإرسال خلال ({n} ثانية)",
    "refreshStamps": "تحديث الأختام",
    "gift": "هدية",
    "stampsZeroMsg": "احصل على ختم واحد مع كل قهوة، وعند الختم رقم {targetStamps} ستحصل على {rewardName} مجاناً!",
    "stampsProgressMsg": "{stamps} / {targetStamps} أختام — متبقي {remaining} للحصول على {rewardName}!",
    "stampsCompletedMsg": "تهانينا! لقد جمعت {targetStamps} أختام بنجاح!",
    "freeRewardVoucherTitle": "قسيمة {rewardName} مجانية واحدة ({count} متوفرة)",
    "freeRewardVoucherSubtitle": "أظهر هذا الرمز للباريستا عند الكاشير للحصول على قهوتك المجانية.",
    "codeForCashier": "الرمز المخصص للكاشير",
    "markAsRedeemed": "تحديد كمستخدم",
    "rewardRedeemedSuccess": "تم استلام قهوتك المجانية بنجاح! بالعافية.",
    "rewardRedeemError": "تعذر إتمام عملية استبدال المكافأة.",
    "howToCollectStamps": "كيف أجمع الأختام؟",
    "howToCollectStampsDesc": "يمكنك تزويد الباريستا برقم هاتفك ({phone}) عند الكاشير أو الطلب عبر التطبيق لجمع الأختام تلقائيًا مع كل قهوة.",
    "viewHistory": "عرض سجل العمليات",
    "hideHistory": "إخفاء السجل",
    "noHistoryRecords": "لا توجد سجلات عمليات حتى الآن.",
    "totalStampsAllTime": "إجمالي الأختام:",
    "logout": "تسجيل الخروج",
    "invalidPhoneError": "يرجى إدخال رقم هاتف محمول صحيح مكون من 10 أرقام.",
    "incompleteOtpError": "يرجى إدخال رمز التحقق المكون من 6 أرقام كاملاً.",
    "securityTimeoutError": "انتهت مهلة التحقق الأمني. يرجى المحاولة مرة أخرى.",
    "invalidPhoneErrorShort": "رقم هاتف غير صالح. يرجى البدء بـ 05XX.",
    "cookieTitle": "تفضيلات ملفات تعريف الارتباط والخصوصية",
    "cookieNotice": "نستخدم ملفات تعريف الارتباط الأساسية والوظيفية لتقديم أفضل تجربة وإدارة طلباتك بأمان.",
    "cookieAccept": "قبول الكل",
    "cookieEssential": "الأساسية فقط",
    "tooManySmsError": "تم إرسال عدد كبير جداً من الرسائل لهذا الرقم. يرجى الانتظار بضع دقائق.",
    "quotaExceededError": "تم تجاوز حصة الرسائل القصيرة. يرجى المحاولة لاحقاً.",
    "securityCheckFailed": "فشل التحقق الأمني. يرجى تحديث الصفحة والمحاولة مجدداً.",
    "unauthorizedDomainError": "هذا النطاق غير مصرح له بإرسال الرسائل القصيرة.",
    "smsSendFailed": "تعذر إرسال رسالة SMS. يرجى المحاولة مرة أخرى.",
    "otpExpiredError": "انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد.",
    "invalidOtpError": "الرمز المدخل غير صحيح. يرجى التحقق من الرمز المكون من 6 أرقام.",
    "tooManyAttemptsError": "محاولات كثيرة جداً. يرجى الانتظار بضع دقائق.",
    "verificationFailed": "فشل التحقق. يرجى التأكد من الرمز والمحاولة مجدداً.",
    "rewardCoffeeName": "قهوة مجانية"
 ,
    "ourStory": "قصتنا",
    "exploreMenu": "استكشف القائمة",
    "viewMenu": "عرض القائمة",
    "continue": "متابعة",
    "next": "التالي",
    "wifiConnectTitle": "شبكة واي فاي للضيوف",
    "wifiScanPrompt": "امسح الرمز بالكاميرا للاتصال تلقائياً بدون كلمة مرور",
    "networkName": "اسم الشبكة (SSID)",
    "wifiPassword": "كلمة مرور الواي فاي",
    "wifiQrAlt": "رمز الاستجابة السريعة للواي فاي",
    "generatingQr": "جارٍ إنشاء رمز الاستجابة...",
    "copied": "تم النسخ!",
    "copy": "نسخ",
    "searchTitle": "البحث عن المنتجات",
    "searchEmptyPrompt": "اكتب للبحث عن الكرواسان، المشروبات أو المكونات.",
    "noResultsFound": "لم يتم العثور على منتجات مطابقة.",
    "tryDifferentSearch": "جرب البحث بكلمة مفتاحية مختلفة.",
    "clear": "مسح",
    "closeModal": "إغلاق النافذة" }
};

export const CATEGORY_TRANSLATIONS: Record<string, Record<Language, string>> = {
  "NOA Menüler": {
    "tr": "NOA Menüler",
    "en": "NOA Menus",
    "de": "NOA Menüs",
    "ru": "NOA Меню",
    "nl": "NOA Menu's",
    "sv": "NOA Menyer",
    "no": "NOA Menyer",
    "fi": "NOA Menut",
    "pl": "Menu NOA",
    "ar": "قوائم نوا"
  },
  "Klasik Tatlı": {
    "tr": "Klasik Tatlı",
    "en": "Classic Sweet",
    "de": "Klassisch Süß",
    "ru": "Классические сладкие",
    "nl": "Klassiek Zoet",
    "sv": "Klassisk Söt",
    "no": "Klassisk Søt",
    "fi": "Perinteiset makeat",
    "pl": "Klasyczne słodkie",
    "ar": "حلويات كلاسيكية"
  },
  "Twissy": {
    "tr": "Twissy",
    "en": "Twissy",
    "de": "Twissy",
    "ru": "Твисси",
    "nl": "Twissy",
    "sv": "Twissy",
    "no": "Twissy",
    "fi": "Twissy",
    "pl": "Twissy",
    "ar": "تويسي"
  },
  "Danish": {
    "tr": "Danish",
    "en": "Danish",
    "de": "Dänisch",
    "ru": "Датская выпечка",
    "nl": "Deens Gebak",
    "sv": "Danskt Wienerbröd",
    "no": "Dansk Wienerbrød",
    "fi": "Tanskalaiset Viinerit",
    "pl": "Ciastka Duńskie",
    "ar": "دانش فرنسي"
  },
  "Roll": {
    "tr": "Roll",
    "en": "Roll",
    "de": "Roll Croissant",
    "ru": "Ролл Круассан",
    "nl": "Roll Croissant",
    "sv": "Rullcroissant",
    "no": "Rullcroissant",
    "fi": "Rullacroissant",
    "pl": "Roll Croissant",
    "ar": "رول كرواسان"
  },
  "Küp": {
    "tr": "Küp",
    "en": "Cube Croissant",
    "de": "Würfel-Croissant",
    "ru": "Кубический круассан",
    "nl": "Kubus Croissant",
    "sv": "Kubcroissant",
    "no": "Kubecroissant",
    "fi": "Kuutiocroissant",
    "pl": "Kostka Croissant",
    "ar": "كرواسان مكعب"
  },
  "Amora": {
    "tr": "Amora",
    "en": "Amora Heart",
    "de": "Amora Herz",
    "ru": "Амора Сердце",
    "nl": "Amora Hart",
    "sv": "Amora Hjärta",
    "no": "Amora Hjerte",
    "fi": "Amora Sydän",
    "pl": "Amora Serce",
    "ar": "أمورا القلوب"
  },
  "Cheesecake": {
    "tr": "Cheesecake",
    "en": "Cheesecake",
    "de": "Cheesecake",
    "ru": "Чизкейки",
    "nl": "Cheesecake",
    "sv": "Cheesecake",
    "no": "Ostekake",
    "fi": "Juustokakut",
    "pl": "Serniki",
    "ar": "تشيز كيك"
  },
  "Waffle": {
    "tr": "Waffle",
    "en": "Waffle",
    "de": "Waffel",
    "ru": "Вафли",
    "nl": "Wafels",
    "sv": "Våffla",
    "no": "Vaffel",
    "fi": "Vohvelit",
    "pl": "Gofry",
    "ar": "وافل"
  },
  "Tuzlu Kruvasanlar": {
    "tr": "Tuzlu Kruvasanlar",
    "en": "Savoury Croissants",
    "de": "Herzhafte Croissants",
    "ru": "Сытные круассаны",
    "nl": "Hartige Croissants",
    "sv": "Matiga Croissanter",
    "no": "Salte Croissanter",
    "fi": "Suolaiset Croissantit",
    "pl": "Wytrawne Croissanty",
    "ar": "كرواسان مالح"
  },
  "NOA İçecekler": {
    "tr": "NOA İçecekler",
    "en": "NOA Beverages",
    "de": "NOA Getränke",
    "ru": "NOA Напитки",
    "nl": "NOA Dranken",
    "sv": "NOA Drycker",
    "no": "NOA Drikke",
    "fi": "NOA Juomat",
    "pl": "Napoje NOA",
    "ar": "مشروبات نوا"
  },
  "Soğuk Kahveler": {
    "tr": "Soğuk Kahveler",
    "en": "Cold Coffees",
    "de": "Eiskaffee & Kalt",
    "ru": "Холодный кофе",
    "nl": "Koude Koffie",
    "sv": "Kalla Kaffedrycker",
    "no": "Kald Kaffe",
    "fi": "Kylmät Kahvit",
    "pl": "Kawa Mrożona",
    "ar": "قهوة باردة"
  },
  "Sıcak Kahveler": {
    "tr": "Sıcak Kahveler",
    "en": "Hot Coffees",
    "de": "Heiße Kaffees",
    "ru": "Горячий кофе",
    "nl": "Warme Koffie",
    "sv": "Varma Kaffedrycker",
    "no": "Varm Kaffe",
    "fi": "Kuumat Kahvit",
    "pl": "Kawa Gorąca",
    "ar": "قهوة ساخنة"
  },
  "Dondurma": {
    "tr": "Dondurma",
    "en": "Artisan Gelato Scoop",
    "de": "Artisan Gelato Eis",
    "ru": "Ремесленное мороженое",
    "nl": "Artisanaal Gelato IJs",
    "sv": "Artisan Gelato Glass",
    "no": "Håndverks-iskrem",
    "fi": "Käsityöläisjäätelö",
    "pl": "Rzemieślnicze Lody Gelato",
    "ar": "آيس كريم جيلاتو فاخر"
  },
  "Soft İçecekler": {
    "tr": "Soft İçecekler",
    "en": "Soft Drinks",
    "de": "Erfrischungsgetränke",
    "ru": "Безалкогольные напитки",
    "nl": "Frisdranken",
    "sv": "Läskedrycker",
    "no": "Alkoholfri Drikke",
    "fi": "Virvoitusjuomat",
    "pl": "Napoje Bezalkoholowe",
    "ar": "مشروبات منعشة وخفيفة"
  },
  "Özel Çaylar": {
    "tr": "Özel Çaylar",
    "en": "Specialty Teas",
    "de": "Spezial-Tees",
    "ru": "Особый чай",
    "nl": "Speciale Thee",
    "sv": "Specialteer",
    "no": "Spesialte",
    "fi": "Erikoisteet",
    "pl": "Herbaty Specjalne",
    "ar": "شاي مميز"
  }
};

export const PRODUCT_TRANSLATIONS: Record<string, Record<Language, { name: string; desc?: string }>> = {
  "NOA Tatlı Kruvasan'ını Oluştur": {
    "tr": {
      "name": "NOA Tatlı Kruvasan'ını Oluştur",
      "desc": "Kruvasan arasına; Belçika çikolatası, mevsim meyveleri, taze kremalar ve soslar seçerek kendi özel lezzetinizi tasarlayın."
    },
    "en": {
      "name": "Build Your Sweet Croissant",
      "desc": "Craft your dream croissant: choose Belgian chocolates, fresh fruits, patisserie creams and gourmet toppings."
    },
    "de": {
      "name": "Süßes Croissant Zusammenstellen",
      "desc": "Kreieren Sie Ihr Croissant: Wählen Sie belgische Schokolade, frische Früchte, Cremes und Toppings."
    },
    "ru": {
      "name": "Собери Сладкий Круассан",
      "desc": "Создайте свой круассан: выберите бельгийский шоколад, свежие фрукты, кремы и топпинги."
    },
    "nl": {
      "name": "Stel Je Zoete Croissant Samen",
      "desc": "Creëer je eigen croissant: kies Belgische chocolade, vers fruit, crèmes en sauzen."
    },
    "sv": {
      "name": "Bygg Din Söta Croissant",
      "desc": "Skapa din egen croissant: välj belgisk choklad, färsk frukt, krämer och såser."
    },
    "no": {
      "name": "Bygg Din Søte Croissant",
      "desc": "Lag din egen croissant: velg belgisk sjokolade, fersk frukt, kremer og sauser."
    },
    "fi": {
      "name": "Rakenna Makea Croissanttisi",
      "desc": "Luo unelmiesi croissant: valitse belgialainen suklaa, tuoreet hedelmät, kreemit ja kastikkeet."
    },
    "pl": {
      "name": "Skomponuj Słodkiego Croissanta",
      "desc": "Stwórz własnego croissanta: wybierz belgijską czekoladę, świeże owoce, kremy i polewy."
    },
    "ar": {
      "name": "ابتكر كرواسانك الحلو",
      "desc": "اختر نوع الشوكولاتة البلجيكية، الفواكه الطازجة، الكريمات والصلصات لابتكار كرواسانك الخاص."
    }
  },
  "NOA Tuzlu Kruvasan'ını Oluştur": {
    "tr": {
      "name": "NOA Tuzlu Kruvasan'ını Oluştur",
      "desc": "Seçeceğiniz kruvasan arasına; seçeceğiniz 4 adet malzeme, 1 adet sos. Elma dilim patates ile servis edilir."
    },
    "en": {
      "name": "Build Your Savoury Croissant",
      "desc": "Your choice of croissant base with 4 gourmet fillings and 1 sauce. Served with crispy potato wedges."
    },
    "de": {
      "name": "Herzhaftes Croissant Zusammenstellen",
      "desc": "Wählen Sie Ihr Croissant mit 4 Gourmet-Zutaten und 1 Sauce. Serviert mit Kartoffelspalten."
    },
    "ru": {
      "name": "Собери Сытный Круассан",
      "desc": "Круассан на выбор с 4 начинками и 1 соусом. Подается с картофельными дольками."
    },
    "nl": {
      "name": "Stel Je Hartige Croissant Samen",
      "desc": "Kies je croissant met 4 ingrediënten en 1 saus. Geserveerd met aardappelpartjes."
    },
    "sv": {
      "name": "Bygg Din Matiga Croissant",
      "desc": "Välj croissant med 4 fyllningar och 1 sås. Serveras med klyftpotatis."
    },
    "no": {
      "name": "Bygg Din Salte Croissant",
      "desc": "Velg croissant med 4 fyll og 1 saus. Serveres med potetbåter."
    },
    "fi": {
      "name": "Rakenna Suolainen Croissanttisi",
      "desc": "Valitse croissant, 4 täytettä ja 1 kastike. Tarjoillaan lohkoperunoiden kera."
    },
    "pl": {
      "name": "Skomponuj Wytrawnego Croissanta",
      "desc": "Wybierz croissanta, 4 składniki i 1 sos. Podawany z pieczonymi ziemniaczkami."
    },
    "ar": {
      "name": "ابتكر كرواسانك المالح",
      "desc": "اختر نوع الكرواسان مع 4 إضافات وصلصة واحدة من اختيارك. يُقدم مع بطاطا ودجز مقرمشة."
    }
  },
  "NOA Tatlı & Tuzlu İkili": {
    "tr": {
      "name": "NOA Tatlı & Tuzlu İkili",
      "desc": "Dopdolu ikili servis: Şefin seçtiği tatlı ve tuzlu kruvasan ikilisi."
    },
    "en": {
      "name": "NOA Sweet & Savoury Duo",
      "desc": "The ultimate combo plate: Chef's curated sweet and savoury croissant pairing."
    },
    "de": {
      "name": "NOA Süß & Herzhaft Duo",
      "desc": "Das beste Kombi-Menü: Vom Chefkoch ausgewähltes süßes und herzhaftes Croissant."
    },
    "ru": {
      "name": "NOA Сладкий и Сытный Дуэт",
      "desc": "Идеальный комбо-сет: сладкий и сытный круассаны от шефа."
    },
    "nl": {
      "name": "NOA Zoet & Hartig Duo",
      "desc": "De ultieme combinatie: door de chef geselecteerde zoete en hartige croissant."
    },
    "sv": {
      "name": "NOA Söt & Matig Duo",
      "desc": "Den ultimata combotallriken: Kockens utvalda söta och matiga croissant."
    },
    "no": {
      "name": "NOA Søt & Salt Duo",
      "desc": "Den ultimate kombotallerkenen: Kokkens utvalgte søte og salte croissant."
    },
    "fi": {
      "name": "NOA Makea & Suolainen Duo",
      "desc": "Täydellinen yhdistelmälautanen: Keittiömestarin valitsema makea ja suolainen croissant."
    },
    "pl": {
      "name": "NOA Zestaw Słodko-Wytrawny",
      "desc": "Wyjątkowy zestaw: wyselekcjonowany przez szefa kuchni słodki i wytrawny croissant."
    },
    "ar": {
      "name": "ثنائي نوا الحلو والمالح",
      "desc": "طبق التوليفة المثالية: تشكيلة الشيف المميزة من كرواسان حلو وآخر مالح."
    }
  },
  "NOA Tatlı İkili": {
    "tr": {
      "name": "NOA Tatlı İkili",
      "desc": "İki adet enfes tatlı kruvasan lezzeti bir arada."
    },
    "en": {
      "name": "NOA Sweet Duo",
      "desc": "Two signature sweet artisan croissants together in one indulgence plate."
    },
    "de": {
      "name": "NOA Süßes Duo",
      "desc": "Zwei erlesene süße Gourmet-Croissants auf einem Servierteller."
    },
    "ru": {
      "name": "NOA Сладкий Дуэт",
      "desc": "Два фирменных сладких авторских круассана на одной тарелке."
    },
    "nl": {
      "name": "NOA Zoet Duo",
      "desc": "Twee heerlijke ambachtelijke zoete croissants samen op één bord."
    },
    "sv": {
      "name": "NOA Söt Duo",
      "desc": "Två utsökta hantverksmässiga söta croissanter på samma fat."
    },
    "no": {
      "name": "NOA Søt Duo",
      "desc": "To nydelige håndlagde søte croissanter på ett fat."
    },
    "fi": {
      "name": "NOA Makea Duo",
      "desc": "Kaksi herkullista artesaanimakeaa croissantia yhdellä lautasella."
    },
    "pl": {
      "name": "NOA Słodki Duet",
      "desc": "Dwa wyśmienite, rzemieślnicze słodkie croissanty na jednym talerzu."
    },
    "ar": {
      "name": "ثنائي نوا الحلو",
      "desc": "كرواسانان حلوين فاخرين معاً في طبق واحد لا يُقاوم."
    }
  },
  "NOA Tuzlu İkili": {
    "tr": {
      "name": "NOA Tuzlu İkili",
      "desc": "İki adet doyurucu gurme tuzlu kruvasan servis tabağı."
    },
    "en": {
      "name": "NOA Savoury Duo",
      "desc": "Two hearty gourmet savoury croissants served with golden potato wedges."
    },
    "de": {
      "name": "NOA Herzhaftes Duo",
      "desc": "Zwei herzhafte Gourmet-Croissants serviert mit knusprigen Kartoffeln."
    },
    "ru": {
      "name": "NOA Сытный Дуэт",
      "desc": "Два сытных авторских круассана с золотистыми картофельными дольками."
    },
    "nl": {
      "name": "NOA Hartig Duo",
      "desc": "Twee stevige gourmet hartige croissants geserveerd met aardappeltjes."
    },
    "sv": {
      "name": "NOA Matig Duo",
      "desc": "Två mättande gourmetcroissanter serverade med krispig klyftpotatis."
    },
    "no": {
      "name": "NOA Salt Duo",
      "desc": "To mettende gourmetsalte croissanter servert med sprø potetbåter."
    },
    "fi": {
      "name": "NOA Suolainen Duo",
      "desc": "Kaksi ruokaisaa gourmet-suolaista croissantia rapeiden lohkoperunoiden kera."
    },
    "pl": {
      "name": "NOA Wytrawny Duet",
      "desc": "Dwa sycące wytrawne croissanty podawane ze złocistymi ziemniaczkami."
    },
    "ar": {
      "name": "ثنائي نوا المالح",
      "desc": "كرواسانان مالحان شهيان ومغذيان يُقدمان مع البطاطا المقرمشة."
    }
  },
  "Antep Fıstıklı Kruvasan": {
    "tr": {
      "name": "Antep Fıstıklı Kruvasan",
      "desc": "Bol Antep fıstıklı krema dolgusu ve üzeri kavrulmuş fıstık parçaları."
    },
    "en": {
      "name": "Pistachio Croissant",
      "desc": "Rich Antep pistachio patisserie cream with roasted pistachio crunch."
    },
    "de": {
      "name": "Pistazien-Croissant",
      "desc": "Reichhaltige Pistaziencreme mit gerösteten Pistazienstücken."
    },
    "ru": {
      "name": "Фисташковый Круассан",
      "desc": "Фирменный крем из фисташек Антеп с обжаренной фисташковой крошкой."
    },
    "nl": {
      "name": "Pistache Croissant",
      "desc": "Rijke pistachecrème met knapperige geroosterde pistachenootjes."
    },
    "sv": {
      "name": "Pistagecroissant",
      "desc": "Fyllig pistagekräm toppad med rostade pistagenötter."
    },
    "no": {
      "name": "Pistasjcroissant",
      "desc": "Fyldig pistasjkrem toppet med ristede pistasjnøtter."
    },
    "fi": {
      "name": "Pistaasicroissant",
      "desc": "Täyteläinen pistaasikreemi paahdetuilla pistaasipähkinöillä."
    },
    "pl": {
      "name": "Croissant Pistacjowy",
      "desc": "Aksamitny krem pistacjowy z prażonymi orzeszkami pistacjowymi."
    },
    "ar": {
      "name": "كرواسان الفستق الحلبي",
      "desc": "محشو بكريمة الفستق الحلبي الغنية ومغطى بالفستق المحمص المقرمش."
    }
  },
  "Çilekli Muzlu Nutellalı Kruvasan": {
    "tr": {
      "name": "Çilekli Muzlu Nutellalı Kruvasan",
      "desc": "Orijinal Nutella, taze çilek dilimleri ve taze muz parçacıkları."
    },
    "en": {
      "name": "Strawberry Banana Nutella Croissant",
      "desc": "Original Nutella hazelnut spread with fresh strawberries and sliced bananas."
    },
    "de": {
      "name": "Erdbeer-Bananen-Nutella Croissant",
      "desc": "Original Nutella mit frischen Erdbeerscheiben und Bananenstücken."
    },
    "ru": {
      "name": "Круассан с Клубникой, Бананом и Нутеллой",
      "desc": "Оригинальная Nutella со свежей клубникой и ломтиками банана."
    },
    "nl": {
      "name": "Aardbei Banaan Nutella Croissant",
      "desc": "Originele Nutella met verse aardbeien en bananenschijfjes."
    },
    "sv": {
      "name": "Jordgubbs- & Banannutellacroissant",
      "desc": "Äkta Nutella med färska jordgubbar och skivad banan."
    },
    "no": {
      "name": "Jordbær- & Banannutellacroissant",
      "desc": "Original Nutella med ferske jordbær og bananskiver."
    },
    "fi": {
      "name": "Mansikka-Banaani Nutellacroissant",
      "desc": "Aitoa Nutellaa tuoreilla mansikoilla ja banaaniviipaleilla."
    },
    "pl": {
      "name": "Croissant z Truskawkami, Bananem i Nutellą",
      "desc": "Oryginalna Nutella ze świeżymi truskawkami i bananem."
    },
    "ar": {
      "name": "كرواسان الفراولة والموز بالنوتيلا",
      "desc": "نوتيلا أصلية غنية مع شرائح الفراولة الطازجة والموز اللذيذ."
    }
  },
  "Çilekli Muzlu Kremalı Kruvasan": {
    "tr": {
      "name": "Çilekli Muzlu Kremalı Kruvasan",
      "desc": "Özel pastacı kreması, taze çilekler ve muz dilimleri."
    },
    "en": {
      "name": "Strawberry Banana Cream Croissant",
      "desc": "Velvety French pastry cream layered with fresh strawberries and bananas."
    },
    "de": {
      "name": "Erdbeer-Bananen-Creme Croissant",
      "desc": "Feine Konditorcreme belegt mit frischen Erdbeeren und Bananen."
    },
    "ru": {
      "name": "Круассан с Клубникой, Бананом и Кремом",
      "desc": "Нежный заварной кондитерский крем со свежей клубникой и бананом."
    },
    "nl": {
      "name": "Aardbei Banaan Room Croissant",
      "desc": "Zachte banketbakkersroom met verse aardbeien en bananen."
    },
    "sv": {
      "name": "Jordgubbs- & Banankrämcroissant",
      "desc": "Len vaniljkräm med färska jordgubbar och bananskivor."
    },
    "no": {
      "name": "Jordbær- & Banankremcroissant",
      "desc": "Myk konditorkrem med ferske jordbær og bananskiver."
    },
    "fi": {
      "name": "Mansikka-Banaani Vaniljakreemicroissant",
      "desc": "Pehmeää kondiittorinkreemiä tuoreilla mansikoilla ja banaanilla."
    },
    "pl": {
      "name": "Croissant z Kremem, Truskawkami i Bananem",
      "desc": "Aksamitny krem cukierniczy ze świeżymi truskawkami i bananem."
    },
    "ar": {
      "name": "كرواسان الفراولة والموز بكريمة الباتيسير",
      "desc": "كريمة باتيسير فرنسية ناعمة مع قطع الفراولة والموز الطازجة."
    }
  },
  "Lotuslu Kruvasan": {
    "tr": {
      "name": "Lotuslu Kruvasan",
      "desc": "Lotus Biscoff karamel bisküvi kreması ve çıtır Lotus bisküvi parçaları."
    },
    "en": {
      "name": "Lotus Biscoff Croissant",
      "desc": "Lotus Biscoff caramel spread with crunchy spiced cookie crumbles."
    },
    "de": {
      "name": "Lotus Biscoff Croissant",
      "desc": "Karamellisierte Lotus Biscoff Creme mit knusprigen Keksbröseln."
    },
    "ru": {
      "name": "Круассан Лотус Бискофф",
      "desc": "Карамельный крем Lotus Biscoff с хрустящей песочной крошкой."
    },
    "nl": {
      "name": "Lotus Biscoff Croissant",
      "desc": "Lotus Biscoff speculoospasta met knapperige koekkruimels."
    },
    "sv": {
      "name": "Lotus Biscoff Croissant",
      "desc": "Lotus Biscoff karamellkräm med krispiga kexsmulor."
    },
    "no": {
      "name": "Lotus Biscoff Croissant",
      "desc": "Lotus Biscoff karamellkrem med sprø kjeksbiter."
    },
    "fi": {
      "name": "Lotus Biscoff Croissant",
      "desc": "Lotus Biscoff -karamellitahnaa rapealla keksimurulla."
    },
    "pl": {
      "name": "Croissant Lotus Biscoff",
      "desc": "Krem karmelowy Lotus Biscoff z chrupiącymi ciasteczkami."
    },
    "ar": {
      "name": "كرواسان لوتس بيسكوف",
      "desc": "زبدة بسكويت اللوتس المكرمل مع فتات بسكويت اللوتس المقرمش."
    }
  },
  "Sütlü Belçika Çikolatalı Kruvasan": {
    "tr": {
      "name": "Sütlü Belçika Çikolatalı Kruvasan",
      "desc": "Akışkan sıcak Belçika sütlü çikolatası ve çikolata kıvrımları."
    },
    "en": {
      "name": "Belgian Milk Chocolate Croissant",
      "desc": "Warm flowing Belgian milk chocolate with crisp chocolate pearls."
    },
    "de": {
      "name": "Belgisches Vollmilchschokolade-Croissant",
      "desc": "Warme belgische Vollmilchschokolade und Schokoraspeln."
    },
    "ru": {
      "name": "Круассан с Молочным Бельгийским Шоколадом",
      "desc": "Нежный бельгийский молочный шоколад и шоколадная стружка."
    },
    "nl": {
      "name": "Belgische Melkchocolade Croissant",
      "desc": "Warme Belgische melkchocolade met chocoladekrullen."
    },
    "sv": {
      "name": "Belgisk Mjölkchokladcroissant",
      "desc": "Varm belgisk mjölkchoklad med chokladkrisp."
    },
    "no": {
      "name": "Belgisk Melkesjokoladecroissant",
      "desc": "Varm belgisk melkesjokolade med sjokoladedryss."
    },
    "fi": {
      "name": "Belgialainen Maitosuklaacroissant",
      "desc": "Lämpimällä belgialaisella maitosuklaalla ja suklaalastuilla."
    },
    "pl": {
      "name": "Croissant z Mleczną Belgijską Czekoladą",
      "desc": "Ciepła belgijska mleczna czekolada i chrupiące perełki."
    },
    "ar": {
      "name": "كرواسان الشوكولاتة البلجيكية بالحليب",
      "desc": "شوكولاتة الحليب البلجيكية الغنية مع رقائق الشوكولاتة المقرمشة."
    }
  },
  "Sade Kruvasan": {
    "tr": {
      "name": "Sade Kruvasan",
      "desc": "Geleneksel Fransız usulü çıtır tereyağlı kruvasan."
    },
    "en": {
      "name": "Plain Butter Croissant",
      "desc": "Traditional French flaky butter croissant baked golden."
    },
    "de": {
      "name": "Klassisches Buttercroissant",
      "desc": "Traditionelles französisches Buttercroissant, goldbraun gebacken."
    },
    "ru": {
      "name": "Классический Сливочный Круассан",
      "desc": "Традиционный французский круассан на чистом сливочном масле."
    },
    "nl": {
      "name": "Klassieke Roombotercroissant",
      "desc": "Traditionele Franse roombotercroissant goudbruin gebakken."
    },
    "sv": {
      "name": "Klassisk Smörcroissant",
      "desc": "Traditionell fransk smörcroissant, frasig och gyllenbrun."
    },
    "no": {
      "name": "Klassisk Smørcroissant",
      "desc": "Tradisjonell fransk smørcroissant, sprø og gyllen."
    },
    "fi": {
      "name": "Perinteinen Voicroissant",
      "desc": "Perinteinen ranskalainen voicroissant, lehtevä ja rapea."
    },
    "pl": {
      "name": "Klasyczny Maślany Croissant",
      "desc": "Tradycyjny francuski maślany croissant wypiekany na złoto."
    },
    "ar": {
      "name": "كرواسان الزبدة الفرنسي الكلاسيكي",
      "desc": "كرواسان الزبدة الفرنسي التقليدي المقرمش والمخبوز بلون ذهبي."
    }
  },
  "Antep Fıstıklı Twissy": {
    "tr": {
      "name": "Antep Fıstıklı Twissy",
      "desc": "Özel burgu formu, yoğun Antep fıstıklı dolgu ve çıtır kaplama."
    },
    "en": {
      "name": "Pistachio Twissy",
      "desc": "Twisted flaky pastry filled with rich pistachio cream and roasted nuts."
    },
    "de": {
      "name": "Pistazien-Twissy",
      "desc": "Gedrehtes Knuspergebäck gefüllt mit edler Pistaziencreme."
    },
    "ru": {
      "name": "Твисси с Фисташками",
      "desc": "Слоеный витой круассан с насыщенным фисташковым кремом."
    },
    "nl": {
      "name": "Pistache Twissy",
      "desc": "Gedraaid bladerdeeg gevuld met rijke pistachecrème."
    },
    "sv": {
      "name": "Pistage Twissy",
      "desc": "Tvinnat frasigt bakverk fyllt med pistagekräm."
    },
    "no": {
      "name": "Pistasj Twissy",
      "desc": "Snurret sprøtt bakverk fylt med pistasjkrem."
    },
    "fi": {
      "name": "Pistaasi Twissy",
      "desc": "Kierteinen lehtevä leivonnainen täyteläisellä pistaasikreemillä."
    },
    "pl": {
      "name": "Twissy Pistacjowe",
      "desc": "Zakręcone ciastko francuskie z kremem pistacjowym."
    },
    "ar": {
      "name": "تويسي الفستق الحلبي",
      "desc": "معجنات مورقة ملتوية ومحشوة بكريمة الفستق الحلبي الفاخرة."
    }
  },
  "Limonlu Twissy": {
    "tr": {
      "name": "Limonlu Twissy",
      "desc": "Taze narenciye ferahlığı, limon kreması dolgusu ve burgu hamur."
    },
    "en": {
      "name": "Lemon Curd Twissy",
      "desc": "Zesty lemon curd pastry twist with crisp golden layers."
    },
    "de": {
      "name": "Zitronen-Twissy",
      "desc": "Erfrischender Zitronencreme-Strudel mit knusprigen Schichten."
    },
    "ru": {
      "name": "Лимонный Твисси",
      "desc": "Освежающий витой круассан с нежным лимонным курдом."
    },
    "nl": {
      "name": "Citroen Twissy",
      "desc": "Frisse citroencrème in een knapperige gedraaide croissant."
    },
    "sv": {
      "name": "Citron Twissy",
      "desc": "Frisk citronkräm i tvinnad frasig smördeg."
    },
    "no": {
      "name": "Sitron Twissy",
      "desc": "Frisk sitronkrem i snurret sprøtt bakverk."
    },
    "fi": {
      "name": "Sitruuna Twissy",
      "desc": "Raikasta sitruunatahnaa kierteisessä voitaikinassa."
    },
    "pl": {
      "name": "Twissy Cytrynowe",
      "desc": "Krem cytrynowy w chrupiącym, zakręconym cieście francuskim."
    },
    "ar": {
      "name": "تويسي الليمون المنعش",
      "desc": "تويسي مقرمش محشو بكريمة الليمون المنعشة واللذيذة."
    }
  },
  "Sütlü Belçika Çikolatalı Twissy": {
    "tr": {
      "name": "Sütlü Belçika Çikolatalı Twissy",
      "desc": "Sütlü Belçika çikolatası dolgulu ve kaplamalı özel burgu lezzet."
    },
    "en": {
      "name": "Belgian Milk Chocolate Twissy",
      "desc": "Twisted pastry filled and coated with silky Belgian milk chocolate."
    },
    "de": {
      "name": "Schoko-Twissy Vollmilch",
      "desc": "Gedrehtes Gebäck mit zarter belgischer Vollmilchschokolade."
    },
    "ru": {
      "name": "Шоколадный Твисси",
      "desc": "Витой слоеный круассан с молочным бельгийским шоколадом."
    },
    "nl": {
      "name": "Chocolade Twissy Melk",
      "desc": "Gedraaide croissant met romige Belgische melkchocolade."
    },
    "sv": {
      "name": "Choklad Twissy Mjölk",
      "desc": "Tvinnat bakverk med belgisk mjölkchoklad."
    },
    "no": {
      "name": "Sjokolade Twissy Melk",
      "desc": "Snurret bakverk med belgisk melkesjokolade."
    },
    "fi": {
      "name": "Maitosuklaa Twissy",
      "desc": "Kierteinen leivonnainen belgialaisella maitosuklaalla."
    },
    "pl": {
      "name": "Twissy Czekoladowe",
      "desc": "Zakręcone ciasto z belgijską czekoladą mleczną."
    },
    "ar": {
      "name": "تويسي الشوكولاتة البلجيكية بالحليب",
      "desc": "تويسي هش محشو ومغطى بالشوكولاتة البلجيكية بالحليب."
    }
  },
  "Yaban Mersinli Danish": {
    "tr": {
      "name": "Yaban Mersinli Danish",
      "desc": "Taze yabani yaban mersini taneleri ve ipeksi pastacı kreması."
    },
    "en": {
      "name": "Blueberry Danish",
      "desc": "Plump fresh wild blueberries resting on velvety pastry cream."
    },
    "de": {
      "name": "Blaubeer-Danish",
      "desc": "Frische wilde Heidelbeeren auf samtiger Vanillecreme."
    },
    "ru": {
      "name": "Черничный Дэниш",
      "desc": "Свежая лесная черника на подушке из заварного крема."
    },
    "nl": {
      "name": "Bosbessen Danish",
      "desc": "Verse wilde bosbessen op zijdezachte banketbakkersroom."
    },
    "sv": {
      "name": "Blåbär Danish",
      "desc": "Färska vilda blåbär på len vaniljkräm."
    },
    "no": {
      "name": "Blåbær Danish",
      "desc": "Ferske ville blåbær på fløyelsmyk vaniljekrem."
    },
    "fi": {
      "name": "Mustikka Danish",
      "desc": "Tuoreita mustikoita samettisella vaniljakreemillä."
    },
    "pl": {
      "name": "Danish z Borówkami",
      "desc": "Świeże dzikie borówki na aksamitnym kremie waniliowym."
    },
    "ar": {
      "name": "دانيش التوت الأزرق",
      "desc": "حبات التوت الأزرق البري الطازجة فوق كريمة الباتيسير الناعمة."
    }
  },
  "Limonlu Danish": {
    "tr": {
      "name": "Limonlu Danish",
      "desc": "Özel limon kreması ve çıtır tereyağlı danish hamuru."
    },
    "en": {
      "name": "Lemon Danish",
      "desc": "Zesty lemon patisserie cream in flaky layered Danish pastry."
    },
    "de": {
      "name": "Zitronen-Danish",
      "desc": "Erfrischende Zitronencreme in buttrigem Blätterteig."
    },
    "ru": {
      "name": "Лимонный Дэниш",
      "desc": "Нежный лимонный крем в слоеной датской выпечке."
    },
    "nl": {
      "name": "Citroen Danish",
      "desc": "Frisse citroencrème in krokant Deens bladerdeeg."
    },
    "sv": {
      "name": "Citron Danish",
      "desc": "Syrlig citronkräm i frasigt danskt smördegsbröd."
    },
    "no": {
      "name": "Sitron Danish",
      "desc": "Syrlig sitronkrem i sprøtt dansk bakverk."
    },
    "fi": {
      "name": "Sitruuna Danish",
      "desc": "Raikasta sitruunakreemiä lehtevässä tanskalaisessa leivonnaisessa."
    },
    "pl": {
      "name": "Danish Cytrynowy",
      "desc": "Krem cytrynowy w maślanym cieście duńskim."
    },
    "ar": {
      "name": "دانيش الليمون",
      "desc": "كريمة الليمون المنعشة في عجينة الدانيش المقرمشة والذهبية."
    }
  },
  "Orman Meyveli Danish": {
    "tr": {
      "name": "Orman Meyveli Danish",
      "desc": "Böğürtlen, frambuaz ve yaban mersini meyve harmanı."
    },
    "en": {
      "name": "Wild Berry Danish",
      "desc": "Medley of fresh blackberries, raspberries and blueberries on cream."
    },
    "de": {
      "name": "Waldbeeren-Danish",
      "desc": "Frische Brombeeren, Himbeeren und Heidelbeeren auf Creme."
    },
    "ru": {
      "name": "Дэниш с Лесными Ягодами",
      "desc": "Микс из ежевики, малины и черники со сливочным кремом."
    },
    "nl": {
      "name": "Bosvruchten Danish",
      "desc": "Mix van bramen, frambozen en bosbessen op room."
    },
    "sv": {
      "name": "Skogsbär Danish",
      "desc": "Blandning av björnbär, hallon och blåbär på kräm."
    },
    "no": {
      "name": "Skogsbær Danish",
      "desc": "Blanding av bjørnebær, bringebær og blåbær på krem."
    },
    "fi": {
      "name": "Metsämarja Danish",
      "desc": "Karhunvatukoita, vadelmia ja mustikoita kreemipohjalla."
    },
    "pl": {
      "name": "Danish z Owocami Leśnymi",
      "desc": "Miks jeżyn, malin i borówek na aksamitnym kremie."
    },
    "ar": {
      "name": "دانيش توت الغابة",
      "desc": "توليفة منعشة من التوت الأسود، التوت الأحمر والتوت الأزرق."
    }
  },
  "Çilekli Danish": {
    "tr": {
      "name": "Çilekli Danish",
      "desc": "Taze bahçe çilekleri ve ipeksi pastacı kreması."
    },
    "en": {
      "name": "Strawberry Danish",
      "desc": "Fresh sweet strawberries on smooth French vanilla cream."
    },
    "de": {
      "name": "Erdbeer-Danish",
      "desc": "Frische Gartenerdbeeren auf feiner französischer Vanillecreme."
    },
    "ru": {
      "name": "Клубничный Дэниш",
      "desc": "Свежая садовая клубника на нежном французском креме."
    },
    "nl": {
      "name": "Aardbei Danish",
      "desc": "Verse zoete aardbeien op zachte vanilleroom."
    },
    "sv": {
      "name": "Jordgubbs Danish",
      "desc": "Färska söta jordgubbar på krämig vaniljkräm."
    },
    "no": {
      "name": "Jordbær Danish",
      "desc": "Ferske søte jordbær på fløyelsmyk vaniljekrem."
    },
    "fi": {
      "name": "Mansikka Danish",
      "desc": "Tuoreita makeita mansikoita pehmeällä vaniljakreemillä."
    },
    "pl": {
      "name": "Danish z Truskawkami",
      "desc": "Świeże słodkie truskawki na kremie waniliowym."
    },
    "ar": {
      "name": "دانيش الفراولة",
      "desc": "حبات الفراولة الطازجة فوق كريمة الفانيليا الفرنسية الناعمة."
    }
  },
  "Mangolu Danish": {
    "tr": {
      "name": "Mangolu Danish",
      "desc": "Taze egzotik mango dilimleri ve krema uyumu."
    },
    "en": {
      "name": "Mango Danish",
      "desc": "Juicy tropical mango slices over smooth pastry cream."
    },
    "de": {
      "name": "Mango-Danish",
      "desc": "Saftige exotische Mangoscheiben auf samtiger Creme."
    },
    "ru": {
      "name": "Манговый Дэниш",
      "desc": "Сочные ломтики спелого манго со сливочным кремом."
    },
    "nl": {
      "name": "Mango Danish",
      "desc": "Sappige exotische mangoschijfjes op zachte room."
    },
    "sv": {
      "name": "Mango Danish",
      "desc": "Saftig tropisk mango på len vaniljkräm."
    },
    "no": {
      "name": "Mango Danish",
      "desc": "Saftig tropisk mango på fløyelsmyk krem."
    },
    "fi": {
      "name": "Mango Danish",
      "desc": "Meheviä trooppisia mangoviipaleita pehmeällä kreemillä."
    },
    "pl": {
      "name": "Danish z Mango",
      "desc": "Soczyste kawałki mango na aksamitnym kremie."
    },
    "ar": {
      "name": "دانيش المانجو الاستوائي",
      "desc": "شرائح المانجو الاستوائية العصيرية فوق كريمة الباتيسير."
    }
  },
  "Frambuazlı Danish": {
    "tr": {
      "name": "Frambuazlı Danish",
      "desc": "Taze ekşi-tatlı frambuaz taneleri ve pastacı kreması."
    },
    "en": {
      "name": "Raspberry Danish",
      "desc": "Sweet-tart fresh raspberries atop rich pastry cream."
    },
    "de": {
      "name": "Himbeer-Danish",
      "desc": "Fruchtig-frische Himbeeren auf zarter Konditorcreme."
    },
    "ru": {
      "name": "Малиновый Дэниш",
      "desc": "Свежая ароматная малина на нежном кондитерском креме."
    },
    "nl": {
      "name": "Frambozen Danish",
      "desc": "Friszoete verse frambozen op banketbakkersroom."
    },
    "sv": {
      "name": "Hallon Danish",
      "desc": "Färska sötsyrliga hallon på len vaniljkräm."
    },
    "no": {
      "name": "Bringebær Danish",
      "desc": "Ferske bringebær på fløyelsmyk vaniljekrem."
    },
    "fi": {
      "name": "Vadelma Danish",
      "desc": "Tuoreita vadelmia pehmeällä kondiittorinkreemillä."
    },
    "pl": {
      "name": "Danish z Malinami",
      "desc": "Świeże maliny na kremie cukierniczym."
    },
    "ar": {
      "name": "دانيش توت العليق",
      "desc": "توت العليق الأحمر الطازج فوق طبقة غنية من الكريمة."
    }
  },
  "Sütlü Belçika Çikolatalı Roll Kruvasan": {
    "tr": {
      "name": "Sütlü Belçika Çikolatalı Roll Kruvasan",
      "desc": "Kat kat çıtır roll kruvasan; sütlü Belçika çikolatası kaplaması ve dolgusu ile."
    },
    "en": {
      "name": "Milk Chocolate Roll Croissant",
      "desc": "Flaky circular roll croissant coated and filled with Belgian milk chocolate."
    },
    "de": {
      "name": "Vollmilch-Rollcroissant",
      "desc": "Runder Schoko-Rollcroissant mit belgischer Vollmilchschokolade."
    },
    "ru": {
      "name": "Ролл-круассан с Молочным Шоколадом",
      "desc": "Круглый слоеный ролл с молочным бельгийским шоколадом."
    },
    "nl": {
      "name": "Melkchocolade Roll Croissant",
      "desc": "Ronde roll croissant gevuld met Belgische melkchocolade."
    },
    "sv": {
      "name": "Mjölkchoklad Roll Croissant",
      "desc": "Rund rollcroissant fylld med belgisk mjölkchoklad."
    },
    "no": {
      "name": "Melkesjokolade Roll Croissant",
      "desc": "Rund rollcroissant fylt med belgisk melkesjokolade."
    },
    "fi": {
      "name": "Maitosuklaa Roll Croissant",
      "desc": "Pyöreä roll-croissant belgialaisella maitosuklaalla."
    },
    "pl": {
      "name": "Roll Croissant z Mleczną Czekoladą",
      "desc": "Okrągły roll croissant z belgijską czekoladą mleczną."
    },
    "ar": {
      "name": "رول كرواسان الشوكولاتة بالحليب",
      "desc": "رول كرواسان دائري مورق ومحشو بالشوكولاتة البلجيكية بالحليب."
    }
  },
  "Bitter Belçika Çikolatalı Roll Kruvasan": {
    "tr": {
      "name": "Bitter Belçika Çikolatalı Roll Kruvasan",
      "desc": "Kat kat çıtır roll kruvasan; yoğun bitter Belçika çikolatası kaplaması ve dolgusu."
    },
    "en": {
      "name": "Dark Chocolate Roll Croissant",
      "desc": "Flaky circular roll croissant filled and coated with intense dark Belgian chocolate."
    },
    "de": {
      "name": "Zartbitter-Rollcroissant",
      "desc": "Runder Rollcroissant mit edler belgischer Zartbitterschokolade."
    },
    "ru": {
      "name": "Ролл-круассан с Темным Шоколадом",
      "desc": "Круглый слоеный ролл с насыщенным темным бельгийским шоколадом."
    },
    "nl": {
      "name": "Pure Chocolade Roll Croissant",
      "desc": "Ronde roll croissant met pure Belgische chocolade."
    },
    "sv": {
      "name": "Mörk Choklad Roll Croissant",
      "desc": "Rund rollcroissant med mörk belgisk choklad."
    },
    "no": {
      "name": "Mørk Sjokolade Roll Croissant",
      "desc": "Rund rollcroissant med mørk belgisk sjokolade."
    },
    "fi": {
      "name": "Tummasuklaa Roll Croissant",
      "desc": "Pyöreä roll-croissant tummalla belgialaisella suklaalla."
    },
    "pl": {
      "name": "Roll Croissant z Gorzką Czekoladą",
      "desc": "Okrągły roll croissant z gorzką belgijską czekoladą."
    },
    "ar": {
      "name": "رول كرواسان الشوكولاتة الداكنة",
      "desc": "رول كرواسان مورق ومحشو بالشوكولاتة البلجيكية الداكنة الفاخرة."
    }
  },
  "Beyaz Belçika Çikolatalı Roll Kruvasan": {
    "tr": {
      "name": "Beyaz Belçika Çikolatalı Roll Kruvasan",
      "desc": "Kat kat çıtır roll kruvasan; fildişi beyaz Belçika çikolatası kaplaması ve dolgusu."
    },
    "en": {
      "name": "White Chocolate Roll Croissant",
      "desc": "Flaky circular roll croissant coated with ivory white Belgian chocolate."
    },
    "de": {
      "name": "Weiße Schokolade Rollcroissant",
      "desc": "Runder Rollcroissant mit feiner weißer belgischer Schokolade."
    },
    "ru": {
      "name": "Ролл-круассан с Белым Шоколадом",
      "desc": "Круглый слоеный ролл с нежным белым бельгийским шоколадом."
    },
    "nl": {
      "name": "Witte Chocolade Roll Croissant",
      "desc": "Ronde roll croissant met romige witte Belgische chocolade."
    },
    "sv": {
      "name": "Vit Choklad Roll Croissant",
      "desc": "Rund rollcroissant med vit belgisk choklad."
    },
    "no": {
      "name": "Hvit Sjokolade Roll Croissant",
      "desc": "Rund rollcroissant med hvit belgisk sjokolade."
    },
    "fi": {
      "name": "Valkosuklaa Roll Croissant",
      "desc": "Pyöreä roll-croissant valkoisella belgialaisella suklaalla."
    },
    "pl": {
      "name": "Roll Croissant z Białą Czekoladą",
      "desc": "Okrągły roll croissant z białą belgijską czekoladą."
    },
    "ar": {
      "name": "رول كرواسان الشوكولاتة البيضاء",
      "desc": "رول كرواسان هش ومغطى بالشوكولاتة البلجيكية البيضاء الناعمة."
    }
  },
  "Sütlü Belçika Çikolatalı Küp Kruvasan": {
    "tr": {
      "name": "Sütlü Belçika Çikolatalı Küp Kruvasan",
      "desc": "Küp formunda kat kat çıtır kruvasan; sütlü çikolata kaplaması ve dolgusu."
    },
    "en": {
      "name": "Milk Chocolate Cube Croissant",
      "desc": "Artisan cube-shaped croissant layered with rich milk chocolate filling and glaze."
    },
    "de": {
      "name": "Vollmilch-Würfelcroissant",
      "desc": "Kreativer Würfelcroissant gefüllt mit Vollmilchschokolade."
    },
    "ru": {
      "name": "Кубический Круассан с Молочным Шоколадом",
      "desc": "Кубический авторский круассан с молочным шоколадом."
    },
    "nl": {
      "name": "Melkchocolade Kubus Croissant",
      "desc": "Ambachtelijke kubusvormige croissant met melkchocolade."
    },
    "sv": {
      "name": "Mjölkchoklad Kubcroissant",
      "desc": "Kubformad croissant fylld med belgisk mjölkchoklad."
    },
    "no": {
      "name": "Melkesjokolade Kubecroissant",
      "desc": "Kubeformet croissant fylt med belgisk melkesjokolade."
    },
    "fi": {
      "name": "Maitosuklaa Kuutiocroissant",
      "desc": "Kuutionmuotoinen croissant belgialaisella maitosuklaalla."
    },
    "pl": {
      "name": "Kostka Croissant z Mleczną Czekoladą",
      "desc": "Kostka croissant z kremem z mlecznej czekolady."
    },
    "ar": {
      "name": "مكعب كرواسان الشوكولاتة بالحليب",
      "desc": "كرواسان على شكل مكعب فني محشو ومغطى بالشوكولاتة بالحليب."
    }
  },
  "Bitter Belçika Çikolatalı Küp Kruvasan": {
    "tr": {
      "name": "Bitter Belçika Çikolatalı Küp Kruvasan",
      "desc": "Küp formunda kat kat çıtır kruvasan; bitter çikolata kaplaması ve dolgusu."
    },
    "en": {
      "name": "Dark Chocolate Cube Croissant",
      "desc": "Artisan cube-shaped croissant with rich dark chocolate cream."
    },
    "de": {
      "name": "Zartbitter-Würfelcroissant",
      "desc": "Würfelcroissant mit feinherber Zartbitterschokolade."
    },
    "ru": {
      "name": "Кубический Круассан с Темным Шоколадом",
      "desc": "Кубический круассан с насыщенным темным шоколадом."
    },
    "nl": {
      "name": "Pure Chocolade Kubus Croissant",
      "desc": "Kubusvormige croissant met pure chocolade."
    },
    "sv": {
      "name": "Mörk Choklad Kubcroissant",
      "desc": "Kubformad croissant med mörk choklad."
    },
    "no": {
      "name": "Mørk Sjokolade Kubecroissant",
      "desc": "Kubeformet croissant med mørk sjokolade."
    },
    "fi": {
      "name": "Tummasuklaa Kuutiocroissant",
      "desc": "Kuutionmuotoinen croissant tummalla suklaalla."
    },
    "pl": {
      "name": "Kostka Croissant z Gorzką Czekoladą",
      "desc": "Kostka croissant z gorzką czekoladą."
    },
    "ar": {
      "name": "مكعب كرواسان الشوكولاتة الداكنة",
      "desc": "كرواسان مكعب محشو بكريمة الشوكولاتة الداكنة الفاخرة."
    }
  },
  "Beyaz Belçika Çikolatalı Küp Kruvasan": {
    "tr": {
      "name": "Beyaz Belçika Çikolatalı Küp Kruvasan",
      "desc": "Küp formunda kat kat çıtır kruvasan; beyaz çikolata kaplaması ve dolgusu."
    },
    "en": {
      "name": "White Chocolate Cube Croissant",
      "desc": "Artisan cube-shaped croissant with velvety white chocolate."
    },
    "de": {
      "name": "Weiße Schokolade Würfelcroissant",
      "desc": "Würfelcroissant mit weißer Schokolade."
    },
    "ru": {
      "name": "Кубический Круассан с Белым Шоколадом",
      "desc": "Кубический круассан с белым шоколадом."
    },
    "nl": {
      "name": "Witte Chocolade Kubus Croissant",
      "desc": "Kubusvormige croissant met witte chocolade."
    },
    "sv": {
      "name": "Vit Choklad Kubcroissant",
      "desc": "Kubformad croissant med vit choklad."
    },
    "no": {
      "name": "Hvit Sjokolade Kubecroissant",
      "desc": "Kubeformet croissant med hvit sjokolade."
    },
    "fi": {
      "name": "Valkosuklaa Kuutiocroissant",
      "desc": "Kuutionmuotoinen croissant valkosuklaalla."
    },
    "pl": {
      "name": "Kostka Croissant z Białą Czekoladą",
      "desc": "Kostka croissant z białą czekoladą."
    },
    "ar": {
      "name": "مكعب كرواسان الشوكولاتة البيضاء",
      "desc": "كرواسان مكعب محشو بكريمة الشوكولاتة البيضاء اللذيذة."
    }
  },
  "Sütlü Belçika Çikolatalı Amora": {
    "tr": {
      "name": "Sütlü Belçika Çikolatalı Amora",
      "desc": "Kalp formundaki ikonik kruvasan; sütlü Belçika çikolatası ve fıstık dokunuşu."
    },
    "en": {
      "name": "Milk Chocolate Amora Heart",
      "desc": "Iconic heart-shaped croissant filled with Belgian milk chocolate."
    },
    "de": {
      "name": "Amora Herz Vollmilchschokolade",
      "desc": "Ikonisches herzförmiges Croissant mit Vollmilchschokolade."
    },
    "ru": {
      "name": "Амора Сердце с Молочным Шоколадом",
      "desc": "Фирменный круассан в форме сердца с молочным шоколадом."
    },
    "nl": {
      "name": "Amora Hart Melkchocolade",
      "desc": "Iconische hartvormige croissant met melkchocolade."
    },
    "sv": {
      "name": "Amora Hjärta Mjölkchoklad",
      "desc": "Ikonisk hjärtformad croissant med mjölkchoklad."
    },
    "no": {
      "name": "Amora Hjerte Melkesjokolade",
      "desc": "Ikonisk hjerteformet croissant med melkesjokolade."
    },
    "fi": {
      "name": "Amora Sydän Maitosuklaa",
      "desc": "Ikoninen sydämenmuotoinen croissant maitosuklaalla."
    },
    "pl": {
      "name": "Amora Serce z Mleczną Czekoladą",
      "desc": "Kultowy croissant w kształcie serca z mleczną czekoladą."
    },
    "ar": {
      "name": "أمورا القلوب بالشوكولاتة بالحليب",
      "desc": "كرواسان أيقوني على شكل قلب محشو بالشوكولاتة البلجيكية بالحليب."
    }
  },
  "Bitter Belçika Çikolatalı Amora": {
    "tr": {
      "name": "Bitter Belçika Çikolatalı Amora",
      "desc": "Kalp formundaki ikonik kruvasan; bitter Belçika çikolatası ve fıstık dokunuşu."
    },
    "en": {
      "name": "Dark Chocolate Amora Heart",
      "desc": "Iconic heart-shaped croissant with intense dark Belgian chocolate."
    },
    "de": {
      "name": "Amora Herz Zartbitterschokolade",
      "desc": "Herzförmiges Croissant mit Zartbitterschokolade."
    },
    "ru": {
      "name": "Амора Сердце с Темным Шоколадом",
      "desc": "Круассан в форме сердца с темным бельгийским шоколадом."
    },
    "nl": {
      "name": "Amora Hart Pure Chocolade",
      "desc": "Hartvormige croissant met pure chocolade."
    },
    "sv": {
      "name": "Amora Hjärta Mörk Choklad",
      "desc": "Hjärtformad croissant med mörk choklad."
    },
    "no": {
      "name": "Amora Hjerte Mørk Sjokolade",
      "desc": "Hjerteformet croissant med mørk sjokolade."
    },
    "fi": {
      "name": "Amora Sydän Tummasuklaa",
      "desc": "Sydämenmuotoinen croissant tummalla suklaalla."
    },
    "pl": {
      "name": "Amora Serce z Gorzką Czekoladą",
      "desc": "Croissant w kształcie serca z gorzką czekoladą."
    },
    "ar": {
      "name": "أمورا القلوب بالشوكولاتة الداكنة",
      "desc": "كرواسان على شكل قلب محشو بالشوكولاتة الداكنة الغنية."
    }
  },
  "Beyaz Belçika Çikolatalı Amora": {
    "tr": {
      "name": "Beyaz Belçika Çikolatalı Amora",
      "desc": "Kalp formundaki ikonik kruvasan; beyaz Belçika çikolatası ve fıstık dokunuşu."
    },
    "en": {
      "name": "White Chocolate Amora Heart",
      "desc": "Iconic heart-shaped croissant with silky white Belgian chocolate."
    },
    "de": {
      "name": "Amora Herz Weiße Schokolade",
      "desc": "Herzförmiges Croissant mit weißer Schokolade."
    },
    "ru": {
      "name": "Амора Сердце с Белым Шоколадом",
      "desc": "Круассан в форме сердца с белым бельгийским шоколадом."
    },
    "nl": {
      "name": "Amora Hart Witte Chocolade",
      "desc": "Hartvormige croissant met witte chocolade."
    },
    "sv": {
      "name": "Amora Hjärta Vit Choklad",
      "desc": "Hjärtformad croissant med vit choklad."
    },
    "no": {
      "name": "Amora Hjerte Hvit Sjokolade",
      "desc": "Hjerteformet croissant med hvit sjokolade."
    },
    "fi": {
      "name": "Amora Sydän Valkosuklaa",
      "desc": "Sydämenmuotoinen croissant valkosuklaalla."
    },
    "pl": {
      "name": "Amora Serce z Białą Czekoladą",
      "desc": "Croissant w kształcie serca z białą czekoladą."
    },
    "ar": {
      "name": "أمورا القلوب بالشوكولاتة البيضاء",
      "desc": "كرواسان على شكل قلب محشو بالشوكولاتة البيضاء اللذيذة."
    }
  },
  "Yeşil Lezzet Kruvasan": {
    "tr": {
      "name": "Yeşil Lezzet Kruvasan",
      "desc": "Labne, guacamole sos, roka, domates ve hindi füme ile hazırlanır. Elma dilim patates ve sıcak çay eşliğinde servis edilir."
    },
    "en": {
      "name": "Green Gourmet Croissant",
      "desc": "Flaky croissant with smoked turkey breast, creamy labneh, fresh guacamole, arugula and tomato. Served with potato wedges and complimentary hot tea."
    },
    "de": {
      "name": "Grüner Gourmet-Croissant",
      "desc": "Knuspriges Croissant mit Putenbrust, Guacamole, Labneh, Rucola und Tomaten. Serviert mit Kartoffelspalten."
    },
    "ru": {
      "name": "Круассан Зеленый Гурме",
      "desc": "Круассан с копченой индейкой, гуакамоле, лабне, руколой и томатами. Подается с картофелем."
    },
    "nl": {
      "name": "Groene Gourmet Croissant",
      "desc": "Croissant met gerookte kalkoen, guacamole, labneh, rucola en tomaat. Geserveerd met aardappelpartjes."
    },
    "sv": {
      "name": "Grön Gourmetcroissant",
      "desc": "Croissant med rökt kalkon, guacamole, labneh, ruccola och tomat. Serveras med klyftpotatis."
    },
    "no": {
      "name": "Grønn Gourmetcroissant",
      "desc": "Croissant med røkt kalkun, guacamole, labneh, ruccola og tomat. Serveras med potetbåter."
    },
    "fi": {
      "name": "Vihreä Gourmetcroissant",
      "desc": "Croissant savustetulla kalkkunalla, guacamolella, rucolalla ja tomaatilla. Lohkoperunoilla."
    },
    "pl": {
      "name": "Zielony Gourmet Croissant",
      "desc": "Croissant z wędzoną piersią indyka, guacamole, rukolą i pomidorem. Z ziemniaczkami."
    },
    "ar": {
      "name": "كرواسان النكهة الخضراء",
      "desc": "كرواسان بالديك الرومي المدخن، صلصة الغواكامولي، اللبنة، الجرجير والطماطم الطازجة مع بطاطا ودجز."
    }
  },
  "Ege Esintisi Kruvasan": {
    "tr": {
      "name": "Ege Esintisi Kruvasan",
      "desc": "Haydari, zeytin, ton balığı ve salatalık ile hazırlanır. Elma dilim patates ve sıcak çay eşliğinde servis edilir."
    },
    "en": {
      "name": "Aegean Breeze Croissant",
      "desc": "Premium tuna flakes, Mediterranean olives, fresh cucumber and herb yogurt spread. Served with potato wedges and complimentary hot tea."
    },
    "de": {
      "name": "Ägäis-Brise Croissant",
      "desc": "Thunfisch, mediterrane Oliven, frische Gurken und feiner Kräuterjoghurt. Serviert mit Kartoffeln."
    },
    "ru": {
      "name": "Круассан Эгейский Бриз",
      "desc": "Круассан с тунцом, оливками, огурцом и пряным йогуртовым соусом. Подается с картофелем."
    },
    "nl": {
      "name": "Egeïsche Bries Croissant",
      "desc": "Tonijn, mediterrane olijven, komkommer en kruidige yoghurtsaus."
    },
    "sv": {
      "name": "Egeiska Brisen Croissant",
      "desc": "Tonfisk, oliver, gurka och örtig yoghurtsås. Serveras med klyftpotatis."
    },
    "no": {
      "name": "Egeisk Bris Croissant",
      "desc": "Tunfisk, oliven, agurk og urteyoghurt. Serveres med potetbåter."
    },
    "fi": {
      "name": "Egean Tuuli Croissant",
      "desc": "Tonnikalaa, oliiveja, kurkkua ja yrttijogurttikastiketta. Lohkoperunoilla."
    },
    "pl": {
      "name": "Croissant Egejska Bryza",
      "desc": "Tuńczyk, śródziemnomorskie oliwki, ogórek i sos ziołowo-jogurtowy."
    },
    "ar": {
      "name": "كرواسان نسيم إيجه",
      "desc": "تونة فاخرة مع الزيتون، الخيار وصلصة الزبادي بالأعشاب مع بطاطا ودجز."
    }
  },
  "Avokado Royale Kruvasan": {
    "tr": {
      "name": "Avokado Royale Kruvasan",
      "desc": "Labne, avokado, kremalı çırpılmış yumurta, kaşar peyniri ve özel Noa sosuyla hazırlanır. Elma dilim patates ve sıcak çay eşliğinde servis edilir."
    },
    "en": {
      "name": "Avocado Royale Croissant",
      "desc": "Fresh avocado slices, creamy scrambled eggs, melted cheese, labneh and signature sauce. Served with potato wedges and complimentary hot tea."
    },
    "de": {
      "name": "Avocado Royale Croissant",
      "desc": "Frische Avocado, cremiges Rührei, geschmolzener Käse und Spezialsoße. Serviert mit Kartoffelspalten."
    },
    "ru": {
      "name": "Круассан Авокадо Рояль",
      "desc": "Свежий авокадо, нежный скрембл, сыр кашар, лабне и фирменный соус Noa."
    },
    "nl": {
      "name": "Avocado Royale Croissant",
      "desc": "Verse avocado, roerei, gesmolten kaas, labneh en speciale saus."
    },
    "sv": {
      "name": "Avokado Royale Croissant",
      "desc": "Färsk avokado, krämig äggröra, smält ost och Noa specialsås."
    },
    "no": {
      "name": "Avokado Royale Croissant",
      "desc": "Fersk avokado, eggerøre, smeltet ost og Noa spesialsaus."
    },
    "fi": {
      "name": "Avocado Royale Croissant",
      "desc": "Tuoretta avokadoa, munakokkelia, juustoa ja Noa-erikoiskastiketta."
    },
    "pl": {
      "name": "Croissant Awokado Royale",
      "desc": "Świeże awokado, jajecznica, ser i firmowy sos Noa."
    },
    "ar": {
      "name": "كرواسان أفوكادو رويال",
      "desc": "شرائح الأفوكادو الطازجة مع البيض المخفوق الكريمي، الجبن وصلصة نوا الخاصة."
    }
  },
  "Közlü Peynir Kruvasan": {
    "tr": {
      "name": "Közlü Peynir Kruvasan",
      "desc": "Labne, köz salata, Ezine peyniri ve domatesle hazırlanır. Elma dilim patates ve sıcak çay eşliğinde servis edilir."
    },
    "en": {
      "name": "Roasted Pepper & Ezine Cheese Croissant",
      "desc": "Authentic Ezine white cheese, fire-roasted red peppers, labneh and tomatoes. Served with potato wedges and complimentary hot tea."
    },
    "de": {
      "name": "Gegrillter Paprika & Schafskäse Croissant",
      "desc": "Traditioneller Ezine-Käse, gegrillte Paprika, Labneh und Tomaten."
    },
    "ru": {
      "name": "Круассан с Печеным Перцем и Сыром Эзине",
      "desc": "Сыр Эзине, запеченный на углях перец, лабне и томаты."
    },
    "nl": {
      "name": "Geroosterde Paprika & Ezine Kaas Croissant",
      "desc": "Ezine kaas, geroosterde paprika, labneh en tomaat."
    },
    "sv": {
      "name": "Rostad Paprika & Ezineost Croissant",
      "desc": "Ezine vitost, grillad paprika, labneh och tomat."
    },
    "no": {
      "name": "Grillet Paprika & Ezineost Croissant",
      "desc": "Ezine hvitost, grillet paprika, labneh og tomat."
    },
    "fi": {
      "name": "Paahdettu Paprika & Ezine-juusto Croissant",
      "desc": "Ezine-juustoa, paahdettua paprikaa, labnehia ja tomaattia."
    },
    "pl": {
      "name": "Croissant z Pieczoną Papryką i Serem Ezine",
      "desc": "Ser Ezine, pieczona papryka, labneh i świeże pomidory."
    },
    "ar": {
      "name": "كرواسان جبن إزيني والفلفل المشوي",
      "desc": "جبن إزيني الأبيض التركي مع الفلفل المشوي واللبنة والطماطم."
    }
  },
  "Pesto Milano Kruvasan": {
    "tr": {
      "name": "Pesto Milano Kruvasan",
      "desc": "Pesto sos, roka, mozzarella peyniri ve domatesle hazırlanır. Elma dilim patates ve sıcak çay eşliğinde servis edilir."
    },
    "en": {
      "name": "Pesto Milano Croissant",
      "desc": "Fresh Italian mozzarella, fragrant basil pesto, peppery arugula and sliced tomatoes. Served with potato wedges and complimentary hot tea."
    },
    "de": {
      "name": "Pesto Milano Croissant",
      "desc": "Frischer Mozzarella, aromatisches Basilikumpesto, Rucola und Tomaten."
    },
    "ru": {
      "name": "Круассан Песто Милано",
      "desc": "Свежая моцарелла, соус песто из базилика, рукола и томаты."
    },
    "nl": {
      "name": "Pesto Milano Croissant",
      "desc": "Verse mozzarella, basilicumpesto, rucola en tomaat."
    },
    "sv": {
      "name": "Pesto Milano Croissant",
      "desc": "Färsk mozzarella, basilikapesto, ruccola och tomat."
    },
    "no": {
      "name": "Pesto Milano Croissant",
      "desc": "Fersk mozzarella, basilikumpesto, ruccola og tomat."
    },
    "fi": {
      "name": "Pesto Milano Croissant",
      "desc": "Tuoretta mozzarellaa, basilikapestoa, rucolaa ja tomaattia."
    },
    "pl": {
      "name": "Croissant Pesto Milano",
      "desc": "Świeża mozzarella, pesto bazyliowe, rukola i pomidory."
    },
    "ar": {
      "name": "كرواسان بيستو ميلانو",
      "desc": "جبن الموزاريلا الطازج مع صلصة البيستو الإيطالية، الجرجير والطماطم."
    }
  },
  "Kaburga Deluxe Kruvasan": {
    "tr": {
      "name": "Kaburga Deluxe Kruvasan",
      "desc": "Burger sos, karamelize soğan, kaşar peyniri, dana kaburga eti ve cheddar sosuyla hazırlanır. Elma dilim patates ve sıcak çay eşliğinde servis edilir."
    },
    "en": {
      "name": "Beef Rib Deluxe Croissant",
      "desc": "Slow-cooked pulled beef ribs, caramelized onions, melted cheese, warm cheddar sauce and burger relish. Served with potato wedges and complimentary hot tea."
    },
    "de": {
      "name": "Rinderrippen Deluxe Croissant",
      "desc": "Zartes geschmortes Rinderrippenfleisch, karamellisierte Zwiebeln, Käse und warme Cheddarsauce."
    },
    "ru": {
      "name": "Круассан Рибс Делюкс с Томлеными Ребрами",
      "desc": "Томленая говяжья грудинка, карамелизированный лук, сыр и теплый соус чеддер."
    },
    "nl": {
      "name": "Runderrib Deluxe Croissant",
      "desc": "Langzaam gegaarde runderribben, gekarameliseerde ui, gesmolten kaas en cheddarsaus."
    },
    "sv": {
      "name": "Nötrevben Deluxe Croissant",
      "desc": "Långkokt högrev/revben, karamelliserad lök, smält ost och cheddarsås."
    },
    "no": {
      "name": "Okseribbe Deluxe Croissant",
      "desc": "Langtidskokt storfekjøtt, karamellisert løk, smeltet ost og cheddarsaus."
    },
    "fi": {
      "name": "Naudanribsi Deluxe Croissant",
      "desc": "Ylikypsää mureaa naudanlihaa, karamellisoitua sipulia, juustoa ja cheddar-kastiketta."
    },
    "pl": {
      "name": "Croissant z Szarpaną Wołowiną Deluxe",
      "desc": "Długo pieczone żeberka wołowe, karmelizowana cebula, ser i sos cheddar."
    },
    "ar": {
      "name": "كرواسان أضلاع اللحم البقري ديلوكس",
      "desc": "لحم أضلاع بقري مطهو ببطء مع البصل المكرمل، الجبن وصلصة الشيدر الساخنة."
    }
  },
  "Hot Dog Kruvasan": {
    "tr": {
      "name": "Hot Dog Kruvasan",
      "desc": "Mayonez, çırpılmış yumurta, tatlı-acı sos, dana sosis ve cheddar peyniriyle hazırlanır. Elma dilim patates ve sıcak çay eşliğinde servis edilir."
    },
    "en": {
      "name": "Hot Dog Croissant",
      "desc": "Gourmet beef sausage, scrambled eggs, sweet-chili relish, mayo and melted cheddar. Served with potato wedges and complimentary hot tea."
    },
    "de": {
      "name": "Hot Dog Croissant",
      "desc": "Rinderwurst, Rührei, Sweet-Chili-Sauce, Mayonnaise und Cheddar-Käse."
    },
    "ru": {
      "name": "Хот-дог Круассан",
      "desc": "Говяжья сосиска, скрембл, кисло-сладкий соус чили и сыр чеддер."
    },
    "nl": {
      "name": "Hot Dog Croissant",
      "desc": "Runderworst, roerei, zoet-zure chilisaus en cheddarkaas."
    },
    "sv": {
      "name": "Hot Dog Croissant",
      "desc": "Nötkorv, äggröra, sweet chilisås och cheddarost."
    },
    "no": {
      "name": "Hot Dog Croissant",
      "desc": "Storfepølse, eggerøre, sweet chilisaus og cheddarost."
    },
    "fi": {
      "name": "Hot Dog Croissant",
      "desc": "Nakkicroissant naudanmakkaralla, munakokkelilla ja cheddarilla."
    },
    "pl": {
      "name": "Hot Dog Croissant",
      "desc": "Kiełbaska wołowa, jajecznica, sos sweet-chili i ser cheddar."
    },
    "ar": {
      "name": "هوت دوج كرواسان",
      "desc": "نقانق لحم بقري فاخرة مع البيض المخفوق، صلصة الفلفل الحلو وجبن الشيدر."
    }
  },
  "NOA Kahvaltı Tabağı": {
    "tr": {
      "name": "NOA Kahvaltı Tabağı",
      "desc": "Taptaze kruvasan, sıcacık omlet, çıtır patates kızartması, peynir, domates, salatalık, siyah & yeşil zeytin ve Nutella. Sıcak çay eşliğinde servis edilir."
    },
    "en": {
      "name": "NOA Breakfast Platter",
      "desc": "Freshly baked croissant, warm omelette, golden crispy fries, cheese, tomatoes, cucumbers, black & green olives and Nutella. Served with complimentary hot tea."
    },
    "de": {
      "name": "NOA Frühstücksplatte",
      "desc": "Frisches Croissant, warmes Omelett, knusprige Pommes, Käse, Tomaten, Gurken, Oliven und Nutella. Serviert mit heißem Tee."
    },
    "ru": {
      "name": "Завтрак NOA Тарелка",
      "desc": "Свежий круассан, омлет, картофель фри, сыр, томаты, огурцы, оливки и Нутелла. Подается с горячим чаем."
    },
    "nl": {
      "name": "NOA Ontbijtplank",
      "desc": "Verse croissant, warme omelet, knapperige frietjes, kaas, tomaten, komkommer, olijven en Nutella. Geserveerd met warme thee."
    },
    "sv": {
      "name": "NOA Frukosttallrik",
      "desc": "Nybakad croissant, varm omelett, krispiga pommes, ost, tomater, gurka, oliver och Nutella. Serveras med varmt te."
    },
    "no": {
      "name": "NOA Frokosttallerken",
      "desc": "Nybakt croissant, varm omelett, sprø pommes frites, ost, tomater, agurk, oliven og Nutella. Servert med varm te."
    },
    "fi": {
      "name": "NOA Aamiaislautanen",
      "desc": "Tuore croissant, lämmin munakas, rapeita ranskalaisia, juustoa, tomaatteja, kurkkua, oliiveja ja Nutellaa. Tarjoillaan kuuman teen kera."
    },
    "pl": {
      "name": "NOA Talerz Śniadaniowy",
      "desc": "Świeży croissant, ciepły omlet, chrupiące frytki, ser, pomidory, ogórki, oliwki i Nutella. Podawane z gorącą herbatą."
    },
    "ar": {
      "name": "طبق فطور نووا المميز",
      "desc": "كرواسان طازج، أومليت ساخن، بطاطا مقلية مقرمشة، جبن، طماطم، خيار، زيتون ونوتيلا مع شاي ساخن مجاني."
    }
  },
  "NOA Full Depo": {
    "tr": {
      "name": "NOA Full Depo",
      "desc": "NOA Benzin ve NOA Dizel'den oluşan 2 adet özel içecek paketi."
    },
    "en": {
      "name": "NOA Full Depo",
      "desc": "Special combo bundle containing 2 signature drinks: NOA Benzin & NOA Dizel."
    },
    "de": {
      "name": "NOA Full Depo",
      "desc": "Vorteilspaket mit 2 Spezialgetränken: NOA Benzin & NOA Dizel."
    },
    "ru": {
      "name": "NOA Фулл Депо",
      "desc": "Специальный сет из двух фирменных напитков: NOA Бензин и NOA Дизель."
    },
    "nl": {
      "name": "NOA Full Depo",
      "desc": "Speciaal pakket met 2 kenmerkende drankjes: NOA Benzin & NOA Dizel."
    },
    "sv": {
      "name": "NOA Full Depo",
      "desc": "Specialpaket med 2 signaturdrycker: NOA Benzin och NOA Dizel."
    },
    "no": {
      "name": "NOA Full Depo",
      "desc": "Spesialpakke med 2 signaturdrikker: NOA Benzin og NOA Dizel."
    },
    "fi": {
      "name": "NOA Full Depo",
      "desc": "Erikoispaketti, joka sisältää 2 nimikojuomaa: NOA Benzin & NOA Dizel."
    },
    "pl": {
      "name": "NOA Full Depo",
      "desc": "Zestaw promocyjny zawierający 2 autorskie napoje: NOA Benzin i NOA Dizel."
    },
    "ar": {
      "name": "نوا فول ديبو",
      "desc": "باقة مميزة تحتوي على مشروبين خاصين: نوا بنزين ونوا ديزل."
    }
  },
  "NOA Turbo": {
    "tr": {
      "name": "NOA Turbo",
      "desc": "NOA Benzin ve NOA Dizel karışımıyla hazırlanan özel imza atom kokteyl."
    },
    "en": {
      "name": "NOA Turbo",
      "desc": "Signature atom cocktail crafted by blending NOA Benzin and NOA Dizel."
    },
    "de": {
      "name": "NOA Turbo",
      "desc": "Spezieller Signatur-Cocktail aus der Mischung von NOA Benzin und NOA Dizel."
    },
    "ru": {
      "name": "NOA Турбо",
      "desc": "Фирменный атом-коктейль из смеси NOA Бензина и NOA Дизеля."
    },
    "nl": {
      "name": "NOA Turbo",
      "desc": "Exclusieve cocktail bereid uit de mix van NOA Benzin en NOA Dizel."
    },
    "sv": {
      "name": "NOA Turbo",
      "desc": "Signaturcocktail skapad genom en blandning av NOA Benzin och NOA Dizel."
    },
    "no": {
      "name": "NOA Turbo",
      "desc": "Signaturcocktail laget av en blanding av NOA Benzin og NOA Dizel."
    },
    "fi": {
      "name": "NOA Turbo",
      "desc": "Erikoiscocktail, joka on valmistettu sekoittamalla NOA Benziniä ja NOA Dizeliä."
    },
    "pl": {
      "name": "NOA Turbo",
      "desc": "Autorski koktajl atomowy powstały z połączenia NOA Benzinu i NOA Dizela."
    },
    "ar": {
      "name": "نوا توربو",
      "desc": "كوكتيل مميز محضر من مزيج نكهات نوا بنزين ونوا ديزل الرائعة."
    }
  },
  "NOA Benzin": {
    "tr": {
      "name": "NOA Benzin",
      "desc": "Pasiflora, Şeftali, Kivi, Muz, Ananas, Portakal."
    },
    "en": {
      "name": "NOA Benzin",
      "desc": "Passion fruit, Peach, Kiwi, Banana, Pineapple, Orange."
    },
    "de": {
      "name": "NOA Benzin",
      "desc": "Passionsfrucht, Pfirsich, Kiwi, Banane, Ananas, Orange."
    },
    "ru": {
      "name": "NOA Бензин",
      "desc": "Маракуйя, Персик, Киви, Банан, Ананас, Апельсин."
    },
    "nl": {
      "name": "NOA Benzin",
      "desc": "Passievrucht, Perzik, Kiwi, Banaan, Ananas, Sinaasappel."
    },
    "sv": {
      "name": "NOA Benzin",
      "desc": "Passionsfrukt, Persika, Kiwi, Banan, Ananas, Apelsin."
    },
    "no": {
      "name": "NOA Benzin",
      "desc": "Pasjonsfrukt, Fersken, Kiwi, Banan, Ananas, Appelsin."
    },
    "fi": {
      "name": "NOA Benzin",
      "desc": "Passiohedelmä, Persikka, Kiivi, Banaani, Ananas, Appelsiini."
    },
    "pl": {
      "name": "NOA Benzin",
      "desc": "Marakuja, Brzoskwinia, Kiwi, Banan, Ananas, Pomarańcza."
    },
    "ar": {
      "name": "نوا بنزين",
      "desc": "باشن فروت، خوخ، كيوي، موز، أناناس، برتقال."
    }
  },
  "NOA Dizel": {
    "tr": {
      "name": "NOA Dizel",
      "desc": "Kavun, Portakal, Ejder Meyvesi, Çilek, Muz."
    },
    "en": {
      "name": "NOA Dizel",
      "desc": "Melon, Orange, Dragon Fruit (Pitaya), Strawberry, Banana."
    },
    "de": {
      "name": "NOA Dizel",
      "desc": "Melone, Orange, Drachenfrucht, Erdbeere, Banane."
    },
    "ru": {
      "name": "NOA Дизель",
      "desc": "Дыня, Апельсин, Драконий фрукт (Питахайя), Клубника, Банан."
    },
    "nl": {
      "name": "NOA Dizel",
      "desc": "Meloen, Sinaasappel, Drakenfruit, Aardbei, Banaan."
    },
    "sv": {
      "name": "NOA Dizel",
      "desc": "Melon, Apelsin, Drakfrukt, Jordgubb, Banan."
    },
    "no": {
      "name": "NOA Dizel",
      "desc": "Melon, Appelsin, Dragefrukt, Jordbær, Banan."
    },
    "fi": {
      "name": "NOA Dizel",
      "desc": "Meloni, Appelsiini, Lohikäärmehedelmä, Mansikka, Banaani."
    },
    "pl": {
      "name": "NOA Dizel",
      "desc": "Melon, Pomarańcza, Smoczy owoc (Pitaja), Truskawka, Banan."
    },
    "ar": {
      "name": "نوا ديزل",
      "desc": "شمام، برتقال، فاكهة التنين (بيتايا)، فراولة، موز."
    }
  },
  "El Yapımı Çilekli Limonata": {
    "tr": {
      "name": "El Yapımı Çilekli Limonata",
      "desc": "Taze bahçe çilekleri püresiyle zenginleştirilmiş ev yapımı limonata."
    },
    "en": {
      "name": "Handcrafted Strawberry Lemonade",
      "desc": "Freshly squeezed Mediterranean lemons blended with crushed garden strawberry puree."
    },
    "de": {
      "name": "Hausgemachte Erdbeer-Limonade",
      "desc": "Frisch gepresste Zitronen verfeinert mit frischem Erdbeerpüree."
    },
    "ru": {
      "name": "Домашний Клубничный Лимонад",
      "desc": "Натуральный свежевыжатый лимонад с пюре из свежей садовой клубники."
    },
    "nl": {
      "name": "Huisgemaakte Aardbeienlimonade",
      "desc": "Vers geperste citroenen gemengd met verse aardbeienpuree."
    },
    "sv": {
      "name": "Hantverksmässig Jordgubbslemonad",
      "desc": "Färskpressad citronlemonad med jordgubbspuré."
    },
    "no": {
      "name": "Hjemmelaget Jordbærlimonade",
      "desc": "Ferskpresset sitronlimonade med fersk jordbærpuré."
    },
    "fi": {
      "name": "Käsintehty Mansikkalimonadi",
      "desc": "Tuorepuristettua sitruunalimonadia aidolla mansikkasoseella."
    },
    "pl": {
      "name": "Rzemieślnicza Lemoniada Truskawkowa",
      "desc": "Świeżo wyciskana lemoniada z puree ze świeżych truskawek."
    },
    "ar": {
      "name": "ليموناضة الفراولة الطبيعية المصنوعة يدوياً",
      "desc": "عصير ليمون طازج معصور يدوياً وممزوج مع بيوريه الفراولة الطازجة."
    }
  },
  "El Yapımı Limonata": {
    "tr": {
      "name": "El Yapımı Limonata",
      "desc": "Taze sıkılmış limonlardan günlük el yapımı ferahlatıcı limonata."
    },
    "en": {
      "name": "Handcrafted Fresh Lemonade",
      "desc": "Daily freshly squeezed Mediterranean lemons with fresh mint and citrus zest."
    },
    "de": {
      "name": "Hausgemachte Frische Limonade",
      "desc": "Täglich frisch gepresste Zitronen mit Minze und Zitrusschale."
    },
    "ru": {
      "name": "Домашний Свежий Лимонад",
      "desc": "Свежевыжатый классический лимонад с мятой и цедрой лимона."
    },
    "nl": {
      "name": "Huisgemaakte Verse Limonade",
      "desc": "Dagelijks vers geperste citroenen met verse munt."
    },
    "sv": {
      "name": "Hantverksmässig Färsk Lemonad",
      "desc": "Dagligen färskpressade citroner med färsk mynta."
    },
    "no": {
      "name": "Hjemmelaget Fersk Limonade",
      "desc": "Daglig ferskpresset sitron med mynte."
    },
    "fi": {
      "name": "Käsintehty Tuorelimonadi",
      "desc": "Päivittäin tuorepuristettua sitruunalimonadia mintulla."
    },
    "pl": {
      "name": "Rzemieślnicza Świeża Lemoniada",
      "desc": "Codziennie świeżo wyciskane cytryny ze świeżą miętą."
    },
    "ar": {
      "name": "ليموناضة طبيعية طازجة",
      "desc": "ليمون متوسطي طازج معصور يومياً باليد مع أوراق النعناع المنعشة."
    }
  },
  "Taze Sıkma Nar Suyu": {
    "tr": {
      "name": "Taze Sıkma Nar Suyu",
      "desc": "Günlük taze sıkılmış %100 doğal nar suyu."
    },
    "en": {
      "name": "Freshly Squeezed Pomegranate Juice",
      "desc": "100% natural, freshly pressed pure pomegranate juice."
    },
    "de": {
      "name": "Frisch gepresster Granatapfelsaft",
      "desc": "100% natürlicher, frisch gepresster reiner Granatapfelsaft."
    },
    "ru": {
      "name": "Свежевыжатый Гранатовый Сок",
      "desc": "100% натуральный свежевыжатый гранатовый сок."
    },
    "nl": {
      "name": "Vers Geperst Granaatappelsap",
      "desc": "100% natuurlijk, vers geperst puur granaatappelsap."
    },
    "sv": {
      "name": "Färskpressad Granatäppeljuice",
      "desc": "100% naturlig, färskpressad ren granatäppeljuice."
    },
    "no": {
      "name": "Ferskpresset Granateplejuice",
      "desc": "100% naturlig, ferskpresset ren granateplejuice."
    },
    "fi": {
      "name": "Tuorepuristettu Granaattiomenamehu",
      "desc": "100% luonnollista, tuorepuristettua puhdasta granaattiomenamehua."
    },
    "pl": {
      "name": "Świeżo Wyciskany Sok z Granatu",
      "desc": "100% naturalny, świeżo wyciskany czysty sok z granatu."
    },
    "ar": {
      "name": "عصير رمان طازج معصور",
      "desc": "عصير رمان طبيعي 100% معصور طازجاً بنكهة نقية وغنية بمضادات الأكسدة."
    }
  },
  "Dondurma": {
    "tr": {
      "name": "Dondurma",
      "desc": "Geleneksel kıvamında doğal ve taze dondurma lezzeti."
    },
    "en": {
      "name": "Artisan Gelato Scoop",
      "desc": "Creamy traditional artisanal Italian gelato scoop."
    },
    "de": {
      "name": "Gourmet Eiskugel",
      "desc": "Klassische handwerkliche Eiskugel aus frischer Milch."
    },
    "ru": {
      "name": "Шарик Натурального Мороженого",
      "desc": "Шарик традиционного сливочного авторского мороженого."
    },
    "nl": {
      "name": "Ambachtelijk Bolletje IJs",
      "desc": "Romig traditioneel ambachtelijk schepijs."
    },
    "sv": {
      "name": "Hantverksglass Skopa",
      "desc": "Krämig traditionell hantverksglass."
    },
    "no": {
      "name": "Håndverksiskrem Kule",
      "desc": "Kremet tradisjonell håndverksiskrem."
    },
    "fi": {
      "name": "Artesaanijäätelöpallo",
      "desc": "Kermaista perinteistä artesaanijäätelöä."
    },
    "pl": {
      "name": "Gałka Lodów Rzemieślniczych",
      "desc": "Kremowe, tradycyjne lody rzemieślnicze."
    },
    "ar": {
      "name": "كرة آيس كريم طبيعي فاخر",
      "desc": "كرة آيس كريم جيلاتو كريمية محضرة بالحليب الطبيعي الطازج."
    }
  },
  "Su (33 cl.)": {
    "tr": {
      "name": "Su (33 cl.)",
      "desc": "Doğal ve ferahlatıcı kaynak suyu."
    },
    "en": {
      "name": "Natural Spring Water (33 cl.)",
      "desc": "Pure and refreshing natural spring water."
    },
    "de": {
      "name": "Quellwasser (33 cl.)",
      "desc": "Natürliches und erfrischendes Quellwasser."
    },
    "ru": {
      "name": "Природная Вода (33 cl.)",
      "desc": "Чистая и освежающая природная родниковая вода."
    },
    "nl": {
      "name": "Bronwater (33 cl.)",
      "desc": "Puur en verfrissend natuurlijk bronwater."
    },
    "sv": {
      "name": "Källvatten (33 cl.)",
      "desc": "Rent och uppfriskande naturligt källvatten."
    },
    "no": {
      "name": "Kildevann (33 cl.)",
      "desc": "Rent og forfriskende naturlig kildevann."
    },
    "fi": {
      "name": "Lähdevesi (33 cl.)",
      "desc": "Puhdasta ja raikasta luonnollista lähdevettä."
    },
    "pl": {
      "name": "Woda Źródlana (33 cl.)",
      "desc": "Czysta i orzeźwiająca naturalna woda źródlana."
    },
    "ar": {
      "name": "مياه ينابيع طبيعية (33 cl.)",
      "desc": "مياه ينابيع طبيعية نقية ومنعشة."
    }
  },
  "Maden Suyu": {
    "tr": {
      "name": "Maden Suyu",
      "desc": "Doğal zengin mineralli ferahlatıcı maden suyu."
    },
    "en": {
      "name": "Sparkling Mineral Water",
      "desc": "Natural effervescent rich mineral water."
    },
    "de": {
      "name": "Sprudelndes Mineralwasser",
      "desc": "Natürliches mineralreiches Mineralwasser."
    },
    "ru": {
      "name": "Газированная Минеральная Вода",
      "desc": "Натуральная природная газированная минеральная вода."
    },
    "nl": {
      "name": "Bruisend Mineraalwater",
      "desc": "Natuurlijk mineraalrijk bruiswater."
    },
    "sv": {
      "name": "Kolsyrat Mineralvatten",
      "desc": "Naturligt kolsyrat mineralvatten."
    },
    "no": {
      "name": "Farris / Kullsyrevann",
      "desc": "Naturlig mineralrikt kullsyrevann."
    },
    "fi": {
      "name": "Kivennäisvesi",
      "desc": "Poreilevaa luonnollista kivennäisvettä."
    },
    "pl": {
      "name": "Woda Mineralna Gazowana",
      "desc": "Naturalna woda gazowana bogata w minerały."
    },
    "ar": {
      "name": "مياه معدنية فوارة",
      "desc": "مياه معدنية طبيعية فوارة غنية بالمعادن."
    }
  },
  "Coca-Cola (33 cl.)": {
    "tr": {
      "name": "Coca-Cola (33 cl.)",
      "desc": "Klasik ve efsanevi ferahlatıcı lezzet."
    },
    "en": {
      "name": "Coca-Cola (33 cl.)",
      "desc": "Classic and iconic refreshing taste."
    },
    "de": {
      "name": "Coca-Cola (33 cl.)",
      "desc": "Klassischer und legendärer Erfrischungsgeschmack."
    },
    "ru": {
      "name": "Coca-Cola (33 cl.)",
      "desc": "Классический легендарный освежающий вкус."
    },
    "nl": {
      "name": "Coca-Cola (33 cl.)",
      "desc": "Klassieke en iconische verfrissende smaak."
    },
    "sv": {
      "name": "Coca-Cola (33 cl.)",
      "desc": "Klassisk och ikonisk uppfriskande smak."
    },
    "no": {
      "name": "Coca-Cola (33 cl.)",
      "desc": "Klassisk og ikonisk forfriskende smak."
    },
    "fi": {
      "name": "Coca-Cola (33 cl.)",
      "desc": "Klassinen ja ikoninen virkistävä maku."
    },
    "pl": {
      "name": "Coca-Cola (33 cl.)",
      "desc": "Klasyczny i kultowy orzeźwiający smak."
    },
    "ar": {
      "name": "كوكاكولا (33 cl.)",
      "desc": "المذاق الكلاسيكي المنعش الأسطوري."
    }
  },
  "Coca-Cola Zero Sugar (33 cl.)": {
    "tr": {
      "name": "Coca-Cola Zero Sugar (33 cl.)",
      "desc": "Şekersiz, hafif ve ferahlatıcı lezzet."
    },
    "en": {
      "name": "Coca-Cola Zero Sugar (33 cl.)",
      "desc": "Zero sugar, light and refreshing taste."
    },
    "de": {
      "name": "Coca-Cola Zero Sugar (33 cl.)",
      "desc": "Zuckerfreier, leichter und erfrischender Geschmack."
    },
    "ru": {
      "name": "Coca-Cola Zero Sugar (33 cl.)",
      "desc": "Без сахара, легкий и освежающий вкус."
    },
    "nl": {
      "name": "Coca-Cola Zero Sugar (33 cl.)",
      "desc": "Suikervrij, licht en verfrissend."
    },
    "sv": {
      "name": "Coca-Cola Zero Sugar (33 cl.)",
      "desc": "Sockerfri, lätt och uppfriskande."
    },
    "no": {
      "name": "Coca-Cola Zero Sugar (33 cl.)",
      "desc": "Sukkerfri, lett og forfriskende."
    },
    "fi": {
      "name": "Coca-Cola Zero Sugar (33 cl.)",
      "desc": "Sokeriton, kevyt ja raikas maku."
    },
    "pl": {
      "name": "Coca-Cola Zero Cukru (33 cl.)",
      "desc": "Bez cukru, lekki i orzeźwiający smak."
    },
    "ar": {
      "name": "كوكاكولا زيرو سكر (33 cl.)",
      "desc": "خالية من السكر، خفيفة ومنعشة."
    }
  },
  "Maden Suyu (20 cl.)": {
    "tr": {
      "name": "Maden Suyu (20 cl.)",
      "desc": "Doğal zengin mineralli ferahlatıcı maden suyu."
    },
    "en": {
      "name": "Mineral Water (20 cl.)",
      "desc": "Natural rich sparkling mineral water."
    },
    "de": {
      "name": "Mineralwasser (20 cl.)",
      "desc": "Natürliches kohlensäurehaltiges Mineralwasser."
    },
    "ru": {
      "name": "Минеральная вода (20 cl.)",
      "desc": "Натуральная газированная минеральная вода."
    },
    "nl": {
      "name": "Mineraalwater (20 cl.)",
      "desc": "Natuurlijk bruisend mineraalwater."
    },
    "sv": {
      "name": "Mineralvatten (20 cl.)",
      "desc": "Naturligt kolsyrat mineralvatten."
    },
    "no": {
      "name": "Mineralvann (20 cl.)",
      "desc": "Naturlig musserende mineralvann."
    },
    "fi": {
      "name": "Kivennäisvesi (20 cl.)",
      "desc": "Luonnollinen hiilihapollinen kivennäisvesi."
    },
    "pl": {
      "name": "Woda Mineralna (20 cl.)",
      "desc": "Naturalna woda mineralna gazowana."
    },
    "ar": {
      "name": "مياه معدنية (20 cl.)",
      "desc": "مياه معدنية فوارة طبيعية منعشة."
    }
  },
  "Churchill": {
    "tr": {
      "name": "Churchill",
      "desc": "Taze sıkılmış limon suyu, mineralli maden suyu ve tuz dengesiyle ferahlatıcı klasik."
    },
    "en": {
      "name": "Churchill",
      "desc": "Fresh lemon juice shaken with sparkling mineral water and a touch of salt."
    },
    "de": {
      "name": "Churchill",
      "desc": "Frischer Zitronensaft mit spritzigem Mineralwasser und einer Prise Salz."
    },
    "ru": {
      "name": "Черчилль",
      "desc": "Свежевыжатый лимонный сок с минеральной газированной водой и щепоткой соли."
    },
    "nl": {
      "name": "Churchill",
      "desc": "Vers citroensap met bruisend mineraalwater en een vleugje zout."
    },
    "sv": {
      "name": "Churchill",
      "desc": "Färsk citronsaft med kolsyrat mineralvatten och en nypa salt."
    },
    "no": {
      "name": "Churchill",
      "desc": "Fersk sitronsaft med musserende mineralvann og et hint av salt."
    },
    "fi": {
      "name": "Churchill",
      "desc": "Tuoretta sitruunamehua kivennäisvedellä ja ripauksella suolaa."
    },
    "pl": {
      "name": "Churchill",
      "desc": "Świeży sok z cytryny z wodą gazowaną i nutą soli."
    },
    "ar": {
      "name": "تشرشل",
      "desc": "عصير ليمون طازج ممزوج مع المياه الفوارة ورشة خفيفة من الملح المنعش."
    }
  },
  "Uludağ Frutti (20 cl.)": {
    "tr": {
      "name": "Uludağ Frutti (20 cl.)",
      "desc": "Ferahlatıcı meyve aromalarıyla zenginleştirilmiş maden suyu."
    },
    "en": {
      "name": "Uludağ Frutti (20 cl.)",
      "desc": "Refreshing fruit-infused sparkling mineral water."
    },
    "de": {
      "name": "Uludağ Frutti (20 cl.)",
      "desc": "Fruchtiges kohlensäurehaltiges Mineralwasser."
    },
    "ru": {
      "name": "Улудаг Фрутти (20 cl.)",
      "desc": "Освежающая фруктовая газированная минеральная вода."
    },
    "nl": {
      "name": "Uludağ Frutti (20 cl.)",
      "desc": "Verfrissend bruisend mineraalwater met fruitsmaak."
    },
    "sv": {
      "name": "Uludağ Frutti (20 cl.)",
      "desc": "Uppfriskande kolsyrat mineralvatten med fruktsmak."
    },
    "no": {
      "name": "Uludağ Frutti (20 cl.)",
      "desc": "Forfriskende musserende mineralvann med fruktsmak."
    },
    "fi": {
      "name": "Uludağ Frutti (20 cl.)",
      "desc": "Raikas hedelmäinen kivennäisvesi."
    },
    "pl": {
      "name": "Uludağ Frutti (20 cl.)",
      "desc": "Orzeźwiająca owocowa woda mineralna gazowana."
    },
    "ar": {
      "name": "أولوداغ فروتي (20 cl.)",
      "desc": "مياه معدنية فوارة بنكهات الفواكه المنعشة."
    }
  },
  "Uludağ Frutti Extra (25 cl.)": {
    "tr": {
      "name": "Uludağ Frutti Extra (25 cl.)",
      "desc": "Yoğun meyve lezzeti ve ferahlatıcı mineral dengesi."
    },
    "en": {
      "name": "Uludağ Frutti Extra (25 cl.)",
      "desc": "Extra fruit richness with crisp sparkling minerals."
    },
    "de": {
      "name": "Uludağ Frutti Extra (25 cl.)",
      "desc": "Extra fruchtiges Mineralwasser voller Geschmack."
    },
    "ru": {
      "name": "Улудаг Фрутти Экстра (25 cl.)",
      "desc": "Насыщенная фруктовая минеральная вода."
    },
    "nl": {
      "name": "Uludağ Frutti Extra (25 cl.)",
      "desc": "Extra fruitig bruisend mineraalwater."
    },
    "sv": {
      "name": "Uludağ Frutti Extra (25 cl.)",
      "desc": "Extra fruktigt och fylligt mineralvatten."
    },
    "no": {
      "name": "Uludağ Frutti Extra (25 cl.)",
      "desc": "Ekstra fruktig og forfriskende mineralvann."
    },
    "fi": {
      "name": "Uludağ Frutti Extra (25 cl.)",
      "desc": "Ekstra hedelmäinen ja raikas kivennäisvesi."
    },
    "pl": {
      "name": "Uludağ Frutti Extra (25 cl.)",
      "desc": "Ekstra owocowa i wyrazista woda mineralna."
    },
    "ar": {
      "name": "أولوداغ فروتي إكسترا (25 cl.)",
      "desc": "مياه معدنية فوارة غنية بنكهات الفواكه الطبيعية المركزة."
    }
  },
  "Fanta (33 cl.)": {
    "tr": {
      "name": "Fanta (33 cl.)",
      "desc": "Canlandırıcı ve enerjik portakal lezzeti."
    },
    "en": {
      "name": "Fanta (33 cl.)",
      "desc": "Vibrant and bubbly sweet orange refreshment."
    },
    "de": {
      "name": "Fanta (33 cl.)",
      "desc": "Spritzige und erfrischende Orangenerfrischung."
    },
    "ru": {
      "name": "Фанта (33 cl.)",
      "desc": "Яркий и сочный апельсиновый вкус."
    },
    "nl": {
      "name": "Fanta (33 cl.)",
      "desc": "Bruisende en fruitige sinaasappelfrisdrank."
    },
    "sv": {
      "name": "Fanta (33 cl.)",
      "desc": "Sprudlande och frisk apelsinläsk."
    },
    "no": {
      "name": "Fanta (33 cl.)",
      "desc": "Sprudlende og frisk appelsinbrus."
    },
    "fi": {
      "name": "Fanta (33 cl.)",
      "desc": "Poreileva ja raikas appelsiinivirvoitusjuoma."
    },
    "pl": {
      "name": "Fanta (33 cl.)",
      "desc": "Soczyście owocowy i orzeźwiający smak pomarańczy."
    },
    "ar": {
      "name": "فانتا (33 cl.)",
      "desc": "مشروب منعش وفوار بنكهة البرتقال اللذيذة."
    }
  },
  "Sprite (33 cl.)": {
    "tr": {
      "name": "Sprite (33 cl.)",
      "desc": "Limon ve misket limonu ferahlığı."
    },
    "en": {
      "name": "Sprite (33 cl.)",
      "desc": "Crisp lemon-lime sparkling refreshment."
    },
    "de": {
      "name": "Sprite (33 cl.)",
      "desc": "Spritzige Zitronen-Limetten-Erfrischung."
    },
    "ru": {
      "name": "Спрайт (33 cl.)",
      "desc": "Кристальная свежесть лимона и лайма."
    },
    "nl": {
      "name": "Sprite (33 cl.)",
      "desc": "Frisse citroen-limoen dorstlesser."
    },
    "sv": {
      "name": "Sprite (33 cl.)",
      "desc": "Krispig citron- och limefräschör."
    },
    "no": {
      "name": "Sprite (33 cl.)",
      "desc": "Krisp sitron- og limefriskhet."
    },
    "fi": {
      "name": "Sprite (33 cl.)",
      "desc": "Raikas sitruunan ja limetin yhdistelmä."
    },
    "pl": {
      "name": "Sprite (33 cl.)",
      "desc": "Krystalicznie orzeźwiający smak cytryny i limonki."
    },
    "ar": {
      "name": "سبرايت (33 cl.)",
      "desc": "انتعاش فوار بنكهة الليمون واللايم الصافية."
    }
  },
  "Fuse Tea (33 cl.)": {
    "tr": {
      "name": "Fuse Tea (33 cl.)",
      "desc": "Taze demlenmiş çay ve meyve aromalarının buz gibi buluşması."
    },
    "en": {
      "name": "Fuse Tea (33 cl.)",
      "desc": "Icy fusion of real brewed tea and luscious fruit extracts."
    },
    "de": {
      "name": "Fuse Tea (33 cl.)",
      "desc": "Eiskalte Fusion aus echtem Tee und fruchtigen Aromen."
    },
    "ru": {
      "name": "Фьюз Ти (33 cl.)",
      "desc": "Ледяное сочетание натурального чая и фруктовых экстрактов."
    },
    "nl": {
      "name": "Fuse Tea (33 cl.)",
      "desc": "IJskoude combinatie van thee en fruitige smaken."
    },
    "sv": {
      "name": "Fuse Tea (33 cl.)",
      "desc": "Iskall fusion av bryggt te och fruktiga smaker."
    },
    "no": {
      "name": "Fuse Tea (33 cl.)",
      "desc": "Iskald kombinasjon av brygget te og fruktige smaker."
    },
    "fi": {
      "name": "Fuse Tea (33 cl.)",
      "desc": "Jääkylmä yhdistelmä haudutettua teetä ja hedelmiä."
    },
    "pl": {
      "name": "Fuse Tea (33 cl.)",
      "desc": "Mrożone połączenie prawdziwej herbaty i soczystych owoców."
    },
    "ar": {
      "name": "فيوز تي (33 cl.)",
      "desc": "مزيج مثلج فاخر من الشاي الطبيعي ونكهات الفواكه المنعشة."
    }
  },
  "Tamek Meyve Suyu (25 cl.)": {
    "tr": {
      "name": "Tamek Meyve Suyu (25 cl.)",
      "desc": "Özenle seçilmiş taze meyvelerden lezzetli meyve suyu."
    },
    "en": {
      "name": "Tamek Fruit Juice (25 cl.)",
      "desc": "Delicious juice made from carefully selected fresh orchard fruits."
    },
    "de": {
      "name": "Tamek Fruchtsaft (25 cl.)",
      "desc": "Köstlicher Fruchtsaft aus sonnengereiften Früchten."
    },
    "ru": {
      "name": "Сок Тамек (25 cl.)",
      "desc": "Вкусный натуральный сок из отборных спелых фруктов."
    },
    "nl": {
      "name": "Tamek Vruchtensap (25 cl.)",
      "desc": "Heerlijk vruchtensap van zorgvuldig geselecteerd fruit."
    },
    "sv": {
      "name": "Tamek Fruktjuice (25 cl.)",
      "desc": "Läcker juice gjord på noggrant utvalda frukter."
    },
    "no": {
      "name": "Tamek Fruktjuice (25 cl.)",
      "desc": "Nydelig juice laget av nøye utvalgte frukter."
    },
    "fi": {
      "name": "Tamek Hedelmämehu (25 cl.)",
      "desc": "Herkullinen mehu huolella valituista hedelmistä."
    },
    "pl": {
      "name": "Sok Owocowy Tamek (25 cl.)",
      "desc": "Pyszny sok ze starannie wyselekcjonowanych świeżych owoców."
    },
    "ar": {
      "name": "عصير تاميك (25 cl.)",
      "desc": "عصير فواكه طبيعي لذيذ محضر من أجود الفواكه الطازجة."
    }
  },
  "Uludağ Limonata (33 cl.)": {
    "tr": {
      "name": "Uludağ Limonata (33 cl.)",
      "desc": "Geleneksel tarifle hazırlanan ferahlatıcı lezzet."
    },
    "en": {
      "name": "Uludağ Lemonade (33 cl.)",
      "desc": "Traditional heritage recipe crafted for supreme refreshment."
    },
    "de": {
      "name": "Uludağ Limonade (33 cl.)",
      "desc": "Traditionelles Rezept für erfrischenden Zitronengenuss."
    },
    "ru": {
      "name": "Улудаг Лимонад (33 cl.)",
      "desc": "Традиционный рецепт освежающего домашнего лимонада."
    },
    "nl": {
      "name": "Uludağ Limonade (33 cl.)",
      "desc": "Traditioneel recept voor ultieme verfrissing."
    },
    "sv": {
      "name": "Uludağ Lemonad (33 cl.)",
      "desc": "Traditionellt recept för optimal uppfriskning."
    },
    "no": {
      "name": "Uludağ Limonade (33 cl.)",
      "desc": "Tradisjonell oppskrift for optimal forfriskning."
    },
    "fi": {
      "name": "Uludağ Sitruunajuoma (33 cl.)",
      "desc": "Perinteinen resepti raikkaaseen nautintoon."
    },
    "pl": {
      "name": "Lemoniada Uludağ (33 cl.)",
      "desc": "Tradycyjna receptura zapewniająca głębokie orzeźwienie."
    },
    "ar": {
      "name": "ليموناضة أولوداغ (33 cl.)",
      "desc": "وصفة تقليدية فاخرة تمنحك أقصى درجات الانتعاش."
    }
  },
  "Iced Americano": {
    "tr": {
      "name": "Iced Americano",
      "desc": "Buz ve soğuk su ile harmanlanmış ferahlatıcı double espresso lezzeti."
    },
    "en": {
      "name": "Iced Americano",
      "desc": "Double shot rich espresso diluted over ice and chilled crystal water."
    },
    "de": {
      "name": "Iced Americano",
      "desc": "Doppelter Espresso über Eis und kaltem Wasser serviert."
    },
    "ru": {
      "name": "Айс Американо",
      "desc": "Двойной эспрессо с ледяной водой и кубиками льда."
    },
    "nl": {
      "name": "Iced Americano",
      "desc": "Dubbele espresso met ijs en koud water."
    },
    "sv": {
      "name": "Iced Americano",
      "desc": "Dubbel espresso serverad över is och kallt vatten."
    },
    "no": {
      "name": "Iskaffe Americano",
      "desc": "Dobbel espresso med is og kaldt vann."
    },
    "fi": {
      "name": "Jääamericano",
      "desc": "Tuplaespresso tarjoiltuna jäiden ja kylmän veden kera."
    },
    "pl": {
      "name": "Iced Americano",
      "desc": "Podwójne espresso na lodzie z zimną wodą."
    },
    "ar": {
      "name": "آيس أمريكانو",
      "desc": "دبل شوت إسبريسو غني مع الماء البارد ومكعبات الثلج."
    }
  },
  "Iced Latte": {
    "tr": {
      "name": "Iced Latte",
      "desc": "Buz, soğuk süt ve taze espresso uyumu."
    },
    "en": {
      "name": "Iced Latte",
      "desc": "Fresh espresso poured over cold silky milk and ice cubes."
    },
    "de": {
      "name": "Iced Latte",
      "desc": "Frischer Espresso auf kalter Vollmilch und Eiswürfeln."
    },
    "ru": {
      "name": "Айс Латте",
      "desc": "Эспрессо со свежим холодным молоком и кубиками льда."
    },
    "nl": {
      "name": "Iced Latte",
      "desc": "Verse espresso over koude melk en ijsblokjes."
    },
    "sv": {
      "name": "Iced Latte",
      "desc": "Färsk espresso över kall mjölk och is."
    },
    "no": {
      "name": "Iskaffe Latte",
      "desc": "Fersk espresso over kald melk og isbiter."
    },
    "fi": {
      "name": "Jäälatté",
      "desc": "Tuoretta espressoa kylmällä maidolla ja jäillä."
    },
    "pl": {
      "name": "Iced Latte",
      "desc": "Świeże espresso zalane zimnym mlekiem z lodem."
    },
    "ar": {
      "name": "آيس لاتيه",
      "desc": "إسبريسو طازج يسكب فوق الحليب البارد ومكعبات الثلج."
    }
  },
  "Iced Sütlü Americano": {
    "tr": {
      "name": "Iced Sütlü Americano",
      "desc": "Buz, soğuk su, double shot espresso ve hafif soğuk süt dokunuşu."
    },
    "en": {
      "name": "Iced Americano with Milk",
      "desc": "Chilled double espresso with cold water, ice and a splash of fresh milk."
    },
    "de": {
      "name": "Iced Americano mit Milch",
      "desc": "Doppelter Espresso über Eis und kaltem Wasser mit einem Schuss kalter Milch."
    },
    "ru": {
      "name": "Айс Американо с молоком",
      "desc": "Двойной эспрессо с ледяной водой и добавлением холодного молока."
    },
    "nl": {
      "name": "Iced Americano met Melk",
      "desc": "Iced Americano verrijkt met een scheutje koude melk."
    },
    "sv": {
      "name": "Iced Americano med Mjölk",
      "desc": "Dubbel espresso över is och kallt vatten med en skvätt kall mjölk."
    },
    "no": {
      "name": "Iskaffe Americano med Melk",
      "desc": "Dobbel espresso med is, kaldt vann og en dæsj kald melk."
    },
    "fi": {
      "name": "Jääamericano maidolla",
      "desc": "Jääamericano tilkalla kylmää maitoa."
    },
    "pl": {
      "name": "Iced Americano z Mlekiem",
      "desc": "Podwójne espresso na lodzie z zimną wodą i nutą mleka."
    },
    "ar": {
      "name": "آيس أمريكانو بالحليب",
      "desc": "دبل شوت إسبريسو مثلج مع لمسة من الحليب البارد المنعش."
    }
  },
  "Iced Latte Macchiato": {
    "tr": {
      "name": "Iced Latte Macchiato",
      "desc": "Buz, katmanlı soğuk süt ve üzerine dökülen taze espresso."
    },
    "en": {
      "name": "Iced Latte Macchiato",
      "desc": "Layered cold milk and rich espresso poured gently over ice."
    },
    "de": {
      "name": "Iced Latte Macchiato",
      "desc": "Geschichtete kalte Milch und Espresso auf Eis serviert."
    },
    "ru": {
      "name": "Айс Латте Макиато",
      "desc": "Слои холодного молока и свежего эспрессо со льдом."
    },
    "nl": {
      "name": "Iced Latte Macchiato",
      "desc": "Gelaagde koude melk en espresso over ijsblokjes."
    },
    "sv": {
      "name": "Iced Latte Macchiato",
      "desc": "Lager av kall mjölk och espresso serverad över is."
    },
    "no": {
      "name": "Iskaffe Latte Macchiato",
      "desc": "Lagvis kald melk og fersk espresso over isbiter."
    },
    "fi": {
      "name": "Jäälatté Macchiato",
      "desc": "Kerroksittain kylmää maitoa ja espressoa jäillä."
    },
    "pl": {
      "name": "Iced Latte Macchiato",
      "desc": "Warstwowe zimne mleko i aromatyczne espresso na lodzie."
    },
    "ar": {
      "name": "آيس لاتيه ماكياتو",
      "desc": "طبقات من الحليب البارد المنعش والإسبريسو المركز مع الثلج."
    }
  },
  "Iced Cappuccino": {
    "tr": {
      "name": "Iced Cappuccino",
      "desc": "Buz üzerinde espresso, soğuk süt ve kadifemsi soğuk süt köpüğü."
    },
    "en": {
      "name": "Iced Cappuccino",
      "desc": "Chilled espresso and milk over ice topped with dense cold froth."
    },
    "de": {
      "name": "Iced Cappuccino",
      "desc": "Espresso und kalte Milch auf Eis mit cremigem kaltem Milchschaum."
    },
    "ru": {
      "name": "Айс Капучино",
      "desc": "Эспрессо и холодное молоко со льдом под шапкой бархатистой пенки."
    },
    "nl": {
      "name": "Iced Cappuccino",
      "desc": "Espresso en koude melk over ijs met romig koud microschuim."
    },
    "sv": {
      "name": "Iced Cappuccino",
      "desc": "Espresso och kall mjölk över is toppad med tätt kallt skum."
    },
    "no": {
      "name": "Iskaffe Cappuccino",
      "desc": "Espresso og kald melk over is toppet med fløyelsmykt kaldt skum."
    },
    "fi": {
      "name": "Jääcappuccino",
      "desc": "Espressoa ja kylmää maitoa jäillä, päällä samettista kylmää vaahtoa."
    },
    "pl": {
      "name": "Iced Cappuccino",
      "desc": "Espresso z zimnym mlekiem na lodzie z gęstą pianką."
    },
    "ar": {
      "name": "آيس كابتشينو",
      "desc": "إسبريسو وحليب بارد على الثلج مع رغوة حليب مخملية كثيفة."
    }
  },
  "Iced Flat White": {
    "tr": {
      "name": "Iced Flat White",
      "desc": "Double shot espresso ve yoğun soğuk mikro süt dokusu."
    },
    "en": {
      "name": "Iced Flat White",
      "desc": "Bold double shot espresso blended with smooth cold micro-textured milk."
    },
    "de": {
      "name": "Iced Flat White",
      "desc": "Kräftiger doppelter Espresso mit samtig-kalter Mikromilch."
    },
    "ru": {
      "name": "Айс Флэт Уайт",
      "desc": "Двойной эспрессо с шелковистым холодным молоком и льдом."
    },
    "nl": {
      "name": "Iced Flat White",
      "desc": "Dubbele espresso met fluweelzachte koude melk over ijs."
    },
    "sv": {
      "name": "Iced Flat White",
      "desc": "Dubbel espresso kombinerad med silkeslen kall mjölk över is."
    },
    "no": {
      "name": "Iskaffe Flat White",
      "desc": "Dobbel espresso med fløyelsmyk kald melk over is."
    },
    "fi": {
      "name": "Jääflat White",
      "desc": "Tuplaespresso silkkisellä kylmällä maidolla jäiden päällä."
    },
    "pl": {
      "name": "Iced Flat White",
      "desc": "Podwójne espresso z gładkim zimnym mlekiem na lodzie."
    },
    "ar": {
      "name": "آيس فلات وايت",
      "desc": "دبل شوت إسبريسو غني ممزوج مع حليب ميكرو بارد وناعم."
    }
  },
  "Iced Espresso": {
    "tr": {
      "name": "Iced Espresso",
      "desc": "Buz ile servis edilen yoğun İtalyan espressosu. Single veya Double shot tercihiyle."
    },
    "en": {
      "name": "Iced Espresso",
      "desc": "Rich Italian espresso served over ice. Available in Single or Double shot."
    },
    "de": {
      "name": "Iced Espresso",
      "desc": "Kräftiger italienischer Espresso über Eis serviert. Single oder Double Shot."
    },
    "ru": {
      "name": "Айс Эспрессо",
      "desc": "Крепкий итальянский эспрессо со льдом. Одинарный или двойной шот."
    },
    "nl": {
      "name": "Iced Espresso",
      "desc": "Intense espresso geserveerd over ijs. Single of Double shot."
    },
    "sv": {
      "name": "Iced Espresso",
      "desc": "Fyllig italiensk espresso serverad över is. Enkel eller dubbel shot."
    },
    "no": {
      "name": "Iskaffe Espresso",
      "desc": "Fyldig italiensk espresso servert over is. Enkel eller dobbel shot."
    },
    "fi": {
      "name": "Jääespresso",
      "desc": "Täyteläinen espresso jäiden kera. Kerta- tai tupla-annos."
    },
    "pl": {
      "name": "Iced Espresso",
      "desc": "Wyraziste espresso serwowane na lodzie. Pojedynczy lub podwójny shot."
    },
    "ar": {
      "name": "آيس إسبريسو",
      "desc": "إسبريسو إيطالي مركز يقدم مع الثلج. خيار سينجل أو دبل شوت."
    }
  },
  "Cold Brew": {
    "tr": {
      "name": "Cold Brew",
      "desc": "16 saat soğuk demlenmiş özel harman."
    },
    "en": {
      "name": "Cold Brew Coffee",
      "desc": "Single origin artisan blend steeped cold for 16 hours."
    },
    "de": {
      "name": "Cold Brew Kaffee",
      "desc": "16 Stunden kalt extrahierter Spezialitätenkaffee."
    },
    "ru": {
      "name": "Колд Брю Кофе",
      "desc": "Холодное медленное заваривание в течение 16 часов."
    },
    "nl": {
      "name": "Cold Brew Koffie",
      "desc": "16 uur koud gezette specialty koffie."
    },
    "sv": {
      "name": "Cold Brew Kaffe",
      "desc": "16 timmars kallextraherat specialkaffe."
    },
    "no": {
      "name": "Cold Brew Kaffe",
      "desc": "16 timers kaldtrukket spesialkaffe."
    },
    "fi": {
      "name": "Kylmäuutettu Kahvi",
      "desc": "16 tuntia kylmäuutettu erikoiskahvi."
    },
    "pl": {
      "name": "Cold Brew Kawa",
      "desc": "Kawa parzona na zimno metodą maceracji przez 16 godzin."
    },
    "ar": {
      "name": "قهوة كولد برو المستخلصة",
      "desc": "قهوة مختصة مستخلصة ببطء على البارد لمدة 16 ساعة."
    }
  },
  "Berry Hibiscus Cooler": {
    "tr": {
      "name": "Berry Hibiscus Cooler",
      "desc": "Buzlu hibiscus çayı & orman meyveleri."
    },
    "en": {
      "name": "Berry Hibiscus Cooler",
      "desc": "Iced herbal hibiscus infusion with crushed wild berry juice."
    },
    "de": {
      "name": "Berry Hibiscus Cooler",
      "desc": "Eisgekühlter Hibiskustee mit fruchtigen Waldbeeren."
    },
    "ru": {
      "name": "Ягодный Гибискус Кулер",
      "desc": "Освежающий чай из гибискуса с лесными ягодами со льдом."
    },
    "nl": {
      "name": "Berry Hibiscus Cooler",
      "desc": "Ijsthee van hibiscus met wilde bosbessen."
    },
    "sv": {
      "name": "Berry Hibiscus Cooler",
      "desc": "Iste på hibiskus med vilda skogsbär."
    },
    "no": {
      "name": "Berry Hibiscus Cooler",
      "desc": "Iste med hibiskus og ville skogsbær."
    },
    "fi": {
      "name": "Berry Hibiscus Cooler",
      "desc": "Jäähibiskustee villimarjoilla."
    },
    "pl": {
      "name": "Berry Hibiscus Cooler",
      "desc": "Mrożona herbata z hibiskusa z leśnymi owocami."
    },
    "ar": {
      "name": "مبرد الكركديه والتوت",
      "desc": "شاي كركديه مثلج ومنعش مع خلاصة التوت البري."
    }
  },
  "Taze Portakal Suyu": {
    "tr": {
      "name": "Taze Portakal Suyu",
      "desc": "Sıkma günlük taze Alanya portakalı."
    },
    "en": {
      "name": "Fresh Orange Juice",
      "desc": "100% freshly squeezed sweet Mediterranean oranges."
    },
    "de": {
      "name": "Frischer Orangensaft",
      "desc": "Frisch gepresste süße mediterrane Orangen."
    },
    "ru": {
      "name": "Свежевыжатый Апельсиновый Сок",
      "desc": "Свежевыжатые сладкие средиземноморские апельсины."
    },
    "nl": {
      "name": "Verse Sinaasappelsap",
      "desc": "Vers geperste zoete sinaasappels."
    },
    "sv": {
      "name": "Färsk Apelsinjuice",
      "desc": "Nypressade söta medelhavsapelsiner."
    },
    "no": {
      "name": "Fersk Appelsinjuice",
      "desc": "Nypresset søt appelsinjuice."
    },
    "fi": {
      "name": "Tuore Appelsiinimehu",
      "desc": "Tuorepuristettua makeaa appelsiinimehua."
    },
    "pl": {
      "name": "Świeży Sok Pomarańczowy",
      "desc": "Świeżo wyciskany sok ze słodkich pomarańczy."
    },
    "ar": {
      "name": "عصير برتقال طبيعي طازج",
      "desc": "عصير برتقال طبيعي 100% معصور يومياً باليد."
    }
  },
  "Çay": {
    "tr": {
      "name": "Çay",
      "desc": "Taze demlenmiş geleneksel çay."
    },
    "en": {
      "name": "Turkish Black Tea",
      "desc": "Freshly brewed traditional aromatic Turkish black tea."
    },
    "de": {
      "name": "Türkischer Schwarztee",
      "desc": "Frisch aufgebrühter aromatischer Schwarztee."
    },
    "ru": {
      "name": "Турецкий Чай",
      "desc": "Свежезаваренный традиционный ароматный турецкий чай."
    },
    "nl": {
      "name": "Turkse Zwarte Thee",
      "desc": "Vers gezette traditionele Turkse thee."
    },
    "sv": {
      "name": "Turkiskt Svart Te",
      "desc": "Färskbryggt traditionellt turkiskt te."
    },
    "no": {
      "name": "Tyrkisk Svart Te",
      "desc": "Nytraktet tradisjonell tyrkisk te."
    },
    "fi": {
      "name": "Turkkilainen Tee",
      "desc": "Tuorehaudutettua perinteistä turkkilaista teetä."
    },
    "pl": {
      "name": "Herbata Turecka",
      "desc": "Świeżo parzona tradycyjna turecka czarna herbata."
    },
    "ar": {
      "name": "شاي تركي تقليدي",
      "desc": "شاي أسود تركي أصيل ومخمر طازجاً بنكهة غنية."
    }
  },
  "Büyük Çay": {
    "tr": {
      "name": "Büyük Çay",
      "desc": "Fincanda servis edilen taze demlenmiş geleneksel çay."
    },
    "en": {
      "name": "Large Turkish Tea (Cup)",
      "desc": "Freshly brewed traditional aromatic Turkish tea served in a large cup."
    },
    "de": {
      "name": "Großer Türkischer Tee (Tasse)",
      "desc": "Frisch aufgebrühter aromatischer Schwarztee in der großen Tasse serviert."
    },
    "ru": {
      "name": "Большой Турецкий Чай (Чашка)",
      "desc": "Свежезаваренный традиционный ароматный турецкий чай в большой чашке."
    },
    "nl": {
      "name": "Grote Turkse Thee (Kop)",
      "desc": "Vers gezette traditionele Turkse thee geserveerd in een grote kop."
    },
    "sv": {
      "name": "Stort Turkiskt Te (Kopp)",
      "desc": "Färskbryggt traditionellt turkiskt te serverat i en stor kopp."
    },
    "no": {
      "name": "Stor Tyrkisk Te (Kopp)",
      "desc": "Nytraktet tradisjonell tyrkisk te servert i en stor kopp."
    },
    "fi": {
      "name": "Iso Turkkilainen Tee (Kuppi)",
      "desc": "Tuorehaudutettua perinteistä turkkilaista teetä isossa kupissa."
    },
    "pl": {
      "name": "Duża Herbata Turecka (Kubek)",
      "desc": "Świeżo parzona tradycyjna turecka herbata podawana w dużym kubku."
    },
    "ar": {
      "name": "شاي تركي كبير (كوب)",
      "desc": "شاي أسود تركي مخمر طازجاً يقدم في كوب كبير بنكهة غنية."
    }
  },
  "Americano": {
    "tr": {
      "name": "Americano",
      "desc": "Sıcak su ve double shot taze espresso."
    },
    "en": {
      "name": "Americano",
      "desc": "Double shot espresso elongated with hot purified water."
    },
    "de": {
      "name": "Americano",
      "desc": "Doppelter Espresso mit heißem Wasser verlängert."
    },
    "ru": {
      "name": "Американо",
      "desc": "Двойной эспрессо с добавлением горячей воды."
    },
    "nl": {
      "name": "Americano",
      "desc": "Dubbele espresso aangelengd met heet water."
    },
    "sv": {
      "name": "Americano",
      "desc": "Dubbel espresso med hett vatten."
    },
    "no": {
      "name": "Americano",
      "desc": "Dobbel espresso med varmt vann."
    },
    "fi": {
      "name": "Americano",
      "desc": "Tuplaespresso kuumalla vedellä."
    },
    "pl": {
      "name": "Americano",
      "desc": "Podwójne espresso z dodatkiem gorącej wody."
    },
    "ar": {
      "name": "أمريكانو",
      "desc": "دبل شوت إسبريسو ممزوج بالماء الساخن."
    }
  },
  "Sütlü Americano": {
    "tr": {
      "name": "Sütlü Americano",
      "desc": "Hafifletilmiş espresso ve sıcak süt dokunuşu."
    },
    "en": {
      "name": "Americano with Milk",
      "desc": "Double shot espresso with hot water and a smooth touch of warm milk."
    },
    "de": {
      "name": "Americano mit Milch",
      "desc": "Espresso mit heißem Wasser und einem Schuss warmer Milch."
    },
    "ru": {
      "name": "Американо с Молоком",
      "desc": "Эспрессо с горячей водой и добавлением теплого молока."
    },
    "nl": {
      "name": "Americano met Melk",
      "desc": "Espresso met heet water en een scheutje warme melk."
    },
    "sv": {
      "name": "Americano med Mjölk",
      "desc": "Espresso med varmt vatten och en skvätt varm mjölk."
    },
    "no": {
      "name": "Americano med Melk",
      "desc": "Espresso med varmt vann og litt varm melk."
    },
    "fi": {
      "name": "Maitokahvi Americano",
      "desc": "Espresso kuumalla vedellä ja tilkalla lämmintä maitoa."
    },
    "pl": {
      "name": "Americano z Mlekiem",
      "desc": "Espresso z gorącą wodą i nutą ciepłego mleka."
    },
    "ar": {
      "name": "أمريكانو بالحليب",
      "desc": "أمريكانو كلاسيكي مع لمسة ناعمة من الحليب الدافئ."
    }
  },
  "Cappuccino": {
    "tr": {
      "name": "Cappuccino",
      "desc": "Espresso, sıcak süt ve ipeksi süt köpüğü."
    },
    "en": {
      "name": "Cappuccino",
      "desc": "Espresso topped with equal parts steamed milk and dense velvety froth."
    },
    "de": {
      "name": "Cappuccino",
      "desc": "Espresso mit cremig aufgeschäumter warmer Milch."
    },
    "ru": {
      "name": "Капучино",
      "desc": "Эспрессо с бархатистой густой молочной пенкой."
    },
    "nl": {
      "name": "Cappuccino",
      "desc": "Espresso met warme melk en een dikke laag microschuim."
    },
    "sv": {
      "name": "Cappuccino",
      "desc": "Espresso med varm mjölk och tätt sammetslent skum."
    },
    "no": {
      "name": "Cappuccino",
      "desc": "Espresso med varm melk og fløyelsmykt skum."
    },
    "fi": {
      "name": "Cappuccino",
      "desc": "Espressoa, kuumaa maitoa ja samettista vaahtoa."
    },
    "pl": {
      "name": "Cappuccino",
      "desc": "Espresso ze spienionym mlekiem i gęstą aksamitną pianką."
    },
    "ar": {
      "name": "كابتشينو",
      "desc": "إسبريسو مع الحليب المبخر ورغوة حليب كريمية كثيفة."
    }
  },
  "Flat White": {
    "tr": {
      "name": "Flat White",
      "desc": "Double shot espresso ve kadifemsi mikro süt köpüğü."
    },
    "en": {
      "name": "Flat White",
      "desc": "Double shot ristretto espresso combined with silky microfoam milk."
    },
    "de": {
      "name": "Flat White",
      "desc": "Doppelter Espresso mit samtigem Mikroschaum."
    },
    "ru": {
      "name": "Флэт Уайт",
      "desc": "Двойной эспрессо с шелковистой микропенкой молока."
    },
    "nl": {
      "name": "Flat White",
      "desc": "Dubbele espresso met zijdezacht microschuim."
    },
    "sv": {
      "name": "Flat White",
      "desc": "Dubbel espresso med lent mikroskum."
    },
    "no": {
      "name": "Flat White",
      "desc": "Dobbel espresso med fløyelsmykt mikroskum."
    },
    "fi": {
      "name": "Flat White",
      "desc": "Tuplaespresso ja samettinen mikromaitovaahto."
    },
    "pl": {
      "name": "Flat White",
      "desc": "Podwójne espresso z jedwabistą mikropianką."
    },
    "ar": {
      "name": "فلات وايت",
      "desc": "دبل شوت إسبريسو مع رغوة حليب ناعمة وحريرية."
    }
  },
  "Latte": {
    "tr": {
      "name": "Latte",
      "desc": "Yoğun espresso ve bol sıcak süt uyumu."
    },
    "en": {
      "name": "Caffè Latte",
      "desc": "Rich espresso blended with plenty of steamed velvety milk and light froth."
    },
    "de": {
      "name": "Caffè Latte",
      "desc": "Kräftiger Espresso mit viel heißer geschäumter Milch."
    },
    "ru": {
      "name": "Латте",
      "desc": "Мягкий эспрессо с большим количеством теплого молока."
    },
    "nl": {
      "name": "Caffè Latte",
      "desc": "Espresso met veel warme opgeschuimde melk."
    },
    "sv": {
      "name": "Caffè Latte",
      "desc": "Espresso med rikligt med varm skummad mjölk."
    },
    "no": {
      "name": "Caffè Latte",
      "desc": "Espresso med rikelig med varm melk og skum."
    },
    "fi": {
      "name": "Caffè Latte",
      "desc": "Espressoa ja runsaasti lämmintä vaahdotettua maitoa."
    },
    "pl": {
      "name": "Caffè Latte",
      "desc": "Espresso z dużą ilością ciepłego, spienionego mleka."
    },
    "ar": {
      "name": "كافيه لاتيه",
      "desc": "إسبريسو غني مع الحليب المبخر الدافئ وطبقة رغوة خفيفة."
    }
  },
  "Latte Macchiato": {
    "tr": {
      "name": "Latte Macchiato",
      "desc": "Katmanlı sıcak süt, süt köpüğü ve espresso."
    },
    "en": {
      "name": "Latte Macchiato",
      "desc": "Layered drink with steamed milk, cloud-like foam and espresso stain."
    },
    "de": {
      "name": "Latte Macchiato",
      "desc": "Drei Schichten aus heißer Milch, Espresso und feinem Milchschaum."
    },
    "ru": {
      "name": "Латте Макиато",
      "desc": "Трехслойный напиток из теплого молока, эспрессо и воздушной пены."
    },
    "nl": {
      "name": "Latte Macchiato",
      "desc": "Laagjes van warme melk, espresso en luchtig melkschuim."
    },
    "sv": {
      "name": "Latte Macchiato",
      "desc": "Skiktad dryck med varm mjölk, espresso och mjukt skum."
    },
    "no": {
      "name": "Latte Macchiato",
      "desc": "Lagvis varm melk, espresso og mykt melkeskum."
    },
    "fi": {
      "name": "Latte Macchiato",
      "desc": "Kerrostettu juoma kuumasta maidosta, espressosta ja vaahdosta."
    },
    "pl": {
      "name": "Latte Macchiato",
      "desc": "Trzywarstwowa kompozycja gorącego mleka, espresso i pianki."
    },
    "ar": {
      "name": "لاتيه ماكياتو",
      "desc": "مشروب ثلاثي الطبقات من الحليب الساخن، الإسبريسو ورغوة الحليب المخفوقة."
    }
  },
  "Türk Kahvesi": {
    "tr": {
      "name": "Türk Kahvesi",
      "desc": "Özel közde pişirilmiş geleneksel Türk kahvesi."
    },
    "en": {
      "name": "Traditional Turkish Coffee",
      "desc": "Finely ground Arabica coffee brewed slowly over hot sand embers."
    },
    "de": {
      "name": "Traditioneller Türkischer Kaffee",
      "desc": "Fein gemahlener Kaffee auf heißer Glut langsam zubereitet."
    },
    "ru": {
      "name": "Турецкий Кофе на Песке",
      "desc": "Традиционный ароматный кофе мелкого помола, сваренный на углях."
    },
    "nl": {
      "name": "Traditionele Turkse Koffie",
      "desc": "Fijngemalen koffie langzaam gebrouwen op hete kolen."
    },
    "sv": {
      "name": "Traditionellt Turkiskt Kaffe",
      "desc": "Finmalt kaffe långsamt bryggt på glödande sand."
    },
    "no": {
      "name": "Tradisjonell Tyrkisk Kaffe",
      "desc": "Finmalt kaffe langsomt brygget på glør."
    },
    "fi": {
      "name": "Perinteinen Turkkilainen Kahvi",
      "desc": "Hienojakoista kahvia hitaasti haudutettuna hiekalla."
    },
    "pl": {
      "name": "Tradycyjna Kawa po Turecku",
      "desc": "Drobno mielona kawa parzona powoli na gorącym piasku."
    },
    "ar": {
      "name": "قهوة تركية تقليدية على الرمل",
      "desc": "بن أرابيكا مطحون ناعماً ومحضر ببطء على الجمر والرمل الساخن."
    }
  },
  "Espresso": {
    "tr": {
      "name": "Espresso",
      "desc": "Yoğun İtalyan espressosu. Single veya Double shot tercihiyle."
    },
    "en": {
      "name": "Espresso",
      "desc": "Intense, aromatic Italian espresso. Available in Single or Double shot."
    },
    "de": {
      "name": "Espresso",
      "desc": "Kräftiger aromatischer italienischer Espresso. Als Single oder Double Shot erhältlich."
    },
    "ru": {
      "name": "Эспрессо",
      "desc": "Насыщенный итальянский эспрессо. На выбор: одинарный или двойной шот."
    },
    "nl": {
      "name": "Espresso",
      "desc": "Intense Italiaanse espresso. Keuze uit Single of Double shot."
    },
    "sv": {
      "name": "Espresso",
      "desc": "Fyllig italiensk espresso. Välj mellan enkel eller dubbel shot."
    },
    "no": {
      "name": "Espresso",
      "desc": "Fyldig italiensk espresso. Velg mellom enkel eller dobbel shot."
    },
    "fi": {
      "name": "Espresso",
      "desc": "Täyteläinen italialainen espresso. Valitse kerta- tai tupla-annos."
    },
    "pl": {
      "name": "Espresso",
      "desc": "Wyraziste włoskie espresso. Do wyboru pojedynczy lub podwójny shot."
    },
    "ar": {
      "name": "إسبريسو",
      "desc": "إسبريسو إيطالي مركز وغني مع خيار سينجل أو دبل شوت."
    }
  }
,
  "Caramel Latte": {
      "tr": {
          "name": "Caramel Latte",
          "desc": "Espresso, kadifemsi sıcak süt ve zengin karamel aromasının uyumu."
      },
      "en": {
          "name": "Caramel Latte",
          "desc": "Rich espresso blended with silky steamed milk and gourmet caramel flavor."
      },
      "de": {
          "name": "Karamell Latte",
          "desc": "Reicher Espresso mit samtiger heißer Milch und feinem Karamellaroma."
      },
      "ru": {
          "name": "Карамельный Латте",
          "desc": "Насыщенный эспрессо с бархатистым горячим молоком и карамельным вкусом."
      },
      "nl": {
          "name": "Caramel Latte",
          "desc": "Rijke espresso met fluweelzachte gestoomde melk en karamelsmaak."
      },
      "sv": {
          "name": "Karamell Latte",
          "desc": "Fyllig espresso med silkeslen varm mjölk och karamellsmak."
      },
      "no": {
          "name": "Karamell Latte",
          "desc": "Fyldig espresso med silkemyk varm melk og karamellsmak."
      },
      "fi": {
          "name": "Karamelli Latte",
          "desc": "Täyteläinen espresso silkkisellä kuumalla maidolla ja karamellilla."
      },
      "pl": {
          "name": "Caramel Latte",
          "desc": "Wyraziste espresso z aksamitnym gorącym mlekiem i nutą karmelu."
      },
      "ar": {
          "name": "كاراميل لاتيه",
          "desc": "إسبريسو غني ممزوج مع حليب مبخر مخملي ونكهة الكراميل الفاخرة."
      }
  },
  "Vanilla Latte": {
      "tr": {
          "name": "Vanilla Latte",
          "desc": "Espresso, sıcak süt ve doğal vanilya aroması."
      },
      "en": {
          "name": "Vanilla Latte",
          "desc": "Espresso and steamed milk infused with natural sweet Madagascar vanilla."
      },
      "de": {
          "name": "Vanille Latte",
          "desc": "Espresso und heiße Milch verfeinert mit natürlichem Vanillearoma."
      },
      "ru": {
          "name": "Ванильный Латте",
          "desc": "Эспрессо и теплое молоко с натуральным ароматом ванили."
      },
      "nl": {
          "name": "Vanille Latte",
          "desc": "Espresso en warme melk verrijkt met natuurlijk vanille-aroma."
      },
      "sv": {
          "name": "Vanilj Latte",
          "desc": "Espresso och varm mjölk med naturlig vaniljsmak."
      },
      "no": {
          "name": "Vanilje Latte",
          "desc": "Espresso og varm melk med naturlig vaniljesmak."
      },
      "fi": {
          "name": "Vanilja Latte",
          "desc": "Espresso ja kuuma maito luonnollisella vanilja-aromilla."
      },
      "pl": {
          "name": "Waniliowe Latte",
          "desc": "Espresso i gorące mleko z dodatkiem naturalnego aromatu wanilii."
      },
      "ar": {
          "name": "فانيلا لاتيه",
          "desc": "إسبريسو وحليب ساخن بنكهة الفانيليا الطبيعية الساحرة."
      }
  },
  "Mocha": {
      "tr": {
          "name": "Mocha",
          "desc": "Yoğun espresso, sıcak süt ve enfes Belçika çikolatası lezzeti."
      },
      "en": {
          "name": "Caffè Mocha",
          "desc": "Espresso combined with rich Belgian chocolate and steamed velvety milk."
      },
      "de": {
          "name": "Caffè Mocha",
          "desc": "Espresso mit feinster belgischer Schokolade und samtiger Milch."
      },
      "ru": {
          "name": "Мокка",
          "desc": "Эспрессо с изысканным бельгийским шоколадом и нежным молоком."
      },
      "nl": {
          "name": "Caffè Mocha",
          "desc": "Espresso gecombineerd met rijke Belgische chocolade en gestoomde melk."
      },
      "sv": {
          "name": "Caffè Mocha",
          "desc": "Espresso med fyllig belgisk choklad och ångad mjölk."
      },
      "no": {
          "name": "Caffè Mocha",
          "desc": "Espresso med fyldig belgisk sjokolade og dampet melk."
      },
      "fi": {
          "name": "Caffè Mocha",
          "desc": "Espressoa belgialaisella suklaalla ja kuumalla vaahdotetulla maidolla."
      },
      "pl": {
          "name": "Caffè Mocha",
          "desc": "Espresso z wyśmienitą belgijską czekoladą i spienionym mlekiem."
      },
      "ar": {
          "name": "كافيه موكا",
          "desc": "إسبريسو غني ممزوج مع شوكولاتة بلجيكية فاخرة وحليب ساخن مخملي."
      }
  },
  "White Chocolate Mocha": {
      "tr": {
          "name": "White Chocolate Mocha",
          "desc": "Espresso, kremsi sıcak süt ve zengin beyaz Belçika çikolatası."
      },
      "en": {
          "name": "White Chocolate Mocha",
          "desc": "Espresso blended with creamy white Belgian chocolate and steamed milk."
      },
      "de": {
          "name": "Weiße Schokolade Mocha",
          "desc": "Espresso mit weißer belgischer Schokolade und cremiger Milch."
      },
      "ru": {
          "name": "Белый Шоколадный Мокка",
          "desc": "Эспрессо с нежным белым бельгийским шоколадом и горячим молоком."
      },
      "nl": {
          "name": "Witte Chocolade Mocha",
          "desc": "Espresso met romige witte Belgische chocolade en warme melk."
      },
      "sv": {
          "name": "Vit Choklad Mocha",
          "desc": "Espresso med krämig vit belgisk choklad och varm mjölk."
      },
      "no": {
          "name": "Hvit Sjokolade Mocha",
          "desc": "Espresso med kremet hvit belgisk sjokolade og varm melk."
      },
      "fi": {
          "name": "Valkosuklaa Mocha",
          "desc": "Espressoa kermaisella valkoisella suklaalla ja maidolla."
      },
      "pl": {
          "name": "Biała Czekolada Mocha",
          "desc": "Espresso z kremową białą belgijską czekoladą i gorącym mlekiem."
      },
      "ar": {
          "name": "وايت تشوكليت موكا",
          "desc": "إسبريسو مع شوكولاتة بلجيكية بيضاء كريمية وحليب ساخن."
      }
  },
  "Caramel Vanilla Latte": {
      "tr": {
          "name": "Caramel Vanilla Latte",
          "desc": "Karamel ve vanilyanın dengeli buluşması, espresso ve kadifemsi sıcak süt."
      },
      "en": {
          "name": "Caramel Vanilla Latte",
          "desc": "Harmonious blend of rich caramel and fragrant vanilla with espresso and steamed milk."
      },
      "de": {
          "name": "Karamell Vanille Latte",
          "desc": "Harmonische Komposition aus Karamell, Vanille, Espresso und Milch."
      },
      "ru": {
          "name": "Карамельно-Ванильный Латте",
          "desc": "Гармония карамели и ванили с эспрессо и бархатным молоком."
      },
      "nl": {
          "name": "Caramel Vanille Latte",
          "desc": "Harmonieuze mix van karamel en vanille met espresso en warme melk."
      },
      "sv": {
          "name": "Karamell Vanilj Latte",
          "desc": "Harmonisk blandning av karamell och vanilj med espresso och mjölk."
      },
      "no": {
          "name": "Karamell Vanilje Latte",
          "desc": "Harmonisk blanding av karamell og vanilje med espresso og melk."
      },
      "fi": {
          "name": "Karamelli-Vanilja Latte",
          "desc": "Karamellin ja vaniljan tasapainoinen liitto espressolla ja maidolla."
      },
      "pl": {
          "name": "Karmelowo-Waniliowe Latte",
          "desc": "Zbalansowane połączenie karmelu i wanilii z espresso i mlekiem."
      },
      "ar": {
          "name": "كاراميل فانيلا لاتيه",
          "desc": "مزيج متوازن ومتناغم من الكراميل والفانيليا مع الإسبريسو والحليب المخملي."
      }
  },
  "Caramel Mocha": {
      "tr": {
          "name": "Caramel Mocha",
          "desc": "Karamel ve çikolata lezzetinin espresso ve sıcak sütle buluşması."
      },
      "en": {
          "name": "Caramel Mocha",
          "desc": "Indulgent fusion of buttery caramel and rich chocolate with espresso and milk."
      },
      "de": {
          "name": "Karamell Mocha",
          "desc": "Verführerische Fusion aus Karamell, Schokolade, Espresso und heißer Milch."
      },
      "ru": {
          "name": "Карамельный Мокка",
          "desc": "Сочетание карамели и шоколада с насыщенным эспрессо и молоком."
      },
      "nl": {
          "name": "Caramel Mocha",
          "desc": "Heerlijke fusie van karamel en chocolade met espresso en melk."
      },
      "sv": {
          "name": "Karamell Mocha",
          "desc": "Läckert möte mellan karamell, choklad, espresso och varm mjölk."
      },
      "no": {
          "name": "Karamell Mocha",
          "desc": "Nydelig møte mellom karamell, sjokolade, espresso og varm melk."
      },
      "fi": {
          "name": "Karamelli Mocha",
          "desc": "Karamellin ja suklaan täyteläinen yhdistelmä espressolla."
      },
      "pl": {
          "name": "Karmelowa Mocha",
          "desc": "Połączenie karmelu i wykwintnej czekolady z espresso i gorącym mlekiem."
      },
      "ar": {
          "name": "كاراميل موكا",
          "desc": "توليفة ساحرة تجمع بين الكراميل والشوكولاتة مع الإسبريسو والحليب الساخن."
      }
  },
  "Caramel White Mocha": {
      "tr": {
          "name": "Caramel White Mocha",
          "desc": "Karamel ve beyaz Belçika çikolatasının kremsi espresso uyumu."
      },
      "en": {
          "name": "Caramel White Mocha",
          "desc": "Silky caramel swirl and white Belgian chocolate melted into fresh espresso and milk."
      },
      "de": {
          "name": "Karamell Weiße Mocha",
          "desc": "Karamell und weiße Schokolade kombiniert mit cremigem Espresso."
      },
      "ru": {
          "name": "Карамельно-Белый Мокка",
          "desc": "Карамель и белый бельгийский шоколад в кремовом эспрессо."
      },
      "nl": {
          "name": "Caramel Witte Mocha",
          "desc": "Karamel en witte chocolade gecombineerd met romige espresso en melk."
      },
      "sv": {
          "name": "Karamell Vit Mocha",
          "desc": "Karamell och vit choklad i perfekt harmoni med krämig espresso."
      },
      "no": {
          "name": "Karamell Hvit Mocha",
          "desc": "Karamell og hvit sjokolade i perfekt harmoni med kremet espresso."
      },
      "fi": {
          "name": "Karamelli Valkoinen Mocha",
          "desc": "Karamelli ja valkosuklaa täyteläisellä espressolla."
      },
      "pl": {
          "name": "Karmelowa Biała Mocha",
          "desc": "Karmel i biała czekolada w aksamitnym połączeniu z espresso."
      },
      "ar": {
          "name": "كاراميل وايت موكا",
          "desc": "مزيج الكراميل والشوكولاتة البيضاء مع الإسبريسو والحليب الكريمي."
      }
  },
  "Vanilla Mocha": {
      "tr": {
          "name": "Vanilla Mocha",
          "desc": "Doğal vanilya ve zengin çikolatanın espresso ve sıcak sütle dansı."
      },
      "en": {
          "name": "Vanilla Mocha",
          "desc": "Sweet aromatic vanilla paired with rich chocolate, fresh espresso and steamed milk."
      },
      "de": {
          "name": "Vanille Mocha",
          "desc": "Süße Vanille und edle Schokolade mit frischem Espresso und Milch."
      },
      "ru": {
          "name": "Ванильный Мокка",
          "desc": "Нежная ваниль и богатый шоколад с горячим молоком и эспрессо."
      },
      "nl": {
          "name": "Vanille Mocha",
          "desc": "Zoete vanille en rijke chocolade met verse espresso en melk."
      },
      "sv": {
          "name": "Vanilj Mocha",
          "desc": "Söt vanilj och fyllig choklad med färsk espresso och mjölk."
      },
      "no": {
          "name": "Vanilje Mocha",
          "desc": "Søt vanilje og fyldig sjokolade med fersk espresso og melk."
      },
      "fi": {
          "name": "Vanilja Mocha",
          "desc": "Makea vanilja ja runsas suklaa espressolla ja kuumalla maidolla."
      },
      "pl": {
          "name": "Waniliowa Mocha",
          "desc": "Wanilia i intensywna czekolada połączone ze świeżym espresso i mlekiem."
      },
      "ar": {
          "name": "فانيلا موكا",
          "desc": "تناغم الفانيليا الحلوة والشوكولاتة الداكنة مع الإسبريسو والحليب."
      }
  },
  "Vanilla White Mocha": {
      "tr": {
          "name": "Vanilla White Mocha",
          "desc": "Vanilya ve beyaz çikolatanın ipeksi sıcak süt ve espresso ile uyumu."
      },
      "en": {
          "name": "Vanilla White Mocha",
          "desc": "Velvety vanilla and white chocolate sauce layered with espresso and hot milk."
      },
      "de": {
          "name": "Vanille Weiße Mocha",
          "desc": "Samtige Vanille und weiße Schokolade mit Espresso und heißer Milch."
      },
      "ru": {
          "name": "Ванильно-Белый Мокка",
          "desc": "Бархатная ваниль и белый шоколад с эспрессо и молоком."
      },
      "nl": {
          "name": "Vanille Witte Mocha",
          "desc": "Fluweelzachte vanille en witte chocolade met espresso en warme melk."
      },
      "sv": {
          "name": "Vanilj Vit Mocha",
          "desc": "Silkeslen vanilj och vit choklad med espresso och varm mjölk."
      },
      "no": {
          "name": "Vanilje Hvit Mocha",
          "desc": "Silkemyk vanilje og hvit sjokolade med espresso og varm melk."
      },
      "fi": {
          "name": "Vanilja Valkoinen Mocha",
          "desc": "Samettinen vanilja ja valkosuklaa espressolla ja maidolla."
      },
      "pl": {
          "name": "Waniliowa Biała Mocha",
          "desc": "Aksamitna wanilia i biała czekolada z espresso i gorącym mlekiem."
      },
      "ar": {
          "name": "فانيلا وايت موكا",
          "desc": "مزيج مخملي من الفانيليا والشوكولاتة البيضاء مع الإسبريسو والحليب الساخن."
      }
  },
  "Zebra Mocha": {
      "tr": {
          "name": "Zebra Mocha",
          "desc": "Sütlü çikolata ve beyaz çikolatanın espressoyla dengelendiği ikonik ikili."
      },
      "en": {
          "name": "Zebra Mocha",
          "desc": "The iconic Tuxedo blend of rich milk chocolate and creamy white chocolate with espresso."
      },
      "de": {
          "name": "Zebra Mocha",
          "desc": "Die ikonische Mischung aus Milchschokolade und weißer Schokolade mit Espresso."
      },
      "ru": {
          "name": "Зебра Мокка",
          "desc": "Иконический дуэт темного и белого бельгийского шоколада с эспрессо."
      },
      "nl": {
          "name": "Zebra Mocha",
          "desc": "De iconische combinatie van melkchocolade en witte chocolade met espresso."
      },
      "sv": {
          "name": "Zebra Mocha",
          "desc": "Den ikoniska blandningen av mjölkchoklad och vit choklad med espresso."
      },
      "no": {
          "name": "Zebra Mocha",
          "desc": "Den ikoniske blandingen av melkesjokolade og hvit sjokolade med espresso."
      },
      "fi": {
          "name": "Zebra Mocha",
          "desc": "Maitosuklaan ja valkosuklaan ikoninen yhdistelmä espressolla."
      },
      "pl": {
          "name": "Zebra Mocha",
          "desc": "Kultowe połączenie czekolady mlecznej i białej z wyrazistym espresso."
      },
      "ar": {
          "name": "زيبرا موكا",
          "desc": "المزيج الأيقوني بين الشوكولاتة بالحليب والشوكولاتة البيضاء مع الإسبريسو."
      }
  },
  "Caramel Vanilla Mocha": {
      "tr": {
          "name": "Caramel Vanilla Mocha",
          "desc": "Karamel, vanilya ve çikolatanın yoğun espresso ve sıcak sütle üçlü senfonisi."
      },
      "en": {
          "name": "Caramel Vanilla Mocha",
          "desc": "Triple symphony of caramel, vanilla and rich chocolate blended with espresso."
      },
      "de": {
          "name": "Karamell Vanille Mocha",
          "desc": "Dreifache Sinfonie aus Karamell, Vanille und Schokolade mit Espresso."
      },
      "ru": {
          "name": "Карамельно-Ванильный Мокка",
          "desc": "Трио карамели, ванили и шоколада с насыщенным эспрессо."
      },
      "nl": {
          "name": "Caramel Vanille Mocha",
          "desc": "Drievoudige symfonie van karamel, vanille en chocolade met espresso."
      },
      "sv": {
          "name": "Karamell Vanilj Mocha",
          "desc": "Trippelsymfoni av karamell, vanilj och choklad med espresso."
      },
      "no": {
          "name": "Karamell Vanilje Mocha",
          "desc": "Trippelsymfoni av karamell, vanilje og sjokolade med espresso."
      },
      "fi": {
          "name": "Karamelli-Vanilja Mocha",
          "desc": "Karamellin, vaniljan ja suklaan kolmoissinfonia espressolla."
      },
      "pl": {
          "name": "Karmelowo-Waniliowa Mocha",
          "desc": "Potrójna symfonia karmelu, wanilii i czekolady z espresso."
      },
      "ar": {
          "name": "كاراميل فانيلا موكا",
          "desc": "سمفونية ثلاثية ساحرة من الكراميل والفانيليا والشوكولاتة مع الإسبريسو."
      }
  },
  "Caramel Vanilla White Mocha": {
      "tr": {
          "name": "Caramel Vanilla White Mocha",
          "desc": "Karamel, vanilya ve beyaz çikolatanın kremsi espresso ile mükemmel dengesi."
      },
      "en": {
          "name": "Caramel Vanilla White Mocha",
          "desc": "Sweet caramel, vanilla and velvety white chocolate balanced with fresh espresso."
      },
      "de": {
          "name": "Karamell Vanille Weiße Mocha",
          "desc": "Karamell, Vanille und weiße Schokolade in perfekter Balance mit Espresso."
      },
      "ru": {
          "name": "Карамельно-Ванильно-Белый Мокка",
          "desc": "Карамель, ваниль и белый шоколад в идеальном балансе с эспрессо."
      },
      "nl": {
          "name": "Caramel Vanille Witte Mocha",
          "desc": "Karamel, vanille en witte chocolade in perfecte balans met espresso."
      },
      "sv": {
          "name": "Karamell Vanilj Vit Mocha",
          "desc": "Karamell, vanilj och vit choklad i perfekt balans med espresso."
      },
      "no": {
          "name": "Karamell Vanilje Hvit Mocha",
          "desc": "Karamell, vanilje og hvit sjokolade i perfekt balanse med espresso."
      },
      "fi": {
          "name": "Karamelli-Vanilja Valkoinen Mocha",
          "desc": "Karamelli, vanilja ja valkosuklaa täydellisessä tasapainossa."
      },
      "pl": {
          "name": "Karmelowo-Waniliowa Biała Mocha",
          "desc": "Karmel, wanilia i biała czekolada w doskonałej harmonii z espresso."
      },
      "ar": {
          "name": "كاراميل فانيلا وايت موكا",
          "desc": "توازن مثالي بين الكراميل والفانيليا والشوكولاتة البيضاء مع الإسبريسو."
      }
  },
  "Triple Caramel Mocha": {
      "tr": {
          "name": "Triple Caramel Mocha",
          "desc": "Karamel, sütlü çikolata ve beyaz çikolatanın zengin espresso buluşması."
      },
      "en": {
          "name": "Triple Caramel Mocha",
          "desc": "Double chocolate meets decadent caramel and bold espresso for maximum indulgence."
      },
      "de": {
          "name": "Triple Karamell Mocha",
          "desc": "Doppelte Schokolade trifft auf feines Karamell und kräftigen Espresso."
      },
      "ru": {
          "name": "Трипл Карамельный Мокка",
          "desc": "Двойной шоколад и тягучая карамель в сочетании с крепким эспрессо."
      },
      "nl": {
          "name": "Triple Caramel Mocha",
          "desc": "Dubbele chocolade ontmoet karamel en espresso voor ultiem genot."
      },
      "sv": {
          "name": "Triple Karamell Mocha",
          "desc": "Dubbel choklad möter karamell och fyllig espresso för maximal njutning."
      },
      "no": {
          "name": "Triple Karamell Mocha",
          "desc": "Dobbel sjokolade møter karamell og fyldig espresso for maksimal nytelse."
      },
      "fi": {
          "name": "Triple Karamelli Mocha",
          "desc": "Tuplasuklaa kohtaa ylellisen karamellin ja vahvan espresson."
      },
      "pl": {
          "name": "Triple Caramel Mocha",
          "desc": "Podwójna czekolada i karmel w połączeniu z mocnym espresso."
      },
      "ar": {
          "name": "تريبل كاراميل موكا",
          "desc": "شوكولاتة مزدوجة مع كراميل غني وإسبريسو مركز لأقصى درجات اللذة."
      }
  },
  "Vanilla Zebra Mocha": {
      "tr": {
          "name": "Vanilla Zebra Mocha",
          "desc": "Vanilya, sütlü çikolata ve beyaz çikolatanın kadifemsi espresso lezzeti."
      },
      "en": {
          "name": "Vanilla Zebra Mocha",
          "desc": "Tuxedo chocolate duo infused with fragrant vanilla and espresso."
      },
      "de": {
          "name": "Vanille Zebra Mocha",
          "desc": "Zweierlei Schokolade verfeinert mit Vanille und Espresso."
      },
      "ru": {
          "name": "Ванильная Зебра Мокка",
          "desc": "Дуэт молочного и белого шоколада с нежной ванилью и эспрессо."
      },
      "nl": {
          "name": "Vanille Zebra Mocha",
          "desc": "Duo van melk- en witte chocolade verrijkt met vanille en espresso."
      },
      "sv": {
          "name": "Vanilj Zebra Mocha",
          "desc": "Chokladduo förfinad med doftande vanilj och espresso."
      },
      "no": {
          "name": "Vanilje Zebra Mocha",
          "desc": "Sjokoladeduo forfinet med velduftende vanilje og espresso."
      },
      "fi": {
          "name": "Vanilja Zebra Mocha",
          "desc": "Suklaaduo höystettynä tuoksuvalla vaniljalla ja espressolla."
      },
      "pl": {
          "name": "Waniliowa Zebra Mocha",
          "desc": "Duet czekolad ze szczyptą wanilii i wyrazistym espresso."
      },
      "ar": {
          "name": "فانيلا زيبرا موكا",
          "desc": "ثنائي الشوكولاتة الشهير معزز بنكهة الفانيليا الرائعة والإسبريسو."
      }
  },
  "NOA Signature Latte": {
      "tr": {
          "name": "NOA Signature Latte",
          "desc": "Karamel, vanilya, çikolata ve beyaz çikolatanın özel oranlarla hazırlandığı imza latte."
      },
      "en": {
          "name": "NOA Signature Latte",
          "desc": "The ultimate signature masterwork blending caramel, vanilla, dark & white chocolate."
      },
      "de": {
          "name": "NOA Signature Latte",
          "desc": "Das Meisterwerk aus Karamell, Vanille, dunkler und weißer Schokolade mit Espresso."
      },
      "ru": {
          "name": "NOA Фирменный Латте",
          "desc": "Фирменный шедевр из карамели, ванили, темного и белого шоколада с эспрессо."
      },
      "nl": {
          "name": "NOA Signature Latte",
          "desc": "Het ultieme meesterwerk van karamel, vanille, donkere en witte chocolade met espresso."
      },
      "sv": {
          "name": "NOA Signatur Latte",
          "desc": "Det ultimata signaturmästerverket med karamell, vanilj, mörk och vit choklad."
      },
      "no": {
          "name": "NOA Signatur Latte",
          "desc": "Det ultimate signaturmesterverket med karamell, vanilje, mørk og hvit sjokolade."
      },
      "fi": {
          "name": "NOA Nimikkolatte",
          "desc": "Täydellinen nimikkomestarijuoma karamellilla, vaniljalla ja kahdella suklaalla."
      },
      "pl": {
          "name": "NOA Signature Latte",
          "desc": "Autorskie arcydzieło łączące karmel, wanilię, ciemną i białą czekoladę z espresso."
      },
      "ar": {
          "name": "نوا سيجنتشر لاتيه",
          "desc": "التحفة الخاصة المميزة التي تجمع بين الكراميل والفانيليا والشوكولاتة الداكنة والبيضاء مع الإسبريسو."
      }
  },
  "Iced Caramel Latte": {
      "tr": {
          "name": "Iced Caramel Latte",
          "desc": "Buz, soğuk taze süt, espresso ve zengin karamel aroması."
      },
      "en": {
          "name": "Iced Caramel Latte",
          "desc": "Chilled milk and bold espresso poured over ice with rich gourmet caramel."
      },
      "de": {
          "name": "Iced Karamell Latte",
          "desc": "Kühle Milch und kräftiger Espresso auf Eis mit feinstem Karamell."
      },
      "ru": {
          "name": "Айс Карамельный Латте",
          "desc": "Холодное молоко и эспрессо со льдом и карамельным сиропом."
      },
      "nl": {
          "name": "Iced Caramel Latte",
          "desc": "Gekoelde melk en espresso over ijs met rijke karamel."
      },
      "sv": {
          "name": "Iced Karamell Latte",
          "desc": "Kall mjölk och fyllig espresso över is med rik karamell."
      },
      "no": {
          "name": "Iskaffe Karamell Latte",
          "desc": "Kald melk og fyldig espresso over is med rik karamell."
      },
      "fi": {
          "name": "Jääkaramelli Latte",
          "desc": "Kylmää maitoa ja espressoa jäillä herkullisella karamellilla."
      },
      "pl": {
          "name": "Iced Caramel Latte",
          "desc": "Schłodzone mleko i wyraziste espresso na lodzie z sosem karmelowym."
      },
      "ar": {
          "name": "آيس كاراميل لاتيه",
          "desc": "حليب مثلج وإسبريسو منعش يقدم فوق الثلج مع صوص الكراميل اللذيذ."
      }
  },
  "Iced Vanilla Latte": {
      "tr": {
          "name": "Iced Vanilla Latte",
          "desc": "Buz, soğuk süt, espresso ve doğal vanilya aroması."
      },
      "en": {
          "name": "Iced Vanilla Latte",
          "desc": "Cold fresh milk and espresso served over ice with natural vanilla."
      },
      "de": {
          "name": "Iced Vanille Latte",
          "desc": "Kalte Milch und Espresso auf Eis mit natürlichem Vanillearoma."
      },
      "ru": {
          "name": "Айс Ванильный Латте",
          "desc": "Холодное молоко и эспрессо со льдом и натуральной ванилью."
      },
      "nl": {
          "name": "Iced Vanille Latte",
          "desc": "Koude melk en espresso geserveerd over ijs met vanille."
      },
      "sv": {
          "name": "Iced Vanilj Latte",
          "desc": "Kall mjölk och espresso serverad över is med naturlig vanilj."
      },
      "no": {
          "name": "Iskaffe Vanilje Latte",
          "desc": "Kald melk og espresso servert over is med naturlig vanilje."
      },
      "fi": {
          "name": "Jäävanilja Latte",
          "desc": "Kylmää maitoa ja espressoa jäillä luonnollisella vaniljalla."
      },
      "pl": {
          "name": "Iced Waniliowe Latte",
          "desc": "Zimne mleko i espresso serwowane na lodzie z naturalną wanilią."
      },
      "ar": {
          "name": "آيس فانيلا لاتيه",
          "desc": "حليب بارد وإسبريسو منعش فوق مكعبات الثلج مع نكهة الفانيليا."
      }
  },
  "Iced Mocha": {
      "tr": {
          "name": "Iced Mocha",
          "desc": "Buz, soğuk süt, espresso ve enfes çikolata sosu."
      },
      "en": {
          "name": "Iced Mocha",
          "desc": "Espresso blended with chilled milk and Belgian chocolate syrup over ice."
      },
      "de": {
          "name": "Iced Mocha",
          "desc": "Espresso mit kalter Milch und Schokoladensirup über Eis serviert."
      },
      "ru": {
          "name": "Айс Мокка",
          "desc": "Эспрессо с холодным молоком и бельгийским шоколадным соусом со льдом."
      },
      "nl": {
          "name": "Iced Mocha",
          "desc": "Espresso gemengd met koude melk en chocoladesaus over ijs."
      },
      "sv": {
          "name": "Iced Mocha",
          "desc": "Espresso blandad med kall mjölk och chokladsås över is."
      },
      "no": {
          "name": "Iskaffe Mocha",
          "desc": "Espresso blandet med kald melk og sjokoladesaus over is."
      },
      "fi": {
          "name": "Jäämocha",
          "desc": "Espressoa sekoitettuna kylmään maitoon ja suklaakastikkeeseen jäillä."
      },
      "pl": {
          "name": "Iced Mocha",
          "desc": "Espresso z zimnym mlekiem i belgijskim sosem czekoladowym na lodzie."
      },
      "ar": {
          "name": "آيس موكا",
          "desc": "إسبريسو ممزوج مع حليب بارد وصوص الشوكولاتة البلجيكية فوق الثلج."
      }
  },
  "Iced White Chocolate Mocha": {
      "tr": {
          "name": "Iced White Chocolate Mocha",
          "desc": "Buz, soğuk süt, espresso ve beyaz Belçika çikolatası lezzeti."
      },
      "en": {
          "name": "Iced White Chocolate Mocha",
          "desc": "Creamy white chocolate sauce, chilled milk and espresso poured over ice."
      },
      "de": {
          "name": "Iced Weiße Schokolade Mocha",
          "desc": "Cremige weiße Schokolade, kalte Milch und Espresso auf Eis."
      },
      "ru": {
          "name": "Айс Белый Шоколадный Мокка",
          "desc": "Белый шоколадный соус, холодное молоко и эспрессо со льдом."
      },
      "nl": {
          "name": "Iced Witte Chocolade Mocha",
          "desc": "Romige witte chocoladesaus, koude melk en espresso over ijs."
      },
      "sv": {
          "name": "Iced Vit Choklad Mocha",
          "desc": "Krämig vit chokladsås, kall mjölk och espresso över is."
      },
      "no": {
          "name": "Iskaffe Hvit Sjokolade Mocha",
          "desc": "Kremet hvit sjokoladesaus, kald melk og espresso over is."
      },
      "fi": {
          "name": "Jäävalkosuklaa Mocha",
          "desc": "Kermaista valkosuklaakastiketta, kylmää maitoa ja espressoa jäillä."
      },
      "pl": {
          "name": "Iced Biała Czekolada Mocha",
          "desc": "Sos z białej czekolady, zimne mleko i espresso na lodzie."
      },
      "ar": {
          "name": "آيس وايت تشوكليت موكا",
          "desc": "صوص الشوكولاتة البيضاء الكريمية مع حليب بارد وإسبريسو فوق الثلج."
      }
  },
  "Iced Caramel Vanilla Latte": {
      "tr": {
          "name": "Iced Caramel Vanilla Latte",
          "desc": "Buz üzerinde karamel ve vanilya aromalı soğuk süt ve espresso."
      },
      "en": {
          "name": "Iced Caramel Vanilla Latte",
          "desc": "Caramel and sweet vanilla swirled with chilled milk and fresh espresso over ice."
      },
      "de": {
          "name": "Iced Karamell Vanille Latte",
          "desc": "Karamell und Vanille mit kalter Milch und frischem Espresso auf Eis."
      },
      "ru": {
          "name": "Айс Карамельно-Ванильный Латте",
          "desc": "Карамель и ваниль с холодным молоком и эспрессо со льдом."
      },
      "nl": {
          "name": "Iced Caramel Vanille Latte",
          "desc": "Karamel en vanille met gekoelde melk en espresso over ijs."
      },
      "sv": {
          "name": "Iced Karamell Vanilj Latte",
          "desc": "Karamell och vanilj med kall mjölk och espresso över is."
      },
      "no": {
          "name": "Iskaffe Karamell Vanilje Latte",
          "desc": "Karamell og vanilje med kald melk og espresso over is."
      },
      "fi": {
          "name": "Jääkaramelli-Vanilja Latte",
          "desc": "Karamellia ja vaniljaa kylmällä maidolla ja espressolla jäillä."
      },
      "pl": {
          "name": "Iced Karmelowo-Waniliowe Latte",
          "desc": "Karmel i wanilia z zimnym mlekiem i espresso na lodzie."
      },
      "ar": {
          "name": "آيس كاراميل فانيلا لاتيه",
          "desc": "مزيج الكراميل والفانيليا المنعش مع حليب بارد وإسبريسو فوق الثلج."
      }
  },
  "Iced Caramel Mocha": {
      "tr": {
          "name": "Iced Caramel Mocha",
          "desc": "Buz, karamel ve çikolata sosu, soğuk süt ve espresso uyumu."
      },
      "en": {
          "name": "Iced Caramel Mocha",
          "desc": "Rich chocolate and buttery caramel shaken with chilled milk and espresso over ice."
      },
      "de": {
          "name": "Iced Karamell Mocha",
          "desc": "Reiche Schokolade und Karamell mit kalter Milch und Espresso auf Eis."
      },
      "ru": {
          "name": "Айс Карамельный Мокка",
          "desc": "Шоколад и карамель с холодным молоком и эспрессо со льдом."
      },
      "nl": {
          "name": "Iced Caramel Mocha",
          "desc": "Chocolade en karamel met koude melk en espresso over ijs."
      },
      "sv": {
          "name": "Iced Karamell Mocha",
          "desc": "Choklad och karamell med kall mjölk och espresso över is."
      },
      "no": {
          "name": "Iskaffe Karamell Mocha",
          "desc": "Sjokolade og karamell med kald melk og espresso over is."
      },
      "fi": {
          "name": "Jääkaramelli Mocha",
          "desc": "Suklaata ja karamellia kylmällä maidolla ja espressolla jäillä."
      },
      "pl": {
          "name": "Iced Karmelowa Mocha",
          "desc": "Czekolada i karmel z zimnym mlekiem i espresso na lodzie."
      },
      "ar": {
          "name": "آيس كاراميل موكا",
          "desc": "شوكولاتة غنية وكراميل لذيذ مع حليب بارد وإسبريسو فوق الثلج."
      }
  },
  "Iced Caramel White Mocha": {
      "tr": {
          "name": "Iced Caramel White Mocha",
          "desc": "Buz üzerinde karamel ve beyaz çikolata, soğuk süt ve espresso."
      },
      "en": {
          "name": "Iced Caramel White Mocha",
          "desc": "White chocolate and golden caramel infused with cold milk and fresh espresso."
      },
      "de": {
          "name": "Iced Karamell Weiße Mocha",
          "desc": "Weiße Schokolade und Karamell mit kalter Milch und Espresso auf Eis."
      },
      "ru": {
          "name": "Айс Карамельно-Белый Мокка",
          "desc": "Белый шоколад и золотистая карамель с холодным молоком и эспрессо."
      },
      "nl": {
          "name": "Iced Caramel Witte Mocha",
          "desc": "Witte chocolade en karamel met koude melk en espresso over ijs."
      },
      "sv": {
          "name": "Iced Karamell Vit Mocha",
          "desc": "Vit choklad och karamell med kall mjölk och espresso över is."
      },
      "no": {
          "name": "Iskaffe Karamell Hvit Mocha",
          "desc": "Hvit sjokolade og karamell med kald melk og espresso over is."
      },
      "fi": {
          "name": "Jääkaramelli Valkoinen Mocha",
          "desc": "Valkosuklaata ja karamellia kylmällä maidolla ja espressolla jäillä."
      },
      "pl": {
          "name": "Iced Karmelowa Biała Mocha",
          "desc": "Biała czekolada i karmel z zimnym mlekiem i espresso na lodzie."
      },
      "ar": {
          "name": "آيس كاراميل وايت موكا",
          "desc": "شوكولاتة بيضاء وكراميل ذهبي مع حليب بارد وإسبريسو مثلج."
      }
  },
  "Iced Vanilla Mocha": {
      "tr": {
          "name": "Iced Vanilla Mocha",
          "desc": "Buz, vanilya ve çikolata lezzeti, soğuk süt ve yoğun espresso."
      },
      "en": {
          "name": "Iced Vanilla Mocha",
          "desc": "Chocolate and fragrant vanilla combined with chilled milk and double espresso."
      },
      "de": {
          "name": "Iced Vanille Mocha",
          "desc": "Schokolade und Vanille mit kalter Milch und doppeltem Espresso auf Eis."
      },
      "ru": {
          "name": "Айс Ванильный Мокка",
          "desc": "Шоколад и ароматная ваниль с холодным молоком и эспрессо со льдом."
      },
      "nl": {
          "name": "Iced Vanille Mocha",
          "desc": "Chocolade en vanille met koude melk en espresso over ijs."
      },
      "sv": {
          "name": "Iced Vanilj Mocha",
          "desc": "Choklad och vanilj med kall mjölk och espresso över is."
      },
      "no": {
          "name": "Iskaffe Vanilje Mocha",
          "desc": "Sjokolade og vanilje med kald melk og espresso over is."
      },
      "fi": {
          "name": "Jäävanilja Mocha",
          "desc": "Suklaata ja vaniljaa kylmällä maidolla ja espressolla jäillä."
      },
      "pl": {
          "name": "Iced Waniliowa Mocha",
          "desc": "Czekolada i aromatyczna wanilia z zimnym mlekiem i espresso na lodzie."
      },
      "ar": {
          "name": "آيس فانيلا موكا",
          "desc": "شوكولاتة وفانيليا عطرة مع حليب بارد وإسبريسو منعش فوق الثلج."
      }
  },
  "Iced Vanilla White Mocha": {
      "tr": {
          "name": "Iced Vanilla White Mocha",
          "desc": "Buz, vanilya ve beyaz çikolata, soğuk süt ve espresso dengesi."
      },
      "en": {
          "name": "Iced Vanilla White Mocha",
          "desc": "White chocolate and vanilla layered over ice with chilled milk and espresso."
      },
      "de": {
          "name": "Iced Vanille Weiße Mocha",
          "desc": "Weiße Schokolade und Vanille auf Eis mit kalter Milch und Espresso."
      },
      "ru": {
          "name": "Айс Ванильно-Белый Мокка",
          "desc": "Белый шоколад и ваниль со льдом, холодным молоком и эспрессо."
      },
      "nl": {
          "name": "Iced Vanille Witte Mocha",
          "desc": "Witte chocolade en vanille over ijs met koude melk en espresso."
      },
      "sv": {
          "name": "Iced Vanilj Vit Mocha",
          "desc": "Vit choklad och vanilj över is med kall mjölk och espresso."
      },
      "no": {
          "name": "Iskaffe Vanilje Hvit Mocha",
          "desc": "Hvit sjokolade og vanilje over is med kald melk og espresso."
      },
      "fi": {
          "name": "Jäävanilja Valkoinen Mocha",
          "desc": "Valkosuklaata ja vaniljaa jäillä kylmällä maidolla ja espressolla."
      },
      "pl": {
          "name": "Iced Waniliowa Biała Mocha",
          "desc": "Biała czekolada i wanilia na lodzie z zimnym mlekiem i espresso."
      },
      "ar": {
          "name": "آيس فانيلا وايت موكا",
          "desc": "شوكولاتة بيضاء وفانيليا مع حليب بارد وإسبريسو فوق الثلج."
      }
  },
  "Iced Zebra Mocha": {
      "tr": {
          "name": "Iced Zebra Mocha",
          "desc": "Buz, sütlü ve beyaz çikolata sosu, soğuk süt ve espresso dengesi."
      },
      "en": {
          "name": "Iced Zebra Mocha",
          "desc": "Dark and white chocolate drizzle layered with chilled milk and iced espresso."
      },
      "de": {
          "name": "Iced Zebra Mocha",
          "desc": "Dunkle und weiße Schokolade mit kalter Milch und Iced Espresso."
      },
      "ru": {
          "name": "Айс Зебра Мокка",
          "desc": "Темный и белый шоколад с холодным молоком и айс эспрессо."
      },
      "nl": {
          "name": "Iced Zebra Mocha",
          "desc": "Donkere en witte chocolade met koude melk en ijsespresso."
      },
      "sv": {
          "name": "Iced Zebra Mocha",
          "desc": "Mörk och vit choklad med kall mjölk och espresso över is."
      },
      "no": {
          "name": "Iskaffe Zebra Mocha",
          "desc": "Mørk og hvit sjokolade med kald melk og espresso over is."
      },
      "fi": {
          "name": "Jääzebra Mocha",
          "desc": "Tummaa ja valkoista suklaata kylmällä maidolla ja jääespressolla."
      },
      "pl": {
          "name": "Iced Zebra Mocha",
          "desc": "Ciemna i biała czekolada z zimnym mlekiem i espresso na lodzie."
      },
      "ar": {
          "name": "آيس زيبرا موكا",
          "desc": "مزيج الشوكولاتة الداكنة والبيضاء مع حليب بارد وإسبريسو مثلج."
      }
  },
  "Iced Caramel Vanilla Mocha": {
      "tr": {
          "name": "Iced Caramel Vanilla Mocha",
          "desc": "Buz üzerinde karamel, vanilya ve çikolata lezzetlerinin soğuk espressoyla buluşması."
      },
      "en": {
          "name": "Iced Caramel Vanilla Mocha",
          "desc": "Caramel, vanilla and chocolate layered over ice with chilled milk and espresso."
      },
      "de": {
          "name": "Iced Karamell Vanille Mocha",
          "desc": "Karamell, Vanille und Schokolade auf Eis mit kalter Milch und Espresso."
      },
      "ru": {
          "name": "Айс Карамельно-Ванильный Мокка",
          "desc": "Карамель, ваниль и шоколад со льдом, холодным молоком и эспрессо."
      },
      "nl": {
          "name": "Iced Caramel Vanille Mocha",
          "desc": "Karamel, vanille en chocolade over ijs met koude melk en espresso."
      },
      "sv": {
          "name": "Iced Karamell Vanilj Mocha",
          "desc": "Karamell, vanilj och choklad över is med kall mjölk och espresso."
      },
      "no": {
          "name": "Iskaffe Karamell Vanilje Mocha",
          "desc": "Karamell, vanilje og sjokolade over is med kald melk og espresso."
      },
      "fi": {
          "name": "Jääkaramelli-Vanilja Mocha",
          "desc": "Karamellia, vaniljaa ja suklaata jäillä kylmällä maidolla ja espressolla."
      },
      "pl": {
          "name": "Iced Karmelowo-Waniliowa Mocha",
          "desc": "Karmel, wanilia i czekolada na lodzie z zimnym mlekiem i espresso."
      },
      "ar": {
          "name": "آيس كاراميل فانيلا موكا",
          "desc": "كراميل وفانيليا وشوكولاتة فوق الثلج مع حليب بارد وإسبريسو."
      }
  },
  "Iced Caramel Vanilla White Mocha": {
      "tr": {
          "name": "Iced Caramel Vanilla White Mocha",
          "desc": "Buz, karamel, vanilya ve beyaz çikolata, soğuk süt ve espresso."
      },
      "en": {
          "name": "Iced Caramel Vanilla White Mocha",
          "desc": "Decadent trio of caramel, vanilla and white chocolate with chilled milk and espresso."
      },
      "de": {
          "name": "Iced Karamell Vanille Weiße Mocha",
          "desc": "Karamell, Vanille und weiße Schokolade mit kalter Milch und Espresso auf Eis."
      },
      "ru": {
          "name": "Айс Карамельно-Ванильно-Белый Мокка",
          "desc": "Карамель, ваниль и белый шоколад с холодным молоком и эспрессо со льдом."
      },
      "nl": {
          "name": "Iced Caramel Vanille Witte Mocha",
          "desc": "Karamel, vanille en witte chocolade met koude melk en espresso over ijs."
      },
      "sv": {
          "name": "Iced Karamell Vanilj Vit Mocha",
          "desc": "Karamell, vanilj och vit choklad med kall mjölk och espresso över is."
      },
      "no": {
          "name": "Iskaffe Karamell Vanilje Hvit Mocha",
          "desc": "Karamell, vanilje og hvit sjokolade med kald melk og espresso over is."
      },
      "fi": {
          "name": "Jääkaramelli-Vanilja Valkoinen Mocha",
          "desc": "Karamellia, vaniljaa ja valkosuklaata kylmällä maidolla ja espressolla jäillä."
      },
      "pl": {
          "name": "Iced Karmelowo-Waniliowa Biała Mocha",
          "desc": "Karmel, wanilia i biała czekolada z zimnym mlekiem i espresso na lodzie."
      },
      "ar": {
          "name": "آيس كاراميل فانيلا وايت موكا",
          "desc": "كراميل وفانيليا وشوكولاتة بيضاء مع حليب مثلج وإسبريسو منعش."
      }
  },
  "Iced Triple Caramel Mocha": {
      "tr": {
          "name": "Iced Triple Caramel Mocha",
          "desc": "Buz üzerinde karamel, sütlü ve beyaz çikolatanın zengin soğuk espresso lezzeti."
      },
      "en": {
          "name": "Iced Triple Caramel Mocha",
          "desc": "Caramel, milk and white chocolate poured over ice with cold milk and bold espresso."
      },
      "de": {
          "name": "Iced Triple Karamell Mocha",
          "desc": "Karamell, Milch- und weiße Schokolade auf Eis mit kalter Milch und Espresso."
      },
      "ru": {
          "name": "Айс Трипл Карамельный Мокка",
          "desc": "Карамель, молочный и белый шоколад со льдом, холодным молоком и эспрессо."
      },
      "nl": {
          "name": "Iced Triple Caramel Mocha",
          "desc": "Karamel, melk- en witte chocolade over ijs met koude melk en espresso."
      },
      "sv": {
          "name": "Iced Triple Karamell Mocha",
          "desc": "Karamell, mjölk- och vit choklad över is med kall mjölk och espresso."
      },
      "no": {
          "name": "Iskaffe Triple Karamell Mocha",
          "desc": "Karamell, melke- og hvit sjokolade over is med kald melk og espresso."
      },
      "fi": {
          "name": "Jää Triple Karamelli Mocha",
          "desc": "Karamellia, maito- ja valkosuklaata jäillä kylmällä maidolla ja espressolla."
      },
      "pl": {
          "name": "Iced Triple Caramel Mocha",
          "desc": "Karmel, czekolada mleczna i biała na lodzie z zimnym mlekiem i espresso."
      },
      "ar": {
          "name": "آيس تريبل كاراميل موكا",
          "desc": "كراميل وشوكولاتة بالحليب وشوكولاتة بيضاء مع حليب بارد وإسبريسو مثلج."
      }
  },
  "Iced Vanilla Zebra Mocha": {
      "tr": {
          "name": "Iced Vanilla Zebra Mocha",
          "desc": "Buz, vanilya, sütlü ve beyaz çikolata sosu ile hazırlanan soğuk espresso."
      },
      "en": {
          "name": "Iced Vanilla Zebra Mocha",
          "desc": "Tuxedo chocolate swirl and natural vanilla over ice with chilled milk and espresso."
      },
      "de": {
          "name": "Iced Vanille Zebra Mocha",
          "desc": "Zweierlei Schokolade und Vanille auf Eis mit kalter Milch und Espresso."
      },
      "ru": {
          "name": "Айс Ванильная Зебра Мокка",
          "desc": "Молочный и белый шоколад с ванилью, холодным молоком и эспрессо со льдом."
      },
      "nl": {
          "name": "Iced Vanille Zebra Mocha",
          "desc": "Duo van chocolade en vanille over ijs met koude melk en espresso."
      },
      "sv": {
          "name": "Iced Vanilj Zebra Mocha",
          "desc": "Chokladduo och vanilj över is med kall mjölk och espresso."
      },
      "no": {
          "name": "Iskaffe Vanilje Zebra Mocha",
          "desc": "Sjokoladeduo og vanilje over is med kald melk og espresso."
      },
      "fi": {
          "name": "Jäävanilja Zebra Mocha",
          "desc": "Suklaaduo ja vaniljaa jäillä kylmällä maidolla ja espressolla."
      },
      "pl": {
          "name": "Iced Waniliowa Zebra Mocha",
          "desc": "Duet czekolad z nutą wanilii na lodzie z zimnym mlekiem i espresso."
      },
      "ar": {
          "name": "آيس فانيلا زيبرا موكا",
          "desc": "مزيج شوكولاتة الزيبرا مع لمسة فانيليا ناعمة وحليب بارد وإسبريسو مثلج."
      }
  },
  "Iced NOA Signature Latte": {
      "tr": {
          "name": "Iced NOA Signature Latte",
          "desc": "Karamel, vanilya, çikolata ve beyaz çikolatanın buz ve soğuk sütle hazırlanan imza soğuk lattesi."
      },
      "en": {
          "name": "Iced NOA Signature Latte",
          "desc": "Signature chilled blend of caramel, vanilla, dark and white chocolate with espresso over ice."
      },
      "de": {
          "name": "Iced NOA Signature Latte",
          "desc": "Kühles Signatur-Meisterwerk aus Karamell, Vanille, dunkler und weißer Schokolade auf Eis."
      },
      "ru": {
          "name": "Айс NOA Фирменный Латте",
          "desc": "Фирменный холодный шедевр из карамели, ванили, темного и белого шоколада со льдом."
      },
      "nl": {
          "name": "Iced NOA Signature Latte",
          "desc": "Gekoeld meesterwerk van karamel, vanille, donkere en witte chocolade met espresso over ijs."
      },
      "sv": {
          "name": "Iced NOA Signatur Latte",
          "desc": "Kylt signaturmästerverk med karamell, vanilj, mörk och vit choklad över is."
      },
      "no": {
          "name": "Iskaffe NOA Signatur Latte",
          "desc": "Kjølig signaturmesterverk med karamell, vanilje, mørk og hvit sjokolade over is."
      },
      "fi": {
          "name": "Jää NOA Nimikkolatte",
          "desc": "Kylmä nimikkomestariteos karamellilla, vaniljalla ja kahdella suklaalla jäillä."
      },
      "pl": {
          "name": "Iced NOA Signature Latte",
          "desc": "Schłodzone autorskie dzieło łączące karmel, wanilię, ciemną i białą czekoladę na lodzie."
      },
      "ar": {
          "name": "آيس نوا سيجنتشر لاتيه",
          "desc": "التحفة المثلجة المميزة بمزيج الكراميل والفانيليا والشوكولاتة المزدوجة مع الإسبريسو المنعش."
      }
  }
,
  "Caramel Macchiato": {
      "tr": {
          "name": "Caramel Macchiato",
          "desc": "Katmanlı sıcak süt, süt köpüğü, espresso ve üzerine gezdirilen karamel sosu."
      },
      "en": {
          "name": "Caramel Macchiato",
          "desc": "Steamed milk stained with espresso and drizzled with sweet buttery caramel sauce."
      },
      "de": {
          "name": "Karamell Macchiato",
          "desc": "Geschichtete heiße Milch, Milchschaum, Espresso und feine Karamellsauce."
      },
      "ru": {
          "name": "Карамельный Маккиато",
          "desc": "Слоистое горячее молоко, молочная пенка, эспрессо и тягучая карамель."
      },
      "nl": {
          "name": "Caramel Macchiato",
          "desc": "Gestoomde melk, melkschuim, espresso en rijke karamelsaus."
      },
      "sv": {
          "name": "Karamell Macchiato",
          "desc": "Lager av varm mjölk, mjölkskum, espresso och fyllig karamellsås."
      },
      "no": {
          "name": "Karamell Macchiato",
          "desc": "Lagvis varm melk, melkeskum, espresso og fyldig karamellsaus."
      },
      "fi": {
          "name": "Karamelli Macchiato",
          "desc": "Kerrostettua kuumaa maitoa, maitovaahtoa, espressoa ja karamellikastiketta."
      },
      "pl": {
          "name": "Caramel Macchiato",
          "desc": "Warstwowe gorące mleko, pianka, espresso i wyśmienity sos karmelowy."
      },
      "ar": {
          "name": "كاراميل ماكياتو",
          "desc": "طبقات الحليب الساخن ورغوة الحليب مع الإسبريسو المركز وصوص الكراميل الغني."
      }
  },
  "Vanilla Caramel Macchiato": {
      "tr": {
          "name": "Vanilla Caramel Macchiato",
          "desc": "Doğal vanilya aromalı katmanlı sıcak süt, taze espresso ve zengin karamel sosu."
      },
      "en": {
          "name": "Vanilla Caramel Macchiato",
          "desc": "Vanilla infused steamed milk with a shot of bold espresso and buttery caramel drizzle."
      },
      "de": {
          "name": "Vanille Karamell Macchiato",
          "desc": "Vanille-Milch mit Espresso und reichhaltigem Karamell-Drizzle."
      },
      "ru": {
          "name": "Ванильно-Карамельный Маккиато",
          "desc": "Ванильное горячее молоко со слоем эспрессо и карамельным узором."
      },
      "nl": {
          "name": "Vanille Caramel Macchiato",
          "desc": "Vanillemelk met espresso en een royale swirl van karamel."
      },
      "sv": {
          "name": "Vanilj Karamell Macchiato",
          "desc": "Vaniljmariad mjölk med espresso och generös karamellsås."
      },
      "no": {
          "name": "Vanilje Karamell Macchiato",
          "desc": "Vaniljemelk med espresso og fyldig karamellsaus."
      },
      "fi": {
          "name": "Vanilja-Karamelli Macchiato",
          "desc": "Vaniljamaitoa espressolla ja runsaalla karamellikastikkeella."
      },
      "pl": {
          "name": "Waniliowo-Karmelowe Macchiato",
          "desc": "Mleko waniliowe z espresso i obfitą porcją sosu karmelowego."
      },
      "ar": {
          "name": "فانيلا كاراميل ماكياتو",
          "desc": "حليب بنكهة الفانيليا مع شوت إسبريسو غني ومزين بخيوط الكراميل الذهبية."
      }
  },
  "Chocolate Caramel Macchiato": {
      "tr": {
          "name": "Chocolate Caramel Macchiato",
          "desc": "Sıcak süt, yoğun çikolata ve karamel sosu ile espresso katmanları."
      },
      "en": {
          "name": "Chocolate Caramel Macchiato",
          "desc": "Decadent fusion of rich chocolate, velvety steamed milk, espresso and caramel."
      },
      "de": {
          "name": "Schoko Karamell Macchiato",
          "desc": "Schokolade und heißer Milchschaum mit Espresso und Karamellsauce."
      },
      "ru": {
          "name": "Шоколадно-Карамельный Маккиато",
          "desc": "Шоколадное молоко, густая пенка, эспрессо и карамельный топпинг."
      },
      "nl": {
          "name": "Chocolade Caramel Macchiato",
          "desc": "Chocolademelk met espresso, melkschuim en karamelsaus."
      },
      "sv": {
          "name": "Choklad Karamell Macchiato",
          "desc": "Chokladmjölk med espresso, mjölkskum och karamellsås."
      },
      "no": {
          "name": "Sjokolade Karamell Macchiato",
          "desc": "Sjokolademelk med espresso, melkeskum og karamellsaus."
      },
      "fi": {
          "name": "Suklaa-Karamelli Macchiato",
          "desc": "Suklaamaitoa espressolla, maitovaahdolla ja karamellikastikkeella."
      },
      "pl": {
          "name": "Czekoladowo-Karmelowe Macchiato",
          "desc": "Mleko czekoladowe z espresso, pianką i sosem karmelowym."
      },
      "ar": {
          "name": "تشوكليت كاراميل ماكياتو",
          "desc": "مزيج فاخر من الشوكولاتة والحليب المبخر مع الإسبريسو وصوص الكراميل."
      }
  },
  "White Chocolate Caramel Macchiato": {
      "tr": {
          "name": "White Chocolate Caramel Macchiato",
          "desc": "Beyaz Belçika çikolatası ve karamel sosunun kadifemsi sıcak süt ve espresso ile buluşması."
      },
      "en": {
          "name": "White Chocolate Caramel Macchiato",
          "desc": "Creamy white chocolate and steamed milk layered with espresso and caramel."
      },
      "de": {
          "name": "Weiße Schoko Karamell Macchiato",
          "desc": "Weiße Schokolade und heiße Milch mit Espresso und Karamell."
      },
      "ru": {
          "name": "Белый Шоколадно-Карамельный Маккиато",
          "desc": "Белый шоколад, горячее молоко, эспрессо и карамельный узор."
      },
      "nl": {
          "name": "Witte Chocolade Caramel Macchiato",
          "desc": "Witte chocolade en warme melk met espresso en karamelsaus."
      },
      "sv": {
          "name": "Vit Choklad Karamell Macchiato",
          "desc": "Vit choklad och varm mjölk med espresso och karamellsås."
      },
      "no": {
          "name": "Hvit Sjokolade Karamell Macchiato",
          "desc": "Hvit sjokolade og varm melk med espresso og karamellsaus."
      },
      "fi": {
          "name": "Valkosuklaa-Karamelli Macchiato",
          "desc": "Valkosuklaata ja kuumaa maitoa espressolla ja karamellilla."
      },
      "pl": {
          "name": "Biała Czekolada Karmelowe Macchiato",
          "desc": "Biała czekolada i gorące mleko z espresso oraz sosem karmelowym."
      },
      "ar": {
          "name": "وايت تشوكليت كاراميل ماكياتو",
          "desc": "شوكولاتة بيضاء بلجيكية وحليب ساخن مخملي مع الإسبريسو والكراميل."
      }
  },
  "Iced Caramel Macchiato": {
      "tr": {
          "name": "Iced Caramel Macchiato",
          "desc": "Buz, soğuk süt, espresso ve üzerine dökülen zengin karamel sosu."
      },
      "en": {
          "name": "Iced Caramel Macchiato",
          "desc": "Chilled milk and vanilla over ice, topped with espresso and caramel drizzle."
      },
      "de": {
          "name": "Iced Karamell Macchiato",
          "desc": "Kalte Milch auf Eis mit Espresso und feiner Karamellsauce."
      },
      "ru": {
          "name": "Айс Карамельный Маккиато",
          "desc": "Холодное молоко со льдом, слоем эспрессо и карамельным узором."
      },
      "nl": {
          "name": "Iced Caramel Macchiato",
          "desc": "Gekoelde melk over ijs met espresso en rijke karamel."
      },
      "sv": {
          "name": "Iced Karamell Macchiato",
          "desc": "Kall mjölk över is med espresso och fyllig karamellsås."
      },
      "no": {
          "name": "Iskaffe Karamell Macchiato",
          "desc": "Kald melk over is med espresso og fyldig karamellsaus."
      },
      "fi": {
          "name": "Jääkaramelli Macchiato",
          "desc": "Kylmää maitoa jäillä espressolla ja karamellikastikkeella."
      },
      "pl": {
          "name": "Iced Caramel Macchiato",
          "desc": "Schłodzone mleko na lodzie z espresso i sosem karmelowym."
      },
      "ar": {
          "name": "آيس كاراميل ماكياتو",
          "desc": "حليب بارد ومكعبات ثلج مع الإسبريسو المنعش وصوص الكراميل اللذيذ."
      }
  },
  "Iced Vanilla Caramel Macchiato": {
      "tr": {
          "name": "Iced Vanilla Caramel Macchiato",
          "desc": "Buz üzerinde vanilya aromalı soğuk süt, taze espresso ve leziz karamel sosu."
      },
      "en": {
          "name": "Iced Vanilla Caramel Macchiato",
          "desc": "Vanilla chilled milk poured over ice, topped with espresso and rich caramel drizzle."
      },
      "de": {
          "name": "Iced Vanille Karamell Macchiato",
          "desc": "Vanille-Kaltmilch auf Eis mit Espresso und Karamell-Drizzle."
      },
      "ru": {
          "name": "Айс Ванильно-Карамельный Маккиато",
          "desc": "Холодное ванильное молоко со льдом, эспрессо и карамелью."
      },
      "nl": {
          "name": "Iced Vanille Caramel Macchiato",
          "desc": "Vanille-gekoelde melk over ijs met espresso en karamel."
      },
      "sv": {
          "name": "Iced Vanilj Karamell Macchiato",
          "desc": "Kall vaniljmariad mjölk över is med espresso och karamell."
      },
      "no": {
          "name": "Iskaffe Vanilje Karamell Macchiato",
          "desc": "Kald vaniljemelk over is med espresso og karamell."
      },
      "fi": {
          "name": "Jäävanilja-Karamelli Macchiato",
          "desc": "Kylmää vaniljamaitoa jäillä espressolla ja karamellilla."
      },
      "pl": {
          "name": "Iced Waniliowo-Karmelowe Macchiato",
          "desc": "Zimne mleko waniliowe na lodzie z espresso i karmelem."
      },
      "ar": {
          "name": "آيس فانيلا كاراميل ماكياتو",
          "desc": "حليب بارد بنكهة الفانيليا فوق الثلج مع الإسبريسو وخيوط الكراميل."
      }
  },
  "Iced Chocolate Caramel Macchiato": {
      "tr": {
          "name": "Iced Chocolate Caramel Macchiato",
          "desc": "Buz, soğuk süt, yoğun çikolata ve karamel sosu ile katmanlanan soğuk espresso."
      },
      "en": {
          "name": "Iced Chocolate Caramel Macchiato",
          "desc": "Iced espresso layered with cold chocolate milk and luscious caramel sauce."
      },
      "de": {
          "name": "Iced Schoko Karamell Macchiato",
          "desc": "Eisgekühlter Espresso mit Schokomilch und Karamellsauce auf Eis."
      },
      "ru": {
          "name": "Айс Шоколадно-Карамельный Маккиато",
          "desc": "Холодный шоколадный эспрессо со льдом и карамельным соусом."
      },
      "nl": {
          "name": "Iced Chocolade Caramel Macchiato",
          "desc": "IJsespresso met chocolademelk en karamelsaus over ijs."
      },
      "sv": {
          "name": "Iced Choklad Karamell Macchiato",
          "desc": "Icespresso med chokladmjölk och karamellsås över is."
      },
      "no": {
          "name": "Iskaffe Sjokolade Karamell Macchiato",
          "desc": "Isespresso med sjokolademelk og karamellsaus over is."
      },
      "fi": {
          "name": "Jääsuklaa-Karamelli Macchiato",
          "desc": "Jääespressoa suklaamaidolla ja karamellikastikkeella."
      },
      "pl": {
          "name": "Iced Czekoladowo-Karmelowe Macchiato",
          "desc": "Iced espresso z mlekiem czekoladowym i sosem karmelowym."
      },
      "ar": {
          "name": "آيس تشوكليت كاراميل ماكياتو",
          "desc": "إسبريسو مثلج مع حليب بالشوكولاتة وصوص الكراميل فوق الثلج."
      }
  },
  "Iced White Chocolate Caramel Macchiato": {
      "tr": {
          "name": "Iced White Chocolate Caramel Macchiato",
          "desc": "Buz üzerinde beyaz çikolata ve karamel sosu, soğuk süt ve espresso katmanı."
      },
      "en": {
          "name": "Iced White Chocolate Caramel Macchiato",
          "desc": "White chocolate sauce and cold milk over ice, layered with espresso and caramel."
      },
      "de": {
          "name": "Iced Weiße Schoko Karamell Macchiato",
          "desc": "Weiße Schokolade und kalte Milch auf Eis mit Espresso und Karamell."
      },
      "ru": {
          "name": "Айс Белый Шоколадно-Карамельный Маккиато",
          "desc": "Белый шоколад и холодное молоко со льдом, эспрессо и карамелью."
      },
      "nl": {
          "name": "Iced Witte Chocolade Caramel Macchiato",
          "desc": "Witte chocolade en koude melk over ijs met espresso en karamel."
      },
      "sv": {
          "name": "Iced Vit Choklad Karamell Macchiato",
          "desc": "Vit choklad och kall mjölk över is med espresso och karamell."
      },
      "no": {
          "name": "Iskaffe Hvit Sjokolade Karamell Macchiato",
          "desc": "Hvit sjokolade og kald melk over is med espresso og karamell."
      },
      "fi": {
          "name": "Jäävalkosuklaa-Karamelli Macchiato",
          "desc": "Valkosuklaata ja kylmää maitoa jäillä espressolla ja karamellilla."
      },
      "pl": {
          "name": "Iced Biała Czekolada Karmelowe Macchiato",
          "desc": "Biała czekolada i zimne mleko na lodzie z espresso i karmelem."
      },
      "ar": {
          "name": "آيس وايت تشوكليت كاراميل ماكياتو",
          "desc": "شوكولاتة بيضاء وحليب بارد مع شوت إسبريسو وصوص الكراميل الذهبي."
      }
  },
  "Classic Mocha": {
      "tr": { "name": "Mocha", "desc": "Espresso, sıcak süt ve enfes Belçika çikolatası uyumu." },
      "en": { "name": "Mocha", "desc": "Rich espresso with steamed milk and premium Belgian chocolate." },
      "de": { "name": "Mocha", "desc": "Kräftiger Espresso mit heißer Milch und feinster belgischer Schokolade." },
      "ru": { "name": "Мокка", "desc": "Эспрессо с горячим молоком и бельгийским шоколадом." },
      "nl": { "name": "Mocha", "desc": "Rijke espresso met warme melk en Belgische chocolade." },
      "sv": { "name": "Mocka", "desc": "Fyllig espresso med varm mjölk och belgisk choklad." },
      "no": { "name": "Mokka", "desc": "Fyldig espresso med varm melk og belgisk sjokolade." },
      "fi": { "name": "Mokkapapu", "desc": "Täyteläinen espresso kuumalla maidolla ja belgialaisella suklaalla." },
      "pl": { "name": "Mocha", "desc": "Wyraziste espresso z gorącym mlekiem i belgijską czekoladą." },
      "ar": { "name": "موكا", "desc": "إسبريسو غني مع حليب ساخن وشوكولاتة بلجيكية فاخرة." }
  },
  "Iced Classic Mocha": {
      "tr": { "name": "Iced Mocha", "desc": "Buz, soğuk süt, espresso ve enfes Belçika çikolatası uyumu." },
      "en": { "name": "Iced Mocha", "desc": "Chilled espresso and milk over ice with decadent Belgian chocolate." },
      "de": { "name": "Eisgekühlter Mocha", "desc": "Kalter Espresso und Milch über Eis mit feiner belgischer Schokolade." },
      "ru": { "name": "Айс Мокка", "desc": "Охлажденный эспрессо с молоком, льдом и бельгийским шоколадом." },
      "nl": { "name": "Iced Mocha", "desc": "Gekoelde espresso met melk over ijs en Belgische chocolade." },
      "sv": { "name": "Isad Mocka", "desc": "Kall espresso och mjölk över is med belgisk choklad." },
      "no": { "name": "Iskaffe Mokka", "desc": "Kald espresso og melk over is med belgisk sjokolade." },
      "fi": { "name": "Jäämokkapapu", "desc": "Kylmä espresso ja maito jäillä belgialaisella suklaalla." },
      "pl": { "name": "Iced Mocha", "desc": "Schłodzone espresso z mlekiem na lodzie i belgijską czekoladą." },
      "ar": { "name": "آيس موكا", "desc": "إسبريسو بارد مع حليب وقطع ثلج وشوكولاتة بلجيكية فاخرة." }
  },
  "Salted Caramel Mocha": {
      "tr": { "name": "Salted Caramel Mocha", "desc": "Espresso, sıcak süt, Belçika çikolatası ve deniz tuzlu karamel dokunuşu." },
      "en": { "name": "Salted Caramel Mocha", "desc": "Espresso and steamed milk with rich chocolate and a touch of salted caramel." },
      "de": { "name": "Salzkaramell Mocha", "desc": "Espresso und heiße Milch mit Schokolade und Meersalz-Karamell." },
      "ru": { "name": "Соленая Карамель Мокка", "desc": "Эспрессо с горячим молоком, шоколадом и соленой карамелью." },
      "nl": { "name": "Gezouten Karamel Mocha", "desc": "Espresso met warme melk, chocolade en gezouten karamel." },
      "sv": { "name": "Saltkaramell Mocka", "desc": "Espresso med varm mjölk, choklad och salt karamell." },
      "no": { "name": "Salt Karamell Mokka", "desc": "Espresso med varm melk, sjokolade og salt karamell." },
      "fi": { "name": "Suolakaramelli Mokka", "desc": "Espresso kuumalla maidolla, suklaalla ja merisuolakaramellilla." },
      "pl": { "name": "Słony Karmel Mocha", "desc": "Espresso z gorącym mlekiem, czekoladą i słonym karmelem." },
      "ar": { "name": "سولتد كاراميل موكا", "desc": "إسبريسو وحليب ساخن مع شوكولاتة ولمسة كراميل مملح بملح البحر." }
  },
  "Iced Salted Caramel Mocha": {
      "tr": { "name": "Iced Salted Caramel Mocha", "desc": "Buz, soğuk süt, espresso, Belçika çikolatası ve deniz tuzlu karamel." },
      "en": { "name": "Iced Salted Caramel Mocha", "desc": "Chilled espresso, milk, and chocolate with sea-salted caramel over ice." },
      "de": { "name": "Eisgekühlter Salzkaramell Mocha", "desc": "Kalter Espresso, Milch und Schokolade mit Meersalz-Karamell über Eis." },
      "ru": { "name": "Айс Соленая Карамель Мокка", "desc": "Холодный эспрессо, молоко и шоколад с соленой карамелью на льду." },
      "nl": { "name": "Iced Gezouten Karamel Mocha", "desc": "Gekoelde espresso, melk en chocolade met gezouten karamel over ijs." },
      "sv": { "name": "Isad Saltkaramell Mocka", "desc": "Kall espresso, mjölk och choklad med havssaltad karamell över is." },
      "no": { "name": "Iskaffe Salt Karamell Mokka", "desc": "Kald espresso, melk og sjokolade med salt karamell over is." },
      "fi": { "name": "Jääsuolakaramelli Mokka", "desc": "Kylmä espresso, maito ja suklaa merisuolakaramellilla jäiden kera." },
      "pl": { "name": "Iced Słony Karmel Mocha", "desc": "Schłodzone espresso, mleko i czekolada ze słonym karmelem na lodzie." },
      "ar": { "name": "آيس سولتد كاراميل موكا", "desc": "إسبريسو وحليب بارد مع شوكولاتة وكراميل مملح منعش فوق الثلج." }
  },
  "NOA Roll & Küp İkili": {
      "tr": { "name": "NOA Roll & Küp İkili", "desc": "1 adet Roll Kruvasan ve 1 adet Küp Kruvasan ikilisi. Eşsiz Belçika çikolatası ve taze meyveler eşliğinde." },
      "en": { "name": "NOA Roll & Cube Duo", "desc": "A duo of 1 Roll Croissant and 1 Cube Croissant served with Belgian chocolate and fresh fruits." },
      "de": { "name": "NOA Roll & Cube Duo", "desc": "Ein Duo aus 1 Roll Croissant und 1 Cube Croissant serviert mit belgischer Schokolade und frischen Früchten." },
      "ru": { "name": "NOA Ролл и Куб Дуо", "desc": "Дуэт из 1 круассана Ролл и 1 круассана Куб с бельгийским шоколадом и свежими фруктами." },
      "nl": { "name": "NOA Roll & Cube Duo", "desc": "Een duo van 1 Roll Croissant en 1 Cube Croissant geserveerd met Belgische chocolade en vers fruit." },
      "sv": { "name": "NOA Rull & Kub Duo", "desc": "Ett duo av 1 Rullcroissant och 1 Kubcroissant med belgisk choklad och färska frukter." },
      "no": { "name": "NOA Rull & Kube Duo", "desc": "En duo av 1 Rullcroissant og 1 Kubecroissant med belgisk sjokolade og friske frukter." },
      "fi": { "name": "NOA Rulla & Kuutio Duo", "desc": "Duo 1 rullacroissantista ja 1 kuutiocroissantista belgialaisen suklaan ja tuoreiden hedelmien kera." },
      "pl": { "name": "NOA Roll & Cube Duo", "desc": "Duet 1 croissanta Roll i 1 croissanta Cube z belgijską czekoladą i świeżymi owocami." },
      "ar": { "name": "نووا رول وكيوب دويتو", "desc": "ثنائي فاخر يجمع كرواسان رول وكرواسان كيوب مع الشوكولاتة البلجيكية والفواكه الطازجة." }
  },
  "Orman Meyveli Kruvasan": {
      "tr": { "name": "Orman Meyveli Kruvasan", "desc": "Taze böğürtlen, yaban mersini, ahududu, ipeksi pastacı kreması ve Belçika çikolatasıyla." },
      "en": { "name": "Wild Berry Croissant", "desc": "Fresh blackberries, blueberries, raspberries with silky pastry cream and Belgian chocolate." },
      "de": { "name": "Waldbeeren Croissant", "desc": "Frische Brombeeren, Blaubeeren, Himbeeren mit feiner Konditorcreme und belgischer Schokolade." },
      "ru": { "name": "Лесные Ягоды Круассан", "desc": "Свежая ежевика, черника, малина с нежным заварным кремом и бельгийским шоколадом." },
      "nl": { "name": "Bosbessen Croissant", "desc": "Verse bramen, bosbessen en frambozen met zijdezachte banketbakkersroom en Belgische chocolade." },
      "sv": { "name": "Skogsbärscroissant", "desc": "Färska björnbär, blåbär, hallon med silkeslen vaniljkräm och belgisk choklad." },
      "no": { "name": "Skogsbærcroissant", "desc": "Friske bjørnebær, blåbær, bringebær med silkemyk vaniljekrem og belgisk sjokolade." },
      "fi": { "name": "Metsämarja Croissant", "desc": "Tuoreita karhunvatukoita, mustikoita, vadelmia silkkisellä leivontakermalla ja belgialaisella suklaalla." },
      "pl": { "name": "Croissant z Owocami Leśnymi", "desc": "Świeże jeżyny, borówki, maliny z aksamitnym kremem cukierniczym i belgijską czekoladą." },
      "ar": { "name": "كرواسان توت الغابة", "desc": "توت أسود، توت أزرق وتوت العليق الطازج مع كريمة الباتسيير الناعمة والشوكولاتة البلجيكية." }
  },
  "Mini Kruvasan Tabağı": {
      "tr": { "name": "Mini Kruvasan Tabağı", "desc": "Çıtır taze mini kruvasanlar, yanında sıcak eritilmiş Belçika çikolatası ve taze mevsim meyveleri ile." },
      "en": { "name": "Mini Croissant Platter", "desc": "Crispy freshly baked mini croissants served with warm Belgian chocolate dip and fresh fruits." },
      "de": { "name": "Mini Croissant Platte", "desc": "Knusprige frische Mini-Croissants serviert mit warmer belgischer Schokolade und Früchten." },
      "ru": { "name": "Тарелка Мини-Круассанов", "desc": "Хрустящие мини-круассаны с теплым бельгийским шоколадным соусом и свежими фруктами." },
      "nl": { "name": "Mini Croissant Schotel", "desc": "Krokante verse mini croissants geserveerd met warme Belgische chocolade en vers fruit." },
      "sv": { "name": "Mini Croissant Tallrik", "desc": "Frasiga nybakade minicroissanter serverade med varm belgisk chokladdipp och färsk frukt." },
      "no": { "name": "Mini Croissant Tallerken", "desc": "Sprø nybakte minicroissanter servert med varm belgisk sjokoladedipp og frisk frukt." },
      "fi": { "name": "Mini Croissant Lautanen", "desc": "Rapeita tuoreita minicroissantteja lämpimän belgialaisen suklaadipon ja hedelmien kera." },
      "pl": { "name": "Talerz Mini Croissantów", "desc": "Chrupiące mini croissanty podawane z ciepłym dipem z belgijskiej czekolady i owocami." },
      "ar": { "name": "طبق ميني كرواسان", "desc": "ميني كرواسان فرنسي مقرمش يقدم مع صوص الشوكولاتة البلجيكية الدافئة والفواكه الطازجة." }
  },
  "Limonlu Cheesecake (Dilim)": {
      "tr": { "name": "Limonlu Cheesecake (Dilim)", "desc": "Tek kişilik taze dilim; fırınlanmış kremsi cheesecake ve ev yapımı limon sosu." },
      "en": { "name": "Lemon Cheesecake (Slice)", "desc": "Fresh single slice; velvety baked cheesecake with zesty homemade lemon curd." },
      "de": { "name": "Zitronen Cheesecake (Stück)", "desc": "Frisches Einzelstück; samtiger gebackener Cheesecake mit hausgemachter Zitronencreme." },
      "ru": { "name": "Лимонный Чизкейк (Кусочек)", "desc": "Порционный свежий кусочек; бархатистый чизкейк с домашним лимонным соусом." },
      "nl": { "name": "Citroen Cheesecake (Punt)", "desc": "Verse punt taart; fluweelzachte cheesecake met huisgemaakte citroen curd." },
      "sv": { "name": "Citron Cheesecake (Bitar)", "desc": "Färsk portionsbit; krämig ugnsbakad cheesecake med fräsch citronkräm." },
      "no": { "name": "Sitron Cheesecake (Skive)", "desc": "Frisk porsjonsbit; kremet bakt ostekake med hjemmelaget sitronkrem." },
      "fi": { "name": "Sitruuna Juustokakku (Pala)", "desc": "Tuore annospala; samettinen paistettu juustokakku sitruunatahnalla." },
      "pl": { "name": "Sernik Cytrynowy (Kawałek)", "desc": "Świeży kawałek; aksamitny pieczony sernik z kremem cytrynowym." },
      "ar": { "name": "تشيز كيك الليمون (شريحة)", "desc": "شريحة فردية طازجة من التشيز كيك المخملي المخبوز مع صوص الليمون المنعش." }
  },
  "Limonlu Cheesecake (Bütün)": {
      "tr": { "name": "Limonlu Cheesecake (Bütün)", "desc": "Özel günler ve kutlamalar için bütün servis taze fırınlanmış Limonlu Cheesecake." },
      "en": { "name": "Whole Lemon Cheesecake", "desc": "Whole freshly baked lemon cheesecake, perfect for celebrations and sharing." },
      "de": { "name": "Ganze Zitronen Cheesecake", "desc": "Ganze frisch gebackene Zitronen-Cheesecake-Torte für besondere Anlässe." },
      "ru": { "name": "Целый Лимонный Чизкейк", "desc": "Целый свежеиспеченный лимонный чизкейк для праздников и компаний." },
      "nl": { "name": "Hele Citroen Cheesecake", "desc": "Hele vers gebakken citroen cheesecake taart voor speciale gelegenheden." },
      "sv": { "name": "Hel Citron Cheesecake", "desc": "Hel nybakad citroncheesecake-tårta för fest och firande." },
      "no": { "name": "Hel Sitron Cheesecake", "desc": "Hel fersk bakt sitron-ostekake til selskap og feiring." },
      "fi": { "name": "Kokonainen Sitruuna Juustokakku", "desc": "Kokonainen tuore sitruunajuustokakku juhliin ja jaettavaksi." },
      "pl": { "name": "Cały Sernik Cytrynowy", "desc": "Cały świeżo pieczony sernik cytrynowy idealny na uroczystości." },
      "ar": { "name": "تشيز كيك الليمون (قالب كامل)", "desc": "قالب كامل طازج ومخبوز من تشيز كيك الليمون الفاخر للمناسبات والمجموعات." }
  },
  "Lotuslu Cheesecake (Dilim)": {
      "tr": { "name": "Lotuslu Cheesecake (Dilim)", "desc": "Tek kişilik taze dilim; karamelize bisküvi tabanı ve akışkan Lotus Biscoff kreması." },
      "en": { "name": "Lotus Biscoff Cheesecake (Slice)", "desc": "Fresh single slice; crunchy biscuit crust topped with rich Lotus Biscoff spread." },
      "de": { "name": "Lotus Biscoff Cheesecake (Stück)", "desc": "Frisches Einzelstück; knuspriger Keksboden und reichhaltige Lotus Biscoff Creme." },
      "ru": { "name": "Чизкейк с Лотус Бискофф (Кусочек)", "desc": "Порционный кусочек с хрустящей основой и кремом Lotus Biscoff." },
      "nl": { "name": "Lotus Biscoff Cheesecake (Punt)", "desc": "Verse punt taart met knapperige koekjesbodem en Lotus Biscoff spread." },
      "sv": { "name": "Lotus Biscoff Cheesecake (Bitar)", "desc": "Portionsbit med kexbotten och krämig Lotus Biscoff." },
      "no": { "name": "Lotus Biscoff Cheesecake (Skive)", "desc": "Porsjonsbit med kjeksbunn og fyldig Lotus Biscoff krem." },
      "fi": { "name": "Lotus Biscoff Juustokakku (Pala)", "desc": "Tuore pala keksipohjalla ja täyteläisellä Lotus Biscoff -levitteellä." },
      "pl": { "name": "Sernik z Lotus Biscoff (Kawałek)", "desc": "Świeży kawałek sernika z ciasteczkowym spodem i kremem Lotus Biscoff." },
      "ar": { "name": "تشيز كيك اللوتس (شريحة)", "desc": "شريحة فردية طازجة مع قاعدة البسكويت المقرمشة وصوص زبدة اللوتس الغني." }
  },
  "Lotuslu Cheesecake (Bütün)": {
      "tr": { "name": "Lotuslu Cheesecake (Bütün)", "desc": "Özel günler ve kutlamalar için bütün servis taze fırınlanmış Lotus Biscoff Cheesecake." },
      "en": { "name": "Whole Lotus Biscoff Cheesecake", "desc": "Whole freshly baked Lotus Biscoff cheesecake, perfect for celebrations." },
      "de": { "name": "Ganze Lotus Biscoff Cheesecake", "desc": "Ganze frisch gebackene Lotus Biscoff Torte für besondere Anlässe." },
      "ru": { "name": "Целый Чизкейк с Лотус Бискофф", "desc": "Целый свежеиспеченный чизкейк с Lotus Biscoff для праздников." },
      "nl": { "name": "Hele Lotus Biscoff Cheesecake", "desc": "Hele vers gebakken Lotus Biscoff cheesecake taart voor feesten." },
      "sv": { "name": "Hel Lotus Biscoff Cheesecake", "desc": "Hel nybakad Lotus Biscoff cheesecake-tårta för speciella stunder." },
      "no": { "name": "Hel Lotus Biscoff Cheesecake", "desc": "Hel fersk bakt Lotus Biscoff ostekake for feiring." },
      "fi": { "name": "Kokonainen Lotus Biscoff Juustokakku", "desc": "Kokonainen tuore Lotus Biscoff juustokakku juhliin." },
      "pl": { "name": "Cały Sernik z Lotus Biscoff", "desc": "Cały pieczony sernik z kremem Lotus Biscoff na przyjęcia." },
      "ar": { "name": "تشيز كيك اللوتس (قالب كامل)", "desc": "قالب كامل طازج ومخبوز من تشيز كيك اللوتس بيسكوف للمناسبات والاحتفالات." }
  },
  "Limonlu Cheesecake": {
      "tr": { "name": "Limonlu Cheesecake", "desc": "Kadifemsi fırınlanmış cheesecake, taze ev yapımı limon sosu ve limon kabuğu rendesiyle." },
      "en": { "name": "Lemon Cheesecake", "desc": "Velvety baked cheesecake topped with fresh homemade zesty lemon curd and zest." },
      "de": { "name": "Zitronen Cheesecake", "desc": "Samtiger gebackener Cheesecake verfeinert mit frischer hausgemachter Zitronencreme." },
      "ru": { "name": "Лимонный Чизкейк", "desc": "Бархатистый запеченный чизкейк со свежим домашним лимонным соусом и цедрой." },
      "nl": { "name": "Citroen Cheesecake", "desc": "Fluweelzachte gebakken cheesecake met verse huisgemaakte citroen curd." },
      "sv": { "name": "Citron Cheesecake", "desc": "Krämig ugnsbakad cheesecake toppad med hemlagad fräsch citronkräm." },
      "no": { "name": "Sitron Cheesecake", "desc": "Kremet bakt ostekake toppet med hjemmelaget frisk sitronkrem." },
      "fi": { "name": "Sitruuna Juustokakku", "desc": "Samettinen paistettu juustokakku tuoreella kotitekoisella sitruunatahnalla." },
      "pl": { "name": "Sernik Cytrynowy", "desc": "Aksamitny pieczony sernik z domowym świeżym kremem cytrynowym." },
      "ar": { "name": "تشيز كيك الليمون", "desc": "تشيز كيك مخملي مخبوز مغطى بصوص الليمون الطازج المنعش وبشر الليمون." }
  },
  "Lotuslu Cheesecake": {
      "tr": { "name": "Lotuslu Cheesecake", "desc": "Karamelize bisküvi tabanı, ipeksi peynir kreması ve akışkan Lotus Biscoff kreması ile." },
      "en": { "name": "Lotus Biscoff Cheesecake", "desc": "Caramelized biscuit crust, silky cream cheese layer topped with luscious Lotus Biscoff spread." },
      "de": { "name": "Lotus Biscoff Cheesecake", "desc": "Karamellisierter Keksboden, cremige Frischkäseschicht und geschmolzene Lotus Biscoff Creme." },
      "ru": { "name": "Чизкейк с Лотус Бискофф", "desc": "Карамелизированная бисквитная основа, нежный крем-чиз и глазурь из крема Lotus Biscoff." },
      "nl": { "name": "Lotus Biscoff Cheesecake", "desc": "Gekaramelliseerde koekjesbodem, zijdezachte roomkaas en vloeibare Lotus Biscoff spread." },
      "sv": { "name": "Lotus Biscoff Cheesecake", "desc": "Karamelliserad kexbotten, silkeslen färskost och smält Lotus Biscoff kräm." },
      "no": { "name": "Lotus Biscoff Cheesecake", "desc": "Karamellisert kjeksbunn, silkemyk kremost og flytende Lotus Biscoff krem." },
      "fi": { "name": "Lotus Biscoff Juustokakku", "desc": "Karamellisoitu keksipohja, silkkisen pehmeä tuorejuustotäyte ja juokseva Lotus Biscoff -levite." },
      "pl": { "name": "Sernik z Lotus Biscoff", "desc": "Karmelizowany spód ciasteczkowy, aksamitna masa serowa i krem Lotus Biscoff." },
      "ar": { "name": "تشيز كيك اللوتس", "desc": "قاعدة بسكويت بالكراميل مع طبقة جبنة كريمية غنية وصوص لوتس بيسكوف المنساب." }
  },
  "Bardakta Waffle": {
      "tr": { "name": "Bardakta Waffle", "desc": "Özel waffle lokmaları, akışkan Belçika çikolatası ve taze meyve dilimleriyle pratik bardak sunumu." },
      "en": { "name": "Waffle in a Cup", "desc": "Crispy waffle bites served in a cup with warm Belgian chocolate and fresh fruits." },
      "de": { "name": "Waffel im Becher", "desc": "Knusprige Waffelstücke im Becher mit warmer belgischer Schokolade und frischen Früchten." },
      "ru": { "name": "Вафли в Стаканчике", "desc": "Хрустящие кусочки вафель в стаканчике с бельгийским шоколадом и свежими фруктами." },
      "nl": { "name": "Wafel in een Beker", "desc": "Krokante wafelstukjes in een beker met warme Belgische chocolade en vers fruit." },
      "sv": { "name": "Våffla i Bägare", "desc": "Frasiga våffelbitar i bägare med varm belgisk choklad och färska frukter." },
      "no": { "name": "Vaffel i Beger", "desc": "Sprø vaffelbiter i beger med varm belgisk sjokolade og frisk frukt." },
      "fi": { "name": "Vohveli Kupissa", "desc": "Rapeita vohvelipaloja kupissa lämpimän belgialaisen suklaan ja hedelmien kera." },
      "pl": { "name": "Gofr w Kubku", "desc": "Chrupiące kawałki gofrów w kubku z ciepłą belgijską czekoladą i owocami." },
      "ar": { "name": "وافل في كوب", "desc": "قطع وافل طازجة ومقرمشة في كوب مع الشوكولاتة البلجيكية الدافئة والفواكه الطازجة." }
  },
  "Waffle Kova": {
      "tr": { "name": "Waffle Kova", "desc": "Bol porsiyon çıtır mini waffle lokmaları, zengin Belçika çikolatası ve taze meyvelerle kova boyu lezzet." },
      "en": { "name": "Waffle Bucket", "desc": "Generous bucket of mini crispy waffle bites loaded with Belgian chocolate and fresh fruits." },
      "de": { "name": "Waffel Eimer", "desc": "Große Portion knusprige Mini-Waffeln im Eimer mit reichlich belgischer Schokolade und Früchten." },
      "ru": { "name": "Ведерко Вафель", "desc": "Большая порция хрустящих мини-вафель в ведерке с бельгийским шоколадом и фруктами." },
      "nl": { "name": "Wafel Emmer", "desc": "Royale emmer knapperige mini-wafels overgoten met Belgische chocolade en vers fruit." },
      "sv": { "name": "Våffelhink", "desc": "Riklig hink med frasiga minivåfflor dränkta i belgisk choklad och färsk frukt." },
      "no": { "name": "Vaffelbøtte", "desc": "Rik porsjon med sprø minivafler toppet med belgisk sjokolade og frisk frukt." },
      "fi": { "name": "Vohveliämpäri", "desc": "Runsaskokoinen ämpärillinen rapeita minivohveleita belgialaisella suklaalla ja hedelmillä." },
      "pl": { "name": "Kubełek Gofrów", "desc": "Duży kubełek chrupiących mini gofrów polanych belgijską czekoladą ze świeżymi owocami." },
      "ar": { "name": "دلو الوافل", "desc": "دلو عائلي غني بقطع الميني وافل المقرمشة مغطاة بالشوكولاتة البلجيكية الغنية والفواكه الطازجة." }
  },
  "Kovada Waffle": {
      "tr": { "name": "Kovada Waffle", "desc": "Bol porsiyon çıtır mini waffle lokmaları, zengin Belçika çikolatası ve taze meyvelerle kova boyu lezzet." },
      "en": { "name": "Waffle Bucket", "desc": "Generous bucket of mini crispy waffle bites loaded with Belgian chocolate and fresh fruits." },
      "de": { "name": "Waffel Eimer", "desc": "Große Portion knusprige Mini-Waffeln im Eimer mit reichlich belgischer Schokolade und Früchten." },
      "ru": { "name": "Ведерко Вафель", "desc": "Большая порция хрустящих мини-вафель в ведерке с бельгийским шоколадом и фруктами." },
      "nl": { "name": "Wafel Emmer", "desc": "Royale emmer knapperige mini-wafels overgoten met Belgische chocolade en vers fruit." },
      "sv": { "name": "Våffelhink", "desc": "Riklig hink med frasiga minivåfflor dränkta i belgisk choklad och färsk frukt." },
      "no": { "name": "Vaffelbøtte", "desc": "Rik porsjon med sprø minivafler toppet med belgisk sjokolade og frisk frukt." },
      "fi": { "name": "Vohveliämpäri", "desc": "Runsaskokoinen ämpärillinen rapeita minivohveleita belgialaisella suklaalla ja hedelmillä." },
      "pl": { "name": "Kubełek Gofrów", "desc": "Duży kubełek chrupiących mini gofrów polanych belgijską czekoladą ze świeżymi owocami." },
      "ar": { "name": "دلو الوافل", "desc": "دلو عائلي غني بقطع الميني وافل المقرمشة مغطاة بالشوكولاتة البلجيكية الغنية والفواكه الطازجة." }
  },
  "San Sebastian Cheesecake": {
      "tr": { "name": "San Sebastian Cheesecake", "desc": "İpeksi kremsi dokusu, karamelize yanık üst kabuğu ve sıcak eritilmiş hakiki Belçika çikolatası eşliğinde." },
      "en": { "name": "San Sebastian Cheesecake", "desc": "Silky creamy texture, caramelized burnt crust, served with warm melted authentic Belgian chocolate." },
      "de": { "name": "San Sebastian Käsekuchen", "desc": "Seidige cremige Textur, karamellisierte verbrannte Kruste, serviert mit warm geschmolzener belgischer Schokolade." },
      "ru": { "name": "Чизкейк Сан-Себастьян", "desc": "Шелковистая нежная текстура, карамелизированная корочка и теплый бельгийский шоколад." },
      "nl": { "name": "San Sebastian Cheesecake", "desc": "Zijdezachte romige textuur, gekaramelliseerde korst, geserveerd met warme gesmolten Belgische chocolade." },
      "sv": { "name": "San Sebastian Cheesecake", "desc": "Silkeslen krämig konsistens, karamelliserad bränd yta, serveras med varm smält belgisk choklad." },
      "no": { "name": "San Sebastian Ostekake", "desc": "Silkemyk kremet konsistens, karamellisert skorpe, servert med varm smeltet belgisk sjokolade." },
      "fi": { "name": "San Sebastian Juustokakku", "desc": "Silkkisen kermainen rakenne, karamellisoitu paahdettu kuori, tarjoillaan lämpimän belgialaisen suklaan kera." },
      "pl": { "name": "Sernik Baskijski San Sebastian", "desc": "Aksamitna kremowa konsystencja, karmelizowany wierzch, podawany z ciepłą belgijską czekoladą." },
      "ar": { "name": "تشيز كيك سان سيباستيان", "desc": "قوام كريمي حريري مع طبقة مكرملة مخبوزة بعناية، تقدم مع الشوكولاتة البلجيكية الدافئة الذائبة." }
  },
  "San Sebastian Cheesecake (Dilim)": {
      "tr": { "name": "San Sebastian Cheesecake (Dilim)", "desc": "İpeksi kremsi dokusu, karamelize yanık üst kabuğu ve isteğe göre sıcak eritilmiş Belçika çikolatası eşliğinde tek kişilik dilim." },
      "en": { "name": "San Sebastian Cheesecake (Slice)", "desc": "Silky creamy single slice with a caramelized burnt crust and warm melted Belgian chocolate." },
      "de": { "name": "San Sebastian Käsekuchen (Stück)", "desc": "Einzelstück mit seidig-cremiger Textur, karamellisierter Kruste und warmer belgischer Schokolade." },
      "ru": { "name": "Чизкейк Сан-Себастьян (Кусочек)", "desc": "Порционный кусочек шелковистого чизкейка с карамелизированной корочкой и бельгийским шоколадом." },
      "nl": { "name": "San Sebastian Cheesecake (Punt)", "desc": "Verse punt fluweelzachte cheesecake met gekaramelliseerde korst en warme Belgische chocolade." },
      "sv": { "name": "San Sebastian Cheesecake (Bitar)", "desc": "Portionsbit med silkeslen konsistens, karamelliserad yta och varm belgisk choklad." },
      "no": { "name": "San Sebastian Ostekake (Skive)", "desc": "Porsjonsbit med silkemyk konsistens og karamellisert skorpe servert med varm belgisk sjokolade." },
      "fi": { "name": "San Sebastian Juustokakku (Pala)", "desc": "Tuore annospala silkkistä juustokakkua karamellisoidulla kuorella ja belgialaisella suklaalla." },
      "pl": { "name": "Sernik Baskijski San Sebastian (Kawałek)", "desc": "Kawałek kremowego sernika baskijskiego z przypieczonym wierzchem i ciepłą belgijską czekoladą." },
      "ar": { "name": "تشيز كيك سان سيباستيان (شريحة)", "desc": "شريحة فردية طازجة من التشيز كيك الباسكي المخملي المخبوز مع الشوكولاتة البلجيكية الدافئة." }
  },
  "San Sebastian Cheesecake (Bütün)": {
      "tr": { "name": "San Sebastian Cheesecake (Bütün)", "desc": "Özel günler ve kutlamalar için bütün servis taze fırınlanmış kremsi San Sebastian Cheesecake." },
      "en": { "name": "Whole San Sebastian Cheesecake", "desc": "Whole freshly baked San Sebastian cheesecake, perfect for celebrations and sharing." },
      "de": { "name": "Ganze San Sebastian Käsekuchen", "desc": "Ganze frisch gebackene San Sebastian Torte für besondere Anlässe." },
      "ru": { "name": "Целый Чизкейк Сан-Себастьян", "desc": "Целый свежеиспеченный чизкейк Сан-Себастьян для праздников и торжеств." },
      "nl": { "name": "Hele San Sebastian Cheesecake", "desc": "Hele vers gebakken San Sebastian cheesecake taart voor speciale gelegenheden." },
      "sv": { "name": "Hel San Sebastian Cheesecake", "desc": "Hel nybakad San Sebastian cheesecake-tårta för firande och fest." },
      "no": { "name": "Hel San Sebastian Ostekake", "desc": "Hel fersk bakt San Sebastian ostekake til selskap og feiring." },
      "fi": { "name": "Kokonainen San Sebastian Juustokakku", "desc": "Kokonainen tuore San Sebastian juustokakku juhliin ja jaettavaksi." },
      "pl": { "name": "Cały Sernik Baskijski San Sebastian", "desc": "Cały świeżo upieczony sernik baskijski idealny na imprezy i uroczystości." },
      "ar": { "name": "تشيز كيك سان سيباستيان (قالب كامل)", "desc": "قالب كامل فاخر ومخبوز طازجاً من تشيز كيك سان سيباستيان للمناسبات والاحتفالات." }
  }

};

export function getTranslation(lang: Language, key: string, fallback?: string): string {
  const langDict = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.tr;
  return langDict[key] || UI_TRANSLATIONS.tr[key] || fallback || key;
}

export function translateCategory(name: string, lang: Language): string {
  if (lang === "tr") return name;
  const match = CATEGORY_TRANSLATIONS[name];
  if (match && match[lang]) return match[lang];
  return name;
}

export function translateProduct(prod: { name: string; description?: string }, lang: Language): { name: string; description: string } {
  if (lang === "tr") return { name: prod.name, description: prod.description || "" };
  const match = PRODUCT_TRANSLATIONS[prod.name];
  if (match && match[lang]) {
    return {
      name: match[lang].name || prod.name,
      description: match[lang].desc || prod.description || "",
    };
  }
  return { name: prod.name, description: prod.description || "" };
}

export function translateNotice(notice: string, lang: Language): string {
  if (lang === "tr") return notice;
  const n = notice.trim().toUpperCase();
  if (n.includes("10-15 DAKİKA") || n.includes("10-15 MIN")) return getTranslation(lang, "prepTime", notice);
  if (n.includes("GÜNLÜK TAZE ÜRETİLMEKTEDİR") || n.includes("GÜNLÜK TAZE")) return getTranslation(lang, "dailyFresh", notice);
  if (n.includes("SPESİYAL MENÜLER") || n.includes("NOA MENÜLER") || n.includes("ÖZEL FORMÜLLÜ")) return getTranslation(lang, "noaMenusNotice", notice);
  if (n.includes("KALP FORMUNDA") || n.includes("AMORA")) return getTranslation(lang, "amoraNotice", notice);
  if (n.includes("SİLİNDİRİK") || n.includes("ROLL HAMURU")) return getTranslation(lang, "rollNotice", notice);
  if (n.includes("GEOMETRİK") || n.includes("KÜP FORMUNDA")) return getTranslation(lang, "cubeNotice", notice);
  if (n.includes("BURGULU") || n.includes("TWISSY")) return getTranslation(lang, "twissyNotice", notice);
  if (n.includes("BAHÇE MEYVELERİ") || n.includes("DANISH")) return getTranslation(lang, "danishNotice", notice);
  if (n.includes("FRANSIZ TEREYAĞI") || n.includes("HER GÜN TAZE PİŞİRİLMEKTEDİR") || n.includes("PASTACI KREMASI")) return getTranslation(lang, "classicCroissantNotice", notice);
  return getTranslation(lang, notice, notice);
}

export function translateLoyaltyRewardName(rewardName: string, lang: Language): string {
  if (!rewardName) return getTranslation(lang, "rewardCoffeeName", "Hediye Kahve");
  const clean = rewardName
    .replace(/^1\s*adet\s*/i, "")
    .replace(/^1\s*/i, "")
    .trim();
  
  if (clean.toLowerCase() === "kahve" || clean.toLowerCase() === "hediye kahve") {
    return getTranslation(lang, "rewardCoffeeName", clean);
  }
  return clean;
}

export function translateLoyaltyHistory(desc: string, language: Language): string {
  if (!desc) return "";
  const lang = language || "tr";
  if (lang === "tr") return desc;

  // Clean icons / emojis
  const clean = desc
    .replace(/NOA Sadakat Kartı/gi, "NOA LOYALTY CARD")
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, "")
    .trim();

  // Pattern 1: Card creation
  if (clean.includes("oluşturuldu") || clean.includes("NOA LOYALTY CARD")) {
    const cardCreatedMap: Record<Language, string> = {
      tr: "NOA LOYALTY CARD oluşturuldu.",
      en: "NOA Loyalty Card created.",
      de: "NOA Treuekarte erstellt.",
      ru: "Карта лояльности NOA создана.",
      nl: "NOA Spaarkaart aangemaakt.",
      sv: "NOA Stämpelkort skapat.",
      no: "NOA Stempelkort opprettet.",
      fi: "NOA Kahvipassi luotu.",
      pl: "Utworzono kartę lojalnościową NOA.",
      ar: "تم إنشاء بطاقة ولاء نوا."
    };
    return cardCreatedMap[lang] || cardCreatedMap.en;
  }

  // Pattern 2: Stamp earned (+X Damga kazanıldı)
  const stampEarnedMatch = clean.match(/\+(\d+)\s*Damga/i);
  if (stampEarnedMatch) {
    const count = parseInt(stampEarnedMatch[1], 10) || 1;
    const hasReward = clean.toLowerCase().includes("tebrikler") || clean.toLowerCase().includes("kazandınız");
    
    switch (lang) {
      case "en":
        return `+${count} Stamp${count > 1 ? "s" : ""} earned!${hasReward ? " Congratulations! Free reward unlocked!" : ""}`;
      case "de":
        return `+${count} Stempel gesammelt!${hasReward ? " Glückwunsch! Gratis-Prämie erhalten!" : ""}`;
      case "ru":
        return `+${count} штамп(ов) получено!${hasReward ? " Поздравляем с подарком!" : ""}`;
      case "nl":
        return `+${count} Stempel(s) gespaard!${hasReward ? " Gefeliciteerd met uw beloning!" : ""}`;
      case "sv":
        return `+${count} Stämpel/Stämplar erhållna!${hasReward ? " Grattis till din gåva!" : ""}`;
      case "no":
        return `+${count} Stempel mottatt!${hasReward ? " Gratulerer med gratis gave!" : ""}`;
      case "fi":
        return `+${count} Leima(a) ansaittu!${hasReward ? " Onnittelut palkinnosta!" : ""}`;
      case "pl":
        return `+${count} Pieczątka/Pieczątek zdobytych!${hasReward ? " Gratulacje! Zdobyto nagrodę!" : ""}`;
      case "ar":
        return `+${count} أختام تم جمعها!${hasReward ? " تهانينا! حصلت على مكافأة مجانية!" : ""}`;
      default:
        return clean;
    }
  }

  // Pattern 3: Stamp removed (-X Damga silindi)
  const stampRemovedMatch = clean.match(/-(\d+)\s*Damga/i);
  if (stampRemovedMatch) {
    const count = parseInt(stampRemovedMatch[1], 10) || 1;
    switch (lang) {
      case "en":
        return `-${count} Stamp${count > 1 ? "s" : ""} adjusted (Correction).`;
      case "de":
        return `-${count} Stempel korrigiert.`;
      case "ru":
        return `-${count} штамп(ов) скорректировано.`;
      case "nl":
        return `-${count} Stempel(s) gecorrigeerd.`;
      case "sv":
        return `-${count} Stämpel/Stämplar justerade.`;
      case "no":
        return `-${count} Stempel korrigert.`;
      case "fi":
        return `-${count} Leima(a) korjattu.`;
      case "pl":
        return `-${count} Pieczątka/Pieczątek skorygowanych.`;
      case "ar":
        return `-${count} أختام تم تعديلها.`;
      default:
        return clean;
    }
  }

  // Pattern 4: Reward redeemed (Hediye kahve kasada teslim alındı)
  if (clean.toLowerCase().includes("hediye") && (clean.toLowerCase().includes("teslim") || clean.toLowerCase().includes("kullanıldı"))) {
    const redeemedMap: Record<Language, string> = {
      tr: "1 Adet Hediye Kahve kasada teslim alındı. Afiyet olsun!",
      en: "1 Complimentary Coffee claimed at cashier. Enjoy!",
      de: "1 Gratis-Kaffee an der Kasse eingelöst. Guten Appetit!",
      ru: "1 бесплатный кофе получен на кассе. Приятного аппетита!",
      nl: "1 Gratis koffie verzilverd bij de kassa. Geniet ervan!",
      sv: "1 Gratis kaffe inlöst i kassan. Smaklig måltid!",
      no: "1 Gratis kaffe innløst i kassen. Kos deg!",
      fi: "1 Ilmainen kahvi lunastettu kassalla. Nauti!",
      pl: "Odebrano 1 darmową kawę przy kasie. Smacznego!",
      ar: "تم استلام قهوة مجانية واحدة عند الكاشير. بالعافية!"
    };
    return redeemedMap[lang] || redeemedMap.en;
  }

  return clean;
}

export const OPTION_GROUP_TRANSLATIONS: Record<string, Record<Language, string>> = {
  "yaninda_iyi_gider": {
    "tr": "Yanında İyi Gider",
    "en": "Pairs Well With",
    "de": "Passt gut dazu",
    "ru": "Идеально сочетается с",
    "nl": "Past goed bij",
    "sv": "Passar bra till",
    "no": "Passer godt til",
    "fi": "Sopii hyvin yhteen",
    "pl": "Doskonale pasuje do",
    "ar": "يناسب تماماً مع"
  },
  "dolgu_secimi": {
    "tr": "Dolgu Seçimi",
    "en": "Filling Selection",
    "de": "Füllungsauswahl",
    "ru": "Выбор начинки",
    "nl": "Vulling Keuze",
    "sv": "Val av fyllning",
    "no": "Valg av fylling",
    "fi": "Täytteen valinta",
    "pl": "Wybór nadzienia",
    "ar": "اختيار الحشوة"
  },
  "cikolata_secimi": {
    "tr": "Çikolata Seçimi",
    "en": "Chocolate Selection",
    "de": "Schokoladenauswahl",
    "ru": "Выбор шоколада",
    "nl": "Chocolade Keuze",
    "sv": "Val av choklad",
    "no": "Valg av sjokolade",
    "fi": "Suklaan valinta",
    "pl": "Wybór czekolady",
    "ar": "اختيار الشوكولاتة"
  },
  "meyve_secimi": {
    "tr": "Meyve Seçimi",
    "en": "Fruit Selection",
    "de": "Fruchtauswahl",
    "ru": "Выбор фруктов",
    "nl": "Fruit Keuze",
    "sv": "Val av frukt",
    "no": "Valg av frukt",
    "fi": "Hedelmien valinta",
    "pl": "Wybór owoców",
    "ar": "اختيار الفواكه"
  },
  "ekstra_malzemeler": {
    "tr": "Ekstra Malzemeler",
    "en": "Extra Toppings & Add-ons",
    "de": "Zusätzliche Zutaten",
    "ru": "Дополнительные ингредиенты",
    "nl": "Extra Toppings",
    "sv": "Extra tillbehör",
    "no": "Ekstra tilbehør",
    "fi": "Lisätäytteet",
    "pl": "Dodatkowe składniki",
    "ar": "إضافات إضافية"
  },
  "sut_secimi": {
    "tr": "Süt Seçimi",
    "en": "Milk Preference",
    "de": "Milchauswahl",
    "ru": "Выбор молока",
    "nl": "Melk Keuze",
    "sv": "Val av mjölk",
    "no": "Valg av melk",
    "fi": "Maidon valinta",
    "pl": "Wybór mleka",
    "ar": "نوع الحليب"
  },
  "surup_secimi": {
    "tr": "Şurup / Aroma Seçimi",
    "en": "Syrup & Flavor",
    "de": "Sirup & Aroma",
    "ru": "Выбор сиропа",
    "nl": "Siroop & Smaak",
    "sv": "Sirap & Smaksättning",
    "no": "Sirup & Smakstilsetning",
    "fi": "Siirappi & Maku",
    "pl": "Syrop & Aromat",
    "ar": "اختيار النكهة والسيروب"
  },
  "ic_dolgu_cikolata_secimi": {
    "tr": "İç Dolgu Çikolata Seçimi",
    "en": "Choose Your Chocolate Filling",
    "de": "Wählen Sie Ihre Schokoladenfüllung",
    "ru": "Выберите шоколадную начинку",
    "nl": "Kies Je Chocoladevulling",
    "sv": "Välj Din Chokladfyllning",
    "no": "Velg Din Sjokoladefyll",
    "fi": "Valitse Suklaatäyte",
    "pl": "Wybierz Nadzienie Czekoladowe",
    "ar": "اختر حشوة الشوكولاتة"
  },
  "ikram_cay": {
    "tr": "İkram Çay",
    "en": "Complimentary Tea",
    "de": "Gratis Tee",
    "ru": "Бесплатный чай",
    "nl": "Gratis Thee",
    "sv": "Gratis Te",
    "no": "Gratis Te",
    "fi": "Ilmainen Tee",
    "pl": "Darmowa Herbata",
    "ar": "شاي مجاني"
  },
  "kruvasan_secimi": {
    "tr": "Kruvasan Seçimi",
    "en": "Croissant Selection",
    "de": "Croissant-Auswahl",
    "ru": "Выбор круассана",
    "nl": "Croissant Keuze",
    "sv": "Val av croissant",
    "no": "Valg av croissant",
    "fi": "Croissantin valinta",
    "pl": "Wybór Croissanta",
    "ar": "اختيار الكرواسون"
  },
  "ic_malzeme_secimi": {
    "tr": "İç Malzeme Seçimi",
    "en": "Filling Selection",
    "de": "Zutaten-Auswahl",
    "ru": "Выбор начинки",
    "nl": "Vulling Keuze",
    "sv": "Val av fyllning",
    "no": "Valg av fylling",
    "fi": "Täytteen valinta",
    "pl": "Wybór Nadzienia",
    "ar": "اختيار الحشوة"
  },
  "dis_dolgu_cikolata_secimi": {
    "tr": "Dış Dolgu Çikolata Seçimi",
    "en": "Chocolate Topping Selection",
    "de": "Schokoladenglasur-Auswahl",
    "ru": "Выбор шоколадной глазури",
    "nl": "Chocolade Topping Keuze",
    "sv": "Val av chokladgarnering",
    "no": "Valg av sjokoladetopping",
    "fi": "Suklaakuorrutteen valinta",
    "pl": "Wybór Polewy Czekoladowej",
    "ar": "اختيار تغطية الشوكولاتة"
  },
  "krema_secimi": {
    "tr": "Krema Seçimi",
    "en": "Cream Selection",
    "de": "Creme-Auswahl",
    "ru": "Выбор крема",
    "nl": "Crème Keuze",
    "sv": "Val av kräm",
    "no": "Valg av krem",
    "fi": "Kreemin valinta",
    "pl": "Wybór Kremu",
    "ar": "اختيار الكريمة"
  },
  "ekstra_ic_malzeme": {
    "tr": "Ekstra İç Malzeme",
    "en": "Extra Filling Ingredients",
    "de": "Zusätzliche Zutaten",
    "ru": "Дополнительная начинка",
    "nl": "Extra Vulling",
    "sv": "Extra Fyllning",
    "no": "Ekstra Fylling",
    "fi": "Lisätäytteet",
    "pl": "Dodatkowe Nadzienie",
    "ar": "حشوة إضافية"
  },
  "sos_secimi": {
    "tr": "Sos Seçimi",
    "en": "Sauce Selection",
    "de": "Saucen-Auswahl",
    "ru": "Выбор соуса",
    "nl": "Saus Keuze",
    "sv": "Val av sås",
    "no": "Valg av saus",
    "fi": "Kastikkeen valinta",
    "pl": "Wybór Sosu",
    "ar": "اختيار الصوص"
  },
  "ekstra_sos_secimi": {
    "tr": "Ekstra Sos Seçimi",
    "en": "Extra Sauce Selection",
    "de": "Zusätzliche Sauce",
    "ru": "Выбор дополнительного соуса",
    "nl": "Extra Saus Keuze",
    "sv": "Val av extra sås",
    "no": "Valg av ekstra saus",
    "fi": "Lisäkastikkeen valinta",
    "pl": "Wybór Dodatkowego Sosu",
    "ar": "اختيار صوص إضافي"
  },
  "porsiyon_boyut_secimi": {
    "tr": "Porsiyon / Boyut Seçimi",
    "en": "Portion & Size Selection",
    "de": "Portions- & Größenauswahl",
    "ru": "Выбор порции и размера",
    "nl": "Portie & Grootte Keuze",
    "sv": "Val av portion och storlek",
    "no": "Valg av porsjon og størrelse",
    "fi": "Annoksen ja koon valinta",
    "pl": "Wybór Porcji i Rozmiaru",
    "ar": "اختيار الحجم والحصة"
  },
  "porsiyon_kisi_sayisi": {
    "tr": "Porsiyon / Kişi Sayısı",
    "en": "Portion / Servings",
    "de": "Portion / Personenzahl",
    "ru": "Порция / Количество персон",
    "nl": "Portie / Aantal Personen",
    "sv": "Portion / Antal personer",
    "no": "Porsjon / Antall personer",
    "fi": "Annos / Henkilömäärä",
    "pl": "Porcja / Liczba Osób",
    "ar": "الحصة / عدد الأشخاص"
  },
  "aroma_secimi": {
    "tr": "Aroma Seçimi",
    "en": "Flavor Selection",
    "de": "Aromenauswahl",
    "ru": "Выбор вкуса",
    "nl": "Smaakkeuze",
    "sv": "Smakval",
    "no": "Smaksvalg",
    "fi": "Maun valinta",
    "pl": "Wybór Smaku",
    "ar": "اختيار النكهة"
  },
  "meyve_suyu_cesidi": {
    "tr": "Meyve Suyu Çeşidi",
    "en": "Juice Flavor",
    "de": "Saftsorte",
    "ru": "Вкус сока",
    "nl": "Sapsmaak",
    "sv": "Juicesort",
    "no": "Juicetype",
    "fi": "Mehuvaihtoehto",
    "pl": "Rodzaj Soku",
    "ar": "نوع العصير"
  },
  "espresso_secimi": {
    "tr": "Espresso Seçimi",
    "en": "Espresso Shot Selection",
    "de": "Espresso-Auswahl",
    "ru": "Выбор эспрессо",
    "nl": "Espresso Keuze",
    "sv": "Val av espresso",
    "no": "Valg av espresso",
    "fi": "Espresson valinta",
    "pl": "Wybór Espresso",
    "ar": "نوع الإسبريسو"
  },
  "bardak_porsiyon_secimi": {
    "tr": "Bardak / Porsiyon Seçimi",
    "en": "Cup & Serving Selection",
    "de": "Tassen- / Portionsauswahl",
    "ru": "Выбор чашки / порции",
    "nl": "Beker / Portie Keuze",
    "sv": "Val av kopp / portion",
    "no": "Valg av kopp / porsjon",
    "fi": "Kupin / annoksen valinta",
    "pl": "Wybór Kubka / Porcji",
    "ar": "اختيار الكوب والحصة"
  },
  "noa_special_icecek_secimi": {
    "tr": "NOA Special İçecek Seçimi",
    "en": "NOA Special Drink Selection",
    "de": "NOA Spezial-Getränkeauswahl",
    "ru": "Выбор фирменного напитка NOA",
    "nl": "NOA Special Drankkeuze",
    "sv": "NOA Special Dryckesval",
    "no": "NOA Special Drikkevalg",
    "fi": "NOA Special Juomavalinta",
    "pl": "Wybór Napoju NOA Special",
    "ar": "اختيار مشروب نوآ الخاص"
  },
  "1_noa_special_icecek_secimi": {
    "tr": "1. NOA Special İçecek Seçimi",
    "en": "1st NOA Special Drink Selection",
    "de": "1. NOA Spezial-Getränkeauswahl",
    "ru": "1. Выбор фирменного напитка NOA",
    "nl": "1e NOA Special Drankkeuze",
    "sv": "1. NOA Special Dryckesval",
    "no": "1. NOA Special Drikkevalg",
    "fi": "1. NOA Special Juomavalinta",
    "pl": "1. Wybór Napoju NOA Special",
    "ar": "1. اختيار مشروب نوآ الخاص"
  },
  "2_noa_special_icecek_secimi": {
    "tr": "2. NOA Special İçecek Seçimi",
    "en": "2nd NOA Special Drink Selection",
    "de": "2. NOA Spezial-Getränkeauswahl",
    "ru": "2. Выбор фирменного напитка NOA",
    "nl": "2e NOA Special Drankkeuze",
    "sv": "2. NOA Special Dryckesval",
    "no": "2. NOA Special Drikkevalg",
    "fi": "2. NOA Special Juomavalinta",
    "pl": "2. Wybór Napoju NOA Special",
    "ar": "2. اختيار مشروب نوآ الخاص"
  },
  "dondurma_porsiyon": {
    "tr": "Porsiyon Seçimi",
    "en": "Portion Selection",
    "de": "Portionsauswahl",
    "ru": "Выбор порции",
    "nl": "Portiekeuze",
    "sv": "Portionsstorlek",
    "no": "Porsjonsstørrelse",
    "fi": "Annoksen koko",
    "pl": "Wybór Porcji",
    "ar": "اختيار الحصة"
  },
  "tatli_kruvasan_secimi": {
    "tr": "Kruvasan Seçimi",
    "en": "Croissant Type",
    "de": "Croissant-Art",
    "ru": "Тип круассана",
    "nl": "Croissant Type",
    "sv": "Croissanttyp",
    "no": "Croissanttype",
    "fi": "Croissanttyyppi",
    "pl": "Rodzaj Croissanta",
    "ar": "نوع الكرواسون"
  },
  "buz_secimi": {
    "tr": "Buz Seçimi",
    "en": "Ice Level",
    "de": "Eis-Menge",
    "ru": "Количество льда",
    "nl": "Hoeveelheid IJs",
    "sv": "Ismängd",
    "no": "Ismengde",
    "fi": "Jään määrä",
    "pl": "Ilość lodu",
    "ar": "مستوى الثلج"
  }
};

export function translateOptionGroup(name: string, lang: Language): string {
  if (lang === "tr") return name;
  const lower = name.toLowerCase().replace(/[\s\-_/]+/g, "_");
  for (const [k, v] of Object.entries(OPTION_GROUP_TRANSLATIONS)) {
    if (lower.includes(k) || k.includes(lower)) {
      return v[lang] || name;
    }
  }
  return name;
}

export const OPTION_ITEM_TRANSLATIONS: Record<string, Record<Language, string>> = {
  "1 Kişilik": {
    "tr": "1 Kişilik",
    "en": "1 Person",
    "de": "1 Person",
    "ru": "1 персона",
    "nl": "1 persoon",
    "sv": "1 person",
    "no": "1 person",
    "fi": "1 henkilö",
    "pl": "1 osoba",
    "ar": "شخص واحد"
  },
  "2 Kişilik": {
    "tr": "2 Kişilik",
    "en": "2 People",
    "de": "2 Personen",
    "ru": "2 персоны",
    "nl": "2 personen",
    "sv": "2 personer",
    "no": "2 personer",
    "fi": "2 henkilöä",
    "pl": "2 osoby",
    "ar": "شخصان"
  },
  "Sade Kruvasan": {
    "tr": "Sade Kruvasan",
    "en": "Plain Butter Croissant",
    "de": "Buttercroissant",
    "ru": "Классический круассан",
    "nl": "Klassieke Croissant",
    "sv": "Klassisk Croissant",
    "no": "Klassisk Croissant",
    "fi": "Perinteinen Croissant",
    "pl": "Klasyczny Croissant",
    "ar": "كرواسون سادة"
  },
  "Pain au Chocolat": {
    "tr": "Pain au Chocolat",
    "en": "Pain au Chocolat",
    "de": "Pain au Chocolat",
    "ru": "Пэн-о-шоколя",
    "nl": "Pain au Chocolat",
    "sv": "Pain au Chocolat",
    "no": "Pain au Chocolat",
    "fi": "Pain au Chocolat",
    "pl": "Pain au Chocolat",
    "ar": "بان أو شوكولا"
  },
  "Pain Suisse": {
    "tr": "Pain Suisse",
    "en": "Pain Suisse",
    "de": "Pain Suisse",
    "ru": "Пэн сюисс",
    "nl": "Pain Suisse",
    "sv": "Pain Suisse",
    "no": "Pain Suisse",
    "fi": "Pain Suisse",
    "pl": "Pain Suisse",
    "ar": "بان سويس"
  },
  "Çay istemiyorum": {
    "tr": "Çay istemiyorum",
    "en": "No tea requested",
    "de": "Kein Tee gewünscht",
    "ru": "Без чая",
    "nl": "Geen thee gewenst",
    "sv": "Inget te önskas",
    "no": "Ingen te ønskes",
    "fi": "Ei teetä",
    "pl": "Bez herbaty",
    "ar": "لا أريد شاي"
  },
  "1 Adet Sıcak Çay": {
    "tr": "1 Adet Sıcak Çay",
    "en": "1 Hot Turkish Tea",
    "de": "1 Heißer Tee",
    "ru": "1 Горячий чай",
    "nl": "1 Warme Thee",
    "sv": "1 Varmt Te",
    "no": "1 Varm Te",
    "fi": "1 Kuuma Tee",
    "pl": "1 Gorąca Herbata",
    "ar": "1 شاي ساخن"
  },
  "1 Top Dondurma": {
    "tr": "1 Top Dondurma",
    "en": "1 Scoop Gelato",
    "de": "1 Kugel Eis",
    "ru": "1 Шарик мороженого",
    "nl": "1 Bolletje IJs",
    "sv": "1 Kula Glass",
    "no": "1 Kule Is",
    "fi": "1 Pallo Jäätelöä",
    "pl": "1 Gałka Lodów",
    "ar": "كرة آيس كريم واحدة"
  },
  "El Yapımı Limonata": {
    "tr": "El Yapımı Limonata",
    "en": "Handcrafted Lemonade",
    "de": "Hausgemachte Limonade",
    "ru": "Домашний лимонад",
    "nl": "Huisgemaakte Limonade",
    "sv": "Hemgjord Lemonad",
    "no": "Hjemmelaget Limonade",
    "fi": "Kotitekoinen Limonadi",
    "pl": "Domowa Lemoniada",
    "ar": "ليموناضة يدوية الصنع"
  },
  "El Yapımı Çilekli Limonata": {
    "tr": "El Yapımı Çilekli Limonata",
    "en": "Handcrafted Strawberry Lemonade",
    "de": "Hausgemachte Erdbeerlimonade",
    "ru": "Домашний клубничный лимонад",
    "nl": "Huisgemaakte Aardbeienlimonade",
    "sv": "Hemgjord Jordgubbslemonad",
    "no": "Hjemmelaget Jordbærlimonade",
    "fi": "Kotitekoinen Mansikkalimonadi",
    "pl": "Domowa Lemoniada Truskawkowa",
    "ar": "ليموناضة الفراولة اليدوية"
  },
  "Taze Sıkma Nar Suyu": {
    "tr": "Taze Sıkma Nar Suyu",
    "en": "Fresh Pomegranate Juice",
    "de": "Frischer Granatapfelsaft",
    "ru": "Свежевыжатый гранатовый сок",
    "nl": "Verse Granaatappelsap",
    "sv": "Färsk Granatäppeljuice",
    "no": "Fersk Granateplejuice",
    "fi": "Tuore Granaattiomenamehu",
    "pl": "Świeży Sok z Granatu",
    "ar": "عصير رمان طازج"
  },
  "Caramel Macchiato": {
    "tr": "Caramel Macchiato",
    "en": "Caramel Macchiato",
    "de": "Karamell Macchiato",
    "ru": "Карамель Макиато",
    "nl": "Caramel Macchiato",
    "sv": "Caramel Macchiato",
    "no": "Karamell Macchiato",
    "fi": "Karamelli Macchiato",
    "pl": "Karmelowe Macchiato",
    "ar": "كراميل ماكياتو"
  },
  "Iced Caramel Macchiato": {
    "tr": "Iced Caramel Macchiato",
    "en": "Iced Caramel Macchiato",
    "de": "Iced Karamell Macchiato",
    "ru": "Холодный Карамель Макиато",
    "nl": "Iced Caramel Macchiato",
    "sv": "Isad Caramel Macchiato",
    "no": "Iskaffe Karamell Macchiato",
    "fi": "Jääkaramelli Macchiato",
    "pl": "Mrożone Karmelowe Macchiato",
    "ar": "آيس كراميل ماكياتو"
  },
  "Iced Latte": {
    "tr": "Iced Latte",
    "en": "Iced Latte",
    "de": "Iced Latte",
    "ru": "Айс Латте",
    "nl": "Iced Latte",
    "sv": "Isad Latte",
    "no": "Iskaffe Latte",
    "fi": "Jäälatté",
    "pl": "Mrożone Latte",
    "ar": "آيس لاتيه"
  },
  "Vanilla Latte": {
    "tr": "Vanilla Latte",
    "en": "Vanilla Latte",
    "de": "Vanille Latte",
    "ru": "Ванильный Латте",
    "nl": "Vanille Latte",
    "sv": "Vanilj Latte",
    "no": "Vanilje Latte",
    "fi": "Vaniljalatté",
    "pl": "Waniliowe Latte",
    "ar": "فانيلا لاتيه"
  },
  "Iced Vanilla Latte": {
    "tr": "Iced Vanilla Latte",
    "en": "Iced Vanilla Latte",
    "de": "Iced Vanille Latte",
    "ru": "Холодный Ванильный Латте",
    "nl": "Iced Vanille Latte",
    "sv": "Isad Vanilj Latte",
    "no": "Iskaffe Vanilje Latte",
    "fi": "Jäävaniljalatté",
    "pl": "Mrożone Waniliowe Latte",
    "ar": "آيس فانيلا لاتيه"
  },
  "Mocha": {
    "tr": "Mocha",
    "en": "Mocha",
    "de": "Mocha",
    "ru": "Мокка",
    "nl": "Mocha",
    "sv": "Mocha",
    "no": "Mocha",
    "fi": "Mocha",
    "pl": "Mocha",
    "ar": "موكا"
  },
  "Iced Mocha": {
    "tr": "Iced Mocha",
    "en": "Iced Mocha",
    "de": "Iced Mocha",
    "ru": "Холодный Мокка",
    "nl": "Iced Mocha",
    "sv": "Isad Mocha",
    "no": "Iskaffe Mocha",
    "fi": "Jäämocha",
    "pl": "Mrożone Mocha",
    "ar": "آيس موكا"
  },
  "White Chocolate Mocha": {
    "tr": "White Chocolate Mocha",
    "en": "White Chocolate Mocha",
    "de": "Weiße Schokolade Mocha",
    "ru": "Белый Шоколадный Мокка",
    "nl": "Witte Chocolade Mocha",
    "sv": "Vit Choklad Mocha",
    "no": "Hvit Sjokolade Mocha",
    "fi": "Valkosuklaamocha",
    "pl": "Mocha z Białą Czekoladą",
    "ar": "وايت شوكليت موكا"
  },
  "Iced White Chocolate Mocha": {
    "tr": "Iced White Chocolate Mocha",
    "en": "Iced White Chocolate Mocha",
    "de": "Iced Weiße Schokolade Mocha",
    "ru": "Холодный Белый Шоколадный Мокка",
    "nl": "Iced Witte Chocolade Mocha",
    "sv": "Isad Vit Choklad Mocha",
    "no": "Iskaffe Hvit Sjokolade Mocha",
    "fi": "Jäävalkosuklaamocha",
    "pl": "Mrożone Mocha z Białą Czekoladą",
    "ar": "آيس وايت شوكليت موكا"
  },
  "Badem Sütü": {
    "tr": "Badem Sütü",
    "en": "Almond Milk",
    "de": "Mandelmilch",
    "ru": "Миндальное молоко",
    "nl": "Amandelmelk",
    "sv": "Mandelmjölk",
    "no": "Mandelmelk",
    "fi": "Mantelimaito",
    "pl": "Mleko Migdałowe",
    "ar": "حليب اللوز"
  },
  "Yulaf Sütü": {
    "tr": "Yulaf Sütü",
    "en": "Oat Milk",
    "de": "Hafermilch",
    "ru": "Овсяное молоко",
    "nl": "Havermelk",
    "sv": "Havremjölk",
    "no": "Havremelk",
    "fi": "Kauramaito",
    "pl": "Mleko Owsiane",
    "ar": "حليب الشوفان"
  },
  "Soya Sütü": {
    "tr": "Soya Sütü",
    "en": "Soy Milk",
    "de": "Sojamilch",
    "ru": "Соевое молоко",
    "nl": "Sojamelk",
    "sv": "Sojamjölk",
    "no": "Soyamelk",
    "fi": "Soijamaito",
    "pl": "Mleko Sojowe",
    "ar": "حليب الصويا"
  },
  "Laktozsuz Süt": {
    "tr": "Laktozsuz Süt",
    "en": "Lactose-Free Milk",
    "de": "Laktosefreie Milch",
    "ru": "Безлактозное молоко",
    "nl": "Lactosevrije Melk",
    "sv": "Laktosfri Mjölk",
    "no": "Laktosefri Melk",
    "fi": "Laktoositon Maito",
    "pl": "Mleko Bezlaktozowe",
    "ar": "حليب خالي من اللاكتوز"
  },
  "Normal Buz": {
    "tr": "Normal Buz",
    "en": "Regular Ice",
    "de": "Normales Eis",
    "ru": "Стандартный лед",
    "nl": "Normaal IJs",
    "sv": "Normal Is",
    "no": "Normal Is",
    "fi": "Normaali Jää",
    "pl": "Standardowy Lód",
    "ar": "ثلج عادي"
  },
  "Az Buz": {
    "tr": "Az Buz",
    "en": "Less Ice",
    "de": "Wenig Eis",
    "ru": "Меньше льда",
    "nl": "Weinig IJs",
    "sv": "Mindre Is",
    "no": "Mindre Is",
    "fi": "Vähän Jäätä",
    "pl": "Mniej Lodu",
    "ar": "ثلج قليل"
  },
  "Buzsuz": {
    "tr": "Buzsuz",
    "en": "No Ice",
    "de": "Ohne Eis",
    "ru": "Без льда",
    "nl": "Zonder IJs",
    "sv": "Utan Is",
    "no": "Uten Is",
    "fi": "Ei Jäätä",
    "pl": "Bez Lodu",
    "ar": "بدون ثلج"
  },
  "Sütlü Belçika Çikolata": {
    "tr": "Sütlü Belçika Çikolata",
    "en": "Belgian Milk Chocolate",
    "de": "Belgische Vollmilchschokolade",
    "ru": "Бельгийский молочный шоколад",
    "nl": "Belgische Melkchocolade",
    "sv": "Belgisk Mjölkchoklad",
    "no": "Belgisk Melkesjokolade",
    "fi": "Belgialainen Maitosuklaa",
    "pl": "Belgijska Czekolada Mleczna",
    "ar": "شوكولاتة الحليب البلجيكية"
  },
  "Beyaz Belçika Çikolata": {
    "tr": "Beyaz Belçika Çikolata",
    "en": "Belgian White Chocolate",
    "de": "Belgische weiße Schokolade",
    "ru": "Бельгийский белый шоколад",
    "nl": "Belgische Witte Chocolade",
    "sv": "Belgisk Vit Choklad",
    "no": "Belgisk Hvit Sjokolade",
    "fi": "Belgialainen Valkosuklaa",
    "pl": "Belgijska Biała Czekolada",
    "ar": "شوكولاتة بيضاء بلجيكية"
  },
  "Bitter Belçika Çikolata": {
    "tr": "Bitter Belçika Çikolata",
    "en": "Belgian Dark Chocolate",
    "de": "Belgische Zartbitterschokolade",
    "ru": "Бельгийский темный шоколад",
    "nl": "Belgische Pure Chocolade",
    "sv": "Belgisk Mörk Choklad",
    "no": "Belgisk Mørk Sjokolade",
    "fi": "Belgialainen Tumma Suklaa",
    "pl": "Belgijska Ciemna Czekolada",
    "ar": "شوكولاتة داكنة بلجيكية"
  },
  "Nutella": {
    "tr": "Nutella",
    "en": "Nutella",
    "de": "Nutella",
    "ru": "Нутелла",
    "nl": "Nutella",
    "sv": "Nutella",
    "no": "Nutella",
    "fi": "Nutella",
    "pl": "Nutella",
    "ar": "نوتيلا"
  },
  "1 Top": {
    "tr": "1 Top",
    "en": "1 Scoop",
    "de": "1 Kugel",
    "ru": "1 шарик",
    "nl": "1 Bolletje",
    "sv": "1 Kula",
    "no": "1 Kule",
    "fi": "1 Pallo",
    "pl": "1 Gałka",
    "ar": "كرة واحدة"
  },
  "3 Top": {
    "tr": "3 Top",
    "en": "3 Scoops",
    "de": "3 Kugeln",
    "ru": "3 шарика",
    "nl": "3 Bolletjes",
    "sv": "3 Kulor",
    "no": "3 Kuler",
    "fi": "3 Palloa",
    "pl": "3 Gałki",
    "ar": "3 كرات"
  },
  "Roll Kruvasan": {
    "tr": "Roll Kruvasan",
    "en": "Roll Croissant",
    "de": "Roll Croissant",
    "ru": "Ролл-круассан",
    "nl": "Roll Croissant",
    "sv": "Roll Croissant",
    "no": "Roll Croissant",
    "fi": "Rullacroissant",
    "pl": "Roll Croissant",
    "ar": "رول كرواسون"
  },
  "Klasik Kruvasan": {
    "tr": "Klasik Kruvasan",
    "en": "Classic Croissant",
    "de": "Klassisches Croissant",
    "ru": "Классический круассан",
    "nl": "Klassieke Croissant",
    "sv": "Klassisk Croissant",
    "no": "Klassisk Croissant",
    "fi": "Klassinen Croissant",
    "pl": "Klasyczny Croissant",
    "ar": "كرواسون كلاسيكي"
  },
  "Twissy Kruvasan": {
    "tr": "Twissy Kruvasan",
    "en": "Twissy Croissant",
    "de": "Twissy Croissant",
    "ru": "Твисси круассан",
    "nl": "Twissy Croissant",
    "sv": "Twissy Croissant",
    "no": "Twissy Croissant",
    "fi": "Twissy Croissant",
    "pl": "Twissy Croissant",
    "ar": "تويسي كرواسون"
  },
  "Sütlü Çikolata": {
    "tr": "Sütlü Çikolata",
    "en": "Milk Chocolate",
    "de": "Vollmilchschokolade",
    "ru": "Молочный шоколад",
    "nl": "Melkchocolade",
    "sv": "Mjölkchoklad",
    "no": "Melkesjokolade",
    "fi": "Maitosuklaa",
    "pl": "Czekolada Mleczna",
    "ar": "شوكولاتة الحليب"
  },
  "Bitter Çikolata": {
    "tr": "Bitter Çikolata",
    "en": "Dark Chocolate",
    "de": "Zartbitterschokolade",
    "ru": "Темный шоколад",
    "nl": "Pure Chocolade",
    "sv": "Mörk Choklad",
    "no": "Mørk Sjokolade",
    "fi": "Tumma Suklaa",
    "pl": "Ciemna Czekolada",
    "ar": "شوكولاتة داكنة"
  },
  "Beyaz Çikolata": {
    "tr": "Beyaz Çikolata",
    "en": "White Chocolate",
    "de": "Weiße Schokolade",
    "ru": "Белый шоколад",
    "nl": "Witte Chocolade",
    "sv": "Vit Choklad",
    "no": "Hvit Sjokolade",
    "fi": "Valkosuklaa",
    "pl": "Biała Czekolada",
    "ar": "شوكولاتة بيضاء"
  },
  "Çilek": {
    "tr": "Çilek",
    "en": "Strawberry",
    "de": "Erdbeere",
    "ru": "Клубника",
    "nl": "Aardbei",
    "sv": "Jordgubb",
    "no": "Jordbær",
    "fi": "Mansikka",
    "pl": "Truskawka",
    "ar": "فراولة"
  },
  "Muz": {
    "tr": "Muz",
    "en": "Banana",
    "de": "Banane",
    "ru": "Банан",
    "nl": "Banaan",
    "sv": "Banan",
    "no": "Banan",
    "fi": "Banaani",
    "pl": "Banan",
    "ar": "موز"
  },
  "Antep Fıstığı": {
    "tr": "Antep Fıstığı",
    "en": "Pistachio",
    "de": "Pistazie",
    "ru": "Фисташки",
    "nl": "Pistache",
    "sv": "Pistage",
    "no": "Pistasj",
    "fi": "Pistaasi",
    "pl": "Pistacja",
    "ar": "فستق حلبي"
  },
  "Fındık": {
    "tr": "Fındık",
    "en": "Hazelnut",
    "de": "Haselnuss",
    "ru": "Фундук",
    "nl": "Hazelnoot",
    "sv": "Hasselnöt",
    "no": "Hasselnøtt",
    "fi": "Hasselpähkinä",
    "pl": "Orzech Laskowy",
    "ar": "بندق"
  },
  "Lotus": {
    "tr": "Lotus",
    "en": "Lotus Biscoff",
    "de": "Lotus Biscoff",
    "ru": "Печенье Лотус",
    "nl": "Lotus Biscoff",
    "sv": "Lotus Biscoff",
    "no": "Lotus Biscoff",
    "fi": "Lotus Biscoff",
    "pl": "Lotus Biscoff",
    "ar": "لوتس بيسكوف"
  },
  "Küçük Boy": {
    "tr": "Küçük Boy",
    "en": "Small Size",
    "de": "Klein",
    "ru": "Маленький",
    "nl": "Klein",
    "sv": "Liten",
    "no": "Liten",
    "fi": "Pieni",
    "pl": "Mały",
    "ar": "حجم صغير"
  },
  "Orta Boy": {
    "tr": "Orta Boy",
    "en": "Medium Size",
    "de": "Mittel",
    "ru": "Средний",
    "nl": "Middel",
    "sv": "Mellan",
    "no": "Middels",
    "fi": "Keskikokoinen",
    "pl": "Średni",
    "ar": "حجم وسط"
  },
  "Büyük Boy": {
    "tr": "Büyük Boy",
    "en": "Large Size",
    "de": "Groß",
    "ru": "Большой",
    "nl": "Groot",
    "sv": "Stor",
    "no": "Stor",
    "fi": "Suuri",
    "pl": "Duży",
    "ar": "حجم كبير"
  },
  "Single Shot": {
    "tr": "Single Shot",
    "en": "Single Shot",
    "de": "Einfacher Shot",
    "ru": "Одинарный эспрессо",
    "nl": "Enkele Shot",
    "sv": "Enkel Shot",
    "no": "Enkel Shot",
    "fi": "Yksi Shot",
    "pl": "Pojedynczy Shot",
    "ar": "جرعة فردية"
  },
  "Double Shot": {
    "tr": "Double Shot",
    "en": "Double Shot",
    "de": "Doppelter Shot",
    "ru": "Двойной эспрессо",
    "nl": "Dubbele Shot",
    "sv": "Dubbel Shot",
    "no": "Dobbel Shot",
    "fi": "Tupla Shot",
    "pl": "Podwójny Shot",
    "ar": "جرعة مضاعفة"
  },
  "Küçük Çay": {
    "tr": "Küçük Çay",
    "en": "Small Turkish Tea",
    "de": "Kleiner Türkischer Tee",
    "ru": "Маленький чай",
    "nl": "Kleine Thee",
    "sv": "Litet Te",
    "no": "Liten Te",
    "fi": "Pieni Tee",
    "pl": "Mała Herbata",
    "ar": "شاي صغير"
  },
  "Büyük Çay (Fincan)": {
    "tr": "Büyük Çay (Fincan)",
    "en": "Large Tea (Cup)",
    "de": "Großer Tee (Tasse)",
    "ru": "Большой чай (чашка)",
    "nl": "Grote Thee (Mok)",
    "sv": "Stort Te (Kopp)",
    "no": "Stor Te (Kopp)",
    "fi": "Suuri Tee (Kuppi)",
    "pl": "Duża Herbata (Filiżanka)",
    "ar": "شاي كبير (كوب)"
  },
  "Çay İstemiyorum": {
    "tr": "Çay İstemiyorum",
    "en": "No Tea",
    "de": "Kein Tee",
    "ru": "Без чая",
    "nl": "Geen Thee",
    "sv": "Inget Te",
    "no": "Ingen Te",
    "fi": "Ei Teetä",
    "pl": "Bez Herbaty",
    "ar": "بدون شاي"
  },
  "1 Adet Sıcak Çay (Ücretsiz İkram)": {
    "tr": "1 Adet Sıcak Çay (Ücretsiz İkram)",
    "en": "1 Hot Turkish Tea (Free)",
    "de": "1 Heißer Tee (Kostenlos)",
    "ru": "1 Горячий чай (Бесплатно)",
    "nl": "1 Warme Thee (Gratis)",
    "sv": "1 Varmt Te (Gratis)",
    "no": "1 Varm Te (Gratis)",
    "fi": "1 Kuuma Tee (Ilmainen)",
    "pl": "1 Gorąca Herbata (Gratis)",
    "ar": "1 شاي ساخن (مجاناً)"
  },
  "İç Dolgu Çikolata İstemiyorum": {
    "tr": "İç Dolgu Çikolata İstemiyorum",
    "en": "No Chocolate Filling",
    "de": "Keine Schokoladenfüllung",
    "ru": "Без шоколадной начинки",
    "nl": "Geen Chocoladevulling",
    "sv": "Ingen Chokladfyllning",
    "no": "Ingen Sjokoladefyll",
    "fi": "Ei Suklaatäytettä",
    "pl": "Bez Nadzienia Czekoladowego",
    "ar": "بدون حشوة شوكولاتة"
  },
  "İç Malzeme İstemiyorum": {
    "tr": "İç Malzeme İstemiyorum",
    "en": "No Filling Ingredients",
    "de": "Keine Zutaten",
    "ru": "Без начинки",
    "nl": "Geen Vulling",
    "sv": "Inga Fyllningar",
    "no": "Ingen Fylling",
    "fi": "Ei Täytteitä",
    "pl": "Bez Dodatków",
    "ar": "بدون حشوة"
  },
  "Dış Dolgu Çikolata İstemiyorum": {
    "tr": "Dış Dolgu Çikolata İstemiyorum",
    "en": "No Chocolate Topping",
    "de": "Keine Glasur",
    "ru": "Без шоколадной глазури",
    "nl": "Geen Chocoladetopping",
    "sv": "Ingen Chokladgarnering",
    "no": "Ingen Sjokoladetopping",
    "fi": "Ei Suklaakuorrutetta",
    "pl": "Bez Polewy Czekoladowej",
    "ar": "بدون تغطية شوكولاتة"
  },
  "Krema İstemiyorum": {
    "tr": "Krema İstemiyorum",
    "en": "No Cream",
    "de": "Keine Sahne/Creme",
    "ru": "Без крема",
    "nl": "Geen Room",
    "sv": "Ingen Grädde",
    "no": "Ingen Kremen",
    "fi": "Ei Kermaa",
    "pl": "Bez Kremu",
    "ar": "بدون كريمة"
  },
  "Sos İstemiyorum": {
    "tr": "Sos İstemiyorum",
    "en": "No Sauce",
    "de": "Keine Sauce",
    "ru": "Без соуса",
    "nl": "Geen Saus",
    "sv": "Ingen Sås",
    "no": "Ingen Saus",
    "fi": "Ei Kastiketta",
    "pl": "Bez Sosu",
    "ar": "بدون صوص"
  },
  "Yaban Mersini": {
    "tr": "Yaban Mersini",
    "en": "Blueberries",
    "de": "Blaubeeren",
    "ru": "Черника",
    "nl": "Bosbessen",
    "sv": "Blåbär",
    "no": "Blåbær",
    "fi": "Mustikat",
    "pl": "Borówki",
    "ar": "توت أزرق"
  },
  "Mango": {
    "tr": "Mango",
    "en": "Mango",
    "de": "Mango",
    "ru": "Манго",
    "nl": "Mango",
    "sv": "Mango",
    "no": "Mango",
    "fi": "Mango",
    "pl": "Mango",
    "ar": "مانجو"
  },
  "Limon Parçacıkları": {
    "tr": "Limon Parçacıkları",
    "en": "Lemon Zest / Bites",
    "de": "Zitronenraspeln",
    "ru": "Кусочки лимона",
    "nl": "Citroenrasp",
    "sv": "Citronbitar",
    "no": "Sitronbiter",
    "fi": "Sitruunapalat",
    "pl": "Cząstki Cytryny",
    "ar": "قطع الليمون"
  },
  "Pastacı Kreması": {
    "tr": "Pastacı Kreması",
    "en": "Pastry Cream",
    "de": "Konditorcreme",
    "ru": "Заварной крем",
    "nl": "Banketbakkersroom",
    "sv": "Vaniljkräm",
    "no": "Vaniljekrem",
    "fi": "Vaniljakreemi",
    "pl": "Krem Cukierniczy",
    "ar": "كاسترد الكريمة"
  },
  "Orman Meyveli Kreması": {
    "tr": "Orman Meyveli Kreması",
    "en": "Forest Berry Cream",
    "de": "Waldbeerencreme",
    "ru": "Крем из лесных ягод",
    "nl": "Bosvruchtenroom",
    "sv": "Skogsbärskräm",
    "no": "Skogsbærkrem",
    "fi": "Metsämarjakreemi",
    "pl": "Krem z Owoców Leśnych",
    "ar": "كريمة توت الغابة"
  },
  "Limon Kreması": {
    "tr": "Limon Kreması",
    "en": "Lemon Curd Cream",
    "de": "Zitronencreme",
    "ru": "Лимонный крем",
    "nl": "Citroencrème",
    "sv": "Citronkräm",
    "no": "Sitronkrem",
    "fi": "Sitruunakreemi",
    "pl": "Krem Cytrynowy",
    "ar": "كريمة الليمون"
  },
  "Lotus Kreması": {
    "tr": "Lotus Kreması",
    "en": "Lotus Biscoff Cream",
    "de": "Lotus Biscoff Creme",
    "ru": "Крем Лотус",
    "nl": "Lotus Biscoff Crème",
    "sv": "Lotus Biscoff Kräm",
    "no": "Lotus Biscoff Krem",
    "fi": "Lotus Biscoff Kreemi",
    "pl": "Krem Lotus Biscoff",
    "ar": "كريمة لوتس"
  },
  "Antep Fıstığı Kreması": {
    "tr": "Antep Fıstığı Kreması",
    "en": "Pistachio Cream",
    "de": "Pistaziencreme",
    "ru": "Фисташковый крем",
    "nl": "Pistachecrème",
    "sv": "Pistagekräm",
    "no": "Pistasjkrem",
    "fi": "Pistaasikreemi",
    "pl": "Krem Pistacjowy",
    "ar": "كريمة الفستق الحلبي"
  },
  "Labne": {
    "tr": "Labne",
    "en": "Labneh Cream Cheese",
    "de": "Frischkäse (Labneh)",
    "ru": "Сыр Лабне",
    "nl": "Labneh Roomkaas",
    "sv": "Labneh Färskost",
    "no": "Labneh Kremost",
    "fi": "Labneh Tuorejuusto",
    "pl": "Serek Labneh",
    "ar": "لبنة كريمية"
  },
  "Roka": {
    "tr": "Roka",
    "en": "Arugula / Rocket",
    "de": "Rucola",
    "ru": "Руккола",
    "nl": "Rucola",
    "sv": "Ruccola",
    "no": "Ruccola",
    "fi": "Rucola",
    "pl": "Rukola",
    "ar": "جرجير"
  },
  "Domates": {
    "tr": "Domates",
    "en": "Tomato",
    "de": "Tomate",
    "ru": "Помидор",
    "nl": "Tomaat",
    "sv": "Tomat",
    "no": "Tomat",
    "fi": "Tomaatti",
    "pl": "Pomidor",
    "ar": "طماطم"
  },
  "Hindi Füme": {
    "tr": "Hindi Füme",
    "en": "Smoked Turkey",
    "de": "Geräucherte Pute",
    "ru": "Копченая индейка",
    "nl": "Gerookte Kalkoen",
    "sv": "Rökt Kalkon",
    "no": "Røkt Kalkun",
    "fi": "Savukalkkuna",
    "pl": "Wędzony Indyk",
    "ar": "ديك رومي مدخن"
  },
  "Zeytin": {
    "tr": "Zeytin",
    "en": "Olives",
    "de": "Oliven",
    "ru": "Оливки",
    "nl": "Olijven",
    "sv": "Oliver",
    "no": "Oliven",
    "fi": "Oliivit",
    "pl": "Oliwki",
    "ar": "زيتون"
  },
  "Ton Balığı": {
    "tr": "Ton Balığı",
    "en": "Tuna",
    "de": "Thunfisch",
    "ru": "Тунец",
    "nl": "Tonijn",
    "sv": "Tonfisk",
    "no": "Tunfisk",
    "fi": "Tonnikala",
    "pl": "Tuńczyk",
    "ar": "تونة"
  },
  "Salatalık": {
    "tr": "Salatalık",
    "en": "Cucumber",
    "de": "Gurke",
    "ru": "Огурец",
    "nl": "Komkommer",
    "sv": "Gurka",
    "no": "Agurk",
    "fi": "Kurkku",
    "pl": "Ogórek",
    "ar": "خيار"
  },
  "Avokado": {
    "tr": "Avokado",
    "en": "Avocado",
    "de": "Avocado",
    "ru": "Авокадо",
    "nl": "Avocado",
    "sv": "Avokado",
    "no": "Avokado",
    "fi": "Avokado",
    "pl": "Awokado",
    "ar": "أفوكادو"
  },
  "Kremalı Çırpılmış Yumurta": {
    "tr": "Kremalı Çırpılmış Yumurta",
    "en": "Creamy Scrambled Eggs",
    "de": "Cremiges Rührei",
    "ru": "Нежный скрэмбл",
    "nl": "Romig Roerei",
    "sv": "Krämig Äggröra",
    "no": "Kremet Eggerøre",
    "fi": "Kermainen Munakokkeli",
    "pl": "Kremowa Jajecznica",
    "ar": "بيض مخفوق بالكريمة"
  },
  "Kaşar Peyniri": {
    "tr": "Kaşar Peyniri",
    "en": "Kashar Cheese",
    "de": "Kashar-Käse",
    "ru": "Сыр Кашар",
    "nl": "Kashar Kaas",
    "sv": "Kasharost",
    "no": "Kashar-ost",
    "fi": "Kashar-juusto",
    "pl": "Ser Kaszar",
    "ar": "جبنة قشقوان"
  },
  "Karamelize Soğan": {
    "tr": "Karamelize Soğan",
    "en": "Caramelized Onions",
    "de": "Karamellisierte Zwiebeln",
    "ru": "Карамелизированный лук",
    "nl": "Gekarameliseerde Uien",
    "sv": "Karamelliserad Lök",
    "no": "Karamellisert Løk",
    "fi": "Karamellisoitu Sipuli",
    "pl": "Karmelizowana Cebula",
    "ar": "بصل مكرمل"
  },
  "Dana Kaburga": {
    "tr": "Dana Kaburga",
    "en": "Pulled Beef Ribs",
    "de": "Gezupfte Rinderrippe",
    "ru": "Рваная говяжья грудинка",
    "nl": "Pulled Rundvleesrib",
    "sv": "Draget Nötkött",
    "no": "Revet Storfekjøtt",
    "fi": "Revitty Naudanliha",
    "pl": "Szarpane Żeberka Wołowe",
    "ar": "أضلاع لحم بقري مسحوبة"
  },
  "Mozzarella": {
    "tr": "Mozzarella",
    "en": "Mozzarella",
    "de": "Mozzarella",
    "ru": "Моцарелла",
    "nl": "Mozzarella",
    "sv": "Mozzarella",
    "no": "Mozzarella",
    "fi": "Mozzarella",
    "pl": "Mozzarella",
    "ar": "موزاريلا"
  },
  "Köz Salata": {
    "tr": "Köz Salata",
    "en": "Roasted Pepper Salad",
    "de": "Gerösteter Paprikasalat",
    "ru": "Салат из запеченных перцев",
    "nl": "Geroosterde Paprikasalade",
    "sv": "Rostad Paprikasallad",
    "no": "Grillet Paprikasalat",
    "fi": "Paahdettu Paprikasalaatti",
    "pl": "Sałatka z Pieczonej Papryki",
    "ar": "سلطة فلفل مشوي"
  },
  "Ezine Peyniri": {
    "tr": "Ezine Peyniri",
    "en": "Ezine White Cheese",
    "de": "Ezine-Weichkäse",
    "ru": "Сыр Эзине",
    "nl": "Ezine Witte Kaas",
    "sv": "Ezine Vitost",
    "no": "Ezine Hvitost",
    "fi": "Ezine-juusto",
    "pl": "Ser Ezine",
    "ar": "جبنة إزيني البيضاء"
  },
  "Çırpılmış Yumurta": {
    "tr": "Çırpılmış Yumurta",
    "en": "Scrambled Eggs",
    "de": "Rührei",
    "ru": "Скрэмбл",
    "nl": "Roerei",
    "sv": "Äggröra",
    "no": "Eggerøre",
    "fi": "Munakokkeli",
    "pl": "Jajecznica",
    "ar": "بيض مخفوق"
  },
  "Sosis": {
    "tr": "Sosis",
    "en": "Sausage",
    "de": "Würstchen",
    "ru": "Сосиска",
    "nl": "Worst",
    "sv": "Korv",
    "no": "Pølse",
    "fi": "Makkara",
    "pl": "Kiełbaska",
    "ar": "سجق"
  },
  "Cheddar": {
    "tr": "Cheddar",
    "en": "Cheddar Cheese",
    "de": "Cheddar",
    "ru": "Чеддер",
    "nl": "Cheddar",
    "sv": "Cheddar",
    "no": "Cheddar",
    "fi": "Cheddar",
    "pl": "Cheddar",
    "ar": "جبنة شيدر"
  },
  "Guacamole": {
    "tr": "Guacamole",
    "en": "Guacamole Sauce",
    "de": "Guacamole",
    "ru": "Гуакамоле",
    "nl": "Guacamole",
    "sv": "Guacamole",
    "no": "Guacamole",
    "fi": "Guacamole",
    "pl": "Guacamole",
    "ar": "صوص جواكامولي"
  },
  "Haydari": {
    "tr": "Haydari",
    "en": "Haydari Dip",
    "de": "Haydari Dip",
    "ru": "Хайдари",
    "nl": "Haydari Dip",
    "sv": "Haydari Dip",
    "no": "Haydari Dip",
    "fi": "Haydari-dippi",
    "pl": "Sos Haydari",
    "ar": "حيدري"
  },
  "Noa Sos": {
    "tr": "Noa Sos",
    "en": "Signature NOA Sauce",
    "de": "NOA Spezial-Sauce",
    "ru": "Фирменный соус NOA",
    "nl": "NOA Speciaalsaus",
    "sv": "NOA Signatursås",
    "no": "NOA Signatursaus",
    "fi": "NOA Talon Kastike",
    "pl": "Sos Autorski NOA",
    "ar": "صوص نوآ الخاص"
  },
  "Burger Sos": {
    "tr": "Burger Sos",
    "en": "Burger Sauce",
    "de": "Burgersauce",
    "ru": "Бургер-соус",
    "nl": "Burgersaus",
    "sv": "Burgarsås",
    "no": "Burgersaus",
    "fi": "Hampurilaiskastike",
    "pl": "Sos Burgerowy",
    "ar": "صوص برجر"
  },
  "Cheddar Sos": {
    "tr": "Cheddar Sos",
    "en": "Warm Cheddar Sauce",
    "de": "Cheddarsauce",
    "ru": "Чеддер-соус",
    "nl": "Cheddarsaus",
    "sv": "Cheddarsås",
    "no": "Cheddarsaus",
    "fi": "Cheddarkastike",
    "pl": "Sos Cheddar",
    "ar": "صوص شيدر"
  },
  "Pesto Sos": {
    "tr": "Pesto Sos",
    "en": "Basil Pesto Sauce",
    "de": "Basilikum-Pesto",
    "ru": "Соус Песто",
    "nl": "Pesto Saus",
    "sv": "Pestosås",
    "no": "Pestosaus",
    "fi": "Pestokastike",
    "pl": "Sos Pesto",
    "ar": "صوص بيستو"
  },
  "Mayonez": {
    "tr": "Mayonez",
    "en": "Mayonnaise",
    "de": "Mayonnaise",
    "ru": "Майонез",
    "nl": "Mayonaise",
    "sv": "Majonnäs",
    "no": "Majones",
    "fi": "Majoneesi",
    "pl": "Majonez",
    "ar": "مايونيز"
  },
  "Tatlı Acı Sos": {
    "tr": "Tatlı Acı Sos",
    "en": "Sweet Chili Sauce",
    "de": "Süß-Sauer / Sweet Chili",
    "ru": "Сладкий чили",
    "nl": "Sweet Chili Saus",
    "sv": "Sweet Chilisås",
    "no": "Søt Chilisaus",
    "fi": "Makea Chilikastike",
    "pl": "Sos Słodko-Pikantny",
    "ar": "صوص حلو وحار"
  },
  "NOA Benzin": {
    "tr": "NOA Benzin",
    "en": "NOA Benzin",
    "de": "NOA Benzin",
    "ru": "NOA Бензин",
    "nl": "NOA Benzin",
    "sv": "NOA Benzin",
    "no": "NOA Benzin",
    "fi": "NOA Benzin",
    "pl": "NOA Benzin",
    "ar": "نوآ بنزين"
  },
  "NOA Dizel": {
    "tr": "NOA Dizel",
    "en": "NOA Dizel",
    "de": "NOA Dizel",
    "ru": "NOA Дизель",
    "nl": "NOA Dizel",
    "sv": "NOA Dizel",
    "no": "NOA Dizel",
    "fi": "NOA Dizel",
    "pl": "NOA Dizel",
    "ar": "نوآ ديزل"
  },
  "Benzin": {
    "tr": "Benzin",
    "en": "Benzin",
    "de": "Benzin",
    "ru": "Бензин",
    "nl": "Benzin",
    "sv": "Benzin",
    "no": "Benzin",
    "fi": "Benzin",
    "pl": "Benzin",
    "ar": "بنزين"
  },
  "Dizel": {
    "tr": "Dizel",
    "en": "Dizel",
    "de": "Dizel",
    "ru": "Дизель",
    "nl": "Dizel",
    "sv": "Dizel",
    "no": "Dizel",
    "fi": "Dizel",
    "pl": "Dizel",
    "ar": "ديزل"
  },
  "NOA Turbo": {
    "tr": "NOA Turbo",
    "en": "NOA Turbo",
    "de": "NOA Turbo",
    "ru": "NOA Турбо",
    "nl": "NOA Turbo",
    "sv": "NOA Turbo",
    "no": "NOA Turbo",
    "fi": "NOA Turbo",
    "pl": "NOA Turbo",
    "ar": "نوآ توربو"
  },
  "NOA Full Depo": {
    "tr": "NOA Full Depo",
    "en": "NOA Full Depo",
    "de": "NOA Full Depo",
    "ru": "NOA Полный Бак",
    "nl": "NOA Full Depo",
    "sv": "NOA Full Depo",
    "no": "NOA Full Depo",
    "fi": "NOA Full Depo",
    "pl": "NOA Full Depo",
    "ar": "نوآ فول تانك"
  },
  "Espresso (Affogato İçin)": {
    "tr": "Espresso (Affogato İçin)",
    "en": "Espresso Shot (For Affogato)",
    "de": "Espresso-Shot (Für Affogato)",
    "ru": "Порция эспрессо (для аффогато)",
    "nl": "Espresso Shot (Voor Affogato)",
    "sv": "Espresso (För Affogato)",
    "no": "Espresso (Til Affogato)",
    "fi": "Espresso (Affogatoon)",
    "pl": "Espresso (Do Affogato)",
    "ar": "إسبريسو (للأفوغاتو)"
  },
  "1 Top Dondurma (Affogato)": {
    "tr": "1 Top Dondurma (Affogato)",
    "en": "1 Scoop Vanilla Gelato (Affogato)",
    "de": "1 Kugel Vanilleeis (Affogato)",
    "ru": "1 шарик мороженого (аффогато)",
    "nl": "1 Bol IJs (Affogato)",
    "sv": "1 Kula Glass (Affogato)",
    "no": "1 Kule Iskrem (Affogato)",
    "fi": "1 Pallo Jäätelöä (Affogato)",
    "pl": "1 Gałka Lodów (Affogato)",
    "ar": "1 كرة آيس كريم (أفوغاتو)"
  },
  "Karpuz & Çilek": {
    "tr": "Karpuz & Çilek",
    "en": "Watermelon & Strawberry",
    "de": "Wassermelone & Erdbeere",
    "ru": "Арбуз и клубника",
    "nl": "Watermeloen & Aardbei",
    "sv": "Vattenmelon & Jordgubb",
    "no": "Vannmelon & Jordbær",
    "fi": "Vesimeloni & Mansikka",
    "pl": "Arbuz & Truskawka",
    "ar": "بطيخ وفراولة"
  },
  "Elma": {
    "tr": "Elma",
    "en": "Apple",
    "de": "Apfel",
    "ru": "Яблоко",
    "nl": "Appel",
    "sv": "Äpple",
    "no": "Eple",
    "fi": "Omena",
    "pl": "Jabłko",
    "ar": "تفاح"
  },
  "Limon": {
    "tr": "Limon",
    "en": "Lemon",
    "de": "Zitrone",
    "ru": "Лимон",
    "nl": "Citroen",
    "sv": "Citron",
    "no": "Sitron",
    "fi": "Sitruuna",
    "pl": "Cytryna",
    "ar": "ليمون"
  },
  "Yeşil Limonlu": {
    "tr": "Yeşil Limonlu",
    "en": "Lime / Green Lemon",
    "de": "Limette",
    "ru": "Лайм",
    "nl": "Limoen",
    "sv": "Lime",
    "no": "Lime",
    "fi": "Limetit",
    "pl": "Limonka",
    "ar": "ليمون أخضر / لايم"
  },
  "Kavunlu": {
    "tr": "Kavunlu",
    "en": "Melon",
    "de": "Melone",
    "ru": "Дыня",
    "nl": "Meloen",
    "sv": "Melon",
    "no": "Melon",
    "fi": "Meloni",
    "pl": "Melon",
    "ar": "شمام"
  },
  "Orman Meyveli": {
    "tr": "Orman Meyveli",
    "en": "Forest Berries",
    "de": "Waldbeere",
    "ru": "Лесные ягоды",
    "nl": "Bosvruchten",
    "sv": "Skogsbär",
    "no": "Skogsbær",
    "fi": "Metsämarja",
    "pl": "Owoce Leśne",
    "ar": "توت الغابة"
  },
  "Mandalina": {
    "tr": "Mandalina",
    "en": "Tangerine / Mandarin",
    "de": "Mandarine",
    "ru": "Мандарин",
    "nl": "Mandarijn",
    "sv": "Mandarin",
    "no": "Mandarin",
    "fi": "Mandariini",
    "pl": "Mandarynka",
    "ar": "يوسفي / مندرين"
  },
  "Şeftali": {
    "tr": "Şeftali",
    "en": "Peach",
    "de": "Pfirsich",
    "ru": "Персик",
    "nl": "Perzik",
    "sv": "Persika",
    "no": "Fersken",
    "fi": "Persikka",
    "pl": "Brzoskwinia",
    "ar": "خوخ"
  },
  "Kavun & Çilek": {
    "tr": "Kavun & Çilek",
    "en": "Melon & Strawberry",
    "de": "Melone & Erdbeere",
    "ru": "Дыня и клубника",
    "nl": "Meloen & Aardbei",
    "sv": "Melon & Jordgubb",
    "no": "Melon & Jordbær",
    "fi": "Meloni & Mansikka",
    "pl": "Melon & Truskawka",
    "ar": "شمام وفراولة"
  },
  "Karpuz": {
    "tr": "Karpuz",
    "en": "Watermelon",
    "de": "Wassermelone",
    "ru": "Арбуз",
    "nl": "Watermeloen",
    "sv": "Vattenmelon",
    "no": "Vannmelon",
    "fi": "Vesimeloni",
    "pl": "Arbuz",
    "ar": "بطيخ"
  },
  "Mango & Ananas": {
    "tr": "Mango & Ananas",
    "en": "Mango & Pineapple",
    "de": "Mango & Ananas",
    "ru": "Манго и ананас",
    "nl": "Mango & Ananas",
    "sv": "Mango & Ananas",
    "no": "Mango & Ananas",
    "fi": "Mango & Ananas",
    "pl": "Mango & Ananas",
    "ar": "مانجو وأناناس"
  },
  "Vişne": {
    "tr": "Vişne",
    "en": "Sour Cherry",
    "de": "Sauerkirsche",
    "ru": "Вишня",
    "nl": "Zure Kers",
    "sv": "Körsbär",
    "no": "Kirsebær",
    "fi": "Kirsikka",
    "pl": "Wiśnia",
    "ar": "كرز حامض"
  },
  "Karışık": {
    "tr": "Karışık",
    "en": "Mixed Fruit",
    "de": "Gemischt",
    "ru": "Микс",
    "nl": "Gemengd Fruit",
    "sv": "Blandad Frukt",
    "no": "Blandet Frukt",
    "fi": "Sekamarja",
    "pl": "Miks Owocowy",
    "ar": "مشكل"
  }
};

export function translateOptionName(name: string, lang: Language): string {
  if (lang === "tr") return name;
  const match = OPTION_ITEM_TRANSLATIONS[name];
  if (match && match[lang]) return match[lang];

  // Try product translations lookup if it's a product name (e.g. pairings)
  const prodMatch = PRODUCT_TRANSLATIONS[name];
  if (prodMatch && prodMatch[lang]?.name) return prodMatch[lang].name;

  return name;
}


