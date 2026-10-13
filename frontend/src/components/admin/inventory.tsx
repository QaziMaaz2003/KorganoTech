"use client";

import Link from "next/link";
import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Boxes, History, Loader2, PackagePlus } from "lucide-react";
import { get, post, qs } from "@/lib/client-api";
import type { InventoryRow, Paged, StockMovement } from "@/lib/admin-types";
import { dateTime, money } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { NativeSelect } from "@/components/ui/native-select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, Label, PageHeader, Pagination, Panel, SearchInput, TableSkeleton, btn, inputCls, td, th } from "./admin-ui";
import { useAdminCategories } from "./products";

const REASON_LABEL: Record<StockMovement["reason"], string> = {
  ORDER: "Order",
  CANCEL: "Order cancelled",
  ADJUSTMENT: "Adjustment",
  RESTOCK: "Restock",
};

function AdjustDialog({ row, onClose }: { row: InventoryRow | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [mode, setMode] = useState<"add" | "set">("add");
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState<"RESTOCK" | "ADJUSTMENT">("RESTOCK");
  const [note, setNote] = useState("");

  const history = useQuery({
    queryKey: ["admin", "movements", row?.id],
    queryFn: () => get<StockMovement[]>(`/admin/inventory/${row!.id}/movements`),
    enabled: Boolean(row),
  });

  const adjust = useMutation({
    mutationFn: () => post(`/admin/inventory/${row!.id}/adjust`, { mode, quantity: Number(qty), reason, note: note || undefined }),
    onSuccess: () => {
      toast.success("Stock updated.");
      qc.invalidateQueries({ queryKey: ["admin", "inventory"] });
      qc.invalidateQueries({ queryKey: ["admin", "movements", row?.id] });
      qc.invalidateQueries({ queryKey: ["admin", "product", row?.product.id] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
      setQty("");
      setNote("");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const preview = row && qty !== "" ? (mode === "add" ? row.stock + Number(qty) : Number(qty)) : null;

  return (
    <Dialog open={row !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Adjust stock</DialogTitle>
        </DialogHeader>
        {row ? (
          <div className="space-y-4 text-sm">
            <div className="rounded-xl bg-muted/60 p-3">
              <p className="font-semibold">{row.product.name}</p>
              <p className="text-muted-foreground">{row.label} · {row.sku}</p>
              <p className="mt-1">Current stock: <span className="font-bold tabular-nums">{row.stock}</span></p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <label>
                <Label>Action</Label>
                <NativeSelect value={mode} onChange={(e) => setMode(e.target.value as "add" | "set")}>
                  <option value="add">Add / remove</option>
                  <option value="set">Set exact count</option>
                </NativeSelect>
              </label>
              <label>
                <Label hint={mode === "add" ? "negative removes" : undefined}>Quantity</Label>
                <input required type="number" className={inputCls} value={qty} onChange={(e) => setQty(e.target.value)} />
              </label>
              <label>
                <Label>Reason</Label>
                <NativeSelect value={reason} onChange={(e) => setReason(e.target.value as "RESTOCK" | "ADJUSTMENT")}>
                  <option value="RESTOCK">Restock</option>
                  <option value="ADJUSTMENT">Adjustment</option>
                </NativeSelect>
              </label>
            </div>
            <label className="block">
              <Label>Note (optional)</Label>
              <input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Shipment from supplier, damaged units" />
            </label>
            {preview !== null ? (
              <p className={cn("rounded-lg px-3 py-2 font-medium", preview < 0 ? "bg-destructive/10 text-destructive" : "bg-accent/60 text-primary")}>
                New stock will be {preview}
              </p>
            ) : null}
            <div>
              <p className="mb-2 flex items-center gap-1.5 font-semibold"><History className="size-4" /> Recent movements</p>
              {history.isLoading ? (
                <div className="h-20 animate-pulse rounded-lg bg-muted" />
              ) : history.data?.length ? (
                <ul className="max-h-48 divide-y divide-lavender overflow-y-auto rounded-xl border border-lavender">
                  {history.data.map((m) => (
                    <li key={m.id} className="flex items-center justify-between gap-3 px-3 py-2">
                      <span>
                        <span className="font-medium">{REASON_LABEL[m.reason]}</span>
                        {m.note ? <span className="text-muted-foreground"> · {m.note}</span> : null}
                        <span className="block text-xs text-muted-foreground">
                          {dateTime(m.createdAt)}{m.user ? ` · ${m.user.firstName} ${m.user.lastName}` : ""}
                        </span>
                      </span>
                      <span className="text-right tabular-nums">
                        <span className={cn("font-bold", m.delta > 0 ? "text-emerald-700" : "text-destructive")}>{m.delta > 0 ? `+${m.delta}` : m.delta}</span>
                        <span className="block text-xs text-muted-foreground">→ {m.stockAfter}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No movements yet.</p>
              )}
            </div>
          </div>
        ) : null}
        <DialogFooter>
          <button type="button" className={btn.secondary} onClick={onClose}>Cancel</button>
          <button type="button" className={btn.primary} disabled={qty === "" || (preview ?? 0) < 0 || adjust.isPending} onClick={() => adjust.mutate()}>
            {adjust.isPending ? <Loader2 className="size-4 animate-spin" /> : <PackagePlus className="size-4" />} Update stock
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AdminInventory({ initialLow }: { initialLow?: boolean }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [low, setLow] = useState(Boolean(initialLow));
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<InventoryRow | null>(null);
  const { data: categories = [] } = useAdminCategories();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "inventory", q, category, low, page],
    queryFn: () => get<Paged<InventoryRow>>(`/admin/inventory${qs({ q, category, lowStock: low, page, pageSize: 30 })}`),
    placeholderData: keepPreviousData,
  });

  return (
    <div>
      <PageHeader title="Inventory" description="Stock levels for every size, MERV rating and pack. Every change is logged." />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search product, size or SKU" className="min-w-64 flex-1" />
        <NativeSelect value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} wrapperClassName="w-56" aria-label="Category">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </NativeSelect>
        <label className="flex items-center gap-2 rounded-lg border border-lavender bg-white px-3 py-2 text-sm font-medium">
          <Switch checked={low} onCheckedChange={(c) => { setLow(c); setPage(1); }} aria-label="Low stock only" /> Low stock only
        </label>
      </div>
      <Panel bodyClassName="p-0">
        {isLoading ? (
          <TableSkeleton rows={10} />
        ) : data && data.items.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead className="border-b border-lavender">
                  <tr>
                    <th className={th}>Product</th>
                    <th className={th}>Variant</th>
                    <th className={th}>SKU</th>
                    <th className={th}>Price</th>
                    <th className={th}>Stock</th>
                    <th className={th} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-lavender">
                  {data.items.map((r) => (
                    <tr key={r.id} className={cn("hover:bg-accent/30", !r.isActive && "opacity-60")}>
                      <td className={td}>
                        <Link href={`/admin/products/${r.product.id}?tab=variants`} className="font-semibold text-primary hover:underline">{r.product.name}</Link>
                        <p className="text-xs text-muted-foreground">{r.product.category.name}</p>
                      </td>
                      <td className={td}>{r.label}{!r.isActive ? <span className="ml-2 text-xs text-muted-foreground">(inactive)</span> : null}</td>
                      <td className={cn(td, "font-mono text-xs")}>{r.sku}</td>
                      <td className={cn(td, "tabular-nums")}>{money(r.price)}</td>
                      <td className={td}>
                        <span className={cn("inline-flex min-w-12 justify-center rounded-full px-2.5 py-1 text-xs font-bold tabular-nums", r.stock === 0 ? "bg-red-50 text-red-700" : r.isLow ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800")}>
                          {r.stock}
                        </span>
                        {r.isLow ? <span className="ml-2 text-xs text-muted-foreground">low at {r.lowStockThreshold}</span> : null}
                      </td>
                      <td className={cn(td, "text-right")}>
                        <button type="button" className={btn.secondary} onClick={() => setEditing(r)}>Adjust</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} pageCount={data.pageCount} total={data.total} onPage={setPage} />
          </>
        ) : (
          <EmptyState icon={Boxes} title={low ? "Nothing is low on stock" : "No variants found"} />
        )}
      </Panel>
      <AdjustDialog row={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
