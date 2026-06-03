import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const plans = await prisma.readingPlan.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: { _count: { select: { items: true } } },
  });
  return NextResponse.json(plans);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const userId = session.user.id;
  const { planId, startDate, targetEndDate } = await req.json();

  // Deactivate current active plans
  await prisma.userReadingPlan.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false },
  });

  const userPlan = await prisma.userReadingPlan.create({
    data: {
      userId,
      planId,
      isActive: true,
      startDate: startDate ? new Date(startDate) : new Date(),
      targetEndDate: targetEndDate ? new Date(targetEndDate) : null,
    },
  });

  return NextResponse.json(userPlan);
}
