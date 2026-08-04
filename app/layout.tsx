import { Suspense } from "react";
import type { Metadata } from "next";

import "@/app/globals.css";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { FeedbackWidget } from "@/components/feedback/feedback-widget";
import { NavigationLoadingIndicator } from "@/components/layout/navigation-loading-indicator";
import { SiteFooter } from "@/components/layout/site-footer";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { themeInitializationScript } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Exam Study Plan",
  description: "A calm, premium exam preparation planner."
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
          <FeedbackWidget />
        </ThemeProvider>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
