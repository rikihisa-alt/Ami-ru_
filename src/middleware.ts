import { NextResponse, type NextRequest } from "next/server";

export async function middleware(_request: NextRequest) {
  // Auth bypassed for development
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
