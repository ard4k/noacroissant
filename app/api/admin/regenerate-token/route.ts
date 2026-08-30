import { NextRequest, NextResponse } from "next/server";
import { noaStore } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { table_id } = await req.json();

    if (!table_id) {
      return NextResponse.json({ error: "Masa ID gereklidir." }, { status: 400 });
    }

    const newToken = noaStore.regenerateTableToken(table_id);
    return NextResponse.json({ success: true, new_token: newToken });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Token yenilenemedi." }, { status: 400 });
  }
}
