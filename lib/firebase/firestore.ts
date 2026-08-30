import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
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
} from "../types";

export const COLLECTIONS = {
  PRODUCTS: "products",
  CATEGORIES: "categories",
  ORDERS: "orders",
  TABLES: "tables",
  SETTINGS: "settings",
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
      where("is_active", "==", true),
      orderBy("sort_order", "asc")
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
