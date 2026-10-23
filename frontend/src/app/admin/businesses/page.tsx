import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminBusinesses } from "@/components/admin/businesses";

export const metadata: Metadata = { title: "Business accounts" };

export default function Page() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white" />}>
      <AdminBusinesses />
    </Suspense>
  );
}
