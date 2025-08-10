// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { METHOD_OVERRIDES, PUBLIC_API_PREFIXES, type Method, type Protection } from "@/lib/security";

// Prefixos sempre públicos
function isPublicApiPath(pathname: string) {
  return PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p));
}

// Casa padrões com [id] etc.
function matchOverride(pathname: string, method: Method): Protection | undefined {
  for (const [pattern, rules] of Object.entries(METHOD_OVERRIDES)) {
    const regex = new RegExp(
      "^" +
        pattern
          .replace(/\[\.{3}.+?\]/g, ".+")   // [...slug] (se você usar)
          .replace(/\[.+?\]/g, "[^/]+") +   // [id]
      "$"
    );
    if (regex.test(pathname)) {
      return rules[method];
    }
  }
  return undefined;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method as Method;

  // Preflight
  if (method === "OPTIONS") return NextResponse.next();

  // Introspect: só em dev
  if (pathname === "/api/introspect" && process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  // 1) Overrides finos por método (aplicados primeiro)
  const rule = matchOverride(pathname, method);
  if (rule === "public") return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;
  const isAdmin = token?.tipo === "admin";

  if (rule === "auth") {
    if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.next();
  }
  if (rule === "admin") {
    if (!isAuth || !isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.next();
  }

  // 2) Regras de PÁGINAS
  if (pathname.startsWith("/admin")) {
    if (!isAuth)  return NextResponse.redirect(new URL("/login", req.url));
    if (!isAdmin) return NextResponse.redirect(new URL("/", req.url));
  }
  if (pathname.startsWith("/minha-conta")) {
    if (!isAuth) return NextResponse.redirect(new URL("/login", req.url));
  }

  // 3) Regras genéricas de API
  if (pathname.startsWith("/api")) {
    // Prefixos públicos gerais
    if (isPublicApiPath(pathname)) return NextResponse.next();

    // Área admin
    if (pathname.startsWith("/api/admin")) {
      if (!isAuth || !isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return NextResponse.next();
    }

    // Demais APIs exigem login
    if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/minha-conta/:path*",
    "/api/:path*",
  ],
};
