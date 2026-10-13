import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderConfirmation } from "@/components/account/order-confirmation";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

async function Confirmation({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  return <OrderConfirmation number={number} />;
}

export default function OrderConfirmationPage(props: PageProps<"/order-confirmation/[number]">) {
  return (
    <div className="container-page py-14">
      <Suspense fallback={<div className="mx-auto h-96 max-w-2xl animate-pulse rounded-2xl bg-white" />}>
        <Confirmation params={props.params} />
      </Suspense>
    </div>
  );
}
