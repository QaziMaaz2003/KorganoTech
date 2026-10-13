"use client";

import { usePathname, useRouter } from "next/navigation";
import { NativeSelect } from "@/components/ui/native-select";

const options = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name" },
  { value: "newest", label: "Newest" },
];

/** Receives the current query so it doesn't need useSearchParams (no Suspense bailout). */
export function SortSelect({ query, value }: { query: string; value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Sort by</span>
      <NativeSelect
        size="sm"
        value={value}
        wrapperClassName="w-44"
        onChange={(e) => {
          const sp = new URLSearchParams(query);
          if (e.target.value === "featured") sp.delete("sort");
          else sp.set("sort", e.target.value);
          sp.delete("page");
          const s = sp.toString();
          router.push(s ? `${pathname}?${s}` : pathname);
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </NativeSelect>
    </label>
  );
}
