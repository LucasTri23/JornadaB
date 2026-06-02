import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TOTAL_BIBLE_CHAPTERS } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const userId = session.user.id;

  const [progressRecords, bookProgress, profile] = await Promise.all([
    prisma.userProgress.findMany({
      where: { userId },
      include: { chapter: { include: { book: true } } },
    }),
    prisma.bibleBook.findMany({
      orderBy: { position: "asc" },
      include: {
        chapters: {
          include: {
            progress: { where: { userId } },
          },
        },
      },
    }),
    prisma.profile.findUnique({ where: { userId } }),
  ]);

  const chaptersRead = progressRecords.length;
  const overallPercent = Math.round((chaptersRead / TOTAL_BIBLE_CHAPTERS) * 100);

  const bookStats = bookProgress.map((book) => {
    const completedChapters = book.chapters.filter(
      (ch) => ch.progress.length > 0
    ).length;
    return {
      id: book.id,
      name: book.name,
      abbreviation: book.abbreviation,
      testament: book.testament,
      totalChapters: book.totalChapters,
      completedChapters,
      percent: Math.round((completedChapters / book.totalChapters) * 100),
    };
  });

  return NextResponse.json({
    chaptersRead,
    chaptersRemaining: TOTAL_BIBLE_CHAPTERS - chaptersRead,
    overallPercent,
    streak: profile?.streak ?? 0,
    bestStreak: profile?.bestStreak ?? 0,
    lastReadAt: profile?.lastReadAt,
    bookStats,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const userId = session.user.id;
  const { chapterId } = await req.json();

  const chapter = await prisma.bibleChapter.findUnique({
    where: { id: chapterId },
  });
  if (!chapter) {
    return NextResponse.json({ error: "Capítulo não encontrado" }, { status: 404 });
  }

  const existing = await prisma.userProgress.findUnique({
    where: { userId_chapterId: { userId, chapterId } },
  });

  const progress = await prisma.userProgress.upsert({
    where: { userId_chapterId: { userId, chapterId } },
    update: {
      status: existing ? "REREAD" : "READ",
      readCount: { increment: 1 },
      updatedAt: new Date(),
    },
    create: { userId, chapterId, status: "READ" },
  });

  // Update streak and lastReadAt
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (profile) {
    const lastRead = profile.lastReadAt ? new Date(profile.lastReadAt) : null;
    lastRead?.setHours(0, 0, 0, 0);

    let newStreak = profile.streak;
    if (!lastRead) {
      newStreak = 1;
    } else {
      const diffDays = Math.floor(
        (today.getTime() - lastRead.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 0) {
        // Same day - no change
      } else if (diffDays === 1) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    await prisma.profile.update({
      where: { userId },
      data: {
        lastReadAt: new Date(),
        streak: newStreak,
        bestStreak: Math.max(newStreak, profile.bestStreak),
      },
    });
  }

  // Check achievements
  await checkAchievements(userId);

  return NextResponse.json({ progress, message: "Progresso registrado!" });
}

async function checkAchievements(userId: string) {
  const [totalRead, profile, notesCount, favoritesCount] = await Promise.all([
    prisma.userProgress.count({ where: { userId } }),
    prisma.profile.findUnique({ where: { userId } }),
    prisma.userNote.count({ where: { userId } }),
    prisma.userFavoriteVerse.count({ where: { userId } }),
  ]);

  const achievements = await prisma.achievement.findMany({ where: { isActive: true } });
  const userAchievements = await prisma.userAchievement.findMany({ where: { userId } });
  const unlockedIds = new Set(userAchievements.map((a) => a.achievementId));

  const toUnlock: string[] = [];

  for (const achievement of achievements) {
    if (unlockedIds.has(achievement.id)) continue;

    let unlocked = false;
    switch (achievement.condition) {
      case "FIRST_READ":
        unlocked = totalRead >= 1;
        break;
      case "CHAPTERS_READ":
        unlocked = totalRead >= achievement.threshold;
        break;
      case "STREAK_DAYS":
        unlocked = (profile?.streak ?? 0) >= achievement.threshold;
        break;
      case "NOTES_CREATED":
        unlocked = notesCount >= achievement.threshold;
        break;
      case "FAVORITES_SAVED":
        unlocked = favoritesCount >= achievement.threshold;
        break;
    }

    if (unlocked) toUnlock.push(achievement.id);
  }

  if (toUnlock.length > 0) {
    await prisma.userAchievement.createMany({
      data: toUnlock.map((achievementId) => ({ userId, achievementId })),
      skipDuplicates: true,
    });
  }
}
