"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useCartStore } from "@/lib/cart-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { refetchOnWindowFocus: false, retry: 1 },
        },
      }),
  );
  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);

  return (
    <QueryClientProvider client={client}>
      <TooltipProvider delay={200}>{children}</TooltipProvider>
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
}
