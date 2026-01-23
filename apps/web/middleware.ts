import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(_req: NextRequest) {
  // Stub: add auth gating for (game) routes if needed.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
