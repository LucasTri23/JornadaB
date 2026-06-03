import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const books = await prisma.bibleBook.findMany({
    orderBy: { position: "asc" },
    include: {
      _count: { select: { chapters: true } },
    },
  });

  return NextResponse.json(books);
}
