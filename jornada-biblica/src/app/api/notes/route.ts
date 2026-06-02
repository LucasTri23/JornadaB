import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const chapterId = searchParams.get("chapterId");

  const notes = await prisma.userNote.findMany({
    where: {
      userId: session.user.id,
      ...(chapterId && { chapterId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    include: {
      chapter: { include: { book: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const data = await req.json();

  const note = await prisma.userNote.create({
    data: { userId: session.user.id, ...data },
    include: { chapter: { include: { book: true } } },
  });

  // Check notes achievement
  const notesCount = await prisma.userNote.count({
    where: { userId: session.user.id },
  });
  if (notesCount === 1) {
    const achievement = await prisma.achievement.findFirst({
      where: { condition: "NOTES_CREATED", threshold: 1 },
    });
    if (achievement) {
      await prisma.userAchievement.upsert({
        where: {
          userId_achievementId: {
            userId: session.user.id,
            achievementId: achievement.id,
          },
        },
        update: {},
        create: { userId: session.user.id, achievementId: achievement.id },
      });
    }
  }

  return NextResponse.json(note, { status: 201 });
}
