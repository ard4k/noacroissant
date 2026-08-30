import { NextResponse } from "next/server";
import { noaStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    orders: noaStore.getOrders(),
    tables: noaStore.getTables(),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body.action === "clear_all") {
      noaStore.clearOrders();
      return NextResponse.json({
        success: true,
        message: "Tüm siparişler başarıyla temizlendi.",
        orders: [],
      });
    }
    return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "İşlem gerçekleştirilemedi" }, { status: 500 });
  }
}
