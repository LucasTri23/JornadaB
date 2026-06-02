import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateProgress, TOTAL_BIBLE_CHAPTERS } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, BookOpen, TrendingUp, Star, CheckCircle2 } from "lucide-react";
import { ProgressCharts } from "@/components/dashboard/progress-charts";

export default async function ProgressPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [profile, progressData, bookStats, achievements] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.userProgress.count({ where: { userId } }),
    prisma.bibleBook.findMany({
      orderBy: { position: "asc" },
      include: {
        chapters: {
          include: { progress: { where: { userId } } },
        },
      },
    }),
    prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: "desc" },
    }),
  ]);

  const allAchievements = await prisma.achievement.findMany({
    where: { isActive: true },
    orderBy: { threshold: "asc" },
  });

  const unlockedIds = new Set(achievements.map((a) => a.achievementId));

  const booksWithStats = bookStats.map((book) => {
    const completed = book.chapters.filter((ch) => ch.progress.length > 0).length;
    return {
      id: book.id,
      name: book.name,
      abbreviation: book.abbreviation,
      testament: book.testament,
      totalChapters: book.totalChapters,
      completedChapters: completed,
      percent: calculateProgress(completed, book.totalChapters),
    };
  });

  const booksCompleted = booksWithStats.filter((b) => b.percent === 100).length;
  const overallPercent = calculateProgress(progressData, TOTAL_BIBLE_CHAPTERS);

  const otBooks = booksWithStats.filter((b) => b.testament === "OLD");
  const ntBooks = booksWithStats.filter((b) => b.testament === "NEW");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Meu Progresso</h1>
        <p className="text-muted-foreground">Acompanhe sua jornada pela Palavra</p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<TrendingUp className="w-5 h-5 text-violet-500" />} bg="bg-violet-50 dark:bg-violet-950/30"
          value={`${overallPercent}%`} label="Bíblia lida" sub={`${progressData} capítulos`} />
        <StatCard icon={<Flame className="w-5 h-5 text-orange-500" />} bg="bg-orange-50 dark:bg-orange-950/30"
          value={`${profile?.streak ?? 0}`} label="Sequência" sub={`Melhor: ${profile?.bestStreak ?? 0} dias`} />
        <StatCard icon={<BookOpen className="w-5 h-5 text-emerald-500" />} bg="bg-emerald-50 dark:bg-emerald-950/30"
          value={`${booksCompleted}`} label="Livros concluídos" sub="de 66" />
        <StatCard icon={<Trophy className="w-5 h-5 text-amber-500" />} bg="bg-amber-50 dark:bg-amber-950/30"
          value={`${achievements.length}`} label="Conquistas" sub={`de ${allAchievements.length}`} />
      </div>

      {/* Overall progress bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg">Progresso Geral da Bíblia</h3>
            <span className="text-2xl font-bold text-primary">{overallPercent}%</span>
          </div>
          <Progress value={overallPercent} className="h-4" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>{progressData} capítulos lidos</span>
            <span>{TOTAL_BIBLE_CHAPTERS - progressData} restantes</span>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <ProgressCharts books={booksWithStats} />

      {/* By book - Antigo Testamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Antigo Testamento
            <Badge variant="secondary">{otBooks.filter(b => b.percent === 100).length}/{otBooks.length} livros</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {otBooks.map((book) => (
              <BookProgressRow key={book.id} book={book} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* By book - Novo Testamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Novo Testamento
            <Badge variant="secondary">{ntBooks.filter(b => b.percent === 100).length}/{ntBooks.length} livros</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ntBooks.map((book) => (
              <BookProgressRow key={book.id} book={book} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Conquistas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {allAchievements.map((achievement) => {
              const unlocked = unlockedIds.has(achievement.id);
              const userAch = achievements.find((a) => a.achievementId === achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    unlocked ? "bg-accent border-primary/30" : "opacity-50"
                  }`}
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    {unlocked && userAch && (
                      <p className="text-xs text-primary mt-0.5">
                        Desbloqueado em {new Date(userAch.unlockedAt).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                  {unlocked ? (
                    <Star className="w-4 h-4 text-amber-500 shrink-0" fill="currentColor" />
                  ) : (
                    <Star className="w-4 h-4 text-muted-foreground/30 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon, bg, value, label, sub }: {
  icon: React.ReactNode; bg: string; value: string; label: string; sub: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>{icon}</div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  );
}

function BookProgressRow({ book }: {
  book: { name: string; abbreviation: string; totalChapters: number; completedChapters: number; percent: number }
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 text-right">
        <span className="text-xs font-mono text-muted-foreground">{book.abbreviation}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium truncate">{book.name}</span>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {book.percent === 100 && (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            )}
            <span className="text-xs text-muted-foreground">
              {book.completedChapters}/{book.totalChapters}
            </span>
          </div>
        </div>
        <Progress value={book.percent} className="h-1.5" />
      </div>
    </div>
  );
}
