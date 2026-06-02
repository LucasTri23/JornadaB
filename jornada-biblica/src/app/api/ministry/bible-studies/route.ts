import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const studies = await prisma.bibleStudy.findMany({
    where: { userId, ...(status ? { status: status as never } : {}) },
    include: { sessions: { orderBy: { date: "desc" }, take: 1 } },
    orderBy: [{ nextStudyDate: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(studies);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = session.user.id;
  const data = await req.json();

  const study = await prisma.bibleStudy.create({
    data: {
      userId,
      name: data.name,
      phone: data.phone ?? null,
      addressReference: data.addressReference ?? null,
      usualDayTime: data.usualDayTime ?? null,
      publication: data.publication ?? null,
      currentLesson: data.currentLesson ?? null,
      nextStudyDate: data.nextStudyDate ? new Date(data.nextStudyDate) : null,
      notes: data.notes ?? null,
    },
  });
  return NextResponse.json(study, { status: 201 });
}
