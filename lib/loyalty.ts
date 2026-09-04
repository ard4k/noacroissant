import { isFirebaseConfigured, db } from "./firebase/config";
import { noaStore } from "./store";
import { LoyaltyCard, LoyaltyHistoryItem } from "./types";

export type { LoyaltyCard, LoyaltyHistoryItem };

const LOCAL_STORAGE_KEY = "noa_loyalty_user_v1";
const memoryLoyaltyCards = new Map<string, LoyaltyCard>();

export function formatPhoneNumberTR(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  let clean = digits;
  if (clean.startsWith("90") && clean.length > 10) {
    clean = clean.slice(2);
  }
  if (clean.startsWith("0")) {
    clean = clean.slice(1);
  }
  clean = clean.slice(0, 10);

  if (clean.length === 0) return "";
  if (clean.length <= 3) return `(${clean}`;
  if (clean.length <= 6) return `(${clean.slice(0, 3)}) ${clean.slice(3)}`;
  if (clean.length <= 8) return `(${clean.slice(0, 3)}) ${clean.slice(3, 6)} ${clean.slice(6)}`;
  return `(${clean.slice(0, 3)}) ${clean.slice(3, 6)} ${clean.slice(6, 8)} ${clean.slice(8, 10)}`;
}

export function toE164PhoneTR(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  let clean = digits;
  if (clean.startsWith("90") && clean.length > 10) {
    clean = clean.slice(2);
  }
  if (clean.startsWith("0")) {
    clean = clean.slice(1);
  }
  return `+90${clean}`;
}

export function sanitizePhoneId(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Get active customer's local session phone
 */
export function getStoredCustomerPhone(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LOCAL_STORAGE_KEY);
}

