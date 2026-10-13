import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminOrders } from "@/components/admin/orders";

export const metadata: Metadata = { title: "Orders" };

async function Orders({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  return <AdminOrders initialStatus={typeof sp.status === "string" ? sp.status : undefined} />;
}

export default function OrdersPage(props: PageProps<"/admin/orders">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white" />}>
      <Orders searchParams={props.searchParams} />
    </Suspense>
  );
}
