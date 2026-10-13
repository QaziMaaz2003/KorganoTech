import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "@/components/content/policy";

export const metadata: Metadata = { title: "Shipping & Returns" };

export default function ShippingReturnsPage() {
  return (
    <PolicyPage title="Shipping & Returns" updated="October 2026">
      <h2>Shipping</h2>
      <p>
        We ship KorganoTech filters to addresses in the United States. Orders over the free-shipping threshold shown in
        your cart ship free; smaller orders pay the flat shipping fee shown at checkout.
      </p>
      <p>
        After you place an order it is reviewed and confirmed by our team. You can follow every step — pending, confirmed,
        processing, shipped and delivered — in <Link href="/account/orders">My orders</Link>, including the carrier and
        tracking number once your order ships.
      </p>
      <h2>Cash on Delivery</h2>
      <p>
        Payment is collected in cash by the courier when your order is delivered. Please have the order total ready.
        Online card payment is coming soon.
      </p>
      <h2>Cancellations</h2>
      <p>
        You can cancel an order yourself while it is still pending. Once it has been confirmed, please{" "}
        <Link href="/contact">contact us</Link> and we will do our best to help.
      </p>
      <h2>Returns</h2>
      <p>
        If a filter arrives damaged or is not the size you ordered, contact us with your order number and we will arrange
        a replacement or return. Filters must be unused and in their original packaging.
      </p>
      <h2>Bulk and custom orders</h2>
      <p>Shipping and return terms for bulk and custom-size orders are agreed with our sales team when you order.</p>
    </PolicyPage>
  );
}
