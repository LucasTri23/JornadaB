import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Users, BookOpen, BarChart3, BookMarked, Map } from "lucide-react";

export default async function AdminPage() {
  const [
    usersCount,
    booksCount,
    chaptersCount,
    plansCount,
    notesCount,
    progressCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.bibleBook.count(),
    prisma.bibleChapter.count(),
    prisma.readingPlan.count(),
    prisma.userNote.count(),
    prisma.userProgress.count(),
  ]);

  const stats = [
    { label: "Usuários", value: usersCount, icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
    { label: "Livros bíblicos", value: booksCount, icon: BookOpen, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/30" },
    { label: "Capítulos", value: chaptersCount, icon: BookOpen, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
    { label: "Planos", value: plansCount, icon: Map, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
    { label: "Anotações", value: notesCount, icon: BookMarked, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
    { label: "Capítulos lidos", value: progressCount, icon: BarChart3, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Painel Administrativo</h1>
        <p className="text-muted-foreground">Visão geral da Jornada Bíblica</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-2xl font-bold">{value.toLocaleString("pt-BR")}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Guia de configuração</h3>
          <div className="space-y-3">
            {[
              { step: "1", title: "Cadastre os livros bíblicos", desc: "Vá em Livros Bíblicos e adicione os 66 livros (ou importe via seed)", done: booksCount > 0 },
              { step: "2", title: "Adicione os capítulos", desc: "Cada livro precisa dos seus capítulos com os versículos", done: chaptersCount > 0 },
              { step: "3", title: "Crie planos de leitura", desc: "Defina os planos que os usuários poderão escolher", done: plansCount > 0 },
              { step: "4", title: "Configure as conquistas", desc: "Defina as medalhas que motivam os usuários a continuar", done: false },
            ].map(({ step, title, desc, done }) => (
              <div key={step} className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  done ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                }`}>
                  {done ? "✓" : step}
                </div>
                <div>
                  <p className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : ""}`}>{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
