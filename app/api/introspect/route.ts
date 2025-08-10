// app/api/_introspect/route.ts
import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { PUBLIC_API_PREFIXES, METHOD_OVERRIDES } from "@/lib/security";

// Regex simples pra achar handlers exportados
const METHOD_RE = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(/g;

function isPublicByPrefix(p: string) {
  return PUBLIC_API_PREFIXES.some((pre) => p.startsWith(pre));
}

function decideProtection(routePath: string, method: string) {
  // 1) exceções por método
  const override = METHOD_OVERRIDES[routePath]?.[method as any];
  if (override) return override; // "public" | "auth" | "admin"

  // 2) por prefixo público
  if (isPublicByPrefix(routePath)) return "public";

  // 3) regra geral do seu middleware: /api/:path* exige login
  // (e /api/admin/:path* exige admin; se quiser, inclua aqui)
  if (routePath.startsWith("/api/admin")) return "admin";
  if (routePath.startsWith("/api")) return "auth";

  return "unknown";
}

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  await Promise.all(entries.map(async (ent) => {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) files.push(...await walk(full));
    else if (ent.isFile() && ent.name === "route.ts") files.push(full);
  }));
  return files;
}

function toApiPath(fullPath: string) {
  // app/api/produtos/route.ts -> /api/produtos
  const ix = fullPath.lastIndexOf(`${path.sep}app${path.sep}api${path.sep}`);
  const rel = fullPath.slice(ix).replace(/\\/g, "/"); // windows-safe
  return rel
    .replace(/^\/app/, "")
    .replace(/\/route\.ts$/, "")
    .replace(/^\/api/, "/api");
}

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Desabilitado em produção" }, { status: 403 });
  }

  const root = process.cwd();
  const apiDir = path.join(root, "app", "api");
  let files: string[] = [];
  try {
    files = await walk(apiDir);
  } catch {
    return NextResponse.json({ routes: [] });
  }

  const results = await Promise.all(files.map(async (file) => {
    const src = await fs.readFile(file, "utf8");
    const handlers = new Set<string>();
    for (const m of src.matchAll(METHOD_RE)) handlers.add(m[1]);

    const routePath = toApiPath(file);
    const methods = Array.from(handlers).sort();
    const protection = methods.map((method) => ({
      method,
      protection: decideProtection(routePath, method), // "public" | "auth" | "admin"
    }));

    return { path: routePath, methods: protection };
  }));

  // Ordena por caminho
  results.sort((a, b) => a.path.localeCompare(b.path));
  return NextResponse.json({ routes: results });
}
