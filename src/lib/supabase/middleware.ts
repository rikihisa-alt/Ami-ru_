import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthRoute = path.startsWith("/login") || path.startsWith("/signup");
  const isOnboardingRoute =
    path.startsWith("/create-pair") || path.startsWith("/join-pair");
  const isCallbackRoute = path.startsWith("/auth/callback");

  // Always allow callback
  if (isCallbackRoute) return supabaseResponse;

  // Not logged in -> redirect to login (unless already on auth route)
  if (!user && !isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  if (user) {
    // Already logged in, on auth route -> redirect to home
    if (isAuthRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/home";
      return NextResponse.redirect(redirectUrl);
    }

    // Root path -> redirect to home
    if (path === "/") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/home";
      return NextResponse.redirect(redirectUrl);
    }

    // ペア未作成でもメイン機能にアクセス可能
    // オンボーディングルートもそのまま通す
  }

  return supabaseResponse;
}
