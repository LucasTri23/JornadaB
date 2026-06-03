import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const visit = await prisma.returnVisit.findFirst({ where: { id, userId: session.user.id } });
  if (!visit) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(visit);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const data = await req.json();
  const existing = await prisma.returnVisit.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const updated = await prisma.returnVisit.update({
    where: { id },
    data: {
      ...data,
      firstConversationDate: data.firstConversationDate ? new Date(data.firstConversationDate) : undefined,
      nextVisitDate: data.nextVisitDate ? new Date(data.nextVisitDate) : undefined,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.returnVisit.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  await prisma.returnVisit.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
