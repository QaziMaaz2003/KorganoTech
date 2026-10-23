import type { Metadata } from "next";
import { brand } from "@/lib/site";
import { PolicyPage } from "@/components/content/policy";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <PolicyPage title="Privacy Policy" updated="October 2026">
      <p>This policy explains what information KorganoTech collects when you use this website and how we use it.</p>
      <h2>Information we collect</h2>
      <ul>
        <li>Account details you provide: name, email address, phone number and password (stored only as a secure hash).</li>
        <li>Order details: delivery addresses, the products you order and your order history.</li>
        <li>
          Payment details: card payments are taken by Stripe on its own secure page. We receive confirmation that an
          order was paid, but never your full card number.
        </li>
        <li>Messages you send through our contact and notify-me forms, and newsletter sign-ups.</li>
        <li>Basic technical data such as your IP address, used to protect our forms from abuse.</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To process, deliver and support your orders, including taking payment through Stripe.</li>
        <li>To respond to your enquiries and send updates you have asked for.</li>
        <li>To keep the website secure and prevent fraud.</li>
      </ul>
      <p>We do not sell your personal information.</p>
      <h2>Cookies</h2>
      <p>
        We use a strictly necessary cookie to keep you signed in, and your browser&apos;s local storage to remember your
        cart before you sign in.
      </p>
      <h2>Your choices</h2>
      <p>You can update your profile and addresses in your account at any time. To request deletion of your account or data, contact us.</p>
      <h2>Contact</h2>
      <p>KorganoTech, {brand.address}.</p>
    </PolicyPage>
  );
}
