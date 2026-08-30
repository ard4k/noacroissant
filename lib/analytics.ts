import { Product, OrderRecord } from "./types";

declare global {
  interface Window {
    dataLayer?: Record<string, any>[];
    gtag?: (...args: any[]) => void;
  }
}

export function pushDataLayer(event: string, ecommerceData?: Record<string, any>) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];

  if (ecommerceData) {
    window.dataLayer.push({ ecommerce: null }); // Clear previous ecommerce object
    window.dataLayer.push({
      event,
      ecommerce: ecommerceData,
    });
  } else {
    window.dataLayer.push({ event });
  }
}

// 1. View Item List (Kategori veya Liste Görüntüleme)
export function trackViewItemList(categoryName: string, products: Product[]) {
  pushDataLayer("view_item_list", {
    item_list_name: categoryName,
    items: products.map((p, idx) => ({
      item_id: p.id,
      item_name: p.name,
      price: p.base_price,
      item_category: categoryName,
      index: idx + 1,
    })),
  });
}

// 2. View Item (Ürün Detay Modalı Açma)
export function trackViewItem(product: Product) {
  pushDataLayer("view_item", {
    currency: "TRY",
    value: product.base_price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.base_price,
        item_category: product.category_id,
      },
    ],
  });
}

// 3. Add to Cart (Sepete Ekleme)
export function trackAddToCart(product: Product, options: any[], quantity: number, finalPrice: number) {
  pushDataLayer("add_to_cart", {
    currency: "TRY",
    value: finalPrice,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.base_price,
        quantity,
        item_category: product.category_id,
        item_variant: options.map((o) => o.name).join(", "),
      },
    ],
  });
}

// 4. Begin Checkout (Sipariş Onay / Masadan Gönder Ekranı)
export function trackBeginCheckout(items: any[], totalValue: number, tableNumber?: number) {
  try {
    pushDataLayer("begin_checkout", {
      currency: "TRY",
      value: totalValue,
      table_number: tableNumber || 0,
      items: (items || []).map((i) => ({
        item_id: i.product_id || i.product?.id || i.id || "",
        item_name: i.product_name || i.name || i.product?.name || "",
        price: i.unit_price || i.base_price || i.total_price || 0,
        quantity: i.quantity || 1,
      })),
    });
  } catch (e) {
    console.warn("Analytics begin_checkout push error:", e);
  }
}

// 5. Purchase (Sipariş Başarıyla Oluşturuldu)
export function trackPurchase(order: any) {
  try {
    pushDataLayer("purchase", {
      transaction_id: order.id || order.order_number || "",
      value: order.total ?? order.total_amount ?? 0,
      currency: "TRY",
      table_number: order.table_number ?? 0,
      items: (order.items || []).map((i: any) => ({
        item_id: i.product_id || i.id,
        item_name: i.product_name || i.name,
        price: i.unit_price || i.total_price || 0,
        quantity: i.quantity || 1,
      })),
    });
  } catch (e) {
    console.warn("Analytics push error:", e);
  }
}
