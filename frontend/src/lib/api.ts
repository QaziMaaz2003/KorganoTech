// Server-side reads from the NestJS API. These run at request time inside
// <Suspense> boundaries, so stock and prices are always current.
import "server-only";
import { notFound } from "next/navigation";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

export async function serverGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  if (res.status === 404) notFound();
  if (!res.ok) {
    throw new Error(`API ${res.status} on ${path}`);
  }
  return (await res.json()) as T;
}

/** Like serverGet, but returns a fallback instead of throwing (non-critical UI). */
export async function serverGetOr<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_URL}/api${path}`, { cache: "no-store" });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}
