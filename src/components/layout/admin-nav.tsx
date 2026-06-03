"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Shield, Map, Trophy, MessageSquare, Users, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
  { href: "/admin", label: "Visão Geral", icon: BarChart3, exact: true },
  { href: "/admin/books", label: "Livros Bíblicos", icon: BookOpen },
  { href: "/admin/plans", label: "Planos de Leitura", icon: Map },
  { href: "/admin/achievements", label: "Conquistas", icon: Trophy },
  { href: "/admin/messages", label: "Mensagens", icon: MessageSquare },
  { href: "/admin/users", label: "Usuários", icon: Users },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 p-3 space-y-1">
      {adminNav.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
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
    </nav>
  );
}
