import { Suspense } from "react";
import type { Metadata } from "next";

import "@/app/globals.css";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { NavigationLoadingIndicator } from "@/components/layout/navigation-loading-indicator";
import { SiteFooter } from "@/components/layout/site-footer";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { EVENT_CONFIG } from "@/lib/config/event";
import { themeInitializationScript } from "@/lib/theme";

export const metadata: Metadata = {
  title: `${EVENT_CONFIG.name} — Tickets`,
  description: EVENT_CONFIG.description
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
      </head>
      <body>
        <ThemeProvider>
          <Suspense fallback={null}>
            <NavigationLoadingIndicator />
          </Suspense>
          <div className="flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </div>
        </ThemeProvider>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
