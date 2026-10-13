import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductEditor } from "@/components/admin/product-editor";

export const metadata: Metadata = { title: "Edit product" };

async function Editor(props: PageProps<"/admin/products/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  return <ProductEditor id={id} initialTab={typeof sp.tab === "string" ? sp.tab : undefined} />;
}

export default function EditProductPage(props: PageProps<"/admin/products/[id]">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white" />}>
      <Editor {...props} />
    </Suspense>
  );
}
