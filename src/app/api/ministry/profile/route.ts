import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = session.user.id;

  let profile = await prisma.ministryProfile.findUnique({ where: { userId } });
  if (!profile) {
    profile = await prisma.ministryProfile.create({
      data: { userId, reportName: session.user.name ?? "" },
    });
  }
  return NextResponse.json(profile);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = session.user.id;
  const data = await req.json();

  const profile = await prisma.ministryProfile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
  return NextResponse.json(profile);
}
