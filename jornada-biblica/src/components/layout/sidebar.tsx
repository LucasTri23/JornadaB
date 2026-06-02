"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  BookOpen,
  Home,
  BarChart3,
  BookMarked,
  Heart,
  Settings,
  LogOut,
  Users,
  Shield,
  Map,
  FileText,
  Calendar,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/read", label: "Ler", icon: BookOpen },
  { href: "/plans", label: "Planos", icon: Map },
  { href: "/progress", label: "Progresso", icon: BarChart3 },
  { href: "/notes", label: "Anotações", icon: BookMarked },
  { href: "/favorites", label: "Favoritos", icon: Heart },
  { href: "/groups", label: "Grupos", icon: Users },
  { href: "/settings", label: "Configurações", icon: Settings },
];

const ministryItems = [
  { href: "/ministry", label: "Início", icon: Briefcase },
  { href: "/ministry/month", label: "Resumo do mês", icon: Calendar },
  { href: "/ministry/return-visits", label: "Revisitas", icon: Users },
  { href: "/ministry/bible-studies", label: "Estudos", icon: BookOpen },
  { href: "/ministry/report", label: "Relatório", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen border-r bg-card">
      {/* Logo */}
      <div className="p-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">Jornada</p>
            <p className="text-xs text-muted-foreground">Bíblica</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}

        {/* Ministry section */}
        <div className="pt-3 pb-1">
          <p className="text-xs font-semibold text-muted-foreground/60 px-3 mb-1 uppercase tracking-wider">Ministério</p>
          {ministryItems.map(({ href, label, icon: Icon }) => {
            const active = href === "/ministry" ? pathname === "/ministry" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </div>

        {session?.user?.role === "ADMIN" && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith("/admin")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Shield className="w-4 h-4 shrink-0" />
            Administração
          </Link>
        )}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">
              {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{session?.user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
