import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const messages = await prisma.motivationalMessage.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const { text, category } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "Texto obrigatório" }, { status: 400 });
  const message = await prisma.motivationalMessage.create({ data: { text: text.trim(), category: category?.trim() || null } });
  return NextResponse.json(message, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const { id, isActive } = await req.json();
  const message = await prisma.motivationalMessage.update({ where: { id }, data: { isActive } });
  return NextResponse.json(message);
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const { id } = await req.json();
  await prisma.motivationalMessage.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
