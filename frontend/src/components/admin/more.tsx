"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Archive, Download, ImagePlus, Inbox, Loader2, Mail, MailOpen, Phone, Trash2, Users } from "lucide-react";
import { api, del, get, patch, qs } from "@/lib/client-api";
import type { AdminSettings, CustomerDetail, CustomerRow, Inquiry, Paged, Subscriber } from "@/lib/admin-types";
import type { Category, InquiryStatus, InquiryType } from "@/lib/types";
import { date, dateTime, INQUIRY_TYPE_LABEL, money } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useMe } from "@/hooks/use-auth";
import { Switch } from "@/components/ui/switch";
import { NativeSelect } from "@/components/ui/native-select";
import { ProductImage } from "@/components/shop/product-image";
import { PaymentBadge, StatusBadge } from "@/components/orders/order-ui";
import { formatAddress } from "@/components/account/address-form";
import { EmptyState, Label, PageHeader, Pagination, Panel, SearchInput, TableSkeleton, Tabs, btn, inputCls, td, th } from "./admin-ui";

// ─── Categories ──────────────────────────────────────────────────────────────

function CategoryCard({ category }: { category: Category }) {
  const qc = useQueryClient();
  const file = useRef<HTMLInputElement>(null);
  const [v, setV] = useState({
    name: category.name,
    tagline: category.tagline ?? "",
    description: category.description ?? "",
    statusLabel: category.statusLabel ?? "",
    sortOrder: category.sortOrder,
  });
  const save = useMutation({
    mutationFn: () => patch(`/admin/categories/${category.id}`, v),
    onSuccess: () => {
      toast.success(`${v.name} saved.`);
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const upload = useMutation({
    mutationFn: (f: File) => {
      const fd = new FormData();
      fd.append("file", f);
      return api(`/admin/categories/${category.id}/image`, { method: "POST", body: fd });
    },
    onSuccess: () => {
      toast.success("Category image uploaded to Cloudinary.");
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Panel title={<span>{category.name} <span className="ml-2 text-xs font-normal text-muted-foreground">/{category.slug} · {category.productCount ?? 0} products</span></span>}>
      <form
        className="grid gap-5 lg:grid-cols-[200px_1fr]"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <div>
          <ProductImage src={category.imageUrl} alt={category.name} sizes="200px" className="aspect-square rounded-xl" />
          <button type="button" className={cn(btn.secondary, "mt-3 w-full")} disabled={upload.isPending} onClick={() => file.current?.click()}>
            {upload.isPending ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />} Replace image
          </button>
          <input
            ref={file}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload.mutate(f);
              e.target.value = "";
            }}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label><Label>Name</Label><input required className={inputCls} value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></label>
          <label><Label hint='e.g. "Available Now"'>Status label</Label><input className={inputCls} value={v.statusLabel} onChange={(e) => setV({ ...v, statusLabel: e.target.value })} /></label>
          <label className="sm:col-span-2"><Label>Tagline</Label><input className={inputCls} value={v.tagline} onChange={(e) => setV({ ...v, tagline: e.target.value })} /></label>
          <label className="sm:col-span-2"><Label>Description</Label><textarea rows={4} className={cn(inputCls, "h-auto py-2")} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} /></label>
          <label><Label>Sort order</Label><input type="number" min={0} className={inputCls} value={v.sortOrder} onChange={(e) => setV({ ...v, sortOrder: Number(e.target.value) })} /></label>
          <div className="flex items-end justify-end">
            <button type="submit" className={btn.primary} disabled={save.isPending}>
              {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null} Save
            </button>
          </div>
        </div>
      </form>
    </Panel>
  );
}

export function AdminCategories() {
  const { data = [], isLoading } = useQuery({ queryKey: ["admin", "categories"], queryFn: () => get<Category[]>("/admin/categories") });
  return (
    <div>
      <PageHeader title="Categories" description="The three KorganoTech programs. Product availability is set per product." />
      {isLoading ? <TableSkeleton rows={3} /> : (
        <div className="space-y-6">
          {data.map((c) => <CategoryCard key={`${c.id}:${c.imageUrl}`} category={c} />)}
        </div>
      )}
    </div>
  );
}

// ─── Customers ───────────────────────────────────────────────────────────────

export function AdminCustomers() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "customers", q, role, page],
    queryFn: () => get<Paged<CustomerRow>>(`/admin/customers${qs({ q, role, page })}`),
    placeholderData: keepPreviousData,
  });
  return (
    <div>
      <PageHeader title="Customers" description="Accounts, their orders and lifetime spend." />
      <div className="mb-4 flex flex-wrap gap-3">
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search name, email or phone" className="min-w-64 flex-1" />
        <NativeSelect value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} wrapperClassName="w-40" aria-label="Role">
          <option value="">All roles</option>
          <option value="CUSTOMER">Customers</option>
          <option value="ADMIN">Admins</option>
        </NativeSelect>
      </div>
      <Panel bodyClassName="p-0">
        {isLoading ? <TableSkeleton /> : data && data.items.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="border-b border-lavender">
                  <tr>
                    <th className={th}>Name</th>
                    <th className={th}>Phone</th>
                    <th className={th}>Orders</th>
                    <th className={th}>Spent</th>
                    <th className={th}>Joined</th>
                    <th className={th}>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lavender">
                  {data.items.map((c) => (
                    <tr key={c.id} className="hover:bg-accent/30">
                      <td className={td}>
                        <Link href={`/admin/customers/${c.id}`} className="font-semibold text-primary hover:underline">{c.firstName} {c.lastName}</Link>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </td>
                      <td className={td}>{c.phone ?? "—"}</td>
                      <td className={cn(td, "tabular-nums")}>{c.orderCount}</td>
                      <td className={cn(td, "tabular-nums")}>{money(c.totalSpent)}</td>
                      <td className={cn(td, "text-muted-foreground")}>{date(c.createdAt)}</td>
                      <td className={td}>
                        <span className="flex gap-1.5">
                          {c.role === "ADMIN" ? <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-primary">Admin</span> : null}
                          <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", c.isActive ? "bg-emerald-50 text-emerald-800" : "bg-zinc-100 text-zinc-600")}>
                            {c.isActive ? "Active" : "Deactivated"}
                          </span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} pageCount={data.pageCount} total={data.total} onPage={setPage} />
          </>
        ) : <EmptyState icon={Users} title="No customers found" />}
      </Panel>
    </div>
  );
}

