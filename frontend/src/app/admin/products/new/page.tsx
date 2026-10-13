import type { Metadata } from "next";
import { NewProduct } from "@/components/admin/product-editor";

export const metadata: Metadata = { title: "New product" };

export default function NewProductPage() {
  return <NewProduct />;
}
