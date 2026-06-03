import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const study = await prisma.bibleStudy.findFirst({
    where: { id, userId: session.user.id },
    include: { sessions: { orderBy: { date: "desc" } } },
  });
  if (!study) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(study);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const data = await req.json();
  const existing = await prisma.bibleStudy.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const updated = await prisma.bibleStudy.update({
    where: { id },
    data: {
      ...data,
      lastStudyDate: data.lastStudyDate ? new Date(data.lastStudyDate) : undefined,
      nextStudyDate: data.nextStudyDate ? new Date(data.nextStudyDate) : undefined,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.bibleStudy.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  await prisma.bibleStudy.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
