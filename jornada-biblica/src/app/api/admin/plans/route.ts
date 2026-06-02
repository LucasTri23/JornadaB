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
  const plans = await prisma.readingPlan.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { items: true } } } });
  return NextResponse.json(plans);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const data = await req.json();
  const plan = await prisma.readingPlan.create({ data });
  return NextResponse.json(plan, { status: 201 });
}
