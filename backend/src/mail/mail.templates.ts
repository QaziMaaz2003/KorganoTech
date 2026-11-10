import type { MailMessage } from './mail.service.js';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const money = (n: number | string | { toString(): string }) =>
  `$${Number(n.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const SUPPORT = 'Support@KorganoTech.com';

/** One shared, simple layout so every email looks the same and renders everywhere. */
function layout(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f4f2fa;font-family:Arial,Helvetica,sans-serif;color:#1d1b2e">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden">
<tr><td style="background:#3b2a6e;color:#ffffff;padding:18px 24px;font-size:20px;font-weight:bold">KorganoTech</td></tr>
<tr><td style="padding:24px"><h1 style="margin:0 0 14px;font-size:20px;color:#3b2a6e">${esc(title)}</h1>${bodyHtml}</td></tr>
<tr><td style="padding:16px 24px;background:#faf9fd;color:#6b6880;font-size:12px">KorganoTech · 69 E Airway Blvd, Livermore, CA 94551 · 925-989-8726<br>Questions? Reply to this email or write to ${SUPPORT}.</td></tr>
</table></td></tr></table></body></html>`;
}

const p = (s: string) => `<p style="margin:0 0 12px;line-height:1.5">${s}</p>`;
const button = (href: string, label: string) =>
  `<p style="margin:18px 0"><a href="${esc(href)}" style="background:#5b3fa6;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:bold;display:inline-block">${esc(label)}</a></p>`;

export interface OrderEmailData {
  orderNumber: string;
  name: string;
  email: string;
  items: { name: string; label: string; quantity: number; lineTotal: number | string | { toString(): string } }[];
  subtotal: number | string | { toString(): string };
  shippingFee: number | string | { toString(): string };
  tax: number | string | { toString(): string };
  total: number | string | { toString(): string };
  invoice?: boolean;
  siteUrl: string;
}

function itemsTable(o: OrderEmailData) {
  const rows = o.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;border-bottom:1px solid #eee">${esc(i.name)}<br><span style="color:#6b6880;font-size:12px">${esc(i.label)}</span></td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td><td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right">${money(i.lineTotal)}</td></tr>`,
    )
    .join('');
  const line = (label: string, value: string, bold = false) =>
    `<tr><td colspan="2" style="padding:4px 0;text-align:right;${bold ? 'font-weight:bold' : 'color:#6b6880'}">${label}</td><td style="padding:4px 0;text-align:right;${bold ? 'font-weight:bold' : ''}">${value}</td></tr>`;
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:12px 0;font-size:14px">${rows}${line('Subtotal', money(o.subtotal))}${line('Shipping', Number(o.shippingFee.toString()) === 0 ? 'Free' : money(o.shippingFee))}${Number(o.tax.toString()) > 0 ? line('Sales tax', money(o.tax)) : ''}${line('Total', money(o.total), true)}</table>`;
}

const itemsText = (o: OrderEmailData) =>
  o.items.map((i) => `- ${i.name} (${i.label}) x ${i.quantity}: ${money(i.lineTotal)}`).join('\n') +
  `\nSubtotal: ${money(o.subtotal)}\nShipping: ${Number(o.shippingFee.toString()) === 0 ? 'Free' : money(o.shippingFee)}\n` +
  (Number(o.tax.toString()) > 0 ? `Sales tax: ${money(o.tax)}\n` : '') +
  `Total: ${money(o.total)}`;

export function orderConfirmation(o: OrderEmailData): MailMessage {
  const link = `${o.siteUrl}/account/orders/${o.orderNumber}`;
  const lead = o.invoice
    ? `We have received your order ${o.orderNumber}. There is nothing to pay now: KorganoTech will send you an invoice when the order is delivered (Net 30).`
    : `Thank you for your order ${o.orderNumber}. Your payment was received and your order is confirmed.`;
  return {
    to: o.email,
    subject: `${o.invoice ? 'Order received' : 'Order confirmed'} - ${o.orderNumber}`,
    html: layout(
      o.invoice ? 'Order received' : 'Order confirmed',
      p(`Hi ${esc(o.name)},`) +
        p(esc(lead)) +
        itemsTable(o) +
        p('Orders ship within 3 to 5 business days. We will email you again with the tracking number when it ships.') +
        button(link, 'View your order'),
    ),
    text: `Hi ${o.name},\n\n${lead}\n\n${itemsText(o)}\n\nOrders ship within 3 to 5 business days. We will email you with tracking when it ships.\nView your order: ${link}\n\nKorganoTech - ${SUPPORT} - 925-989-8726`,
  };
}

