// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth  = !!token;
  const isAdmin = token?.tipo === "admin";
  const { pathname } = req.nextUrl;

  // ✅ Permite acesso ao dashboard logo após login (impede redirecionamento indevido)
  if (pathname === "/admin/dashboard") {
    return NextResponse.next();
  }

  // 1) Protege páginas admin
  if (pathname.startsWith("/admin")) {
    if (!isAuth)  return NextResponse.redirect(new URL("/login", req.url));
    if (!isAdmin) return NextResponse.redirect(new URL("/", req.url));
  }

  // 2) Protege APIs admin
  if (pathname.startsWith("/api/admin")) {
    if (!isAuth || !isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  }

  // 3) Protege "minha conta"
  if (pathname.startsWith("/minha-conta")) {
    if (!isAuth || !isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/minha-conta/:path*"],
};
