import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const userPlan = await prisma.userReadingPlan.findFirst({
    where: { userId: session.user.id, isActive: true },
    include: {
      plan: {
        include: {
          items: {
            orderBy: [{ dayNumber: "asc" }, { order: "asc" }],
            include: {
              chapter: { include: { book: true } },
              book: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(userPlan);
}
