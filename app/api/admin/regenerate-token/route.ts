import { NextRequest, NextResponse } from "next/server";
import { noaStore } from "@/lib/store";
import { isRequestAdminAuthenticated, validateCsrfOrigin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isRequestAdminAuthenticated(req)) {
    return NextResponse.json(
      { success: false, error: "Yetkisiz erişim: Bu işlem yönetici yetkisi gerektirir." },
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
    const { table_id } = await req.json().catch(() => ({}));

    if (!table_id || typeof table_id !== "string") {
      return NextResponse.json({ error: "Geçerli bir Masa ID gereklidir." }, { status: 400 });
    }

    const newToken = noaStore.regenerateTableToken(table_id);
    return NextResponse.json({ success: true, new_token: newToken });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Token yenilenemedi." }, { status: 400 });
  }
}

