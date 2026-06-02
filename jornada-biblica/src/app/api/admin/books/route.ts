import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const books = await prisma.bibleBook.findMany({
    orderBy: { position: "asc" },
    include: { _count: { select: { chapters: true } } },
  });

  return NextResponse.json(books);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const data = await req.json();
  const book = await prisma.bibleBook.create({ data });
  return NextResponse.json(book, { status: 201 });
}
