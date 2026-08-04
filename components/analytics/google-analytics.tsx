"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

const GA_MEASUREMENT_ID = "G-254X428MH7";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

type GtagConfigParams = Record<string, boolean | number | string | null | undefined>;
type GtagEventParams = Record<string, string>;
type GtagCommand =
  | ["js", Date]
  | ["config", string, GtagConfigParams?]
  | ["event", string, GtagEventParams?];

type AnalyticsWindow = Window &
  typeof globalThis & {
    dataLayer?: unknown[];
    gtag?: (...args: GtagCommand) => void;
  };

function buildPagePath(pathname: string, search: string) {
  return search ? `${pathname}?${search}` : pathname;
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    if (!IS_PRODUCTION || !GA_MEASUREMENT_ID || !pathname) {
      return;
    }

    let cancelled = false;

    async function sendPageView() {
      const pagePath = buildPagePath(pathname, search);
      const analyticsWindow = window as AnalyticsWindow;
      let userId: string | null = null;

      try {
        const { data } = await createClient().auth.getSession();
        userId = data.session?.user.id ?? null;
      } catch {
        userId = null;
      }

      if (cancelled) return;

      analyticsWindow.dataLayer = analyticsWindow.dataLayer ?? [];
      analyticsWindow.gtag =
        analyticsWindow.gtag ??
        ((...args: GtagCommand) => {
          analyticsWindow.dataLayer?.push(args);
        });

      analyticsWindow.gtag("config", GA_MEASUREMENT_ID, {
        send_page_view: false,
        user_id: userId
      });
      analyticsWindow.gtag("event", "page_view", {
        page_location: window.location.href,
        page_path: pagePath,
        page_title: document.title
      });
    }

    void sendPageView();

    return () => {
      cancelled = true;
    };
  }, [pathname, search]);

  if (!IS_PRODUCTION || !GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          window.gtag("js", new Date());
          window.gtag("config", "${GA_MEASUREMENT_ID}", {
            send_page_view: false
          });
        `}
      </Script>
    </>
  );
}
