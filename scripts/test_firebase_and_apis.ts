import fs from "fs";
import path from "path";

// Auto-load .env.local if present
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch (e) {}

import {
  db,
  isFirebaseConfigured,
} from "../lib/firebase/config";
import {
  getAllProductsFromFirestore,
  getSettingsFromFirestore,
  getAllTablesFromFirestore,
  saveOrderToFirestore,
  getOrderByIdFromFirestore,
  getOrderByTrackingTokenFromFirestore,
  updateOrderStatusInFirestore,
  saveServiceRequestToFirestore,
  getAllServiceRequestsFromFirestore,
  COLLECTIONS,
} from "../lib/firebase/firestore";
import { doc, deleteDoc, getDoc } from "firebase/firestore";
import { OrderRecord, ServiceRequest } from "../lib/types";

const LIVE_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.noacroissant.com";
const ADMIN_PIN = process.env.ADMIN_PIN || "330738";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`✅ PASS: ${msg}`);
    passedCount++;
  } else {
    console.error(`❌ FAIL: ${msg}`);
    failedCount++;
  }
}

async function runDirectFirebaseTests() {
  console.log("\n========================================================");
  console.log("🔥 PHASE 1: DIRECT FIREBASE / FIRESTORE INTEGRATION TESTS");
  console.log("========================================================");

  assert(isFirebaseConfigured === true, "Firebase is configured with valid environment variables");
  assert(Boolean(db), "Firestore instance (db) is initialized");

  if (!db) {
    console.error("Firestore db is null. Skipping Firestore tests.");
    return;
  }

  // 1. Products test
  const products = await getAllProductsFromFirestore();
  assert(products.length > 0, `Firestore contains ${products.length} products (expected > 0)`);
  const activeProducts = products.filter((p) => p.is_available && p.is_active);
  assert(activeProducts.length > 0, `Firestore contains ${activeProducts.length} active products`);

  // 2. Settings test
  const settings = await getSettingsFromFirestore();
  assert(settings !== null, "Firestore settings document exists and loaded successfully");

  // 3. Tables test
  const tables = await getAllTablesFromFirestore();
  assert(tables.length > 0, `Firestore contains ${tables.length} tables`);

  // 4. Order Lifecycle Test in Firestore
  const testOrderId = `test-ord-${Date.now()}`;
  const testTrackingToken = `track-${Date.now()}`;
  const mockOrder: OrderRecord = {
    id: testOrderId,
    order_number: 9999,
    table_number: 1,
    table_label: "Test Masa 01",
    status: "received",
    payment_method: "credit_card",
    payment_status: "paid",
    subtotal: 350,
    total: 350,
    tracking_token: testTrackingToken,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      {
        id: `item-${Date.now()}`,
        product_id: "prod-antep-fistikli",
        product_name: "Antep Fıstıklı Kruvasan (Test)",
        quantity: 1,
        unit_price: 350,
        total_price: 350,
      },
    ],
  };

  console.log(`\nTesting Firestore Order save for ID: ${testOrderId}...`);
  const saveSuccess = await saveOrderToFirestore(mockOrder);
  assert(saveSuccess === true, "saveOrderToFirestore returned true");

  const fetchedById = await getOrderByIdFromFirestore(testOrderId);
  assert(fetchedById !== null && fetchedById.id === testOrderId, "getOrderByIdFromFirestore retrieved correct order");
  assert(fetchedById?.total === 350, "Order total correctly matches 350");

  const fetchedByToken = await getOrderByTrackingTokenFromFirestore(testTrackingToken);
  assert(fetchedByToken !== null && fetchedByToken.id === testOrderId, "getOrderByTrackingTokenFromFirestore retrieved correct order");

  // Update status in Firestore
  console.log("Updating order status to 'preparing' in Firestore...");
  const updateSuccess = await updateOrderStatusInFirestore(testOrderId, "preparing", "paid", "Test Personel");
  assert(updateSuccess === true, "updateOrderStatusInFirestore returned true");

  const fetchedAfterUpdate = await getOrderByIdFromFirestore(testOrderId);
  assert(fetchedAfterUpdate?.status === "preparing", "Order status in Firestore updated to 'preparing'");

  // Clean up test order
  console.log("Cleaning up test order from Firestore...");
  await deleteDoc(doc(db, COLLECTIONS.ORDERS, testOrderId));
  const fetchedAfterDelete = await getOrderByIdFromFirestore(testOrderId);
  assert(fetchedAfterDelete === null, "Test order document successfully cleaned up from Firestore");

  // 5. Service Request Lifecycle Test in Firestore
  const testServiceId = `test-srv-${Date.now()}`;
  const mockServiceReq: ServiceRequest = {
    id: testServiceId,
    table_number: 1,
    table_label: "Test Masa 01",
    type: "water_napkin",
    status: "pending",
    created_at: new Date().toISOString(),
    note: "Su ve peçete rica olunur (Otomasyon Testi)",
  };

  console.log(`\nTesting Service Request save for ID: ${testServiceId}...`);
  const srvSaveSuccess = await saveServiceRequestToFirestore(mockServiceReq);
  assert(srvSaveSuccess === true, "saveServiceRequestToFirestore returned true");

  const allServiceReqs = await getAllServiceRequestsFromFirestore();
  const foundSrv = allServiceReqs.find((s) => s.id === testServiceId);
  assert(Boolean(foundSrv), "getAllServiceRequestsFromFirestore retrieved saved test service request");

  console.log("Cleaning up test service request from Firestore...");
  await deleteDoc(doc(db, COLLECTIONS.SERVICE_REQUESTS, testServiceId));
  const allServiceReqsAfter = await getAllServiceRequestsFromFirestore();
  assert(!allServiceReqsAfter.some((s) => s.id === testServiceId), "Test service request successfully cleaned up");
}

