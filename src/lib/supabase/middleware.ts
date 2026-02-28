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
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    // Check if user has a pair
    const { data: profile } = await supabase
      .from("profiles")
      .select("pair_id")
      .eq("id", user.id)
      .single();

    const hasPair = !!profile?.pair_id;

    // Already logged in, on auth route -> redirect
    if (isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = hasPair ? "/home" : "/create-pair";
      return NextResponse.redirect(url);
    }

    // No pair but trying to access main routes
    if (!hasPair && !isOnboardingRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/create-pair";
      return NextResponse.redirect(url);
    }

    // Has pair but on onboarding routes
    if (hasPair && isOnboardingRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/home";
      return NextResponse.redirect(url);
    }

    // Root path redirect
    if (path === "/") {
      const url = request.nextUrl.clone();
      url.pathname = hasPair ? "/home" : "/create-pair";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
