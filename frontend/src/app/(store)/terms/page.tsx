import type { Metadata } from "next";
import Link from "next/link";
import { aboutCopy, pathogenCopy } from "@/lib/site";
import { PolicyPage } from "@/components/content/policy";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <PolicyPage title="Terms of Service" updated="October 2026">
      <p>By using this website or placing an order you agree to these terms.</p>
      <h2>Orders</h2>
      <p>
        All orders are subject to confirmation and product availability. Prices and stock are confirmed when you place
        your order. We may cancel an order if a product becomes unavailable or a pricing error occurs, in which case no
        payment is due.
      </p>
      <h2>Payment</h2>
      <p>Payment is made by Cash on Delivery. The amount due is the order total shown at checkout and in your order confirmation.</p>
      <h2>Shipping, cancellations and returns</h2>
      <p>
        See our <Link href="/shipping-returns">Shipping &amp; Returns</Link> policy.
      </p>
      <h2>Product information</h2>
      <p>{aboutCopy.disclaimer}</p>
      <p>{pathogenCopy.disclaimer}</p>
      <p>Product capabilities are subject to testing, validation, and applicable regulations.</p>
      <h2>Accounts</h2>
      <p>You are responsible for keeping your password confidential and for activity under your account.</p>
    </PolicyPage>
  );
}
