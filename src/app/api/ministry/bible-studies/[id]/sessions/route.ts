import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const study = await prisma.bibleStudy.findFirst({ where: { id, userId: session.user.id } });
  if (!study) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  const sessions = await prisma.studySession.findMany({
    where: { bibleStudyId: id },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = session.user.id;
  const { id: bibleStudyId } = await params;
  const data = await req.json();

  const study = await prisma.bibleStudy.findFirst({ where: { id: bibleStudyId, userId } });
  if (!study) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const studySession = await prisma.studySession.create({
    data: {
      userId,
      bibleStudyId,
      date: new Date(data.date),
      minutes: data.minutes,
      lessonStudied: data.lessonStudied ?? null,
      paragraphStudied: data.paragraphStudied ?? null,
      doubts: data.doubts ?? null,
      notes: data.notes ?? null,
    },
  });

  // Update the bible study's lastStudyDate and current lesson
  await prisma.bibleStudy.update({
    where: { id: bibleStudyId },
    data: {
      lastStudyDate: new Date(data.date),
      currentLesson: data.lessonStudied ?? study.currentLesson,
      currentParagraph: data.paragraphStudied ?? study.currentParagraph,
    },
  });

  return NextResponse.json(studySession, { status: 201 });
}
