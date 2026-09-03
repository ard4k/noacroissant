"use client";

import { useState, useEffect } from "react";
import { CartItem, CartItemOption, Product } from "./types";

const CART_STORAGE_KEY = "noa_customer_cart_v1";

interface CartStoreState {
  items: CartItem[];
  tableToken: string | null;
  tableNumber: number | null;
  generalNote: string;
  complimentaryTeaClaimed: boolean;
}

export function useCart() {
  const [cart, setCart] = useState<CartStoreState>({
    items: [],
    tableToken: null,
    tableNumber: null,
    generalNote: "",
    complimentaryTeaClaimed: false,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to load cart from storage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage
  const saveCart = (nextCart: CartStoreState) => {
    setCart(nextCart);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextCart));
    } catch (e) {
      console.warn("Failed to save cart to storage", e);
    }
  };

  // Check if cart has savoury croissant
  const hasSavouryCroissant = (items: CartItem[]) => {
    return items.some((item) => {
      // Yeşil lezzet, ege esintisi, avokado royale, kaburga deluxe, pesto milano, közlü peynirli, hot dog
      return (
        [
          "yesil-lezzet",
          "ege-esintisi",
          "avokado-royale",
          "kaburga-deluxe",
          "pesto-milano",
          "kozlu-peynirli",
          "hot-dog",
        ].includes(item.product_slug) && !item.is_complimentary
      );
    });
  };

  const addItem = (
    product: Product,
    options: CartItemOption[] = [],
    quantity = 1,
    itemNote?: string
  ) => {
    // Generate unique composite key
    const sortedOptions = [...options];
    const optionsKey = sortedOptions
      .map((o) => o.option_value_id)
      .sort()
      .join("_");
    const itemKey = `${product.id}-${optionsKey}-${itemNote || ""}`;

    const optionAdditions = options.reduce((sum, opt) => sum + opt.price_modifier, 0);
    const unitPrice = product.base_price + optionAdditions;

    let updatedItems = [...cart.items];
    const existingIndex = updatedItems.findIndex((i) => i.id === itemKey);

    if (existingIndex > -1) {
      const existing = updatedItems[existingIndex];
      const newQty = existing.quantity + quantity;
      updatedItems[existingIndex] = {
        ...existing,
        quantity: newQty,
        total_price: unitPrice * newQty,
      };
    } else {
      updatedItems.push({
        id: itemKey,
        product_id: product.id,
        product_name: product.name,
        product_name_i18n: product.name_i18n,
        product_slug: product.slug,
        product_image: product.image_url,
        base_price: product.base_price,
        selected_options: sortedOptions,
        quantity,
        item_note: itemNote,
        unit_price: unitPrice,
        total_price: unitPrice * quantity,
        is_complimentary: false,
      });
    }

    // Auto check complimentary tea status
    let compClaimed = cart.complimentaryTeaClaimed;
    if (!hasSavouryCroissant(updatedItems)) {
      compClaimed = false;
      updatedItems = updatedItems.filter((i) => !i.is_complimentary);
    }

    saveCart({
      ...cart,
      items: updatedItems,
      complimentaryTeaClaimed: compClaimed,
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    let updatedItems = cart.items
      .map((item) => {
        if (item.id === itemId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return {
            ...item,
            quantity: newQty,
            total_price: item.is_complimentary ? 0 : item.unit_price * newQty,
          };
        }
        return item;
      })
      .filter((i): i is CartItem => i !== null);

    // If savoury croissant is removed, remove complimentary tea
    let compClaimed = cart.complimentaryTeaClaimed;
    if (!hasSavouryCroissant(updatedItems)) {
      compClaimed = false;
      updatedItems = updatedItems.filter((i) => !i.is_complimentary);
    }

    saveCart({
      ...cart,
      items: updatedItems,
      complimentaryTeaClaimed: compClaimed,
    });
  };

  const removeItem = (itemId: string) => {
    let updatedItems = cart.items.filter((item) => item.id !== itemId);

    let compClaimed = cart.complimentaryTeaClaimed;
    if (!hasSavouryCroissant(updatedItems)) {
      compClaimed = false;
      updatedItems = updatedItems.filter((i) => !i.is_complimentary);
    }

    saveCart({
      ...cart,
      items: updatedItems,
      complimentaryTeaClaimed: compClaimed,
    });
  };

  const claimComplimentaryTea = (claim: boolean) => {
    if (!hasSavouryCroissant(cart.items)) return;

    let updatedItems = cart.items.filter((i) => !i.is_complimentary);

    if (claim) {
      updatedItems.push({
        id: "complimentary-tea-promo",
        product_id: "prod-cay",
        product_name: "İkram Çay (Tuzlu Kruvasan Yanında)",
        product_slug: "cay",
        base_price: 0,
        selected_options: [],
        quantity: 1,
        unit_price: 0,
        total_price: 0,
        is_complimentary: true,
      });
    }

    saveCart({
      ...cart,
      items: updatedItems,
      complimentaryTeaClaimed: claim,
    });
  };

  const setTableInfo = (token: string, number: number) => {
    saveCart({
      ...cart,
      tableToken: token,
      tableNumber: number,
    });
  };

  const setGeneralNote = (note: string) => {
    saveCart({
      ...cart,
      generalNote: note,
    });
  };

  const clearCart = () => {
    saveCart({
      items: [],
      tableToken: cart.tableToken,
      tableNumber: cart.tableNumber,
      generalNote: "",
      complimentaryTeaClaimed: false,
    });
  };

  const subtotal = cart.items.reduce((sum, item) => sum + item.total_price, 0);
  const total = subtotal;
  const totalPrice = total;
  const totalItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const isSavouryEligible = hasSavouryCroissant(cart.items);

  return {
    cart,
    items: cart.items,
    totalItemCount,
    subtotal,
    total,
    totalPrice,
    isLoaded,
    isSavouryEligible,
    complimentaryTeaClaimed: cart.complimentaryTeaClaimed,
    tableToken: cart.tableToken,
    tableNumber: cart.tableNumber,
    generalNote: cart.generalNote,
    addItem,
    updateQuantity,
    removeItem,
    claimComplimentaryTea,
    toggleComplimentaryTea: claimComplimentaryTea,
    setTableInfo,
    setGeneralNote,
    clearCart,
  };
}
