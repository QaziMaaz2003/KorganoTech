import type { Metadata } from "next";
import { AdminCategories } from "@/components/admin/more";

export const metadata: Metadata = { title: "Categories" };

export default function Page() {
  return <AdminCategories />;
}
