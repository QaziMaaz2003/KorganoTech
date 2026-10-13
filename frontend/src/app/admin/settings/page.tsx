import type { Metadata } from "next";
import { AdminSettingsPage } from "@/components/admin/more";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return <AdminSettingsPage />;
}
