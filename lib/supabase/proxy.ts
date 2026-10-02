import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabasePublicConfig } from "@/lib/supabase/config";

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip session claims refresh for public landing page, APIs, payment return, and static pages
  if (
    pathname === "/" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/payment") ||
    pathname.startsWith("/admin")
  ) {
    return NextResponse.next({ request });
  }

  const config = getSupabasePublicConfig();
  if (!config) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      }
    }
  });

  await supabase.auth.getClaims();
  return response;
}
