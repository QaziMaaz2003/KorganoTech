"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Building2, Check, Copy, Loader2, Plus, Ruler, Search, Trash2, UserPlus } from "lucide-react";
import { del, get, patch, post, qs } from "@/lib/client-api";
import type {
  BusinessDetail,
  BusinessLoginResult,
  BusinessRow,
  InventoryRow,
  Paged,
} from "@/lib/admin-types";
import type { CustomFilterOptions } from "@/lib/types";
import { date, money } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { NativeSelect } from "@/components/ui/native-select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  EmptyState,
  Label,
  PageHeader,
  Pagination,
  Panel,
  SearchInput,
  TableSkeleton,
  btn,
  inputCls,
  td,
  th,
} from "./admin-ui";

const KEY = ["admin", "businesses"];

// ─── Temporary password (shown once) ─────────────────────────────────────────

function LoginResultDialog({ result, onClose }: { result: BusinessLoginResult["login"] | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <Dialog open={result !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{result?.created ? "Login created" : "Login linked"}</DialogTitle>
        </DialogHeader>
        {result ? (
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-semibold">{result.email}</span>{" "}
              {result.created
                ? "is a new customer login for this business."
                : "already had a KorganoTech account and now belongs to this business. Their password is unchanged."}
            </p>
            {result.tempPassword ? (
              <div className="rounded-xl bg-accent p-4">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Temporary password</p>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <code className="text-lg font-bold break-all text-primary" data-testid="temp-password">{result.tempPassword}</code>
                  <button
                    type="button"
                    className={btn.secondary}
                    onClick={() => {
                      navigator.clipboard?.writeText(result.tempPassword!).then(() => setCopied(true), () => undefined);
                    }}
                  >
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  This is shown only once. Send it to the customer and ask them to change it in Account settings after
                  signing in.
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
        <DialogFooter>
          <button type="button" className={btn.primary} onClick={onClose}>Done</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── List + create ───────────────────────────────────────────────────────────

function CreateBusinessDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const qc = useQueryClient();
  const params = useSearchParams();
  const [login, setLogin] = useState<BusinessLoginResult | null>(null);

  const [v, setV] = useState(() => {
    const contact = (params.get("contact") ?? "").trim().split(/\s+/);
    return {
      name: params.get("name") ?? "",
      loginEmail: params.get("email") ?? "",
      firstName: contact[0] ?? "",
      lastName: contact.slice(1).join(" "),
      phone: params.get("phone") ?? "",
      address: params.get("address") ?? "",
      notes: "",
    };
  });
  const inquiryId = params.get("inquiry") || undefined;
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setV((p) => ({ ...p, [k]: e.target.value }));

  const create = useMutation({
    mutationFn: () =>
      post<BusinessLoginResult>("/admin/businesses", {
        ...v,
        phone: v.phone || undefined,
        address: v.address || undefined,
        notes: v.notes || undefined,
        firstName: v.firstName || undefined,
        lastName: v.lastName || undefined,
        inquiryId,
      }),
    onSuccess: (res) => {
      toast.success(`${res.business.name} created.`);
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["admin", "inquiries"] });
      setLogin(res);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <Dialog open={open && !login} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>New business account</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate();
            }}
          >
            <label className="block"><Label>Company name</Label>
              <input required className={inputCls} value={v.name} onChange={set("name")} maxLength={160} />
            </label>
            <label className="block"><Label hint="Existing customers are linked; new ones get a temporary password">Login email</Label>
              <input required type="email" className={inputCls} value={v.loginEmail} onChange={set("loginEmail")} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block"><Label>First name</Label>
                <input className={inputCls} value={v.firstName} onChange={set("firstName")} maxLength={60} />
              </label>
              <label className="block"><Label>Last name</Label>
                <input className={inputCls} value={v.lastName} onChange={set("lastName")} maxLength={60} />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block"><Label>Phone</Label>
                <input className={inputCls} value={v.phone} onChange={set("phone")} maxLength={40} />
              </label>
              <label className="block"><Label>Address</Label>
                <input className={inputCls} value={v.address} onChange={set("address")} maxLength={300} />
              </label>
            </div>
            <label className="block"><Label>Internal notes</Label>
              <textarea rows={3} className={cn(inputCls, "h-auto py-2")} value={v.notes} onChange={set("notes")} maxLength={2000} />
            </label>
            <DialogFooter>
              <button type="button" className={btn.secondary} onClick={onClose}>Cancel</button>
              <button type="submit" className={btn.primary} disabled={create.isPending}>
                {create.isPending ? <Loader2 className="size-4 animate-spin" /> : null} Create account
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <LoginResultDialog
        result={login?.login ?? null}
        onClose={() => {
          const id = login?.business.id;
          setLogin(null);
          onClose();
          if (id) router.push(`/admin/businesses/${id}`);
        }}
      />
    </>
  );
}

export function AdminBusinesses() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(params.get("new") === "1");

  const { data, isLoading } = useQuery({
    queryKey: [...KEY, q, page],
    queryFn: () => get<Paged<BusinessRow>>(`/admin/businesses${qs({ q, page })}`),
    placeholderData: keepPreviousData,
  });

  return (
    <div>
      <PageHeader
        title="Business accounts"
        description="Businesses sign in to see the filter sizes you've set up for them and reorder in a few clicks."
        actions={
          <button type="button" className={btn.primary} onClick={() => setCreating(true)}>
            <Plus className="size-4" /> New business
          </button>
        }
      />
      <div className="mb-4">
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search company, address or login email" />
      </div>
      {isLoading ? <TableSkeleton /> : data && data.items.length ? (
        <div className="overflow-hidden rounded-2xl border border-lavender bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-lavender bg-muted/50">
                <tr>
                  <th className={th}>Business</th>
                  <th className={th}>Logins</th>
                  <th className={th}>Filters</th>
                  <th className={th}>Status</th>
                  <th className={th}>Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lavender">
                {data.items.map((b) => (
                  <tr key={b.id} className="cursor-pointer hover:bg-accent/40" onClick={() => router.push(`/admin/businesses/${b.id}`)}>
                    <td className={td}>
                      <Link href={`/admin/businesses/${b.id}`} className="font-bold text-primary hover:underline" onClick={(e) => e.stopPropagation()}>{b.name}</Link>
                      {b.address ? <p className="text-xs text-muted-foreground">{b.address}</p> : null}
                    </td>
                    <td className={cn(td, "tabular-nums")}>{b._count.users}</td>
                    <td className={cn(td, "tabular-nums")}>{b._count.filters}</td>
                    <td className={td}>
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", b.isActive ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground")}>
                        {b.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className={cn(td, "text-muted-foreground")}>{date(b.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} pageCount={data.pageCount} total={data.total} onPage={setPage} />
        </div>
      ) : (
        <Panel>
          <EmptyState
            icon={Building2}
            title="No business accounts yet"
            body="Requests from the website arrive in Inquiries, where you can turn one into an account with one click."
            action={<Link href="/admin/inquiries" className={btn.secondary}>Open inquiries</Link>}
          />
        </Panel>
      )}
      {creating ? <CreateBusinessDialog open onClose={() => { setCreating(false); router.replace("/admin/businesses"); }} /> : null}
    </div>
  );
}

// ─── Detail ──────────────────────────────────────────────────────────────────

function Details({ b }: { b: BusinessDetail }) {
  const qc = useQueryClient();
  const [v, setV] = useState({ name: b.name, phone: b.phone ?? "", address: b.address ?? "", notes: b.notes ?? "" });
  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => patch<BusinessDetail>(`/admin/businesses/${b.id}`, body),
    onSuccess: (res) => {
      qc.setQueryData([...KEY, b.id], res);
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Saved.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setV((p) => ({ ...p, [k]: e.target.value }));

  return (
    <Panel
      title="Details"
      actions={
        <label className="flex items-center gap-2 text-sm font-semibold">
          Active
          <Switch checked={b.isActive} onCheckedChange={(isActive) => save.mutate({ isActive })} aria-label="Account active" />
        </label>
      }
    >
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate({ ...v });
        }}
      >
        <label className="block"><Label>Company name</Label><input required className={inputCls} value={v.name} onChange={set("name")} maxLength={160} /></label>
        <label className="block"><Label>Phone</Label><input className={inputCls} value={v.phone} onChange={set("phone")} maxLength={40} /></label>
        <label className="block sm:col-span-2"><Label>Address</Label><input className={inputCls} value={v.address} onChange={set("address")} maxLength={300} /></label>
        <label className="block sm:col-span-2"><Label>Internal notes</Label>
          <textarea rows={3} className={cn(inputCls, "h-auto py-2")} value={v.notes} onChange={set("notes")} maxLength={2000} />
        </label>
        <div className="sm:col-span-2">
          <button type="submit" className={btn.primary} disabled={save.isPending}>
            {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null} Save details
          </button>
        </div>
      </form>
    </Panel>
  );
}

function Logins({ b }: { b: BusinessDetail }) {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [result, setResult] = useState<BusinessLoginResult["login"] | null>(null);

  const add = useMutation({
    mutationFn: () =>
      post<BusinessLoginResult>(`/admin/businesses/${b.id}/users`, {
        email,
        firstName: first || undefined,
        lastName: last || undefined,
      }),
    onSuccess: (res) => {
      qc.setQueryData([...KEY, b.id], res.business);
      qc.invalidateQueries({ queryKey: KEY });
      setEmail(""); setFirst(""); setLast("");
      setResult(res.login);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (userId: string) => del<BusinessDetail>(`/admin/businesses/${b.id}/users/${userId}`),
    onSuccess: (res) => {
      qc.setQueryData([...KEY, b.id], res);
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Login removed from this business.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Panel title="Logins">
      <ul className="divide-y divide-lavender">
        {b.users.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0">
            <div className="min-w-0">
              <p className="font-semibold">{u.firstName} {u.lastName}</p>
              <p className="truncate text-sm text-muted-foreground">{u.email}</p>
            </div>
            <button
              type="button"
              className={cn(btn.ghost, "hover:bg-destructive/10 hover:text-destructive")}
              onClick={() => { if (confirm(`Remove ${u.email} from this business? They keep their customer account.`)) remove.mutate(u.id); }}
            >
              <Trash2 className="size-4" /> Remove
            </button>
          </li>
        ))}
        {b.users.length === 0 ? <li className="py-2 text-sm text-muted-foreground">No logins yet. Add one below.</li> : null}
      </ul>
      <form
        className="mt-4 grid gap-3 border-t border-lavender pt-4 sm:grid-cols-[1.4fr_1fr_1fr_auto]"
        onSubmit={(e) => { e.preventDefault(); add.mutate(); }}
      >
        <input required type="email" aria-label="Login email" placeholder="Login email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
        <input aria-label="First name" placeholder="First name" className={inputCls} value={first} onChange={(e) => setFirst(e.target.value)} />
        <input aria-label="Last name" placeholder="Last name" className={inputCls} value={last} onChange={(e) => setLast(e.target.value)} />
        <button type="submit" className={btn.secondary} disabled={add.isPending}>
          {add.isPending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />} Add login
        </button>
      </form>
      <LoginResultDialog result={result} onClose={() => setResult(null)} />
    </Panel>
  );
}

function FilterRow({ businessId, f }: { businessId: string; f: BusinessDetail["filters"][number] }) {
  const qc = useQueryClient();
  const [qty, setQty] = useState(String(f.quantity));
  const [label, setLabel] = useState(f.label ?? "");
  const dirty = Number(qty) !== f.quantity || label !== (f.label ?? "");
  const apply = (res: BusinessDetail) => {
    qc.setQueryData([...KEY, businessId], res);
    qc.invalidateQueries({ queryKey: KEY });
  };
  const save = useMutation({
    mutationFn: () => patch<BusinessDetail>(`/admin/businesses/${businessId}/filters/${f.id}`, { quantity: Number(qty), label }),
    onSuccess: (res) => { apply(res); toast.success("Filter updated."); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: () => del<BusinessDetail>(`/admin/businesses/${businessId}/filters/${f.id}`),
    onSuccess: apply,
    onError: (e: Error) => toast.error(e.message),
  });
  const c = f.custom;
  return (
    <tr>
      <td className={td}>
        <p className="font-semibold text-primary">{f.product?.name ?? (f.isCustom ? "Custom-size filter" : "Filter")}</p>
        <p className="text-xs text-muted-foreground">
          {f.variant ? `${f.variant.label} · ${f.variant.sku}` : c ? `${c.width}×${c.height}×${c.depth} · MERV ${c.mervRating} · ${c.packQuantity}-pack` : ""}
        </p>
        {f.issue ? <p className="text-xs font-semibold text-destructive">{f.issue}</p> : null}
      </td>
      <td className={td}>
        <input aria-label="Label" placeholder="e.g. Front office" className={cn(inputCls, "min-w-36")} value={label} onChange={(e) => setLabel(e.target.value)} maxLength={80} />
      </td>
      <td className={td}>
        <input aria-label="Quantity" type="number" min={1} max={99} className={cn(inputCls, "w-20")} value={qty} onChange={(e) => setQty(e.target.value)} />
      </td>
      <td className={cn(td, "tabular-nums")}>{money(f.unitPrice)}</td>
      <td className={cn(td, "text-right whitespace-nowrap")}>
        {dirty ? (
          <button type="button" className={btn.secondary} disabled={save.isPending} onClick={() => save.mutate()}>Save</button>
        ) : null}
        <button type="button" aria-label="Remove filter" className={cn(btn.ghost, "hover:bg-destructive/10 hover:text-destructive")} onClick={() => remove.mutate()}>
          <Trash2 className="size-4" />
        </button>
      </td>
    </tr>
  );
}

function AddFilter({ b }: { b: BusinessDetail }) {
  const qc = useQueryClient();
  const [mode, setMode] = useState<"catalog" | "custom">("catalog");
  const [q, setQ] = useState("");
  const [qty, setQty] = useState("1");
  const [label, setLabel] = useState("");
  const [custom, setCustom] = useState({ width: "", height: "", depth: "1", mervRating: "11", packQuantity: "1" });

  const found = useQuery({
    queryKey: ["admin", "inventory", "pick", q],
    queryFn: () => get<Paged<InventoryRow>>(`/admin/inventory${qs({ q, pageSize: 8 })}`),
    enabled: mode === "catalog" && q.trim().length >= 2,
  });
  const cfg = useQuery({
    queryKey: ["custom-filters", "config"],
    queryFn: () => get<CustomFilterOptions>("/custom-filters/config"),
    enabled: mode === "custom",
  });

  const add = useMutation({
    mutationFn: (body: Record<string, unknown>) => post<BusinessDetail>(`/admin/businesses/${b.id}/filters`, body),
    onSuccess: (res) => {
      qc.setQueryData([...KEY, b.id], res);
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Filter added to the list.");
      setLabel("");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const common = { quantity: Number(qty) || 1, label: label || undefined };

  return (
    <div className="mt-5 rounded-xl border border-lavender bg-muted/40 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold text-primary">Add a filter</p>
        <div className="inline-flex rounded-lg border border-border bg-white p-0.5 text-sm font-semibold">
          {(["catalog", "custom"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)} className={cn("rounded-md px-3 py-1.5", mode === m ? "bg-gradient-brand text-white" : "text-muted-foreground")}>
              {m === "catalog" ? "From catalog" : "Custom size"}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_7rem]">
        <input aria-label="Label" placeholder="Label (optional), e.g. Front office" className={inputCls} value={label} onChange={(e) => setLabel(e.target.value)} maxLength={80} />
        <input aria-label="Quantity" type="number" min={1} max={99} className={inputCls} value={qty} onChange={(e) => setQty(e.target.value)} />
      </div>

      {mode === "catalog" ? (
        <div className="mt-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input className={cn(inputCls, "pl-9")} placeholder="Search by size, product or SKU (e.g. 16x25x1)" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          {found.data?.items.length ? (
            <ul className="mt-2 divide-y divide-lavender overflow-hidden rounded-lg border border-lavender bg-white">
              {found.data.items.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{r.product.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{r.label} · {r.sku} · {r.stock} in stock · {money(r.price)}</span>
                  </span>
                  <button type="button" className={btn.secondary} disabled={add.isPending} onClick={() => add.mutate({ variantId: r.id, ...common })}>
                    <Plus className="size-4" /> Add
                  </button>
                </li>
              ))}
            </ul>
          ) : q.trim().length >= 2 && !found.isFetching ? (
            <p className="mt-2 text-sm text-muted-foreground">No matching filters.</p>
          ) : null}
        </div>
      ) : (
        <form
          className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-6"
          onSubmit={(e) => {
            e.preventDefault();
            add.mutate({
              custom: {
                width: Number(custom.width),
                height: Number(custom.height),
                depth: Number(custom.depth),
                mervRating: Number(custom.mervRating),
                packQuantity: Number(custom.packQuantity),
              },
              ...common,
            });
          }}
        >
          <input required aria-label="Width" placeholder="Width (in)" type="number" step="any" min={1} className={inputCls} value={custom.width} onChange={(e) => setCustom((c) => ({ ...c, width: e.target.value }))} />
          <input required aria-label="Height" placeholder="Height (in)" type="number" step="any" min={1} className={inputCls} value={custom.height} onChange={(e) => setCustom((c) => ({ ...c, height: e.target.value }))} />
          <NativeSelect aria-label="Depth" value={custom.depth} onChange={(e) => setCustom((c) => ({ ...c, depth: e.target.value }))}>
            {(cfg.data?.depths ?? [1, 2, 4]).map((d) => <option key={d} value={d}>{d}&quot; deep</option>)}
          </NativeSelect>
          <NativeSelect aria-label="MERV rating" value={custom.mervRating} onChange={(e) => setCustom((c) => ({ ...c, mervRating: e.target.value }))}>
            {(cfg.data?.mervRatings ?? [11, 13]).map((m) => <option key={m} value={m}>MERV {m}</option>)}
          </NativeSelect>
          <NativeSelect aria-label="Pack size" value={custom.packQuantity} onChange={(e) => setCustom((c) => ({ ...c, packQuantity: e.target.value }))}>
            {(cfg.data?.packs ?? [{ quantity: 1, discount: 0 }]).map((p) => <option key={p.quantity} value={p.quantity}>{p.quantity}-pack</option>)}
          </NativeSelect>
          <button type="submit" className={btn.secondary} disabled={add.isPending}>
            {add.isPending ? <Loader2 className="size-4 animate-spin" /> : <Ruler className="size-4" />} Add
          </button>
        </form>
      )}
    </div>
  );
}

export function AdminBusinessDetail({ id }: { id: string }) {
  const { data: b, isLoading, error } = useQuery({
    queryKey: [...KEY, id],
    queryFn: () => get<BusinessDetail>(`/admin/businesses/${id}`),
  });

  if (isLoading) return <div className="h-96 animate-pulse rounded-2xl bg-white" />;
  if (error || !b) {
    return (
      <Panel>
        <EmptyState icon={Building2} title="Business not found" action={<Link href="/admin/businesses" className={btn.secondary}>Back to businesses</Link>} />
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        back={{ href: "/admin/businesses", label: "Business accounts" }}
        title={b.name}
        description={`Created ${date(b.createdAt)} · ${b.users.length} ${b.users.length === 1 ? "login" : "logins"} · ${b.filters.length} saved ${b.filters.length === 1 ? "filter" : "filters"}`}
      />
      <Details key={b.id + b.name} b={b} />
      <Logins b={b} />
      <Panel title="Filter list" bodyClassName="p-0 sm:p-5">
        {b.filters.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-lavender">
                <tr>
                  <th className={th}>Filter</th>
                  <th className={th}>Label</th>
                  <th className={th}>Qty</th>
                  <th className={th}>Price</th>
                  <th className={th} />
                </tr>
              </thead>
              <tbody className="divide-y divide-lavender">
                {b.filters.map((f) => <FilterRow key={`${f.id}:${f.quantity}:${f.label}`} businessId={b.id} f={f} />)}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-5 text-sm text-muted-foreground sm:p-0">No filters yet. Add the sizes this business orders below — they&apos;ll see them when they sign in.</p>
        )}
        <div className="p-5 pt-0 sm:p-0"><AddFilter b={b} /></div>
      </Panel>
    </div>
  );
}
