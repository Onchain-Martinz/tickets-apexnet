"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const LOADING_TIMEOUT_MS = 8000;

export function NavigationLoadingVisual({ visible = true }: { visible?: boolean }) {
  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-3 z-[100] flex justify-center px-4 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <div
        className="liquid-navigation-loader relative h-1.5 w-28 overflow-hidden rounded-full border border-border/80 bg-card/85 shadow-calm backdrop-blur-xl sm:w-36"
        role="status"
        aria-label="Loading"
      >
        <span className="liquid-navigation-loader__fill absolute inset-y-0 left-0 rounded-full bg-primary/70" />
        <span className="liquid-navigation-loader__shimmer absolute inset-y-0 w-10 bg-foreground/20 blur-sm" />
      </div>
    </div>
  );
}

export function NavigationLoadingIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    setVisible(false);
  }, []);

  const start = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(true);
    timeoutRef.current = setTimeout(stop, LOADING_TIMEOUT_MS);
  }, [stop]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(stop);
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, search, stop]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin) return;

      const current = new URL(window.location.href);
      if (destination.pathname === current.pathname && destination.search === current.search) {
        return;
      }

      start();
    }

    function handleSubmit(event: SubmitEvent) {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || event.defaultPrevented) return;
      if (form.target === "_blank" || form.method.toLowerCase() === "dialog") return;
      start();
    }

    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);
    window.addEventListener("popstate", start);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
      window.removeEventListener("popstate", start);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [start]);

  return <NavigationLoadingVisual visible={visible} />;
}
