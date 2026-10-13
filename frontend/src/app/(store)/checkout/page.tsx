import type { Metadata } from "next";
import { CheckoutView } from "@/components/shop/checkout-view";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="container-page py-10">
      <CheckoutView />
    </div>
  );
}