export function orderShipped(o: {
  orderNumber: string;
  name: string;
  email: string;
  carrier: string | null;
  trackingNumber: string | null;
  siteUrl: string;
}): MailMessage {
  const link = `${o.siteUrl}/account/orders/${o.orderNumber}`;
  const tracking =
    o.carrier || o.trackingNumber
      ? `Carrier: ${o.carrier ?? 'n/a'}. Tracking number: ${o.trackingNumber ?? 'n/a'}.`
      : 'Tracking details will appear on your order page.';
  return {
    to: o.email,
    subject: `Your order has shipped - ${o.orderNumber}`,
    html: layout('Your order has shipped', p(`Hi ${esc(o.name)},`) + p(`Order ${esc(o.orderNumber)} is on its way. ${esc(tracking)}`) + button(link, 'Track your order')),
    text: `Hi ${o.name},\n\nOrder ${o.orderNumber} is on its way. ${tracking}\nTrack your order: ${link}\n\nKorganoTech - ${SUPPORT}`,
  };
}

export function refundIssued(o: {
  orderNumber: string;
  name: string;
  email: string;
  amount: number | string | { toString(): string };
  siteUrl: string;
}): MailMessage {
  return {
    to: o.email,
    subject: `Your refund has been issued - ${o.orderNumber}`,
    html: layout(
      'Your refund has been issued',
      p(`Hi ${esc(o.name)},`) +
        p(`We have refunded ${money(o.amount)} for order ${esc(o.orderNumber)} to the card you paid with. It can take up to 7 days to appear on your statement.`) +
        p(`If you have any questions, reply to this email or write to ${SUPPORT}.`),
    ),
    text: `Hi ${o.name},\n\nWe have refunded ${money(o.amount)} for order ${o.orderNumber} to the card you paid with. It can take up to 7 days to appear on your statement.\n\nKorganoTech - ${SUPPORT}`,
  };
}

export function businessLogin(o: {
  name: string;
  email: string;
  businessName: string;
  tempPassword: string | null;
  siteUrl: string;
}): MailMessage {
  const link = `${o.siteUrl}/login?next=/account/business`;
  const creds = o.tempPassword
    ? p(`Sign in with your email <strong>${esc(o.email)}</strong> and this temporary password: <strong style="font-size:16px">${esc(o.tempPassword)}</strong>`) +
      p('Please change it after you sign in (Account settings).')
    : p(`Sign in with your existing KorganoTech login (<strong>${esc(o.email)}</strong>).`);
  return {
    to: o.email,
    subject: `Your KorganoTech business account - ${o.businessName}`,
    html: layout(
      'Your business account is ready',
      p(`Hi ${esc(o.name)},`) +
        p(`A KorganoTech business account has been set up for ${esc(o.businessName)}. After you sign in, you will see your saved filter list, adjust quantities and place orders. We invoice on delivery (Net 30).`) +
        creds +
        button(link, 'Sign in'),
    ),
    text: `Hi ${o.name},\n\nA KorganoTech business account has been set up for ${o.businessName}. After you sign in you will see your saved filter list, adjust quantities and place orders. We invoice on delivery (Net 30).\n\nEmail: ${o.email}\n${o.tempPassword ? `Temporary password: ${o.tempPassword}\nPlease change it after you sign in.\n` : 'Use your existing KorganoTech password.\n'}\nSign in: ${link}\n\nKorganoTech - ${SUPPORT}`,
  };
}