export function setStoredCustomerPhone(phone: string | null): void {
  if (typeof window === "undefined") return;
  if (phone) {
    localStorage.setItem(LOCAL_STORAGE_KEY, phone);
  } else {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}

/**
 * Generate standard 4-digit redeem verification code
 */
export function generateRedeemCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/**
 * Create initial empty loyalty card
 */
export function createEmptyLoyaltyCard(phoneE164: string): LoyaltyCard {
  const now = new Date().toISOString();
  const id = sanitizePhoneId(phoneE164);
  return {
    id,
    phone_number: phoneE164,
    stamps: 0,
    rewards_count: 0,
    total_stamps_all_time: 0,
    redeem_code: generateRedeemCode(),
    history: [
      {
        id: `act-${Date.now()}-init`,
        date: now,
        type: "card_created",
        description: "NOA LOYALTY CARD oluşturuldu.",
      },
    ],
    created_at: now,
    updated_at: now,
  };
}

/**
 * Fetch loyalty card with multi-tier store (noaStore -> Firestore -> Memory -> LocalStorage)
 */
export async function fetchLoyaltyCard(phoneE164: string): Promise<LoyaltyCard> {
  const id = sanitizePhoneId(phoneE164);

  // 1. Client-Side: Always fetch fresh authoritative card from API first
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/loyalty?phone=${encodeURIComponent(phoneE164)}&_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.card) {
          memoryLoyaltyCards.set(id, data.card);
          noaStore.saveLoyaltyCard(data.card);
          localStorage.setItem(`noa_card_${id}`, JSON.stringify(data.card));
          return data.card;
        }
      }
    } catch (apiErr) {
      console.warn("Client loyalty API fetch warning:", apiErr);
    }
  }

  // 2. Server-Side or Client-Offline: Check noaStore (persisted in .data/noa_store.json)
  const storeCard = noaStore.getLoyaltyCard(phoneE164);
  if (storeCard) {
    memoryLoyaltyCards.set(id, storeCard);
    return storeCard;
  }

  // 3. Check In-Memory Map
  if (memoryLoyaltyCards.has(id)) {
    const memCard = memoryLoyaltyCards.get(id)!;
    noaStore.saveLoyaltyCard(memCard);
    return memCard;
  }

  // 4. Try Firestore if configured
  if (isFirebaseConfigured && db) {
    try {
      const { doc, getDoc } = await import("firebase/firestore");
      const docRef = doc(db, "loyalty_cards", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as LoyaltyCard;
        memoryLoyaltyCards.set(id, data);
        noaStore.saveLoyaltyCard(data);
        if (typeof window !== "undefined") {
          localStorage.setItem(`noa_card_${id}`, JSON.stringify(data));
        }
        return data;
      }
    } catch (e) {
      console.warn("Firestore loyalty fetch fallback:", e);
    }
  }

  // 5. Fallback to local storage (offline)
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(`noa_card_${id}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        memoryLoyaltyCards.set(id, parsed);
        noaStore.saveLoyaltyCard(parsed);
        return parsed;
      } catch (e) {}
    }
  }

  // 6. Create new card and persist across all layers
  const newCard = createEmptyLoyaltyCard(phoneE164);
  memoryLoyaltyCards.set(id, newCard);
  noaStore.saveLoyaltyCard(newCard);
  if (typeof window !== "undefined") {
    localStorage.setItem(`noa_card_${id}`, JSON.stringify(newCard));
  }

  if (isFirebaseConfigured && db) {
    try {
      const { doc, setDoc } = await import("firebase/firestore");
      await setDoc(doc(db, "loyalty_cards", id), newCard);
    } catch (e) {}
  }

  return newCard;
}

/**
 * Add stamps to customer card (dynamic requiredStamps, default 5)
 */
export async function addStampsToCustomer(
  phoneE164: string,
  count: number = 1,
  requiredStamps: number = 7,
  rewardName: string = "Hediye Kahve"
): Promise<LoyaltyCard> {
  const card = await fetchLoyaltyCard(phoneE164);
  const now = new Date().toISOString();
  const id = sanitizePhoneId(phoneE164);
  const target = requiredStamps > 0 ? requiredStamps : 7;

  let newStamps = card.stamps + count;
  let newRewards = card.rewards_count;
  let earnedRewards = 0;

  while (newStamps >= target) {
    newStamps -= target;
    newRewards += 1;
    earnedRewards += 1;
  }

  const cleanReward = (rewardName || "Hediye Kahve")
    .replace(/^1\s*adet\s*/i, "")
    .replace(/^1\s*/i, "")
    .trim();
  const rewardLabel = earnedRewards === 1 ? `1 adet ${cleanReward}` : `${earnedRewards} adet ${cleanReward}`;

  const newHistory = [...card.history];
  newHistory.unshift({
    id: `act-${Date.now()}-stamp`,
    date: now,
    type: "stamp_earned",
    description: `+${count} Damga kazanıldı!${
      earnedRewards > 0 ? ` Tebrikler! ${rewardLabel} kazandınız!` : ""
    }`,
  });

  const updatedCard: LoyaltyCard = {
    ...card,
    stamps: newStamps,
    rewards_count: newRewards,
    total_stamps_all_time: card.total_stamps_all_time + count,
    redeem_code: card.redeem_code || generateRedeemCode(),
    history: newHistory.slice(0, 30),
    updated_at: now,
  };

  // Update In-Memory cache and noaStore persistent store
  memoryLoyaltyCards.set(id, updatedCard);
  noaStore.saveLoyaltyCard(updatedCard);

  // Persist to local storage
  if (typeof window !== "undefined") {
    localStorage.setItem(`noa_card_${id}`, JSON.stringify(updatedCard));
  }

  // Persist to Firestore if configured
  if (isFirebaseConfigured && db) {
    try {
      const { doc, setDoc } = await import("firebase/firestore");
      await setDoc(doc(db, "loyalty_cards", id), updatedCard, { merge: true });
    } catch (e) {
      console.warn("Firestore loyalty stamp save warning:", e);
    }
  }

  return updatedCard;
}

/**
 * Remove stamps from customer card (e.g. barista correction)
 */
export async function removeStampFromCustomer(
  phoneE164: string,
  count: number = 1
): Promise<LoyaltyCard> {
  const card = await fetchLoyaltyCard(phoneE164);
  const now = new Date().toISOString();
  const id = sanitizePhoneId(phoneE164);

  const newStamps = Math.max(0, card.stamps - count);
  const newHistory = [...card.history];
  newHistory.unshift({
    id: `act-${Date.now()}-rem`,
    date: now,
    type: "stamp_removed",
    description: `-${count} Damga silindi (Düzeltme).`,
  });

  const updatedCard: LoyaltyCard = {
    ...card,
    stamps: newStamps,
    total_stamps_all_time: Math.max(0, card.total_stamps_all_time - count),
    history: newHistory.slice(0, 30),
    updated_at: now,
  };

  memoryLoyaltyCards.set(id, updatedCard);
  noaStore.saveLoyaltyCard(updatedCard);
  if (typeof window !== "undefined") {
    localStorage.setItem(`noa_card_${id}`, JSON.stringify(updatedCard));
  }

  if (isFirebaseConfigured && db) {
    try {
      const { doc, setDoc } = await import("firebase/firestore");
      await setDoc(doc(db, "loyalty_cards", id), updatedCard, { merge: true });
    } catch (e) {
      console.warn("Firestore loyalty remove stamp warning:", e);
    }
  }

  return updatedCard;
}

/**
 * Redeem a free coffee reward
 */
export async function redeemFreeCoffee(phoneE164: string): Promise<LoyaltyCard> {
  const card = await fetchLoyaltyCard(phoneE164);
  if (card.rewards_count <= 0) {
    throw new Error("Kullanılabilir hediye kahveniz bulunmamaktadır.");
  }

  const now = new Date().toISOString();
  const id = sanitizePhoneId(phoneE164);

  const newHistory = [...card.history];
  newHistory.unshift({
    id: `act-${Date.now()}-redeem`,
    date: now,
    type: "reward_redeemed",
    description: "1 Adet Hediye Kahve kasada teslim alındı. Afiyet olsun!",
  });

  const updatedCard: LoyaltyCard = {
    ...card,
    rewards_count: card.rewards_count - 1,
    redeem_code: generateRedeemCode(), // Rotate redeem code
    history: newHistory.slice(0, 30),
    updated_at: now,
  };

  // Update In-Memory cache and noaStore persistent store
  memoryLoyaltyCards.set(id, updatedCard);
  noaStore.saveLoyaltyCard(updatedCard);

  if (typeof window !== "undefined") {
    localStorage.setItem(`noa_card_${id}`, JSON.stringify(updatedCard));
  }

  if (isFirebaseConfigured && db) {
    try {
      const { doc, setDoc } = await import("firebase/firestore");
      await setDoc(doc(db, "loyalty_cards", id), updatedCard, { merge: true });
    } catch (e) {
      console.warn("Firestore loyalty redeem save warning:", e);
    }
  }

  return updatedCard;
}
