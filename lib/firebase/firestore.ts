import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./config";
export { isFirebaseConfigured };
import {
  Product,
  Category,
  OrderRecord,
  DiningTable,
  BusinessSettings,
  OrderStatus,
  PaymentStatus,
  ServiceRequest,
} from "../types";

export const COLLECTIONS = {
  PRODUCTS: "products",
  CATEGORIES: "categories",
  ORDERS: "orders",
  TABLES: "tables",
  SETTINGS: "settings",
  SERVICE_REQUESTS: "service_requests",
} as const;

/**
 * Realtime listener for active orders
 */
export function subscribeToOrders(
  onOrdersUpdate: (orders: OrderRecord[]) => void,
  onError?: (error: Error) => void
): Unsubscribe | null {
  if (!isFirebaseConfigured || !db) return null;

  try {
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      orderBy("created_at", "desc"),
      limit(100)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const orders: OrderRecord[] = [];
        snapshot.forEach((docSnap) => {
          orders.push({ id: docSnap.id, ...docSnap.data() } as OrderRecord);
        });
        onOrdersUpdate(orders);
      },
      (error) => {
        console.error("Firestore orders subscription error:", error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.error("Failed to setup orders listener:", err);
    return null;
  }
}

function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  if (typeof obj === "object" && !(obj instanceof Date)) {
    const clean: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        clean[key] = sanitizeForFirestore(value);
      }
    }
    return clean;
  }
  return obj;
}

/**
 * Create or save order in Firestore
 */
export async function saveOrderToFirestore(order: OrderRecord): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;

  try {
    const docRef = doc(db, COLLECTIONS.ORDERS, order.id);
    const sanitized = sanitizeForFirestore({
      ...order,
      updated_at: new Date().toISOString(),
    });
    await setDoc(docRef, sanitized);
    return true;
  } catch (error) {
    console.error("Error saving order to Firestore:", error);
    return false;
  }
}

/**
 * Fetch order by tracking token from Firestore
 */
export async function getOrderByTrackingTokenFromFirestore(
  trackingToken: string
): Promise<OrderRecord | null> {
  if (!isFirebaseConfigured || !db) return null;

  try {
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where("tracking_token", "==", trackingToken),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as OrderRecord;
    }
    return null;
  } catch (err) {
    console.error("Error fetching order from Firestore by tracking token:", err);
    return null;
  }
}

/**
 * Fetch order by ID from Firestore
 */
export async function getOrderByIdFromFirestore(orderId: string): Promise<OrderRecord | null> {
  if (!isFirebaseConfigured || !db) return null;

  try {
    const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as OrderRecord;
    }
    return null;
  } catch (err) {
    console.error("Error fetching order from Firestore by ID:", err);
    return null;
  }
}

/**
 * Fetch all orders from Firestore (sorted by created_at desc)
 */
export async function getAllOrdersFromFirestore(): Promise<OrderRecord[]> {
  if (!isFirebaseConfigured || !db) return [];

  try {
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      orderBy("created_at", "desc"),
      limit(200)
    );
    const snap = await getDocs(q);
    const orders: OrderRecord[] = [];
    snap.forEach((docSnap) => {
      orders.push({ id: docSnap.id, ...docSnap.data() } as OrderRecord);
    });
    return orders;
  } catch (err) {
    console.error("Error fetching all orders from Firestore:", err);
    return [];
  }
}

/**
 * Clear/delete all orders from Firestore
 */
export async function clearAllOrdersFromFirestore(): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;

  try {
    const snap = await getDocs(collection(db, COLLECTIONS.ORDERS));
    if (snap.empty) return true;

    // Batch delete in chunks of 400
    const docs = snap.docs;
    for (let i = 0; i < docs.length; i += 400) {
      const batch = writeBatch(db);
      const chunk = docs.slice(i, i + 400);
      chunk.forEach((d) => {
        batch.delete(d.ref);
      });
      await batch.commit();
    }
    return true;
  } catch (err) {
    console.error("Error clearing all orders from Firestore:", err);
    return false;
  }
}

/**
 * Update order status and payment status in Firestore
 */
export async function updateOrderStatusInFirestore(
  orderId: string,
  status: OrderStatus,
  paymentStatus?: PaymentStatus,
  staffRole?: string
): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;

  try {
    const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
    const updatePayload: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (paymentStatus) {
      updatePayload.payment_status = paymentStatus;
    }

    if (staffRole) {
      updatePayload.last_updated_by = staffRole;
    }

    await updateDoc(docRef, updatePayload);
    return true;
  } catch (error) {
    console.error("Error updating order in Firestore:", error);
    return false;
  }
}

/**
 * Realtime listener for menu products
 */
export function subscribeToProducts(
  onProductsUpdate: (products: Product[]) => void
): Unsubscribe | null {
  if (!isFirebaseConfigured || !db) return null;

  try {
    const q = query(
      collection(db, COLLECTIONS.PRODUCTS),
      orderBy("display_order", "asc")
    );

    return onSnapshot(q, (snapshot) => {
      const products: Product[] = [];
      snapshot.forEach((docSnap) => {
        products.push({ id: docSnap.id, ...docSnap.data() } as Product);
      });
      onProductsUpdate(products);
    });
  } catch (err) {
    console.error("Failed to setup products listener:", err);
    return null;
  }
}

/**
 * Seed all initial menu data to Firestore
 */
