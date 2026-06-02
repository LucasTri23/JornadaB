import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ReadIndexPage() {
  const books = await prisma.bibleBook.findMany({
    orderBy: { position: "asc" },
    select: { id: true, name: true, abbreviation: true, testament: true, totalChapters: true },
  });

  const oldTestament = books.filter((b) => b.testament === "OLD");
  const newTestament = books.filter((b) => b.testament === "NEW");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Leitura Bíblica</h1>
        <p className="text-muted-foreground">Escolha um livro para começar a ler</p>
      </div>

      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold">Antigo Testamento</h2>
          <Badge variant="secondary">{oldTestament.length} livros</Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {oldTestament.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold">Novo Testamento</h2>
          <Badge variant="secondary">{newTestament.length} livros</Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {newTestament.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>
    </div>
  );
}

function BookCard({ book }: { book: { id: string; name: string; abbreviation: string; totalChapters: number } }) {
  return (
    <Link href={`/read/${book.id}/1`}>
      <Card className="hover:border-primary/50 hover:bg-accent transition-all cursor-pointer">
        <CardContent className="p-4">
          <p className="text-xs font-bold text-primary mb-1">{book.abbreviation}</p>
          <p className="text-sm font-medium leading-tight">{book.name}</p>
          <p className="text-xs text-muted-foreground mt-1">{book.totalChapters} cap.</p>
        </CardContent>
      </Card>
    </Link>
  );
}
