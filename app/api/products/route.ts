import { NextRequest, NextResponse } from "next/server";
import { noaStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      products: noaStore.getProducts(),
      categories: noaStore.getCategories(),
      tables: noaStore.getTables(),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, product, id } = body;

    if (action === "update" && product && product.id) {
      const updated = noaStore.updateProduct(product);
      // Sync with Firestore asynchronously if available
      try {
        const { saveProductToFirestore } = await import("@/lib/firebase/firestore");
        saveProductToFirestore(updated).catch(() => {});
      } catch (e) {}
      return NextResponse.json({ success: true, product: updated });
    }

    if (action === "create" && product) {
      const created = noaStore.addProduct(product);
      try {
        const { saveProductToFirestore } = await import("@/lib/firebase/firestore");
        saveProductToFirestore(created).catch(() => {});
      } catch (e) {}
      return NextResponse.json({ success: true, product: created });
    }

    if (action === "delete" && id) {
      noaStore.deleteProduct(id);
      try {
        const { deleteProductFromFirestore } = await import("@/lib/firebase/firestore");
        deleteProductFromFirestore(id).catch(() => {});
      } catch (e) {}
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "İşlem başarısız" }, { status: 400 });
  }
}