export async function seedAllDataToFirestore(data: {
  categories: Category[];
  products: Product[];
  tables: DiningTable[];
  settings: BusinessSettings;
}): Promise<{ success: boolean; message: string }> {
  if (!isFirebaseConfigured || !db) {
    return {
      success: false,
      message: "Firebase henüz yapılandırılmamış. Lütfen .env.local dosyasına Firebase bilgilerinizi ekleyin.",
    };
  }

  try {
    // 1. Seed Categories
    for (const cat of data.categories) {
      await setDoc(doc(db, COLLECTIONS.CATEGORIES, cat.id), cat);
    }

    // 2. Seed Products
    for (const prod of data.products) {
      await setDoc(doc(db, COLLECTIONS.PRODUCTS, prod.id), prod);
    }

    // 3. Seed Tables
    for (const table of data.tables) {
      await setDoc(doc(db, COLLECTIONS.TABLES, table.id), table);
    }

    // 4. Seed Settings
    await setDoc(doc(db, COLLECTIONS.SETTINGS, "business"), data.settings);

    return {
      success: true,
      message: `${data.products.length} ürün, ${data.categories.length} kategori ve ${data.tables.length} masa Firestore veritabanına başarıyla yüklendi!`,
    };
  } catch (error: any) {
    console.error("Error seeding to Firestore:", error);
    return {
      success: false,
      message: error?.message || "Veriler Firestore'a yüklenirken hata oluştu.",
    };
  }
}

/**
 * Fetch all products from Firestore
 */
export async function getAllProductsFromFirestore(): Promise<Product[]> {
  if (!isFirebaseConfigured || !db) return [];
  try {
    const q = query(
      collection(db, COLLECTIONS.PRODUCTS),
      orderBy("display_order", "asc")
    );
    const snap = await getDocs(q);
    const products: Product[] = [];
    snap.forEach((docSnap) => {
      products.push({ id: docSnap.id, ...docSnap.data() } as Product);
    });
    return products;
  } catch (err) {
    console.error("Error fetching all products from Firestore:", err);
    return [];
  }
}

/**
 * Save or update single product in Firestore
 */
export async function saveProductToFirestore(product: Product): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, product.id);
    await setDoc(docRef, sanitizeForFirestore(product), { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving product to Firestore:", error);
    return false;
  }
}

/**
 * Delete single product from Firestore
 */
export async function deleteProductFromFirestore(productId: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const { deleteDoc } = await import("firebase/firestore");
    const docRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting product from Firestore:", error);
    return false;
  }
}

/**
 * Realtime listener for active service calls (waiter/bill requests)
 */
export function subscribeToServiceRequests(
  onRequestsUpdate: (requests: ServiceRequest[]) => void,
  onError?: (error: Error) => void
): Unsubscribe | null {
  if (!isFirebaseConfigured || !db) return null;

  try {
    const q = query(
      collection(db, COLLECTIONS.SERVICE_REQUESTS),
      where("status", "==", "pending"),
      limit(50)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const requests: ServiceRequest[] = [];
        snapshot.forEach((docSnap) => {
          requests.push({ id: docSnap.id, ...docSnap.data() } as ServiceRequest);
        });
        requests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        onRequestsUpdate(requests);
      },
      (error) => {
        console.error("Firestore service requests subscription error:", error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.error("Failed to setup service requests listener:", err);
    return null;
  }
}

/**
 * Save new service request in Firestore
 */
export async function saveServiceRequestToFirestore(req: ServiceRequest): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const docRef = doc(db, COLLECTIONS.SERVICE_REQUESTS, req.id);
    await setDoc(docRef, sanitizeForFirestore(req));
    return true;
  } catch (error) {
    console.error("Error saving service request to Firestore:", error);
    return false;
  }
}

/**
 * Fetch all active service requests from Firestore
 */
export async function getAllServiceRequestsFromFirestore(): Promise<ServiceRequest[]> {
  if (!isFirebaseConfigured || !db) return [];
  try {
    const q = query(
      collection(db, COLLECTIONS.SERVICE_REQUESTS),
      orderBy("created_at", "desc"),
      limit(50)
    );
    const snap = await getDocs(q);
    const requests: ServiceRequest[] = [];
    snap.forEach((d) => {
      requests.push({ id: d.id, ...d.data() } as ServiceRequest);
    });
    return requests;
  } catch (error) {
    console.error("Error fetching service requests from Firestore:", error);
    return [];
  }
}

/**
 * Mark service request as completed in Firestore
 */
export async function resolveServiceRequestInFirestore(
  requestId: string,
  resolvedBy: string = "Personel"
): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const docRef = doc(db, COLLECTIONS.SERVICE_REQUESTS, requestId);
    await updateDoc(docRef, {
      status: "completed",
      resolved_at: new Date().toISOString(),
      resolved_by: resolvedBy,
    });
    return true;
  } catch (error) {
    console.error("Error resolving service request in Firestore:", error);
    return false;
  }
}

/**
 * Fetch business settings from Firestore
 */
export async function getSettingsFromFirestore(): Promise<BusinessSettings | null> {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, "business");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as BusinessSettings;
    }
    return null;
  } catch (error) {
    console.error("Error getting settings from Firestore:", error);
    return null;
  }
}

/**
 * Save business settings to Firestore (including Wi-Fi and disabled ingredients)
 */
export async function saveSettingsToFirestore(settings: BusinessSettings): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, "business");
    await setDoc(docRef, sanitizeForFirestore(settings), { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving settings to Firestore:", error);
    return false;
  }
}

/**
 * Realtime listener for business settings
 */
export function subscribeToSettings(
  onSettingsUpdate: (settings: BusinessSettings) => void
): Unsubscribe | null {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, "business");
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        onSettingsUpdate(snapshot.data() as BusinessSettings);
      }
    });
  } catch (err) {
    return null;
  }
}

