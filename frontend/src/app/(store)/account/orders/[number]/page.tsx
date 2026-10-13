import { Suspense } from "react";
import { MyOrderDetail } from "@/components/account/account-pages";

async function Detail({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  return <MyOrderDetail number={number} />;
}

export default function MyOrderPage(props: PageProps<"/account/orders/[number]">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white" />}>
      <Detail params={props.params} />
    </Suspense>
  );
}
