import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminOrderDetail } from "@/components/admin/orders";

export const metadata: Metadata = { title: "Order" };

async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminOrderDetail id={id} />;
}

export default function OrderPage(props: PageProps<"/admin/orders/[id]">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white" />}>
      <Detail params={props.params} />
    </Suspense>
  );
}
