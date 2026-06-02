import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const data = await req.json();

  const entry = await prisma.ministryEntry.findFirst({ where: { id, userId: session.user.id } });
  if (!entry) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const updated = await prisma.ministryEntry.update({
    where: { id },
    data: {
      date: data.date ? new Date(data.date) : undefined,
      activityType: data.activityType,
      minutes: data.minutes,
      isCredit: data.isCredit,
      creditType: data.creditType,
      notes: data.notes,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;

  const entry = await prisma.ministryEntry.findFirst({ where: { id, userId: session.user.id } });
  if (!entry) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  await prisma.ministryEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
