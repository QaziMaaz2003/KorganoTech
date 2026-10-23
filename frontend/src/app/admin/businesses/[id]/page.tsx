import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminBusinessDetail } from "@/components/admin/businesses";

export const metadata: Metadata = { title: "Business account" };

async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminBusinessDetail id={id} />;
}

export default function BusinessPage(props: PageProps<"/admin/businesses/[id]">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white" />}>
      <Detail params={props.params} />
    </Suspense>
  );
}
