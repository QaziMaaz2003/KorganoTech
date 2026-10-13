import type { Metadata } from "next";
import { AdminInquiries } from "@/components/admin/more";

export const metadata: Metadata = { title: "Inquiries" };

export default function Page() {
  return <AdminInquiries />;
}
