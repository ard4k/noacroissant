import { noaStore } from "../lib/store";
import { INITIAL_TABLES, INITIAL_PRODUCTS } from "../lib/seedData";
import { SupportedLocale } from "../lib/types";

async function runVerification() {
  console.log("=========================================");
  console.log("   NOA CROISSANT FULL-STACK VERIFICATION ");
  console.log("=========================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      process.exitCode = 1;
    }
  }

  // 1. Verify 20 Tables Initialization
  const tables = noaStore.getTables();
  assert(tables.length === 20, "Exact 20 tables exist in store");
  assert(
    tables.every((t) => t.table_number >= 1 && t.table_number <= 20),
    "All table numbers are within 1-20"
  );
  assert(
    tables.every((t) => t.qr_token.startsWith("noa_tbl_")),
    "All tables have secure opaque QR tokens"
  );

  // 2. Verify Table Token Validation
  const table1 = noaStore.getTableByToken(tables[0].qr_token);
  assert(table1?.table_number === 1, "Valid table 01 token resolves correctly");

  const invalidTable = noaStore.getTableByToken("invalid_fake_token_123");
  assert(invalidTable === undefined, "Invalid table token is rejected");

  // 3. Verify Product Data & Categories
  const products = noaStore.getProducts();
  assert(products.length >= 40, `All required products seeded (found ${products.length})`);

  const amora = noaStore.getProductBySlug("amora");
  assert(amora?.base_price === 360, "Amora base price is 360 TL");
  assert(
    Boolean(amora?.option_groups?.some((g) => g.name.includes("dolgu"))),
    "Amora has Dolgu selection group"
  );

  const savoury = noaStore.getProductBySlug("avokado-royale");
  assert(savoury?.base_price === 420, "Avokado Royale price is 420 TL");
  assert(
    Boolean(savoury?.ingredients?.includes("Labne")),
    "Avokado Royale ingredients correctly seeded"
  );

  // 4. Test Tamper-Proof Server-Side Order Creation
  const createdOrder = noaStore.createOrder({
    table_token: tables[3].qr_token, // Masa 04
    items: [
      {
        product_id: "prod-avokado-royale", // 420 TL
        quantity: 2, // 840 TL
        item_note: "Sos bol olsun",
      },
      {
        product_id: "prod-amora", // base 360 + Belçikalı 20 = 380 TL
        quantity: 1,
        selected_options: [
          { option_group_id: "opt-ic-dolgu-cikolata-secimi", option_value_id: "dolgu-sutlu-belcika" }, // +20 TL -> 380 TL
        ],
      },
      {
        product_id: "prod-cay",
        quantity: 1,
        is_complimentary: true, // 0 TL promo tea
      },
    ],
    payment_method: "credit_card",
    general_note: "Paket servis",
    idempotency_key: `test_idem_${Date.now()}`,
  });

  assert(Boolean(createdOrder.order), "Order created successfully");
  assert(createdOrder.order.table_number === 4, "Order assigned to Masa 04");
  // Total calculation: (420 * 2) + (360 + 20) + 0 = 840 + 380 + 0 = 1220 TL
  assert(createdOrder.order.total === 1220, `Price calculated correctly by server (expected 1220 TL, got ${createdOrder.order.total} TL)`);
  assert(Boolean(createdOrder.tracking_token), "Private tracking token generated");

  // 5. Test Idempotency (Duplicate Prevention)
  const duplicateOrder = noaStore.createOrder({
    table_token: tables[3].qr_token,
    items: [{ product_id: "prod-cola", quantity: 1 }],
    payment_method: "table",
    idempotency_key: createdOrder.order.idempotency_key,
  });
  assert(
    duplicateOrder.order.id === createdOrder.order.id,
    "Idempotency key prevents duplicate order creation and returns existing order"
  );

  // 6. Test Complimentary Tea Validation (Cannot add promo tea without savoury croissant)
  let promoErrorCaught = false;
  try {
    noaStore.createOrder({
      table_token: tables[0].qr_token,
      items: [
        {
          product_id: "prod-cola",
          quantity: 1,
        },
        {
          product_id: "prod-cay",
          quantity: 1,
          is_complimentary: true,
        },
      ],
      payment_method: "cashier",
    });
  } catch (e) {
    promoErrorCaught = true;
  }
  assert(
    promoErrorCaught,
    "Complimentary tea rejected if cart has no savoury croissant"
  );

  // 7. Test Order State Machine Transitions & Audit Logs
  const updatedOrder = noaStore.updateOrderStatus(
    createdOrder.order.id,
    "preparing",
    "Mutfak hazırlamaya başladı",
    undefined,
    "Mutfak Şefi"
  );
  assert(Boolean(updatedOrder && updatedOrder.status === "preparing"), "Order advanced to 'preparing'");
  assert(
    Boolean(updatedOrder && updatedOrder.status_history?.length === 2),
    "Status audit event logged properly"
  );

  noaStore.updateOrderStatus(createdOrder.order.id, "ready", undefined, undefined, "Barista");
  const readyOrder = noaStore.getOrderById(createdOrder.order.id);
  assert(readyOrder?.status === "ready", "Order advanced to 'ready'");

  // 8. Test Payment Status Toggle
  noaStore.updatePaymentStatus(createdOrder.order.id, "paid");
  const paidOrder = noaStore.getOrderById(createdOrder.order.id);
  assert(paidOrder?.payment_status === "paid", "Payment status updated to 'paid'");

  // 9. Test Table Token Regeneration
  const oldToken = tables[0].qr_token;
  const newToken = noaStore.regenerateTableToken(tables[0].id);
  assert(newToken !== oldToken, "New QR token generated");
  assert(
    noaStore.getTableByToken(oldToken) === undefined,
    "Old token is invalidated after regeneration"
  );
  assert(
    noaStore.getTableByToken(newToken)?.id === tables[0].id,
    "New token resolves to the table"
  );

  // 10. Test Ingredient Out-of-Stock Toggling & Order Integrity (Phase 2)
  noaStore.toggleIngredient("Nutella", false);
  assert(noaStore.getDisabledIngredients().includes("Nutella"), "Nutella added to disabled ingredients list");

  // Attempting to order a product with disabled ingredient must be rejected
  let blockedByIngredient = false;
  try {
    noaStore.createOrder({
      table_token: "self_service",
      items: [{ product_id: "prod-cilekli-muzlu-nutella", quantity: 1 }],
      payment_method: "cash",
    });
  } catch (e: any) {
    if (e.message.toLowerCase().includes("nutella")) {
      blockedByIngredient = true;
    }
  }
  assert(blockedByIngredient, "Order blocked when required ingredient 'Nutella' is out of stock");

  // Re-enable Nutella and verify order succeeds
  noaStore.toggleIngredient("Nutella", true);
  assert(!noaStore.getDisabledIngredients().includes("Nutella"), "Nutella removed from disabled ingredients on re-enabling");

  const unblockedOrder = noaStore.createOrder({
    table_token: "self_service",
    items: [{ product_id: "prod-cilekli-muzlu-nutella", quantity: 1 }],
    payment_method: "cash",
  });
  assert(unblockedOrder.order.id !== undefined, "Order succeeds after ingredient is re-enabled");
  noaStore.deleteOrder(unblockedOrder.order.id);

  // 11. Test Wi-Fi Settings Storage
  noaStore.updateSettings({
    wifi_ssid: "Noa Croissant",
    wifi_password: "noa330738",
  });
  const currentSettings = noaStore.getSettings();
  assert(currentSettings.wifi_ssid === "Noa Croissant", "Wi-Fi SSID updated correctly");
  assert(currentSettings.wifi_password === "noa330738", "Wi-Fi password updated correctly");

  // 12. Security & Role Authorization Tests (Phase 1)
  const {
    verifyPin,
    generateSessionToken,
    validateSessionToken,
    isValidStatusTransition,
  } = await import("../lib/adminAuth");

  assert(verifyPin("330738", "admin"), "Admin PIN verified successfully");
  assert(!verifyPin("wrong_pin", "admin"), "Wrong PIN rejected");
  assert(verifyPin("330738", "kitchen"), "Kitchen role accepts verified PIN");

  const adminToken = generateSessionToken("admin");
  const kitchenToken = generateSessionToken("kitchen");

  assert(validateSessionToken(adminToken, "admin"), "Admin session token validates for admin role");
  assert(validateSessionToken(adminToken, "kitchen"), "Admin session token validates for kitchen role");
  assert(validateSessionToken(kitchenToken, "kitchen"), "Kitchen session token validates for kitchen role");
  assert(!validateSessionToken(kitchenToken, "admin"), "Kitchen session token is rejected for admin role");
  assert(!validateSessionToken("invalid.token.signature", "admin"), "Forged session token rejected");

  // 13. State Transition Matrix Tests (Phase 1)
  assert(isValidStatusTransition("received", "preparing"), "Transition 'received' -> 'preparing' allowed");
  assert(isValidStatusTransition("preparing", "ready"), "Transition 'preparing' -> 'ready' allowed");
  assert(isValidStatusTransition("ready", "served"), "Transition 'ready' -> 'served' allowed");
  assert(isValidStatusTransition("received", "cancelled"), "Transition 'received' -> 'cancelled' allowed");
  assert(isValidStatusTransition("preparing", "cancelled"), "Transition 'preparing' -> 'cancelled' allowed");
  assert(!isValidStatusTransition("served", "preparing"), "Invalid transition 'served' -> 'preparing' blocked");
  assert(!isValidStatusTransition("cancelled", "ready"), "Invalid transition 'cancelled' -> 'ready' blocked");
  assert(!isValidStatusTransition("served", "cancelled"), "Invalid transition 'served' -> 'cancelled' blocked");

  // 14. Loyalty Stamp Card Tests (5 Coffees = 1 Free)
  const {
    formatPhoneNumberTR,
    toE164PhoneTR,
    fetchLoyaltyCard,
    addStampsToCustomer,
    redeemFreeCoffee,
  } = await import("../lib/loyalty");

  const formattedTR = formatPhoneNumberTR("5404233307");
  assert(formattedTR === "(540) 423 33 07", "Phone number formatted to Turkish format correctly");

  const e164 = toE164PhoneTR("05404233307");
  assert(e164 === "+905404233307", "Phone converted to E.164 format (+905404233307)");

  const testPhone = "+905001112233";
  const initialCard = await fetchLoyaltyCard(testPhone);
  assert(initialCard.stamps === 0 && initialCard.rewards_count === 0, "Initial loyalty card created with 0 stamps and 0 rewards");

  const cardWith3 = await addStampsToCustomer(testPhone, 3);
  assert(cardWith3.stamps === 3 && cardWith3.rewards_count === 0, "Adding 3 stamps results in 3/7 stamps");

  const cardWith7 = await addStampsToCustomer(testPhone, 4);
  assert(cardWith7.stamps === 0 && cardWith7.rewards_count === 1, "7th stamp successfully converted to 1 Free Coffee Reward Voucher");

  const cardRedeemed = await redeemFreeCoffee(testPhone);
  assert(cardRedeemed.rewards_count === 0, "Redeeming free coffee consumes 1 reward voucher");

  let redeemEmptyFailed = false;
  try {
    await redeemFreeCoffee(testPhone);
  } catch (e) {
    redeemEmptyFailed = true;
  }
  assert(redeemEmptyFailed, "Redeeming when no reward vouchers are available is rejected");

  // 15. Comprehensive i18n Resolver & User Bug Verification
  const {
    resolveLocalizedText,
    formatLocalizedPrice,
    getSortedAndFormattedOptionsLocalized,
  } = await import("../lib/i18n/resolver");

  // 15.1 Verify LocalizedText Object resolution
  const testObj = { tr: "Çilekli Kruvasan", en: "Strawberry Croissant", de: "Erdbeer-Croissant" };
  assert(
    resolveLocalizedText(testObj, "en") === "Strawberry Croissant",
    "resolveLocalizedText resolves English from LocalizedText object"
  );
  assert(
    resolveLocalizedText(testObj, "de") === "Erdbeer-Croissant",
    "resolveLocalizedText resolves German from LocalizedText object"
  );
  assert(
    resolveLocalizedText(testObj, "fr" as any) === "Çilekli Kruvasan",
    "resolveLocalizedText falls back to Turkish when requested locale is missing"
  );

  // 15.2 Verify Specific Error Cases Reported by User
  const fillingTitle = resolveLocalizedText("ic_dolgu_cikolata_secimi", "en");
  assert(
    fillingTitle === "Choose Your Chocolate Filling",
    `User Case 1: 'ic_dolgu_cikolata_secimi' resolves to 'Choose Your Chocolate Filling' in EN (got: '${fillingTitle}')`
  );

  const milkChoc = resolveLocalizedText("Sütlü Belçika Çikolata", "en");
  assert(
    milkChoc === "Belgian Milk Chocolate",
    `User Case 2: 'Sütlü Belçika Çikolata' resolves to 'Belgian Milk Chocolate' in EN (got: '${milkChoc}')`
  );

  const whiteChoc = resolveLocalizedText("Beyaz Belçika Çikolata", "en");
  assert(
    whiteChoc === "Belgian White Chocolate",
    `User Case 3: 'Beyaz Belçika Çikolata' resolves to 'Belgian White Chocolate' in EN (got: '${whiteChoc}')`
  );

  const darkChoc = resolveLocalizedText("Bitter Belçika Çikolata", "en");
  assert(
    darkChoc === "Belgian Dark Chocolate",
    `User Case 4: 'Bitter Belçika Çikolata' resolves to 'Belgian Dark Chocolate' in EN (got: '${darkChoc}')`
  );

  // 15.3 Test Multi-Language Option Group and Value Formatting
  const sampleOptions = [
    {
      option_group_id: "opt-ic-dolgu-cikolata-secimi",
      option_group_name: "İç Dolgu Çikolata Seçimi",
      option_value_name: "Sütlü Belçika Çikolata",
      price_modifier: 20,
    },
    {
      option_group_id: "opt-tatli-kruvasan-secimi",
      option_group_name: "Tatlı Kruvasan Seçimi",
      option_value_name: "Roll Kruvasan",
      price_modifier: 0,
    },
  ];

  const formattedEn = getSortedAndFormattedOptionsLocalized(sampleOptions as any, "en");
  assert(
    formattedEn.length === 2,
    "getSortedAndFormattedOptionsLocalized returns 2 formatted option items"
  );
  assert(
    formattedEn[0] === "Roll Croissant",
    `Taban option formatted properly in EN (got: '${formattedEn[0]}')`
  );
  assert(
    formattedEn[1].includes("Filling: Belgian Milk Chocolate"),
    `Option group prefix and item name properly translated in EN without Turkish mangling (got: '${formattedEn[1]}')`
  );

  // 15.4 Test Currency Price Formatter
  const priceTr = formatLocalizedPrice(350, "tr");
  const priceEn = formatLocalizedPrice(350, "en");
  assert(priceTr.includes("350") && priceTr.includes("₺"), `Price formatted properly in TR (got: '${priceTr}')`);
  assert(priceEn.includes("350") && (priceEn.includes("TRY") || priceEn.includes("₺")), `Price formatted properly in EN (got: '${priceEn}')`);

  // 16. Test Loyalty Card Translations across languages
  const { getTranslation, translateLoyaltyHistory, translateLoyaltyRewardName, translateNotice } = await import("../lib/i18n/translations");
  assert(
    getTranslation("en", "digitalCoffeeCard") === "Your Digital Coffee Card",
    "Loyalty modal title translated to English correctly"
  );
  assert(
    getTranslation("de", "digitalCoffeeCard") === "Ihre digitale Kaffeekarte",
    "Loyalty modal title translated to German correctly"
  );
  assert(
    getTranslation("ar", "digitalCoffeeCard") === "بطاقة القهوة الرقمية الخاصة بك",
    "Loyalty modal title translated to Arabic correctly"
  );
  assert(
    translateLoyaltyRewardName("Hediye Kahve", "en") === "Complimentary Coffee",
    "Loyalty reward name translated to English correctly"
  );
  assert(
    translateLoyaltyHistory("+2 Damga kazanıldı!", "en") === "+2 Stamps earned!",
    "Loyalty stamp earned history translated to English correctly"
  );
  assert(
    translateLoyaltyHistory("NOA LOYALTY CARD oluşturuldu.", "de") === "NOA Treuekarte erstellt.",
    "Loyalty card creation history translated to German correctly"
  );
  assert(
    translateLoyaltyHistory("1 Adet Hediye Kahve kasada teslim alındı. Afiyet olsun!", "ru") === "1 бесплатный кофе получен на кассе. Приятного аппетита!",
    "Loyalty redemption history translated to Russian correctly"
  );

  // 17. Test Multi-Language Completeness (de, ru, nl, sv, no, fi, pl, ar)
  const languagesToVerify: {
    lang: SupportedLocale;
    expectedRollNotice: string;
    expectedFillingTitle: string;
    expectedMilkChoc: string;
    expectedDarkChoc: string;
  }[] = [
    {
      lang: "de",
      expectedRollNotice: "SERVIERT MIT ZYLINDRISCHEM FRANZÖSISCHEM ROLLTEIG UND FLÜSSIGER FÜLLUNG.",
      expectedFillingTitle: "Wählen Sie Ihre Schokoladenfüllung",
      expectedMilkChoc: "Belgische Vollmilchschokolade",
      expectedDarkChoc: "Belgische Zartbitterschokolade",
    },
    {
      lang: "ru",
      expectedRollNotice: "ПОДАЕТСЯ С ЦИЛИНДРИЧЕСКИМ ФРАНЦУЗСКИМ РОЛЛ-ТЕСТОМ И ЖИДКОЙ НАЧИНКОЙ.",
      expectedFillingTitle: "Выберите шоколадную начинку",
      expectedMilkChoc: "Бельгийский молочный шоколад",
      expectedDarkChoc: "Бельгийский темный шоколад",
    },
    {
      lang: "nl",
      expectedRollNotice: "GESERVEERD MET CILINDRISCH FRANS ROLL-DEEG EN VLOEIENDE VULLING.",
      expectedFillingTitle: "Kies Je Chocoladevulling",
      expectedMilkChoc: "Belgische Melkchocolade",
      expectedDarkChoc: "Belgische Pure Chocolade",
    },
    {
      lang: "sv",
      expectedRollNotice: "SERVERAS MED CYLINDRISK FRANSK ROLLDEG OCH KRÄMIG FYLLNING.",
      expectedFillingTitle: "Välj Din Chokladfyllning",
      expectedMilkChoc: "Belgisk Mjölkchoklad",
      expectedDarkChoc: "Belgisk Mörk Choklad",
    },
    {
      lang: "no",
      expectedRollNotice: "SERVERES MED SYLINDRISK FRANSK ROLLDEIG OG FLYTENDE FYLL.",
      expectedFillingTitle: "Velg Din Sjokoladefyll",
      expectedMilkChoc: "Belgisk Melkesjokolade",
      expectedDarkChoc: "Belgisk Mørk Sjokolade",
    },
    {
      lang: "fi",
      expectedRollNotice: "TARJOILLAAN SYLINTERINMUOTOISELLA RANSKALAISELLA TAIKINALLA JA JUOKSEVALLA TÄYTTEELLÄ.",
      expectedFillingTitle: "Valitse Suklaatäyte",
      expectedMilkChoc: "Belgialainen Maitosuklaa",
      expectedDarkChoc: "Belgialainen Tumma Suklaa",
    },
    {
      lang: "pl",
      expectedRollNotice: "PODAWANY Z CYLINDRYCZNYM FRANCUSKIM CIASTEM ROLL I PŁYNNYM NADZIENIEM.",
      expectedFillingTitle: "Wybierz Nadzienie Czekoladowe",
      expectedMilkChoc: "Belgijska Czekolada Mleczna",
      expectedDarkChoc: "Belgijska Ciemna Czekolada",
    },
    {
      lang: "ar",
      expectedRollNotice: "يُقدم بعجينة الرول الفرنسية الأسطوانية مع حشوة غنية وسلسة.",
      expectedFillingTitle: "اختر حشوة الشوكولاتة",
      expectedMilkChoc: "شوكولاتة الحليب البلجيكية",
      expectedDarkChoc: "شوكولاتة داكنة بلجيكية",
    },
  ];

  for (const item of languagesToVerify) {
    const notice = translateNotice("SİLİNDİRİK FRANSIZ ROLL HAMURU VE AKIŞKAN DOLGU İLE SERVİS EDİLİR.", item.lang);
    assert(
      notice === item.expectedRollNotice,
      `[${item.lang}] roll category notice translates correctly`
    );

    const title = resolveLocalizedText("ic_dolgu_cikolata_secimi", item.lang);
    assert(
      title === item.expectedFillingTitle,
      `[${item.lang}] option group 'ic_dolgu_cikolata_secimi' translates correctly`
    );

    const milk = resolveLocalizedText("Sütlü Belçika Çikolata", item.lang);
    assert(
      milk === item.expectedMilkChoc,
      `[${item.lang}] option 'Sütlü Belçika Çikolata' translates correctly`
    );

    const dark = resolveLocalizedText("Bitter Belçika Çikolata", item.lang);
    assert(
      dark === item.expectedDarkChoc,
      `[${item.lang}] option 'Bitter Belçika Çikolata' translates correctly`
    );

    const formatted = getSortedAndFormattedOptionsLocalized(sampleOptions as any, item.lang);
    assert(
      formatted.length === 2 && formatted[1].includes(item.expectedMilkChoc),
      `[${item.lang}] options formatted properly without fallback corruption`
    );
  }

  // 18. Verify Hidden / Inactive Products & Cheesecake Category
  const categories = noaStore.getCategories();
  const cheesecakeCat = categories.find((c) => c.id === "cat-cheesecake");
  assert(
    cheesecakeCat?.is_active === false,
    "Category 'cat-cheesecake' is marked is_active: false"
  );

  const hiddenProductIds = [
    "prod-san-sebastian-cheesecake-dilim",
    "prod-san-sebastian-cheesecake-butun",
    "prod-limonlu-cheesecake-dilim",
    "prod-limonlu-cheesecake-butun",
    "prod-lotuslu-cheesecake-dilim",
    "prod-lotuslu-cheesecake-butun",
    "prod-noa-tatli-tuzlu-ikili",
    "prod-noa-tuzlu-ikili",
    "prod-noa-roll-kup-ikili",
    "prod-cedric-grolet",
    "prod-noa-tatli-ikili",
  ];

  for (const id of hiddenProductIds) {
    const prod = noaStore.getProductById(id);
    assert(
      prod !== undefined,
      `Product '${id}' still exists in database/store for future reactivation`
    );
    assert(
      prod?.is_available === false && prod?.is_active === false,
      `Product '${id}' has is_available: false and is_active: false`
    );

    // Attempt to order must fail
    let orderBlocked = false;
    try {
      noaStore.createOrder({
        table_token: "self_service",
        items: [{ product_id: id, quantity: 1 }],
        payment_method: "cash",
      });
    } catch (e: any) {
      if (e.message.includes("tükenmiştir")) {
        orderBlocked = true;
      }
    }
    assert(
      orderBlocked,
      `Order creation for hidden/inactive product '${id}' is strictly blocked`
    );
  }

  // 19. Verify Menu & Customization Options Updates
  const miniKruvasan = noaStore.getProductById("prod-mini-kruvasan");
  assert(
    miniKruvasan !== undefined && miniKruvasan.base_price === 550 && miniKruvasan.category_id === "cat-spesiyal",
    "Mini Kruvasan Tabağı is 550 TL in cat-spesiyal"
  );
  const miniOpt = miniKruvasan?.option_groups?.find((g) => g.id === "opt-ozellestirme-secenekleri");
  assert(
    miniOpt !== undefined && miniOpt.options.some((o) => o.name === "Frambuazlı Danish" && o.price_modifier === 40),
    "Mini Kruvasan contains Frambuazlı Danish (+40 TL) option"
  );
  assert(
    miniOpt !== undefined && miniOpt.options.some((o) => o.name === "Orman Meyveli Danish" && o.price_modifier === 20),
    "Mini Kruvasan contains Orman Meyveli Danish (+20 TL) option"
  );
  assert(
    miniOpt !== undefined && miniOpt.options.some((o) => o.name === "Antep Fıstıklı Kruvasan" && o.price_modifier === 40),
    "Mini Kruvasan contains Antep Fıstıklı Kruvasan (+40 TL) option"
  );
  assert(
    miniOpt !== undefined && miniOpt.options.some((o) => o.name.includes("Lotus") && o.price_modifier === 40),
    "Mini Kruvasan contains Lotus (+40 TL) option"
  );

  const lotusCruffin = noaStore.getProductById("prod-lotus-cruffin");
  assert(
    lotusCruffin !== undefined && lotusCruffin.name === "Lotus Cruffin" && lotusCruffin.base_price === 350,
    "Lotus Cruffin is active and 350 TL"
  );

  const limonluCilekliDanish = noaStore.getProductById("prod-limonlu-cilekli-danish");
  assert(
    limonluCilekliDanish === undefined,
    "Limonlu Çilekli Danish is completely removed"
  );

  // Clean up test order so it doesn't pollute admin panel
  noaStore.deleteOrder(createdOrder.order.id);

  console.log("\n=========================================");
  console.log(`   TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
  console.log("=========================================\n");
}

runVerification();


