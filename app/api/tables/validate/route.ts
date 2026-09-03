import { NextRequest, NextResponse } from "next/server";
import { noaStore } from "@/lib/store";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { valid: false, error: "Masa kodu eksik." },
      { status: 400 }
    );
  }

  const table = noaStore.getTableByToken(token);
  if (!table) {
    return NextResponse.json(
      { valid: false, error: "Geçersiz veya süresi dolmuş masa QR kodu." },
      { status: 404 }
    );
  }

  // Return only non-sensitive table identifiers; qr_token is NOT returned
  // (caller already has the token — returning it would just be redundant exposure)
  return NextResponse.json({
    valid: true,
    table: {
      id: table.id,
      table_number: table.table_number,
      label: table.label,
    },
  });
}
