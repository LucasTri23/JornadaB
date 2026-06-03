import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const favorites = await prisma.userFavoriteVerse.findMany({
    where: { userId: session.user.id },
    include: {
      verse: {
        include: { chapter: { include: { book: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(favorites);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { verseId, note } = await req.json();

  const favorite = await prisma.userFavoriteVerse.upsert({
    where: {
      userId_verseId: { userId: session.user.id, verseId },
    },
    update: { note },
    create: { userId: session.user.id, verseId, note },
    include: { verse: { include: { chapter: { include: { book: true } } } } },
  });

  return NextResponse.json(favorite, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { verseId } = await req.json();

  await prisma.userFavoriteVerse.delete({
    where: {
      userId_verseId: { userId: session.user.id, verseId },
    },
  });

  return NextResponse.json({ message: "Favorito removido" });
}
