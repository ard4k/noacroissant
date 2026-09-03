import { NextRequest, NextResponse } from "next/server";
import { noaStore } from "@/lib/store";
import { saveSettingsToFirestore } from "@/lib/firebase/firestore";
import { BusinessSettings } from "@/lib/types";
import { isRequestAdminAuthenticated, validateCsrfOrigin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const settings = noaStore.getSettings();

  // Determine if this is an authenticated admin request
  const isAdmin = isRequestAdminAuthenticated(request);

  // Build the public-safe settings object — strip sensitive fields for unauthenticated callers
  const publicSettings = isAdmin
    ? settings
    : (({ wifi_password, wifi_ssid, ...rest }) => rest)(settings as typeof settings & { wifi_password?: string; wifi_ssid?: string });

  return NextResponse.json({
    success: true,
    settings: publicSettings,
  });
}

export async function POST(request: NextRequest) {
  // Handler-level authorization: Admin only
  if (!isRequestAdminAuthenticated(request)) {
    return NextResponse.json(
      { success: false, error: "Yetkisiz erişim: Bu işlem yönetici yetkisi gerektirir." },
      { status: 401 }
    );
  }

  if (!validateCsrfOrigin(request)) {
    return NextResponse.json(
      { success: false, error: "CSRF doğrulaması başarısız oldu." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const current = noaStore.getSettings();
    const updated: BusinessSettings = {
      ...current,
      ...body,
    };

    noaStore.updateSettings(updated);

    // Save to Firestore asynchronously
    try {
      await saveSettingsToFirestore(updated);
    } catch (e) {
      console.warn("Firestore settings save warning:", e);
    }

    return NextResponse.json({
      success: true,
      settings: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Settings could not be updated." },
      { status: 400 }
    );
  }
}

