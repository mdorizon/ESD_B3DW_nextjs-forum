import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes qui nécessitent une authentification
const protectedRoutes = ["/profile", "/settings", "/account"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Vérifier si la route est protégée
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Vérifier la présence d'un cookie de session
    const sessionCookie = request.cookies.get("better-auth.session_token");

    if (!sessionCookie) {
      // Rediriger vers la page de login si non authentifié
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
