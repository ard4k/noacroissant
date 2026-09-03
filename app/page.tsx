import React, { Suspense } from "react";
import { MenuClient } from "./menu/MenuClient";
import { noaStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const products = noaStore.getProducts();
  const categories = noaStore.getCategories();

  return (
    <Suspense fallback={null}>
      <MenuClient products={products} categories={categories} />
    </Suspense>
  );
}
