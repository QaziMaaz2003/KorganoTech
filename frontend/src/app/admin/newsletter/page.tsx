import type { Metadata } from "next";
import { AdminNewsletter } from "@/components/admin/more";

export const metadata: Metadata = { title: "Newsletter" };

export default function Page() {
  return <AdminNewsletter />;
}
