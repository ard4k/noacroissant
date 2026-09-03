import {
  Category,
  DiningTable,
  Product,
  OrderRecord,
  OrderStatus,
  PaymentMethod,
  Promotion,
  BusinessSettings,
  StaffRole,
  OrderItemRecord,
  ServiceRequest,
  ServiceCallType,
  LoyaltyCard,
  SupportedLocale,
} from "./types";
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_PROMOTIONS,
  INITIAL_SETTINGS,
  INITIAL_TABLES,
} from "./seedData";

const STORAGE_KEYS = {
  TABLES: "noa_tables_v5",
  PRODUCTS: "noa_products_v5",
  CATEGORIES: "noa_categories_v5",
  ORDERS: "noa_orders_v5",
  SETTINGS: "noa_settings_v5",
  PROMOTIONS: "noa_promotions_v5",
  STAFF_USER: "noa_staff_user_v5",
  SERVICE_REQUESTS: "noa_service_requests_v5",
  LOYALTY_CARDS: "noa_loyalty_cards_v5",
};

// In-memory fallback singleton for server and client sync
class NoaStore {
  private tables: DiningTable[] = [...INITIAL_TABLES];
  private products: Product[] = [...INITIAL_PRODUCTS];
  private categories: Category[] = [...INITIAL_CATEGORIES];
  private orders: OrderRecord[] = [];
  private serviceRequests: ServiceRequest[] = [];
  private settings: BusinessSettings = { ...INITIAL_SETTINGS };
  private promotions: Promotion[] = [...INITIAL_PROMOTIONS];
  private loyaltyCards: Record<string, LoyaltyCard> = {};
  private listeners: Set<() => void> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    this.loadFromStorage();

    // Ensure all tables have a secure dynamic token at runtime if not set
    for (const table of this.tables) {
      if (!table.qr_token) {
        const randomSuffix =
          Math.random().toString(36).substring(2, 10) +
          Date.now().toString(36).substring(4);
        table.qr_token = `noa_tbl_${table.table_number
          .toString()
          .padStart(2, "0")}_${randomSuffix}`;
      }
    }

