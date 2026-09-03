import { NextRequest, NextResponse } from "next/server";
import { noaStore } from "@/lib/store";
import { ServiceCallType } from "@/lib/types";
import { isRequestKitchenAuthenticated, validateCsrfOrigin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isRequestKitchenAuthenticated(req)) {
    return NextResponse.json(
      { success: false, error: "Yetkisiz erişim: Personel oturumu gereklidir." },
      { status: 401 }
    );
  }

  // Hydrate from Firestore if configured
  try {
    const { getAllServiceRequestsFromFirestore, isFirebaseConfigured } = await import(
      "@/lib/firebase/firestore"
    );
    if (isFirebaseConfigured && getAllServiceRequestsFromFirestore) {
      const firestoreRequests = await getAllServiceRequestsFromFirestore();
      if (firestoreRequests && Array.isArray(firestoreRequests) && firestoreRequests.length > 0) {
        noaStore.hydrateServiceRequests(firestoreRequests);
      }
    }
  } catch (e) {
    console.warn("Firestore service requests hydration warning:", e);
  }

  const requests = noaStore.getServiceRequests();
  return NextResponse.json({ success: true, requests });
}

export async function POST(req: NextRequest) {
  if (!validateCsrfOrigin(req)) {
    return NextResponse.json(
      { success: false, error: "CSRF doğrulaması başarısız oldu." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { table_number, table_label, type, note } = body;

    const num = Number(table_number);
    if (isNaN(num) || num < 1 || num > 50) {
      return NextResponse.json(
        { error: "Geçerli bir masa numarası gereklidir." },
        { status: 400 }
      );
    }

    const validTypes: ServiceCallType[] = [
      "waiter",
      "bill_card",
      "bill_cash",
      "water_napkin",
      "tea_refresh",
    ];

    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Geçersiz çağrı türü." },
        { status: 400 }
      );
    }

    const sanitizedNote = typeof note === "string" ? note.trim().slice(0, 150).replace(/[<>]/g, "") : undefined;
    const sanitizedLabel = typeof table_label === "string" ? table_label.trim().slice(0, 30).replace(/[<>]/g, "") : `Masa ${num}`;

    // Create in store
    const serviceReq = noaStore.createServiceRequest({
      table_number: num,
      table_label: sanitizedLabel,
      type,
      note: sanitizedNote,
    });

    // Save to Firestore
    try {
      const { saveServiceRequestToFirestore, isFirebaseConfigured } = await import(
        "@/lib/firebase/firestore"
      );
      if (isFirebaseConfigured) {
        await saveServiceRequestToFirestore(serviceReq);
      }
    } catch (e) {
      console.warn("Firestore service call save error:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Çağrınız personele iletildi.",
      request: serviceReq,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || "Çağrı iletilemedi." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  if (!isRequestKitchenAuthenticated(req)) {
    return NextResponse.json(
      { error: "Yetkisiz erişim: Bu işlem için personel yetkisi gereklidir." },
      { status: 401 }
    );
  }

  if (!validateCsrfOrigin(req)) {
    return NextResponse.json(
      { success: false, error: "CSRF doğrulaması başarısız oldu." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { id, resolved_by } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Çağrı ID gereklidir." }, { status: 400 });
    }

    const sanitizedResolvedBy = typeof resolved_by === "string" ? resolved_by.trim().slice(0, 50).replace(/[<>]/g, "") : "Personel";
    const resolved = noaStore.resolveServiceRequest(id, sanitizedResolvedBy);

    try {
      const { resolveServiceRequestInFirestore, isFirebaseConfigured } = await import(
        "@/lib/firebase/firestore"
      );
      if (isFirebaseConfigured) {
        await resolveServiceRequestInFirestore(id, sanitizedResolvedBy);
      }
    } catch (e) {
      console.warn("Firestore service call resolve error:", e);
    }

    return NextResponse.json({ success: true, request: resolved });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || "İşlem tamamlanamadı." },
      { status: 500 }
    );
  }
}

