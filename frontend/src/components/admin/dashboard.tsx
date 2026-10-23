"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, Banknote, Boxes, Clock, DollarSign, Inbox, Package, ShoppingBag, Users } from "lucide-react";
import { get } from "@/lib/client-api";
import type { AdminStats } from "@/lib/admin-types";
import { date, money, ORDER_STATUS_LABEL } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";
import { PageHeader, Panel, td, th } from "./admin-ui";
import { PaymentBadge, StatusBadge } from "@/components/orders/order-ui";

// Chart marks use the validated brand violet (#7d67ae); text stays in ink tokens.
const SERIES = "#7d67ae";
const GRID = "oklch(91.2% 0.024 300)";
const AXIS_TEXT = "oklch(50.5% 0.026 296)";

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const shortDay = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

function ChartTooltip({ active, payload, label, kind }: { active?: boolean; payload?: { value: number }[]; label?: string; kind: "revenue" | "orders" }) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div className="rounded-lg border border-lavender bg-white px-3 py-2 text-xs shadow-lift">
      <p className="font-semibold text-foreground">{shortDay(label)}</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-muted-foreground">
        <span className="size-2 rounded-full" style={{ background: SERIES }} />
        {kind === "revenue" ? money(payload[0].value) : `${payload[0].value} order${payload[0].value === 1 ? "" : "s"}`}
      </p>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, hint, href }: { icon: React.ElementType; label: string; value: React.ReactNode; hint?: string; href?: string }) {
  const body = (
    <div className="h-full rounded-2xl border border-lavender bg-white p-5 shadow-card transition hover:shadow-lift">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="grid size-9 place-items-center rounded-lg bg-accent text-primary">
          <Icon className="size-4.5" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-extrabold text-foreground tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => get<AdminStats>("/admin/stats"),
    refetchInterval: 60_000,
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" />
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-white" />)}
        </div>
      </div>
    );
  }

  const t = data.totals;
  const last30Revenue = data.series.reduce((n, d) => n + d.revenue, 0);
  const last30Orders = data.series.reduce((n, d) => n + d.orders, 0);
  const statusOrder: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
  const maxStatus = Math.max(1, ...statusOrder.map((s) => data.statusCounts[s] ?? 0));

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Sales, orders and stock at a glance. Refreshes every minute." />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Kpi icon={DollarSign} label="Gross sales" value={money(t.grossSales)} hint="Paid orders, before refunds" />
        <Kpi icon={Banknote} label="Payments received" value={money(t.collected)} hint="Orders marked paid" />
        <Kpi icon={ShoppingBag} label="Orders" value={t.orders} hint={`${last30Orders} in the last 30 days`} href="/admin/orders" />
        <Kpi icon={Clock} label="Ready to fulfil" value={t.toFulfil} hint="Paid, not yet shipped" href="/admin/orders?status=CONFIRMED" />
        <Kpi icon={Users} label="Customers" value={t.customers} href="/admin/customers" />
        <Kpi icon={Package} label="Active products" value={t.activeProducts} href="/admin/products" />
        <Kpi icon={Boxes} label="Low-stock variants" value={t.lowStock} hint="At or below their threshold" href="/admin/inventory?low=1" />
        <Kpi icon={Inbox} label="New inquiries" value={t.newInquiries} href="/admin/inquiries" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title={<>Revenue · last 30 days <span className="ml-2 font-normal text-muted-foreground">{money(last30Revenue)}</span></>}>
          <div className="h-64" role="img" aria-label={`Daily revenue over the last 30 days, total ${money(last30Revenue)}`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={GRID} strokeWidth={1} vertical={false} />
                <XAxis dataKey="date" tickFormatter={shortDay} tick={{ fill: AXIS_TEXT, fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={24} />
                <YAxis tickFormatter={(v: number) => `$${compact.format(v)}`} tick={{ fill: AXIS_TEXT, fontSize: 11 }} axisLine={false} tickLine={false} width={48} allowDecimals={false} />
                <Tooltip content={<ChartTooltip kind="revenue" />} cursor={{ stroke: AXIS_TEXT, strokeWidth: 1 }} />
                <Area type="monotone" dataKey="revenue" stroke={SERIES} strokeWidth={2} fill={SERIES} fillOpacity={0.1} activeDot={{ r: 4, stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title={<>Orders · last 30 days <span className="ml-2 font-normal text-muted-foreground">{last30Orders}</span></>}>
          <div className="h-64" role="img" aria-label={`Orders per day over the last 30 days, total ${last30Orders}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={GRID} strokeWidth={1} vertical={false} />
                <XAxis dataKey="date" tickFormatter={shortDay} tick={{ fill: AXIS_TEXT, fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={24} />
                <YAxis allowDecimals={false} tick={{ fill: AXIS_TEXT, fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                <Tooltip content={<ChartTooltip kind="orders" />} cursor={{ fill: "oklch(93.8% 0.021 300 / 0.5)" }} />
                <Bar dataKey="orders" fill={SERIES} radius={[4, 4, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.6fr]">
        <Panel title="Orders by status">
          <ul className="space-y-3">
            {statusOrder.map((s) => {
              const n = data.statusCounts[s] ?? 0;
              return (
                <li key={s}>
                  <Link href={`/admin/orders?status=${s}`} className="group grid grid-cols-[110px_1fr_40px] items-center gap-3">
                    <StatusBadge status={s} className="justify-self-start" />
                    <span className="h-2 overflow-hidden rounded-full bg-muted">
                      <span className="block h-full rounded-full transition-all" style={{ width: `${(n / maxStatus) * 100}%`, background: SERIES }} />
                    </span>
                    <span className="text-right text-sm font-semibold tabular-nums group-hover:text-brand" aria-label={`${n} ${ORDER_STATUS_LABEL[s]}`}>
                      {n}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="Recent orders" actions={<Link href="/admin/orders" className="text-sm font-semibold text-brand hover:underline">View all</Link>} bodyClassName="p-0">
          {data.recentOrders.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="border-b border-lavender">
                  <tr>
                    <th className={th}>Order</th>
                    <th className={th}>Customer</th>
                    <th className={th}>Status</th>
                    <th className={th}>Payment</th>
                    <th className={`${th} text-right`}>Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lavender">
                  {data.recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-accent/30">
                      <td className={td}>
                        <Link href={`/admin/orders/${o.id}`} className="font-semibold text-primary hover:underline">{o.orderNumber}</Link>
                        <p className="text-xs text-muted-foreground">{date(o.placedAt)}</p>
                      </td>
                      <td className={td}>{o.user ? `${o.user.firstName} ${o.user.lastName}` : o.shipFullName}</td>
                      <td className={td}><StatusBadge status={o.status} /></td>
                      <td className={td}><PaymentBadge status={o.paymentStatus} /></td>
                      <td className={`${td} text-right font-semibold tabular-nums`}>{money(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="p-5 text-sm text-muted-foreground">No orders yet.</p>
          )}
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title={<span className="inline-flex items-center gap-2"><AlertTriangle className="size-4 text-amber-600" /> Low stock</span>} actions={<Link href="/admin/inventory?low=1" className="text-sm font-semibold text-brand hover:underline">Manage</Link>} bodyClassName="p-0">
          {data.lowStock.length ? (
            <ul className="divide-y divide-lavender">
              {data.lowStock.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <div className="min-w-0">
                    <Link href={`/admin/products/${v.product.id}?tab=variants`} className="font-semibold hover:text-brand">{v.product.name}</Link>
                    <p className="text-xs text-muted-foreground">{v.label} · {v.sku}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${v.stock === 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`}>
                    {v.stock === 0 ? "Out of stock" : `${v.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-5 text-sm text-muted-foreground">Everything is well stocked.</p>
          )}
        </Panel>
        <Panel title="Top products (units sold)" bodyClassName="p-0">
          {data.topProducts.length ? (
            <ul className="divide-y divide-lavender">
              {data.topProducts.map((p) => (
                <li key={p.name} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-right text-muted-foreground tabular-nums">
                    <span className="font-semibold text-foreground">{p.quantity}</span> packs · {money(p.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-5 text-sm text-muted-foreground">No sales yet.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}
