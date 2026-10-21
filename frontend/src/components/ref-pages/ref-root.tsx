"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import "./ref-pages.css";
import { initEnvironmental, initPathogen } from "./behaviors";

/**
 * Scope + interactivity wrapper for the Environmental and Pathogen pages.
 * The page markup is passed in as server-rendered children and is never re-rendered
 * here, so the class changes made by behaviors.ts stay in place.
 */
export function RefRoot({ page, children }: { page: "environmental" | "pathogen"; children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const controller = new AbortController();
    const cleanup = (page === "environmental" ? initEnvironmental : initPathogen)(root, controller.signal);
    root.addEventListener(
      "click",
      (e) => {
        const img = (e.target as HTMLElement).closest<HTMLImageElement>(".rx-zoomable-media");
        if (img) setLightbox({ src: img.currentSrc || img.src, alt: img.alt });
      },
      { signal: controller.signal },
    );
    return () => {
      controller.abort();
      cleanup();
    };
  }, [page]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLightbox(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightbox]);

  return (
    <div ref={rootRef} className="rx-root">
      {children}
      {lightbox ? (
        <div
          className="rx-lightbox-backdrop rx-is-open"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged engineering diagram"
          onClick={(e) => e.target === e.currentTarget && setLightbox(null)}
        >
          <div className="rx-lightbox-content">
            <button type="button" className="rx-lightbox-close" aria-label="Close enlarged view" onClick={() => setLightbox(null)}>
              ✕
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox.src} alt={lightbox.alt} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
