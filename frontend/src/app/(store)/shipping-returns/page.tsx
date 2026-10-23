import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "@/components/content/policy";

export const metadata: Metadata = { title: "Shipping & Returns" };

export default function ShippingReturnsPage() {
  return (
    <PolicyPage title="Shipping & Returns" updated="October 2026">
      <h2>Shipping</h2>
      <p>
        We ship KorganoTech filters to addresses in the <strong>United States only</strong>. We cannot ship outside the
        United States at this time. Orders over the free-shipping threshold shown in your cart ship free; smaller orders
        pay the flat shipping fee shown at checkout.
      </p>
      <h2>Currency and taxes</h2>
      <p>
        All prices and payments are in US dollars (USD). No sales tax is added at checkout, so the total shown in your
        cart and at checkout is the amount you pay.
      </p>
      <p>
        After you place an order it is reviewed and confirmed by our team. You can follow every step — pending, confirmed,
        processing, shipped and delivered — in <Link href="/account/orders">My orders</Link>, including the carrier and
        tracking number once your order ships.
      </p>
      <h2>Payment</h2>
      <p>
        You pay by card on Stripe&apos;s secure checkout page when you place your order. Your items are reserved while you
        pay, and your order is confirmed as soon as the payment goes through. If you leave without paying, the
        reservation ends after a short time and the order is cancelled.
      </p>
      <h2>Cancellations and refunds</h2>
      <p>
        You can cancel an order yourself while it is still awaiting payment. Once it has been paid and confirmed, please{" "}
        <Link href="/contact">contact us</Link> and we will do our best to help. If a paid order is cancelled, the amount
        is refunded to the card you paid with.
      </p>
      <h2>Returns</h2>
      <p>
        Returns are accepted. Please do not send anything back until you have a return authorization: email{" "}
        <a href="mailto:support@korganotech.com">support@korganotech.com</a> with your order number and the reason for the return, and we will send
        you a return authorization and instructions. Returned filters must be unused and in their original packaging.
        If a filter arrives damaged or is not the size you ordered, tell us in the same email and we will arrange a
        replacement or refund.
      </p>
      <h2>Custom-size filters</h2>
      <p>
        Filters ordered on our <Link href="/custom-filters">custom size page</Link> are made to the exact measurements you
        enter, so they cannot be returned or exchanged because of a measuring mistake. If a custom filter arrives
        damaged, or is not made to the size you ordered, email <a href="mailto:support@korganotech.com">support@korganotech.com</a> with your order
        number and we will make it right.
      </p>
      <h2>Bulk orders</h2>
      <p>Shipping and return terms for large or recurring orders are agreed with our sales team when you order.</p>
    </PolicyPage>
  );
}
