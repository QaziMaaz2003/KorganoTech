import { serverGetOr } from "@/lib/api";
import type { CategoryWithProducts } from "@/lib/types";
import { ProductCard, ProductCardSkeleton } from "@/components/shop/product-card";

/** Live product grid for a category landing page (admin edits show up here). */
export async function CategoryProducts({ slug }: { slug: string }) {
  const category = await serverGetOr<CategoryWithProducts | null>(`/categories/${slug}`, null);
  const products = category?.products ?? [];
  if (!products.length) {
    return <p className="rounded-2xl border border-dashed border-border bg-white p-10 text-center text-muted-foreground">Products will appear here soon.</p>;
  }
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <li key={p.id}>
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  );
}

export function CategoryProductsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
