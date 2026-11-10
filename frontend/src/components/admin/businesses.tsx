"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Building2, Check, Copy, Download, Loader2, Plus, Trash2, Upload, UserPlus } from "lucide-react";
import { api, del, get, patch, post, qs } from "@/lib/client-api";
import type {
  BusinessDetail,
  BusinessLoginResult,
  BusinessRow,
  Paged,
  SheetImportSummary,
} from "@/lib/admin-types";
import type { BusinessLine, SizeType } from "@/lib/types";
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

function FilterRow({ businessId, f }: { businessId: string; f: BusinessLine }) {
  const qc = useQueryClient();
  const [qty, setQty] = useState(String(f.quantity));
  const [price, setPrice] = useState(f.unitPrice === null ? "" : String(f.unitPrice));
  const [label, setLabel] = useState(f.label ?? "");
  const [type, setType] = useState<SizeType>(f.sizeType);
  const dirty =
    Number(qty) !== f.quantity || price !== (f.unitPrice === null ? "" : String(f.unitPrice)) || label !== (f.label ?? "") || type !== f.sizeType;
  const apply = (res: BusinessDetail) => {
    qc.setQueryData([...KEY, businessId], res);
    qc.invalidateQueries({ queryKey: KEY });
  };
  const save = useMutation({
    mutationFn: () =>
      patch<BusinessDetail>(`/admin/businesses/${businessId}/filters/${f.id}`, {
        quantity: Number(qty),
        unitPrice: price === "" ? null : Number(price),
        label,
        sizeType: type,
      }),
    onSuccess: (res) => {
      apply(res);
      toast.success("Line updated.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: () => del<BusinessDetail>(`/admin/businesses/${businessId}/filters/${f.id}`),
    onSuccess: apply,
    onError: (e: Error) => toast.error(e.message),
  });
  const total = price === "" ? null : Number(price) * (Number(qty) || 0);
  return (
    <tr>
      <td className={td}>
        <input aria-label="School and building" placeholder="School - Building" className={cn(inputCls, "min-w-44")} value={label} onChange={(e) => setLabel(e.target.value)} maxLength={80} />
      </td>
      <td className={td}>
        <p className="font-semibold text-primary whitespace-nowrap">{f.size}</p>
        <p className="text-xs text-muted-foreground whitespace-nowrap">actual {f.actualSize}</p>
      </td>
      <td className={cn(td, "whitespace-nowrap")}>MERV {f.mervRating}</td>
      <td className={td}>
        <NativeSelect aria-label="Nominal or exact" value={type} onChange={(e) => setType(e.target.value as SizeType)}>
          <option value="NOMINAL">Nominal</option>
          <option value="EXACT">Exact</option>
        </NativeSelect>
      </td>
      <td className={td}>
        <input aria-label="Quantity" type="number" min={1} max={100000} className={cn(inputCls, "w-24")} value={qty} onChange={(e) => setQty(e.target.value)} />
      </td>
      <td className={td}>
        <input aria-label="Price per filter" type="number" min={0} step="0.01" placeholder="Not set" className={cn(inputCls, "w-28")} value={price} onChange={(e) => setPrice(e.target.value)} />
      </td>
      <td className={cn(td, "tabular-nums whitespace-nowrap")}>{total === null ? "—" : money(total)}</td>
      <td className={cn(td, "text-right whitespace-nowrap")}>
        {dirty ? (
          <button type="button" className={btn.secondary} disabled={save.isPending} onClick={() => save.mutate()}>Save</button>
        ) : null}
        <button type="button" aria-label="Remove line" className={cn(btn.ghost, "hover:bg-destructive/10 hover:text-destructive")} onClick={() => remove.mutate()}>
          <Trash2 className="size-4" />
        </button>
      </td>
    </tr>
  );
}

function AddLine({ b }: { b: BusinessDetail }) {
  const qc = useQueryClient();
  const [v, setV] = useState({ label: "", width: "", height: "", depth: "1", mervRating: "11", sizeType: "NOMINAL", quantity: "1", unitPrice: "" });
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setV((p) => ({ ...p, [k]: e.target.value }));
  const add = useMutation({
    mutationFn: () =>
      post<BusinessDetail>(`/admin/businesses/${b.id}/filters`, {
        label: v.label || undefined,
        width: Number(v.width),
        height: Number(v.height),
        depth: Number(v.depth),
        mervRating: Number(v.mervRating),
        sizeType: v.sizeType,
        quantity: Number(v.quantity),
        unitPrice: v.unitPrice === "" ? undefined : Number(v.unitPrice),
      }),
    onSuccess: (res) => {
      qc.setQueryData([...KEY, b.id], res);
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Line added to the list.");
      setV((p) => ({ ...p, width: "", height: "", quantity: "1" }));
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <form
      className="mt-5 rounded-xl border border-lavender bg-muted/40 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        add.mutate();
      }}
    >
      <p className="mb-3 font-semibold text-primary">Add a line</p>
      <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-8">
        <input aria-label="New line: school and building" placeholder="School - Building" className={cn(inputCls, "sm:col-span-2")} value={v.label} onChange={set("label")} maxLength={80} />
        <input required aria-label="New line: width" placeholder="Width" type="number" step="any" min={1} className={inputCls} value={v.width} onChange={set("width")} />
        <input required aria-label="New line: height" placeholder="Height" type="number" step="any" min={1} className={inputCls} value={v.height} onChange={set("height")} />
        <input required aria-label="New line: depth" placeholder="Depth" type="number" step="any" min={0.25} className={inputCls} value={v.depth} onChange={set("depth")} />
        <input required aria-label="New line: MERV" placeholder="MERV" type="number" min={1} max={16} className={inputCls} value={v.mervRating} onChange={set("mervRating")} />
        <NativeSelect aria-label="New line: nominal or exact" value={v.sizeType} onChange={set("sizeType")}>
          <option value="NOMINAL">Nominal</option>
          <option value="EXACT">Exact</option>
        </NativeSelect>
        <input required aria-label="New line: quantity" placeholder="Qty" type="number" min={1} className={inputCls} value={v.quantity} onChange={set("quantity")} />
        <input aria-label="New line: price per filter" placeholder="Price/filter" type="number" step="0.01" min={0} className={inputCls} value={v.unitPrice} onChange={set("unitPrice")} />
        <button type="submit" className={cn(btn.secondary, "sm:col-span-2 lg:col-span-1")} disabled={add.isPending}>
          {add.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Add
        </button>
      </div>
    </form>
  );
}

function ExcelPanel({ b }: { b: BusinessDetail }) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [summary, setSummary] = useState<SheetImportSummary | null>(null);

  const run = useMutation({
    mutationFn: (apply: boolean) => {
      const fd = new FormData();
      fd.append("file", file!);
      fd.append("mode", mode);
      fd.append("apply", String(apply));
      return api<SheetImportSummary>(`/admin/businesses/${b.id}/import`, { method: "POST", body: fd });
    },
    onSuccess: (res) => {
      setSummary(res);
      if (res.applied) {
        toast.success(`Imported ${res.lines} line${res.lines === 1 ? "" : "s"}.`);
        qc.invalidateQueries({ queryKey: [...KEY, b.id] });
        qc.invalidateQueries({ queryKey: KEY });
        setFile(null);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mt-5 rounded-xl border border-lavender bg-muted/40 p-4">
      <p className="font-semibold text-primary">Excel list</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Fill in the standard sheet (School, Building, Filter size, Nominal or Exact, MERV rating, Quantity, Price/filter), then upload it.
        Quantity is a number of filters. You can also export this list, change it in Excel and upload it again.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a href="/api/admin/businesses/template" className={btn.secondary}><Download className="size-4" /> Blank template</a>
        <a href={`/api/admin/businesses/${b.id}/export`} className={btn.secondary}><Download className="size-4" /> Export this list</a>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-lavender pt-4">
        <input
          ref={fileRef}
          type="file"
          aria-label="Excel file"
          accept=".xlsx"
          className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3.5 file:py-2 file:text-sm file:font-semibold file:text-primary"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setSummary(null);
          }}
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name={`mode-${b.id}`} checked={mode === "merge"} onChange={() => { setMode("merge"); setSummary(null); }} className="accent-[var(--brand)]" />
          Update and add
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name={`mode-${b.id}`} checked={mode === "replace"} onChange={() => { setMode("replace"); setSummary(null); }} className="accent-[var(--brand)]" />
          Replace the whole list
        </label>
        <button type="button" className={btn.secondary} disabled={!file || run.isPending} onClick={() => run.mutate(false)}>
          {run.isPending && !summary ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Preview
        </button>
      </div>

      {summary ? (
        <div className="mt-4 rounded-lg bg-white p-4 text-sm" role="status">
          <p className="font-semibold text-primary">
            {summary.applied ? "Imported." : "Preview, nothing saved yet."}{" "}
            {summary.created} new, {summary.updated} updated{summary.removed ? `, ${summary.removed} removed` : ""} ({summary.lines} lines in the sheet).
          </p>
          {summary.withoutPrice ? (
            <p className="mt-1 text-amber-800">{summary.withoutPrice} line{summary.withoutPrice === 1 ? "" : "s"} have no price yet and can&apos;t be ordered until you add one.</p>
          ) : null}
          {summary.errors.length ? (
            <ul className="mt-2 space-y-1 text-destructive">
              {summary.errors.slice(0, 8).map((e, i) => (
                <li key={i}>Row {e.row}: {e.message}</li>
              ))}
              {summary.errors.length > 8 ? <li>…and {summary.errors.length - 8} more.</li> : null}
            </ul>
          ) : null}
          {summary.warnings.length ? (
            <ul className="mt-2 space-y-1 text-muted-foreground">
              {summary.warnings.slice(0, 6).map((w, i) => (
                <li key={i}>{w.row ? `Row ${w.row}: ` : ""}{w.message}</li>
              ))}
              {summary.warnings.length > 6 ? <li>…and {summary.warnings.length - 6} more notes.</li> : null}
            </ul>
          ) : null}
          {!summary.applied && !summary.errors.length && summary.lines > 0 ? (
            <button
              type="button"
              className={cn(btn.primary, "mt-3")}
              disabled={run.isPending}
              onClick={() => {
                if (summary.mode === "replace" && !confirm(`Replace this business's whole list with the ${summary.lines} lines in the sheet?`)) return;
                run.mutate(true);
              }}
            >
              {run.isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Apply import
            </button>
          ) : null}
        </div>
      ) : null}
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

  const unpriced = b.filters.filter((f) => f.unitPrice === null).length;
  const listTotal = b.filters.reduce((n, f) => n + (f.lineTotal ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        back={{ href: "/admin/businesses", label: "Business accounts" }}
        title={b.name}
        description={`Created ${date(b.createdAt)} · ${b.users.length} ${b.users.length === 1 ? "login" : "logins"} · ${b.filters.length} saved ${b.filters.length === 1 ? "line" : "lines"} · invoiced on delivery, Net 30`}
      />
      <Details key={b.id + b.name} b={b} />
      <Logins b={b} />
      <Panel title="Filter list and prices" bodyClassName="p-0 sm:p-5">
        {b.filters.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-lavender">
                  <tr>
                    <th className={th}>School / building</th>
                    <th className={th}>Size</th>
                    <th className={th}>MERV</th>
                    <th className={th}>Type</th>
                    <th className={th}>Qty</th>
                    <th className={th}>Price/filter</th>
                    <th className={th}>Total</th>
                    <th className={th} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-lavender">
                  {b.filters.map((f) => (
                    <FilterRow key={`${f.id}:${f.quantity}:${f.unitPrice}:${f.label}:${f.sizeType}`} businessId={b.id} f={f} />
                  ))}
                </tbody>
              </table>
            </div>
            <p className="px-5 pt-3 text-xs text-muted-foreground sm:px-0">
              List value at these quantities: <span className="font-semibold text-foreground">{money(listTotal)}</span>
              {unpriced ? <> · <span className="font-semibold text-amber-800">{unpriced} line{unpriced === 1 ? "" : "s"} without a price</span> (the customer cannot order those)</> : null}
            </p>
          </>
        ) : (
          <p className="p-5 text-sm text-muted-foreground sm:p-0">No filters yet. Upload the standard Excel sheet below, or add lines one at a time. The customer sees them when they sign in.</p>
        )}
        <div className="p-5 pt-0 sm:p-0">
          <ExcelPanel b={b} />
          <AddLine b={b} />
        </div>
      </Panel>
    </div>
  );
}
