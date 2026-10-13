import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminInventory } from "@/components/admin/inventory";

export const metadata: Metadata = { title: "Inventory" };

async function Inventory({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  return <AdminInventory initialLow={sp.low === "1"} />;
}

export default function InventoryPage(props: PageProps<"/admin/inventory">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white" />}>
      <Inventory searchParams={props.searchParams} />
    </Suspense>
  );
}
