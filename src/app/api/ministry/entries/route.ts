import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const now = new Date();
  const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1));
  const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()));

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const entries = await prisma.ministryEntry.findMany({
    where: { userId, date: { gte: start, lte: end } },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = session.user.id;
  const data = await req.json();

  const entry = await prisma.ministryEntry.create({
    data: {
      userId,
      date: new Date(data.date),
      activityType: data.activityType,
      minutes: data.minutes,
      isCredit: data.isCredit ?? false,
      creditType: data.creditType ?? null,
      notes: data.notes ?? null,
    },
  });
  return NextResponse.json(entry, { status: 201 });
}
