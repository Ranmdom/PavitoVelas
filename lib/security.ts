// lib/security.ts
export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type Protection = "public" | "auth" | "admin";

// Prefixos SEMPRE públicos (todos os métodos)
export const PUBLIC_API_PREFIXES = [
  "/api/auth",                 // NextAuth
  "/api/public",
  "/api/webhook",
  "/api/webhook/melhorEnvio",
  "/api/health",
  "/api/melhorEnvio/calculate",
  // Introspect: liberar só no middleware em DEV (evita expor em prod)
];

// Regras por método na MESMA URL (override fino)
export const METHOD_OVERRIDES: Record<
  string,
  Partial<Record<Method, Protection>>
> = {
  // Produtos (vitrine pública, writes admin)
  "/api/produtos": { GET: "public", POST: "admin" },
  "/api/produtos/[id]": { GET: "public", PUT: "admin", DELETE: "admin" },
  "/api/produtos/[id]/imagens": { POST: "admin", DELETE: "admin" },
  "/api/produtos/[id]/limitada": { POST: "admin", DELETE: "admin" },
  "/api/produtos/populares": { GET: "public" },
  "/api/produtos/relacionados": { GET: "public" },
  "/api/produtos/imagens-promocionais": { GET: "public" },
  "/api/melhorEnvio/sign": { POST: "auth" },

  // Categorias (GET público; writes admin)
  "/api/categorias": { GET: "public", POST: "admin" },
  "/api/categorias/[id]": { GET: "public", PUT: "admin", DELETE: "admin" },

  // Usuários (admin ou owner-check no handler)
  "/api/usuarios": { GET: "admin", POST: "admin" },
  "/api/usuarios/[id]": { GET: "auth", PUT: "auth", DELETE: "admin" },
  "/api/usuarios/enderecos": { GET: "auth", POST: "auth" },
  "/api/usuarios/enderecos/[id]": { PUT: "auth", DELETE: "auth" },
  "/api/usuarios/pedidos/[id]": { GET: "auth" },
  "/api/admin/pedidos/[id]": { GET: "auth" },

  // Itens/Pedidos (sempre com owner-check no handler)
  "/api/itensPedido": { GET: "auth", POST: "auth" },
  "/api/itensPedido/[id]": { GET: "auth", PUT: "auth", DELETE: "auth" },

  // Checkout
  "/api/checkout": { POST: "auth" },

  // Melhor Envio (ações perigosas = admin)
  "/api/melhorEnvio/calculate": { POST: "auth" },
  "/api/melhorEnvio/compraEtiquetas": { POST: "admin" },
  "/api/melhorEnvio/gerarEtiquetas": { POST: "admin" },
  "/api/melhorEnvio/InserirFretes": { POST: "admin" },
  "/api/melhorEnvio/resyncPendentes": { POST: "admin" },
  "/api/melhorEnvio/rastreio": { GET: "auth" },
  "/api/melhorEnvio/debug/[orderId]": { GET: "admin" },

  // Webhooks e introspect (dev)
  "/api/webhook": { POST: "public" },
  "/api/webhook/melhor-envio": { POST: "public" },
  "/api/introspect": { GET: "public" }, // middleware bloqueia em produção
};
