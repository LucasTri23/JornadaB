import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { BibleReader } from "@/components/bible/bible-reader";

interface Props {
  params: Promise<{ bookId: string; chapter: string }>;
}

export default async function ChapterPage({ params }: Props) {
  const { bookId, chapter } = await params;
  const chapterNum = parseInt(chapter);
  const session = await auth();

  if (isNaN(chapterNum)) notFound();

  const chapterData = await prisma.bibleChapter.findUnique({
    where: { bookId_number: { bookId, number: chapterNum } },
    include: {
      book: true,
      verses: { orderBy: { number: "asc" } },
    },
  });

  if (!chapterData) notFound();

  // Navigation
  const [prevChapter, nextChapter] = await Promise.all([
    chapterNum > 1
      ? prisma.bibleChapter.findUnique({
          where: { bookId_number: { bookId, number: chapterNum - 1 } },
          include: { book: true },
        })
      : prisma.bibleChapter.findFirst({
          where: { book: { position: chapterData.book.position - 1 } },
          orderBy: { number: "desc" },
          include: { book: true },
        }),
    chapterNum < chapterData.book.totalChapters
      ? prisma.bibleChapter.findUnique({
          where: { bookId_number: { bookId, number: chapterNum + 1 } },
          include: { book: true },
        })
      : prisma.bibleChapter.findFirst({
          where: { book: { position: chapterData.book.position + 1 } },
          orderBy: { number: "asc" },
          include: { book: true },
        }),
  ]);

  // User data
  let userProgress = null;
  let userFavoriteIds: string[] = [];

  if (session?.user?.id) {
    [userProgress, userFavoriteIds] = await Promise.all([
      prisma.userProgress.findUnique({
        where: {
          userId_chapterId: { userId: session.user.id, chapterId: chapterData.id },
        },
      }),
      prisma.userFavoriteVerse
        .findMany({
          where: { userId: session.user.id },
          select: { verseId: true },
        })
        .then((f) => f.map((fav) => fav.verseId)),
    ]);
  }

  return (
    <BibleReader
      chapter={chapterData}
      userProgress={userProgress}
      userFavoriteIds={userFavoriteIds}
      prevChapter={
        prevChapter
          ? { bookId: prevChapter.bookId, number: prevChapter.number, bookName: prevChapter.book.name }
          : null
      }
      nextChapter={
        nextChapter
          ? { bookId: nextChapter.bookId, number: nextChapter.number, bookName: nextChapter.book.name }
          : null
      }
    />
  );
}