async function runLiveApiScenarioTests() {
  console.log("\n========================================================");
  console.log(`🌐 PHASE 2: LIVE PRODUCTION API SCENARIOS (${LIVE_BASE_URL})`);
  console.log("========================================================");

  // 1. GET /api/products
  console.log(`Testing GET ${LIVE_BASE_URL}/api/products...`);
  const productsRes = await fetch(`${LIVE_BASE_URL}/api/products`, { cache: "no-store" });
  assert(productsRes.status === 200, `GET /api/products returned 200 (got: ${productsRes.status})`);
  const productsData = await productsRes.json();
  assert(productsData.success === true, "GET /api/products returned success: true");
  assert(Array.isArray(productsData.products) && productsData.products.length > 0, `Returned ${productsData.products?.length} products`);
  assert(Array.isArray(productsData.tables) && productsData.tables.length > 0, `Returned ${productsData.tables?.length} tables`);

  // Grab a valid table token from the live API
  const sampleTable = productsData.tables[0];
  const tableToken = sampleTable.qr_token || "self_service";
  console.log(`Using table: ${sampleTable.label} (token: ${tableToken ? "VALID" : "EMPTY"})`);

  // 2. POST /api/service-call
  console.log(`\nTesting POST ${LIVE_BASE_URL}/api/service-call...`);
  const serviceRes = await fetch(`${LIVE_BASE_URL}/api/service-call`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": LIVE_BASE_URL,
    },
    body: JSON.stringify({
      table_number: sampleTable.table_number || 1,
      table_label: sampleTable.label || "Masa 01",
      type: "water_napkin",
      note: "E2E Test Çağrısı",
    }),
  });
  assert(serviceRes.status === 200, `POST /api/service-call returned 200 (got: ${serviceRes.status})`);
  const serviceData = await serviceRes.json();
  assert(serviceData.success === true, "POST /api/service-call responded with success: true");

  // 3. POST /api/order/create (Real Customer Order Placement Scenario)
  console.log(`\nTesting POST ${LIVE_BASE_URL}/api/order/create (Sipariş Verme Senaryosu)...`);
  const sampleProduct = productsData.products.find((p: any) => p.is_available && p.is_active) || productsData.products[0];
  console.log(`Ordering product: "${sampleProduct.name}" (ID: ${sampleProduct.id}, Price: ${sampleProduct.base_price} TL)`);

  const orderPayload = {
    table_token: tableToken,
    payment_method: "credit_card",
    general_note: "Canlı Sistem Entegrasyon Test Siparişi - Otomatik Test",
    customer_phone: "05550001122",
    language: "tr",
    items: [
      {
        product_id: sampleProduct.id,
        quantity: 1,
        item_note: "Test siparişi",
      },
    ],
  };

  const createRes = await fetch(`${LIVE_BASE_URL}/api/order/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": LIVE_BASE_URL,
    },
    body: JSON.stringify(orderPayload),
  });

  assert(createRes.status === 200, `POST /api/order/create returned 200 (got: ${createRes.status})`);
  const createData = await createRes.json();
  assert(createData.success === true, "Order created successfully with success: true");
  assert(Boolean(createData.order?.id), `Order ID assigned: ${createData.order?.id}`);
  assert(Boolean(createData.tracking_token), `Tracking token assigned: ${createData.tracking_token}`);

  const liveOrderId = createData.order?.id;
  const liveTrackingToken = createData.tracking_token;

  // 4. GET /api/order/track (Customer Tracking Scenario)
  console.log(`\nTesting GET ${LIVE_BASE_URL}/api/order/track?token=${liveTrackingToken} (Sipariş Takip Senaryosu)...`);
  const trackRes = await fetch(`${LIVE_BASE_URL}/api/order/track?token=${encodeURIComponent(liveTrackingToken)}`, {
    cache: "no-store",
  });
  assert(trackRes.status === 200, `GET /api/order/track returned 200 (got: ${trackRes.status})`);
  const trackData = await trackRes.json();
  assert(trackData.order?.id === liveOrderId, `Tracked order ID matches created order (${trackData.order?.id})`);
  assert(trackData.order?.status === "received", `Initial order status is 'received'`);
  assert(trackData.order?.items?.length === 1, `Order items count is 1`);

  // 5. POST /api/admin/auth (Staff / Kitchen Login Scenario)
  console.log(`\nTesting POST ${LIVE_BASE_URL}/api/admin/auth (Admin / Personel Giriş Senaryosu)...`);
  const authRes = await fetch(`${LIVE_BASE_URL}/api/admin/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": LIVE_BASE_URL,
    },
    body: JSON.stringify({
      action: "login",
      pin: ADMIN_PIN,
      role: "admin",
    }),
  });
  assert(authRes.status === 200, `POST /api/admin/auth returned 200 (got: ${authRes.status})`);
  const authData = await authRes.json();
  assert(authData.success === true, "Admin authentication succeeded");

  // Extract session cookie from Set-Cookie header
  const setCookie = authRes.headers.get("set-cookie") || "";
  const cookieMatch = setCookie.match(/noa_admin_token=[^;]+/);
  const adminCookie = cookieMatch ? cookieMatch[0] : "";
  assert(Boolean(adminCookie), "Received noa_admin_token session cookie");

  // 6. GET /api/admin/orders (Admin View Orders Queue)
  console.log(`\nTesting GET ${LIVE_BASE_URL}/api/admin/orders (Personel Sipariş Ekranı)...`);
  const adminOrdersRes = await fetch(`${LIVE_BASE_URL}/api/admin/orders`, {
    headers: {
      Cookie: adminCookie,
    },
    cache: "no-store",
  });
  assert(adminOrdersRes.status === 200, `GET /api/admin/orders returned 200 (got: ${adminOrdersRes.status})`);
  const adminOrdersData = await adminOrdersRes.json();
  assert(adminOrdersData.success === true, "GET /api/admin/orders success: true");
  const foundLiveOrder = adminOrdersData.orders?.find((o: any) => o.id === liveOrderId);
  assert(Boolean(foundLiveOrder), `Newly created order (${liveOrderId}) is present in staff order queue`);

  // 7. POST /api/admin/order-status (Staff Preparation and Delivery Flow)
  console.log(`\nTesting POST ${LIVE_BASE_URL}/api/admin/order-status -> 'preparing'...`);
  const statusPrepRes = await fetch(`${LIVE_BASE_URL}/api/admin/order-status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": LIVE_BASE_URL,
      Cookie: adminCookie,
    },
    body: JSON.stringify({
      order_id: liveOrderId,
      status: "preparing",
      staff_name: "Test Barista",
      note: "Sipariş mutfakta hazırlanıyor",
    }),
  });
  assert(statusPrepRes.status === 200, `Status change to 'preparing' returned 200 (got: ${statusPrepRes.status})`);

  // Verify tracking page updated to 'preparing'
  const trackPrepRes = await fetch(`${LIVE_BASE_URL}/api/order/track?token=${encodeURIComponent(liveTrackingToken)}`, {
    cache: "no-store",
  });
  const trackPrepData = await trackPrepRes.json();
  assert(trackPrepData.order?.status === "preparing", "Customer tracking endpoint reflects updated status 'preparing'");

  // Update to 'delivered' / completed
  console.log(`\nTesting POST ${LIVE_BASE_URL}/api/admin/order-status -> 'delivered' (Teslim Edildi)...`);
  const statusDelivRes = await fetch(`${LIVE_BASE_URL}/api/admin/order-status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": LIVE_BASE_URL,
      Cookie: adminCookie,
    },
    body: JSON.stringify({
      order_id: liveOrderId,
      status: "delivered",
      payment_status: "paid",
      staff_name: "Test Barista",
      note: "Sipariş masaya teslim edildi. Afiyet olsun!",
    }),
  });
  assert(statusDelivRes.status === 200, `Status change to 'delivered' returned 200`);

  const trackDelivRes = await fetch(`${LIVE_BASE_URL}/api/order/track?token=${encodeURIComponent(liveTrackingToken)}`, {
    cache: "no-store",
  });
  const trackDelivData = await trackDelivRes.json();
  assert(trackDelivData.order?.status === "delivered", "Customer tracking endpoint reflects completed status 'delivered'");

  // 8. GET /api/loyalty
  console.log(`\nTesting GET ${LIVE_BASE_URL}/api/loyalty?phone=05550001122 (Sadakat Kartı)...`);
  const loyaltyRes = await fetch(`${LIVE_BASE_URL}/api/loyalty?phone=05550001122`, { cache: "no-store" });
  assert(loyaltyRes.status === 200, `GET /api/loyalty returned 200 (got: ${loyaltyRes.status})`);
  const loyaltyData = await loyaltyRes.json();
  assert(loyaltyData.success === true, "GET /api/loyalty responded with success: true");
  assert(Boolean(loyaltyData.card?.phone_number), `Loyalty card exists for phone: ${loyaltyData.card?.phone_number}`);
}

async function main() {
  console.log("===============================================================");
  console.log("🚀 NOA CROISSANT: FULL API & FIREBASE E2E VERIFICATION SUITE");
  console.log("===============================================================");
  console.log(`Timestamp: ${new Date().toISOString()}`);

  try {
    await runDirectFirebaseTests();
  } catch (err) {
    console.error("Firebase Direct Tests error:", err);
    failedCount++;
  }

  try {
    await runLiveApiScenarioTests();
  } catch (err) {
    console.error("Live API Scenario Tests error:", err);
    failedCount++;
  }

  console.log("\n========================================================");
  console.log(`🏁 TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("========================================================");

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Fatal test suite runner error:", err);
  process.exit(1);
});
