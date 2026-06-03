"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Heart, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface Favorite {
  id: string;
  note: string | null;
  createdAt: string;
  verse: {
    id: string;
    number: number;
    text: string;
    chapter: {
      id: string;
      number: number;
      bookId: string;
      book: { name: string; abbreviation: string };
    };
  };
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/favorites")
      .then((r) => r.json())
      .then(setFavorites)
      .finally(() => setLoading(false));
  }, []);

  async function removeFavorite(verseId: string) {
    setDeleting(verseId);
    await fetch("/api/favorites", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verseId }),
    });
    setFavorites((prev) => prev.filter((f) => f.verse.id !== verseId));
    setDeleting(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Versículos Favoritos</h1>
        <p className="text-muted-foreground">{favorites.length} versículos salvos</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-medium text-muted-foreground">Nenhum favorito ainda</p>
          <p className="text-sm text-muted-foreground mt-1">
            Durante a leitura, clique no ❤️ ao lado de um versículo para favoritar
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {favorites.map((fav) => (
            <Card key={fav.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Heart className="w-4 h-4 text-amber-600" fill="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Link
                        href={`/read/${fav.verse.chapter.bookId}/${fav.verse.chapter.number}`}
                        className="hover:underline"
                      >
                        <Badge variant="secondary">
                          {fav.verse.chapter.book.abbreviation} {fav.verse.chapter.number}:{fav.verse.number}
                        </Badge>
                      </Link>
                      <span className="text-xs text-muted-foreground">{formatDate(fav.createdAt)}</span>
                    </div>
                    <p className="text-sm leading-relaxed italic">
                      &ldquo;{fav.verse.text}&rdquo;
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {fav.verse.chapter.book.name} {fav.verse.chapter.number}:{fav.verse.number}
                    </p>
                    {fav.note && (
                      <p className="text-sm text-muted-foreground mt-2 border-t pt-2">{fav.note}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeFavorite(fav.verse.id)}
                    disabled={deleting === fav.verse.id}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    {deleting === fav.verse.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
