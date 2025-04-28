import { getServerSession } from "next-auth";
import { authOptions }      from "@/app/api/auth/[...nextauth]/route";
import { redirect }         from "next/navigation";
import AdminShell           from "./_AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // redireciona se não estiver logado ou não for admin
  if (!session) redirect("/login");
  if (session.user.tipo !== "admin") redirect("/");

  // se passou, renderiza o shell client
  return <AdminShell>{children}</AdminShell>;
}
