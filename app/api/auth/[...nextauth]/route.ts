// app/api/auth/[...nextauth]/route.ts
import NextAuth, { DefaultSession, SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";


declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      tipo: string;
      nome: string;
    } & DefaultSession["user"];
  }
}

// ─────────────────────────────────────────────────────────────
// 1)  defina e EXPORTe o objeto authOptions
// ─────────────────────────────────────────────────────────────
export const authOptions = {
  session: { strategy: "jwt" as SessionStrategy },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) {
          throw new Error("Email e senha são obrigatórios");
        }

        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email },
        });
        if (!usuario) throw new Error("Usuário não encontrado");

        const match = await bcrypt.compare(
          credentials.senha,
          usuario.senhaHash
        );
        if (!match) throw new Error("Credenciais inválidas");

        return {
          id: String(usuario.usuarioId),
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.userId = user.id;
        token.tipo = user.tipo;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.tipo = token.tipo as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
};

// ─────────────────────────────────────────────────────────────
// 2)  passe authOptions para NextAuth e exporte os handlers
// ─────────────────────────────────────────────────────────────
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
