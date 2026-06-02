"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, BookMarked, Trash2, Plus, X } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface Note {
  id: string;
  title: string | null;
  content: string;
  verseRef: string | null;
  createdAt: string;
  chapter?: { number: number; book: { name: string } } | null;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/notes${params}`);
      const data = await res.json();
      setNotes(data);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchNotes, 300);
    return () => clearTimeout(timer);
  }, [fetchNotes]);

  async function deleteNote(id: string) {
    setDeleting(id);
    try {
      await fetch(`/api/notes/${id}`, { method: "DELETE" });
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Minhas Anotações</h1>
          <p className="text-muted-foreground">Seu diário espiritual</p>
        </div>
        <Link href="/read">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nova leitura
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar anotações..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-9"
        />
        {search && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            onClick={() => setSearch("")}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16">
          <BookMarked className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-medium text-muted-foreground">
            {search ? "Nenhuma anotação encontrada" : "Nenhuma anotação ainda"}
          </p>
          {!search && (
            <p className="text-sm text-muted-foreground mt-1">
              Comece a ler e registre seus pensamentos
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {notes.map((note) => (
            <Card key={note.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {note.chapter && (
                        <Badge variant="secondary" className="text-xs">
                          {note.chapter.book.name} {note.chapter.number}
                        </Badge>
                      )}
                      {note.verseRef && (
                        <Badge variant="outline" className="text-xs">{note.verseRef}</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(note.createdAt)}
                      </span>
                    </div>
                    {note.title && (
                      <h3 className="font-semibold mb-1">{note.title}</h3>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-3">{note.content}</p>
                  </div>
                  <button
                    onClick={() => deleteNote(note.id)}
                    disabled={deleting === note.id}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    {deleting === note.id ? (
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