    if (typeof window !== "undefined") {
      try {
        this.broadcastChannel = new BroadcastChannel("noa_realtime_bus");
        this.broadcastChannel.onmessage = (event) => {
          if (event.data === "sync") {
            this.loadFromStorage();
            this.notify();
          }
        };
      } catch (e) {
        // BroadcastChannel might fail in unsupported test envs
      }
    }
  }

  private loadFromStorage() {
    if (typeof window === "undefined") {
      // Server-side filesystem persistence
      try {
        const fs = require("fs");
        const path = require("path");
        const isServerless = process.env.VERCEL === "1" || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
        const filePath = isServerless
          ? path.join("/tmp", ".data", "noa_store.json")
          : path.join(process.cwd(), ".data", "noa_store.json");

        if (fs.existsSync(filePath)) {
          const raw = fs.readFileSync(filePath, "utf-8");
          const data = JSON.parse(raw);
          if (data.tables && Array.isArray(data.tables)) this.tables = data.tables;
          const storedProducts = (data.products && Array.isArray(data.products)) ? (data.products as Product[]) : [];
          this.products = INITIAL_PRODUCTS.map((init) => {
            const stored = storedProducts.find((p) => p.id === init.id);
            if (stored) {
              return {
                ...init,
                is_available: stored.is_available ?? init.is_available,
                is_featured: stored.is_featured ?? init.is_featured,
              };
            }
            return init;
          });

          const storedCategories = (data.categories && Array.isArray(data.categories)) ? (data.categories as Category[]) : [];
          this.categories = INITIAL_CATEGORIES.map((init) => {
            const stored = storedCategories.find((c) => c.id === init.id);
            if (stored) {
              return {
                ...init,
                is_active: stored.is_active ?? init.is_active,
                display_order: stored.display_order ?? init.display_order,
              };
            }
            return init;
          });
          if (data.orders && Array.isArray(data.orders)) this.orders = data.orders;
          if (data.settings) {
            this.settings = { ...INITIAL_SETTINGS, ...data.settings };
            if (this.settings.loyalty_reward_name === "1 Adet Hediye Kahve") {
              this.settings.loyalty_reward_name = "Hediye Kahve";
            }
          }
          if (!Array.isArray(this.settings.disabled_ingredients)) {
            this.settings.disabled_ingredients = [];
          }
          if (data.promotions && Array.isArray(data.promotions)) this.promotions = data.promotions;
          if (data.loyaltyCards && typeof data.loyaltyCards === "object") {
            this.loyaltyCards = data.loyaltyCards;
          }
        }
      } catch (e) {
        // Ignore file read error
      }
      return;
    }

    try {
      // Always reset and clean legacy localStorage items to prevent stale data
      for (let i = 1; i <= 6; i++) {
        localStorage.removeItem(`noa_products_v${i}`);
        localStorage.removeItem(`noa_categories_v${i}`);
        localStorage.removeItem(`noa_orders_v${i}`);
      }
      localStorage.removeItem(STORAGE_KEYS.ORDERS);

      this.tables = [...INITIAL_TABLES];
      this.orders = [];

      const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (storedProducts) {
        try {
          const parsed = JSON.parse(storedProducts) as Product[];
          if (Array.isArray(parsed)) {
            this.products = INITIAL_PRODUCTS.map((init) => {
              const custom = parsed.find((p) => p.id === init.id);
              if (custom) {
                return {
                  ...init,
                  is_available: custom.is_available ?? init.is_available,
                  is_featured: custom.is_featured ?? init.is_featured,
                  base_price: custom.base_price ?? init.base_price,
                };
              }
              return init;
            });
            const customOnly = parsed.filter((p) => !INITIAL_PRODUCTS.some((init) => init.id === p.id));
            this.products.push(...customOnly);
          } else {
            this.products = [...INITIAL_PRODUCTS];
          }
        } catch {
          this.products = [...INITIAL_PRODUCTS];
        }
      } else {
        this.products = [...INITIAL_PRODUCTS];
      }

      const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (storedCategories) {
        try {
          const parsed = JSON.parse(storedCategories) as Category[];
          if (Array.isArray(parsed)) {
            this.categories = INITIAL_CATEGORIES.map((init) => {
              const custom = parsed.find((c) => c.id === init.id);
              if (custom) {
                return {
                  ...init,
                  is_active: custom.is_active ?? init.is_active,
                  display_order: custom.display_order ?? init.display_order,
                };
              }
              return init;
            });
          } else {
            this.categories = [...INITIAL_CATEGORIES];
          }
        } catch {
          this.categories = [...INITIAL_CATEGORIES];
        }
      } else {
        this.categories = [...INITIAL_CATEGORIES];
      }

      const storedTables = localStorage.getItem(STORAGE_KEYS.TABLES);
      if (storedTables) this.tables = JSON.parse(storedTables);

      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) {
        this.settings = { ...INITIAL_SETTINGS, ...JSON.parse(storedSettings) };
        if (this.settings.loyalty_reward_name === "1 Adet Hediye Kahve") {
          this.settings.loyalty_reward_name = "Hediye Kahve";
        }
      }
      if (!Array.isArray(this.settings.disabled_ingredients)) {
        this.settings.disabled_ingredients = [];
      }

      const storedPromos = localStorage.getItem(STORAGE_KEYS.PROMOTIONS);
      if (storedPromos) this.promotions = JSON.parse(storedPromos);

      const storedLoyalty = localStorage.getItem(STORAGE_KEYS.LOYALTY_CARDS);
      if (storedLoyalty) {
        this.loyaltyCards = JSON.parse(storedLoyalty);
      }
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") {
      // Server-side filesystem persistence
      try {
        const fs = require("fs");
        const path = require("path");
        const isServerless = process.env.VERCEL === "1" || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
        const dirPath = isServerless ? path.join("/tmp", ".data") : path.join(process.cwd(), ".data");
        const filePath = path.join(dirPath, "noa_store.json");
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
        const state = {
          tables: this.tables,
          products: this.products,
          categories: this.categories,
          orders: this.orders,
          settings: this.settings,
          promotions: this.promotions,
          loyaltyCards: this.loyaltyCards,
        };
        fs.writeFileSync(filePath, JSON.stringify(state, null, 2), "utf-8");
      } catch (e) {
        // Ignore file write error
      }
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(this.tables));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
      localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(this.promotions));
      localStorage.setItem(STORAGE_KEYS.LOYALTY_CARDS, JSON.stringify(this.loyaltyCards));

      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage("sync");
      }
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }

  public subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // --- TABLES ---
  public getTables(): DiningTable[] {
    return [...this.tables];
  }

  public getTableByToken(token: string): DiningTable | undefined {
    if (!token) return undefined;
    return this.tables.find((t) => t.qr_token === token && t.is_active);
  }

  public getTableByNumber(num: number): DiningTable | undefined {
    return this.tables.find((t) => t.table_number === num);
  }

  public regenerateTableToken(tableId: string): string {
    const table = this.tables.find((t) => t.id === tableId);
    if (!table) throw new Error("Masa bulunamadı");

    const randomSuffix = Math.random().toString(36).substring(2, 10) + Date.now().toString(36).substring(4);
    const newToken = `noa_tbl_${table.table_number.toString().padStart(2, "0")}_${randomSuffix}`;
    table.qr_token = newToken;
    table.last_token_regenerated_at = new Date().toISOString();

    this.saveToStorage();
    this.notify();
    return newToken;
  }

  // --- CATEGORIES & PRODUCTS ---
  public getCategories(): Category[] {
    return [...this.categories].sort((a, b) => a.display_order - b.display_order);
  }

  public getProducts(): Product[] {
    return [...this.products].sort((a, b) => a.display_order - b.display_order);
  }

  public getProductBySlug(slug: string): Product | undefined {
    return this.getProducts().find((p) => p.slug === slug);
  }

  public getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  public updateProduct(updated: Partial<Product> & { id: string }): Product {
    const idx = this.products.findIndex((p) => p.id === updated.id);
    if (idx === -1) throw new Error("Ürün bulunamadı");

    this.products[idx] = { ...this.products[idx], ...updated };
    this.saveToStorage();
    this.notify();
    return this.products[idx];
  }

  public hydrateProducts(products: Product[]): void {
    if (!products || products.length === 0) return;
    for (const prod of products) {
      const idx = this.products.findIndex((p) => p.id === prod.id);
      if (idx >= 0) {
        this.products[idx] = { ...this.products[idx], ...prod };
      } else {
        this.products.push(prod);
      }
    }
    this.saveToStorage();
    this.notify();
  }

  public addProduct(product: Omit<Product, "id"> & { id?: string }): Product {
    const newProduct: Product = {
      ...product,
      id: product.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    this.products.push(newProduct);
    this.saveToStorage();
    this.notify();
    return newProduct;
  }

  public deleteProduct(id: string) {
    this.products = this.products.filter((p) => p.id !== id);
    this.saveToStorage();
    this.notify();
  }

  public updateCategory(updated: Partial<Category> & { id: string }) {
    const idx = this.categories.findIndex((c) => c.id === updated.id);
    if (idx !== -1) {
      this.categories[idx] = { ...this.categories[idx], ...updated };
      this.saveToStorage();
      this.notify();
    }
  }

  // --- PROMOTIONS & SETTINGS ---
  public getPromotions(): Promotion[] {
    return [...this.promotions];
  }

  public updatePromotion(id: string, is_active: boolean) {
    const promo = this.promotions.find((p) => p.id === id);
    if (promo) {
      promo.is_active = is_active;
      this.saveToStorage();
      this.notify();
    }
  }

  public getSettings(): BusinessSettings {
    return { ...this.settings };
  }

  public updateSettings(settings: Partial<BusinessSettings>) {
    this.settings = { ...this.settings, ...settings };
    this.saveToStorage();
    this.notify();
  }

  // --- ORDERS ---
  public getOrders(): OrderRecord[] {
    return [...this.orders].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getOrderByTrackingToken(token: string): OrderRecord | undefined {
    return this.orders.find((o) => o.tracking_token === token);
  }

  public getOrderById(id: string): OrderRecord | undefined {
    return this.orders.find((o) => o.id === id);
  }

  public hydrateOrder(order: OrderRecord): void {
    const idx = this.orders.findIndex(
      (o) => o.id === order.id || o.tracking_token === order.tracking_token
    );
    if (idx >= 0) {
      this.orders[idx] = { ...this.orders[idx], ...order };
    } else {
      this.orders.unshift(order);
    }
    this.saveToStorage();
    this.notify();
  }

  public setOrders(orders: OrderRecord[]): void {
    this.orders = Array.isArray(orders) ? [...orders] : [];
    this.orders.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    this.saveToStorage();
    this.notify();
  }

  public hydrateOrders(orders: OrderRecord[]): void {
    if (!orders || orders.length === 0) return;
    for (const ord of orders) {
      const idx = this.orders.findIndex(
        (o) => o.id === ord.id || o.tracking_token === ord.tracking_token
      );
      if (idx >= 0) {
        this.orders[idx] = { ...this.orders[idx], ...ord };
      } else {
        this.orders.push(ord);
      }
    }
    this.orders.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    this.saveToStorage();
    this.notify();
  }

  // Server-safe tamper-proof order creation
  public createOrder(params: {
    table_token: string;
    items: {
      product_id: string;
      quantity: number;
      selected_options?: { option_group_id: string; option_value_id: string }[];
      item_note?: string;
      is_complimentary?: boolean;
    }[];
    payment_method: PaymentMethod;
    general_note?: string;
    idempotency_key?: string;
    customer_phone?: string;
    language?: SupportedLocale;
  }): { order: OrderRecord; tracking_token: string } {
    let table = this.getTableByToken(params.table_token);
    if (!table) {
      if (params.table_token === "self_service" || this.tables.length > 0) {
        table = this.tables[0];
      } else {
        throw new Error("Geçersiz masa QR kodu veya masa bulunamadı.");
      }
    }

    if (params.idempotency_key) {
      const existing = this.orders.find((o) => o.idempotency_key === params.idempotency_key);
      if (existing) {
        return { order: existing, tracking_token: existing.tracking_token };
      }
    }

    if (!params.items || params.items.length === 0) {
      throw new Error("Sipariş için en az 1 ürün gereklidir.");
    }

    let calculatedSubtotal = 0;
    const orderItems: OrderItemRecord[] = [];
    const now = new Date().toISOString();
    const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Verify promotional tea eligibility
    let hasSavouryCroissant = false;
    let complimentaryCount = 0;

    for (const item of params.items) {
      const product = this.getProductById(item.product_id);
      if (!product) {
        throw new Error(`Ürün bulunamadı: ${item.product_id}`);
      }
      if (!product.is_available) {
        throw new Error(`"${product.name}" şu anda tükenmiştir.`);
      }

      // Check disabled / out-of-stock ingredients
      const disabledList = (this.settings.disabled_ingredients || []).map((i) => i.toLowerCase().trim());
      if (disabledList.length > 0) {
        let productIngs: string[] = [];
        if (Array.isArray(product.ingredients)) {
          productIngs = product.ingredients;
        } else if (typeof product.ingredients === "string") {
          productIngs = (product.ingredients as string).split(",").map((s) => s.trim());
        }

        const matchedDisabled = disabledList.find((disabled) => {
          if (productIngs.some((ing) => ing.toLowerCase().includes(disabled) || disabled.includes(ing.toLowerCase()))) {
            return true;
          }
          if (product.name.toLowerCase().includes(disabled) || product.slug.toLowerCase().includes(disabled)) {
            return true;
          }
          return false;
        });

        if (matchedDisabled) {
          throw new Error(`"${matchedDisabled}" tükendiği için "${product.name}" şu anda sipariş verilemez.`);
        }

        if (item.selected_options && product.option_groups) {
          for (const sel of item.selected_options) {
            const group = product.option_groups.find((g) => g.id === sel.option_group_id);
            if (group) {
              const val = group.options.find((o) => o.id === sel.option_value_id);
              if (val && disabledList.some((d) => val.name.toLowerCase().includes(d) || d.includes(val.name.toLowerCase()))) {
                throw new Error(`"${val.name}" seçeneği tükendiği için seçilemez.`);
              }
            }
          }
        }
      }

      if (product.category_id === "cat-tuzlu") {
        hasSavouryCroissant = true;
      }

      // Calculate unit price from database definitions
      let itemPrice = product.base_price;
      const snapOptions: {
        option_group_name: string;
        option_value_name: string;
        price_modifier: number;
      }[] = [];

      if (item.selected_options && product.option_groups) {
        for (const sel of item.selected_options) {
          const group = product.option_groups.find((g) => g.id === sel.option_group_id);
          if (group) {
            const val = group.options.find((o) => o.id === sel.option_value_id);
            if (val) {
              itemPrice += val.price_modifier;
              snapOptions.push({
                option_group_name: group.display_name,
                option_value_name: val.name,
                price_modifier: val.price_modifier,
              });
            }
          }
        }
      }

      // Check complimentary item
      let isComplimentary = Boolean(item.is_complimentary);
      if (isComplimentary) {
        complimentaryCount += item.quantity;
        itemPrice = 0;
      }

      const totalItemPrice = itemPrice * item.quantity;
      calculatedSubtotal += totalItemPrice;

      orderItems.push({
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        order_id: orderId,
        product_id: product.id,
        product_name: product.name,
        product_slug: product.slug,
        quantity: item.quantity,
        unit_price: itemPrice,
        total_price: totalItemPrice,
        item_note: item.item_note ? item.item_note.trim().substring(0, 200) : undefined,
        is_complimentary: isComplimentary,
        options: snapOptions,
      });
    }

    if (complimentaryCount > 1) {
      throw new Error("Sipariş başına en fazla 1 adet ikram çay eklenebilir.");
    }
    if (complimentaryCount > 0 && !hasSavouryCroissant) {
      throw new Error("İkram çay sadece tuzlu kruvasan siparişlerinde geçerlidir.");
    }

    const orderNumber = `NOA-${String(new Date().getDate()).padStart(2, "0")}${String(
      new Date().getMonth() + 1
    ).padStart(2, "0")}-${String(this.orders.length + 1).padStart(3, "0")}`;

    const trackingToken = `trk_${Math.random().toString(36).substring(2, 12)}_${Date.now().toString(36)}`;

    const isSelfService = params.table_token === "self_service" || !params.table_token;

    const newOrder: OrderRecord = {
      id: orderId,
      order_number: orderNumber,
      table_id: isSelfService ? "self-service" : table.id,
      table_number: isSelfService ? 0 : table.table_number,
      table_label: isSelfService ? "Self Servis" : table.label,
      tracking_token: trackingToken,
      status: "received",
      payment_method: params.payment_method,
      payment_status: "unpaid",
      subtotal: calculatedSubtotal,
      total: calculatedSubtotal,
      customer_phone: params.customer_phone,
      general_note: params.general_note ? params.general_note.trim().substring(0, 300) : undefined,
      idempotency_key: params.idempotency_key,
      language: params.language,
      created_at: now,
      updated_at: now,
      items: orderItems,
      status_history: [
        {
          id: `evt-${Date.now()}`,
          order_id: orderId,
          from_status: null,
          to_status: "received",
          note: "Sipariş oluşturuldu",
          created_at: now,
        },
      ],
    };

    this.orders.unshift(newOrder);
    this.saveToStorage();
    this.notify();

    return { order: newOrder, tracking_token: trackingToken };
  }

  public updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    cancelledReason?: string,
    staffName?: string
  ): OrderRecord | null {
    const order = this.orders.find((o) => o.id === orderId || o.order_number === orderId);
    if (!order) {
      console.warn(`Order not found for ID: ${orderId}`);
      return null;
    }

    const previousStatus = order.status;
    order.status = newStatus;
    order.updated_at = new Date().toISOString();

    if (cancelledReason) {
      order.cancelled_reason = cancelledReason;
    }

    if (!order.status_history) {
      order.status_history = [];
    }

    order.status_history.push({
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      order_id: orderId,
      from_status: previousStatus,
      to_status: newStatus,
      note: note || (cancelledReason ? `İptal Nedeni: ${cancelledReason}` : undefined),
      created_by: staffName || "Staff",
      created_at: new Date().toISOString(),
    });

    this.saveToStorage();
    this.notify();
    return order;
  }

  public updatePaymentStatus(orderId: string, status: "paid" | "unpaid"): OrderRecord | null {
    const order = this.orders.find((o) => o.id === orderId || o.order_number === orderId);
    if (!order) {
      console.warn(`Order not found for payment update: ${orderId}`);
      return null;
    }

    order.payment_status = status;
    order.updated_at = new Date().toISOString();

    this.saveToStorage();
    this.notify();
    return order;
  }

  public deleteOrder(orderId: string): boolean {
    const initialLen = this.orders.length;
    this.orders = this.orders.filter((o) => o.id !== orderId && o.order_number !== orderId);
    if (this.orders.length !== initialLen) {
      this.saveToStorage();
      this.notify();
      return true;
    }
    return false;
  }

  public clearOrders(): void {
    this.orders = [];
    this.saveToStorage();
    this.notify();
  }

  // --- SERVICE REQUESTS (CALL WAITER / BILL) ---
  public getServiceRequests(status?: "pending" | "completed"): ServiceRequest[] {
    const list = status
      ? this.serviceRequests.filter((r) => r.status === status)
      : this.serviceRequests;
    return [...list].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public createServiceRequest(params: {
    table_number: number;
    table_label?: string;
    type: ServiceCallType;
    note?: string;
  }): ServiceRequest {
    const typeLabels: Record<ServiceCallType, string> = {
      waiter: "Garson Çağrısı",
      bill_card: "Hesap İstendi (Kredi Kartı)",
      bill_cash: "Hesap İstendi (Nakit)",
      water_napkin: "Su & Peçete İsteği",
      tea_refresh: "Çay Tazeleme İsteği",
    };

    const newReq: ServiceRequest = {
      id: `call-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      table_number: params.table_number,
      table_label: params.table_label || `Masa ${params.table_number.toString().padStart(2, "0")}`,
      type: params.type,
      type_label: typeLabels[params.type] || "Garson Çağrısı",
      note: params.note ? params.note.trim().substring(0, 200) : undefined,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    this.serviceRequests.unshift(newReq);
    this.saveToStorage();
    this.notify();
    return newReq;
  }

  public resolveServiceRequest(id: string, resolvedBy?: string): ServiceRequest | null {
    const req = this.serviceRequests.find((r) => r.id === id);
    if (!req) return null;

    req.status = "completed";
    req.resolved_at = new Date().toISOString();
    req.resolved_by = resolvedBy || "Personel";

    this.saveToStorage();
    this.notify();
    return req;
  }

  public hydrateServiceRequests(requests: ServiceRequest[]): void {
    if (!requests || !Array.isArray(requests)) return;
    this.serviceRequests = requests;
    this.saveToStorage();
    this.notify();
  }

  // --- INGREDIENT & OPTION STOCK MANAGEMENT ---
  public getDisabledIngredients(): string[] {
    return this.settings.disabled_ingredients || [];
  }

  public toggleIngredient(ingredientName: string, isAvailable?: boolean): string[] {
    const current = new Set(this.settings.disabled_ingredients || []);
    const normalized = ingredientName.trim();

    if (isAvailable !== undefined) {
      if (isAvailable) {
        current.delete(normalized);
      } else {
        current.add(normalized);
      }
    } else {
      if (current.has(normalized)) {
        current.delete(normalized);
      } else {
        current.add(normalized);
      }
    }

    this.settings.disabled_ingredients = Array.from(current);
    this.saveToStorage();
    this.notify();
    return this.settings.disabled_ingredients;
  }

  // --- LOYALTY CARDS PERSISTENCE ---
  public getLoyaltyCard(phoneE164: string): LoyaltyCard | undefined {
    if (!phoneE164) return undefined;
    const id = phoneE164.replace(/\D/g, "");
    return this.loyaltyCards[id];
  }

  public saveLoyaltyCard(card: LoyaltyCard): void {
    if (!card) return;
    const id = card.id || card.phone_number.replace(/\D/g, "");
    this.loyaltyCards[id] = { ...card, id };
    this.saveToStorage();
    this.notify();
  }

  public getAllLoyaltyCards(): LoyaltyCard[] {
    return Object.values(this.loyaltyCards);
  }
}

export const noaStore = new NoaStore();
