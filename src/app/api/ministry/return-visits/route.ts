import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const visits = await prisma.returnVisit.findMany({
    where: { userId, ...(status ? { status: status as never } : {}) },
    orderBy: [{ nextVisitDate: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(visits);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = session.user.id;
  const data = await req.json();

  const visit = await prisma.returnVisit.create({
    data: {
      userId,
      name: data.name,
      phone: data.phone ?? null,
      addressReference: data.addressReference ?? null,
      firstConversationDate: data.firstConversationDate ? new Date(data.firstConversationDate) : null,
      subjectDiscussed: data.subjectDiscussed ?? null,
      scriptureUsed: data.scriptureUsed ?? null,
      materialLeft: data.materialLeft ?? null,
      nextVisitDate: data.nextVisitDate ? new Date(data.nextVisitDate) : null,
      notes: data.notes ?? null,
    },
  });
  return NextResponse.json(visit, { status: 201 });
}