export function AdminCustomerDetail({ id }: { id: string }) {
  const qc = useQueryClient();
  const { data: me } = useMe();
  const key = ["admin", "customer", id];
  const { data: c, isLoading } = useQuery({ queryKey: key, queryFn: () => get<CustomerDetail>(`/admin/customers/${id}`) });
  const update = useMutation({
    mutationFn: (body: { isActive?: boolean; role?: "CUSTOMER" | "ADMIN" }) => patch<CustomerDetail>(`/admin/customers/${id}`, body),
    onSuccess: (d) => {
      qc.setQueryData(key, d);
      qc.invalidateQueries({ queryKey: ["admin", "customers"] });
      toast.success("Account updated. The user will need to sign in again.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  if (isLoading || !c) return <div className="h-96 animate-pulse rounded-2xl bg-white" />;
  const self = me?.id === c.id;

  return (
    <div className="space-y-6">
      <PageHeader back={{ href: "/admin/customers", label: "Customers" }} title={`${c.firstName} ${c.lastName}`} description={`Customer since ${date(c.createdAt)}`} />
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <Panel title="Contact">
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2"><Mail className="size-4 text-brand" /> <a href={`mailto:${c.email}`} className="hover:underline">{c.email}</a></p>
              <p className="flex items-center gap-2"><Phone className="size-4 text-brand" /> {c.phone ?? "—"}</p>
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="rounded-xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Orders</p><p className="text-xl font-bold tabular-nums">{c.orderCount}</p></div>
                <div className="rounded-xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Spent</p><p className="text-xl font-bold tabular-nums">{money(c.totalSpent)}</p></div>
              </div>
            </div>
          </Panel>
          <Panel title="Access">
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span><span className="block font-semibold">Account active</span><span className="text-xs text-muted-foreground">Deactivated users can&apos;t sign in.</span></span>
                <Switch checked={c.isActive} disabled={self || update.isPending} onCheckedChange={(v) => update.mutate({ isActive: v })} aria-label="Account active" />
              </div>
              <label className="block">
                <Label>Role</Label>
                <NativeSelect value={c.role} disabled={self || update.isPending} onChange={(e) => update.mutate({ role: e.target.value as "CUSTOMER" | "ADMIN" })}>
                  <option value="CUSTOMER">Customer</option>
                  <option value="ADMIN">Admin</option>
                </NativeSelect>
              </label>
              {self ? <p className="text-xs text-muted-foreground">You can&apos;t change your own access.</p> : null}
            </div>
          </Panel>
          <Panel title="Addresses">
            {c.addresses.length ? (
              <ul className="space-y-3 text-sm">
                {c.addresses.map((a) => (
                  <li key={a.id} className="rounded-xl bg-muted/50 p-3">
                    <p className="font-semibold">{a.fullName}{a.isDefault ? <span className="ml-2 text-xs text-brand">Default</span> : null}</p>
                    <p className="text-muted-foreground">{formatAddress(a)}</p>
                    <p className="text-muted-foreground">{a.phone}</p>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted-foreground">No saved addresses.</p>}
          </Panel>
        </div>
        <Panel title="Orders" bodyClassName="p-0">
          {c.orders.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="border-b border-lavender">
                  <tr><th className={th}>Order</th><th className={th}>Placed</th><th className={th}>Status</th><th className={th}>Payment</th><th className={`${th} text-right`}>Total</th></tr>
                </thead>
                <tbody className="divide-y divide-lavender">
                  {c.orders.map((o) => (
                    <tr key={o.id} className="hover:bg-accent/30">
                      <td className={td}><Link href={`/admin/orders/${o.id}`} className="font-semibold text-primary hover:underline">{o.orderNumber}</Link></td>
                      <td className={cn(td, "text-muted-foreground")}>{date(o.placedAt)}</td>
                      <td className={td}><StatusBadge status={o.status} /></td>
                      <td className={td}><PaymentBadge status={o.paymentStatus} /></td>
                      <td className={cn(td, "text-right font-semibold tabular-nums")}>{money(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="p-5 text-sm text-muted-foreground">No orders yet.</p>}
        </Panel>
      </div>
    </div>
  );
}

// ─── Inquiries ───────────────────────────────────────────────────────────────

type TypeTab = "ALL" | InquiryType;

export function AdminInquiries() {
  const qc = useQueryClient();
  const [type, setType] = useState<TypeTab>("ALL");
  const [status, setStatus] = useState<"" | InquiryStatus>("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "inquiries", type, status, q, page],
    queryFn: () => get<Paged<Inquiry> & { statusCounts: Partial<Record<InquiryStatus, number>> }>(`/admin/inquiries${qs({ type: type === "ALL" ? null : type, status, q, page })}`),
    placeholderData: keepPreviousData,
  });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "inquiries"] });
    qc.invalidateQueries({ queryKey: ["admin", "stats"] });
  };
  const setInquiryStatus = useMutation({
    mutationFn: ({ id, s }: { id: string; s: InquiryStatus }) => patch(`/admin/inquiries/${id}`, { status: s }),
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => del(`/admin/inquiries/${id}`),
    onSuccess: () => {
      toast.success("Inquiry deleted.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Inquiries" description="Contact-sales, franchise, notify-me and landfill enquiries from the website." />
      <div className="mb-4 space-y-3">
        <Tabs<TypeTab>
          value={type}
          onChange={(v) => { setType(v); setPage(1); }}
          items={[{ value: "ALL", label: "All" }, ...(Object.keys(INQUIRY_TYPE_LABEL) as InquiryType[]).map((t) => ({ value: t, label: INQUIRY_TYPE_LABEL[t] }))]}
        />
        <div className="flex flex-wrap gap-3">
          <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search name, email, company or message" className="min-w-64 flex-1" />
          <NativeSelect value={status} onChange={(e) => { setStatus(e.target.value as "" | InquiryStatus); setPage(1); }} wrapperClassName="w-44" aria-label="Status">
            <option value="">Inbox (new + read)</option>
            <option value="NEW">New ({data?.statusCounts.NEW ?? 0})</option>
            <option value="READ">Read</option>
            <option value="ARCHIVED">Archived</option>
          </NativeSelect>
        </div>
      </div>
      {isLoading ? <TableSkeleton /> : data && data.items.length ? (
        <div className="space-y-3">
          {data.items.map((i) => (
            <article key={i.id} className={cn("rounded-2xl border bg-white p-5 shadow-card", i.status === "NEW" ? "border-brand/40" : "border-lavender")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex flex-wrap items-center gap-2 font-bold">
                    {i.status === "NEW" ? <span className="size-2 rounded-full bg-brand" aria-label="New" /> : null}
                    {i.name}
                    <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-primary">{INQUIRY_TYPE_LABEL[i.type]}</span>
                    {i.productType ? <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">{i.productType}</span> : null}
                    {i.productName ? <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">{i.productName}</span> : null}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <a href={`mailto:${i.email}`} className="hover:underline">{i.email}</a>
                    {i.phone ? ` · ${i.phone}` : ""}
                    {i.company ? ` · ${i.company}` : ""}
                    {" · "}{dateTime(i.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <a href={`mailto:${i.email}?subject=${encodeURIComponent("Re: your KorganoTech enquiry")}`} className={btn.ghost}><Mail className="size-4" /> Reply</a>
                  {i.status === "NEW" ? (
                    <button type="button" className={btn.ghost} onClick={() => setInquiryStatus.mutate({ id: i.id, s: "READ" })}><MailOpen className="size-4" /> Mark read</button>
                  ) : null}
                  {i.status !== "ARCHIVED" ? (
                    <button type="button" className={btn.ghost} onClick={() => setInquiryStatus.mutate({ id: i.id, s: "ARCHIVED" })}><Archive className="size-4" /> Archive</button>
                  ) : (
                    <button type="button" className={btn.ghost} onClick={() => setInquiryStatus.mutate({ id: i.id, s: "READ" })}>Restore</button>
                  )}
                  <button
                    type="button"
                    className={cn(btn.ghost, "hover:bg-destructive/10 hover:text-destructive")}
                    aria-label="Delete inquiry"
                    onClick={() => { if (confirm("Delete this inquiry?")) remove.mutate(i.id); }}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm whitespace-pre-wrap">{i.message}</p>
            </article>
          ))}
          <div className="rounded-2xl border border-lavender bg-white">
            <Pagination page={data.page} pageCount={data.pageCount} total={data.total} onPage={setPage} />
          </div>
        </div>
      ) : (
        <Panel><EmptyState icon={Inbox} title="No inquiries here" body="Messages from the contact, franchise and notify-me forms land in this inbox." /></Panel>
      )}
    </div>
  );
}

// ─── Newsletter ──────────────────────────────────────────────────────────────

export function AdminNewsletter() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "newsletter", q, page],
    queryFn: () => get<Paged<Subscriber>>(`/admin/newsletter${qs({ q, page, pageSize: 50 })}`),
    placeholderData: keepPreviousData,
  });
  const exportCsv = async () => {
    const all: Subscriber[] = [];
    for (let p = 1; ; p++) {
      const res = await get<Paged<Subscriber>>(`/admin/newsletter${qs({ page: p, pageSize: 100 })}`);
      all.push(...res.items);
      if (p >= res.pageCount) break;
    }
    const csv = ["email,subscribed_at", ...all.map((s) => `${s.email},${s.createdAt}`)].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "korganotech-newsletter.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div>
      <PageHeader
        title="Newsletter"
        description="People who signed up for product updates and announcements."
        actions={<button type="button" className={btn.secondary} onClick={() => void exportCsv()}><Download className="size-4" /> Export CSV</button>}
      />
      <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search email" className="mb-4 max-w-md" />
      <Panel bodyClassName="p-0">
        {isLoading ? <TableSkeleton /> : data && data.items.length ? (
          <>
            <table className="w-full text-sm">
              <thead className="border-b border-lavender"><tr><th className={th}>Email</th><th className={th}>Subscribed</th></tr></thead>
              <tbody className="divide-y divide-lavender">
                {data.items.map((s) => (
                  <tr key={s.id}><td className={td}>{s.email}</td><td className={cn(td, "text-muted-foreground")}>{dateTime(s.createdAt)}</td></tr>
                ))}
              </tbody>
            </table>
            <Pagination page={data.page} pageCount={data.pageCount} total={data.total} onPage={setPage} />
          </>
        ) : <EmptyState icon={Mail} title="No subscribers yet" />}
      </Panel>
    </div>
  );
}

// ─── Settings ────────────────────────────────────────────────────────────────

function SettingsForm({ s }: { s: AdminSettings }) {
  const qc = useQueryClient();
  const [v, setV] = useState({
    storeName: s.storeName,
    supportEmail: s.supportEmail ?? "",
    supportPhone: s.supportPhone ?? "",
    address: s.address ?? "",
    shippingFee: String(s.shippingFee),
    freeShippingThreshold: s.freeShippingThreshold === null ? "" : String(s.freeShippingThreshold),
    taxRatePct: String(Math.round(s.taxRate * 10000) / 100),
    codEnabled: s.codEnabled,
    announcement: s.announcement ?? "",
  });
  const save = useMutation({
    mutationFn: () =>
      patch<AdminSettings>("/admin/settings", {
        storeName: v.storeName,
        supportEmail: v.supportEmail || null,
        supportPhone: v.supportPhone || null,
        address: v.address || null,
        shippingFee: Number(v.shippingFee),
        freeShippingThreshold: v.freeShippingThreshold === "" ? null : Number(v.freeShippingThreshold),
        taxRate: Number(v.taxRatePct) / 100,
        codEnabled: v.codEnabled,
        announcement: v.announcement || null,
      }),
    onSuccess: (d) => {
      qc.setQueryData(["admin", "settings"], d);
      qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings saved.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: e.target.value });

  return (
    <form
      className="grid gap-6 xl:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <Panel title="Store">
        <div className="grid gap-4">
          <label><Label>Store name</Label><input required className={inputCls} value={v.storeName} onChange={set("storeName")} /></label>
          <label><Label>Support email</Label><input type="email" className={inputCls} value={v.supportEmail} onChange={set("supportEmail")} /></label>
          <label><Label>Support phone</Label><input className={inputCls} value={v.supportPhone} onChange={set("supportPhone")} /></label>
          <label><Label>Address</Label><input className={inputCls} value={v.address} onChange={set("address")} /></label>
          <label><Label hint="Top banner on every page">Announcement</Label><input className={inputCls} maxLength={200} value={v.announcement} onChange={set("announcement")} /></label>
        </div>
      </Panel>
      <Panel title="Checkout">
        <div className="grid gap-4">
          <label><Label>Flat shipping fee ($)</Label><input type="number" min={0} step="0.01" className={inputCls} value={v.shippingFee} onChange={set("shippingFee")} /></label>
          <label><Label hint="Leave empty to disable">Free shipping from ($)</Label><input type="number" min={0} step="0.01" className={inputCls} value={v.freeShippingThreshold} onChange={set("freeShippingThreshold")} /></label>
          <label><Label hint="Applied to the subtotal">Sales tax (%)</Label><input type="number" min={0} max={50} step="0.01" className={inputCls} value={v.taxRatePct} onChange={set("taxRatePct")} /></label>
          <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 p-4">
            <span><span className="block text-sm font-semibold">Cash on Delivery</span><span className="text-xs text-muted-foreground">Turning this off pauses checkout until another payment method is added.</span></span>
            <Switch checked={v.codEnabled} onCheckedChange={(c) => setV({ ...v, codEnabled: c })} aria-label="Cash on Delivery enabled" />
          </div>
        </div>
      </Panel>
      <div className="xl:col-span-2">
        <button type="submit" className={btn.primary} disabled={save.isPending}>
          {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null} Save settings
        </button>
      </div>
    </form>
  );
}

export function AdminSettingsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["admin", "settings"], queryFn: () => get<AdminSettings>("/admin/settings") });
  return (
    <div>
      <PageHeader title="Settings" description="Shipping, tax, payment and store details used at checkout." />
      {isLoading || !data ? <TableSkeleton rows={4} /> : <SettingsForm s={data} />}
    </div>
  );
}
