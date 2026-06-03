import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ bookId: string; chapter: string }> }
) {
  const session = await auth();
  const { bookId, chapter } = await params;
  const chapterNum = parseInt(chapter);

  const chapterData = await prisma.bibleChapter.findUnique({
    where: { bookId_number: { bookId, number: chapterNum } },
    include: {
      book: true,
      verses: { orderBy: { number: "asc" } },
    },
  });

  if (!chapterData) {
    return NextResponse.json({ error: "Capítulo não encontrado" }, { status: 404 });
  }

  // Fetch user progress for this chapter
  let userProgress = null;
  let userFavorites: string[] = [];
  if (session?.user?.id) {
    [userProgress, userFavorites] = await Promise.all([
      prisma.userProgress.findUnique({
        where: {
          userId_chapterId: {
            userId: session.user.id,
            chapterId: chapterData.id,
          },
        },
      }),
      prisma.userFavoriteVerse
        .findMany({
          where: { userId: session.user.id },
          select: { verseId: true },
        })
        .then((favs) => favs.map((f) => f.verseId)),
    ]);
  }

  // Get prev/next chapter info
  const [prevChapter, nextChapter] = await Promise.all([
    prisma.bibleChapter.findFirst({
      where: {
        book: { position: { lte: chapterData.book.position } },
        number: chapterNum > 1 ? chapterNum - 1 : -1,
        bookId: chapterNum > 1 ? bookId : undefined,
      },
      include: { book: true },
      orderBy: [{ book: { position: "desc" } }, { number: "desc" }],
    }),
    prisma.bibleChapter.findFirst({
      where: {
        book: { position: { gte: chapterData.book.position } },
        number: { gt: chapterNum },
        bookId,
      },
      include: { book: true },
      orderBy: [{ book: { position: "asc" } }, { number: "asc" }],
    }),
  ]);

  return NextResponse.json({
    ...chapterData,
    userProgress,
    userFavorites,
    navigation: {
      prev: prevChapter
        ? { bookId: prevChapter.bookId, chapter: prevChapter.number }
        : null,
      next: nextChapter
        ? { bookId: nextChapter.bookId, chapter: nextChapter.number }
        : null,
    },
  });
}
