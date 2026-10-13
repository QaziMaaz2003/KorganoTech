import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminCustomerDetail } from "@/components/admin/more";

export const metadata: Metadata = { title: "Customer" };

async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminCustomerDetail id={id} />;
}

export default function CustomerPage(props: PageProps<"/admin/customers/[id]">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white" />}>
      <Detail params={props.params} />
    </Suspense>
  );
}
