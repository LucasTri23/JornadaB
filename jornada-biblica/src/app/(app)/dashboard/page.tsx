import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGreeting, calculateProgress, TOTAL_BIBLE_CHAPTERS } from "@/lib/utils";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Flame,
  Trophy,
  ChevronRight,
  Star,
  BookMarked,
  TrendingUp,
} from "lucide-react";

const motivationalMessages = [
  "Cada capítulo lido é um passo mais próximo de Deus.",
  "A Palavra de Deus é viva e eficaz. Continue lendo!",
  "A fidelidade na leitura diária transforma o coração.",
  "Você está construindo algo eterno. Continue!",
  "A Bíblia é a carta de amor de Deus para você.",
];

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [profile, activePlan, progressData, recentNotes, achievements] =
    await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      prisma.userReadingPlan.findFirst({
        where: { userId, isActive: true },
        include: {
          plan: {
            include: {
              items: {
                orderBy: [{ dayNumber: "asc" }, { order: "asc" }],
                include: { chapter: { include: { book: true } } },
                take: 5,
              },
            },
          },
        },
      }),
      prisma.userProgress.count({ where: { userId } }),
      prisma.userNote.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { chapter: { include: { book: true } } },
      }),
      prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
        orderBy: { unlockedAt: "desc" },
        take: 3,
      }),
    ]);

  const overallPercent = calculateProgress(progressData, TOTAL_BIBLE_CHAPTERS);
  const motivation =
    motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  // Today's reading chapters
  const todayItems = activePlan?.plan.items.filter(
    (item) => item.dayNumber === (activePlan.currentDay ?? 1)
  ) ?? [];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">{getGreeting(session?.user?.name)}</h1>
        <p className="text-muted-foreground mt-1 italic text-sm">{motivation}</p>
      </div>

      {/* Today's reading */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-violet-500/5">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Leitura de hoje</span>
              </div>
              {todayItems.length > 0 ? (
                <>
                  <h2 className="text-xl font-bold mb-1">
                    {todayItems.map((item) =>
                      item.chapter
                        ? `${item.chapter.book.name} ${item.chapter.number}`
                        : item.storyName
                    ).join(", ")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Plano: {activePlan?.plan.name} · Dia {activePlan?.currentDay}
                  </p>
                </>
              ) : (
                <div>
                  <h2 className="text-xl font-bold mb-1">Nenhum plano ativo</h2>
                  <p className="text-sm text-muted-foreground">Escolha um plano para começar</p>
                </div>
              )}
            </div>

            {todayItems.length > 0 && todayItems[0].chapter ? (
              <Link
                href={`/read/${todayItems[0].chapter.bookId}/${todayItems[0].chapter.number}`}
              >
                <Button className="shrink-0 gap-2">
                  Começar <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/plans">
                <Button className="shrink-0">Escolher plano</Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-violet-500" />}
          label="Bíblia lida"
          value={`${overallPercent}%`}
          sub={`${progressData} de ${TOTAL_BIBLE_CHAPTERS} cap.`}
          bg="bg-violet-50 dark:bg-violet-950/30"
        />
        <StatCard
          icon={<Flame className="w-5 h-5 text-orange-500" />}
          label="Sequência"
          value={`${profile?.streak ?? 0} dias`}
          sub={`Melhor: ${profile?.bestStreak ?? 0} dias`}
          bg="bg-orange-50 dark:bg-orange-950/30"
        />
        <StatCard
          icon={<Trophy className="w-5 h-5 text-amber-500" />}
          label="Conquistas"
          value={achievements.length.toString()}
          sub="desbloqueadas"
          bg="bg-amber-50 dark:bg-amber-950/30"
        />
        <StatCard
          icon={<BookMarked className="w-5 h-5 text-emerald-500" />}
          label="Anotações"
          value={recentNotes.length.toString()}
          sub="registradas"
          bg="bg-emerald-50 dark:bg-emerald-950/30"
        />
      </div>

      {/* Overall progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Progresso geral da Bíblia</h3>
            <span className="text-sm font-bold text-primary">{overallPercent}%</span>
          </div>
          <Progress value={overallPercent} className="h-3" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{progressData} capítulos lidos</span>
            <span>{TOTAL_BIBLE_CHAPTERS - progressData} restantes</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent notes */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Últimas anotações</h3>
              <Link href="/notes" className="text-sm text-primary hover:underline">
                Ver todas
              </Link>
            </div>
            {recentNotes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma anotação ainda. Comece a ler e registre seus pensamentos!
              </p>
            ) : (
              <div className="space-y-3">
                {recentNotes.map((note) => (
                  <div key={note.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
                      <BookMarked className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {note.title ?? note.chapter?.book.name ?? "Anotação"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{note.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent achievements */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Conquistas recentes</h3>
              <Link href="/progress" className="text-sm text-primary hover:underline">
                Ver todas
              </Link>
            </div>
            {achievements.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Continue lendo para desbloquear conquistas!
              </p>
            ) : (
              <div className="space-y-3">
                {achievements.map(({ achievement, unlockedAt }) => (
                  <div key={achievement.id} className="flex items-center gap-3">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{achievement.name}</p>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                    <Badge variant="success" className="shrink-0 text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      {new Date(unlockedAt).toLocaleDateString("pt-BR")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  bg: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
          {icon}
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  );
}
