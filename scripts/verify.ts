import { noaStore } from "../lib/store";
import { INITIAL_TABLES, INITIAL_PRODUCTS } from "../lib/seedData";

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

  // Clean up test order so it doesn't pollute admin panel
  noaStore.deleteOrder(createdOrder.order.id);

  console.log("\n=========================================");
  console.log(`   TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
  console.log("=========================================\n");
}

runVerification();
