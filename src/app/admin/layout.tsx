import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield } from "lucide-react";
import { AdminNav } from "@/components/layout/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-60 border-r bg-card flex flex-col">
        <div className="p-5 border-b flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold">Admin</p>
            <p className="text-xs text-muted-foreground">Jornada Bíblica</p>
          </div>
        </div>
        <AdminNav />
        <div className="p-3 border-t">
          <Link href="/dashboard" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground px-3 py-2">
            ← Voltar ao app
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
