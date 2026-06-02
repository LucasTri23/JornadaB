"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ChevronLeft, ChevronRight, CheckCircle2, Heart, BookMarked,
  Sun, Moon, Minus, Plus, Info, X, Loader2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { NoteModal } from "@/components/bible/note-modal";
import { ReflectionModal } from "@/components/bible/reflection-modal";

interface Verse {
  id: string;
  number: number;
  text: string;
}

interface ChapterData {
  id: string;
  number: number;
  totalVerses: number;
  summary?: string | null;
  context?: string | null;
  mainTheme?: string | null;
  book: { id: string; name: string; abbreviation: string; totalChapters: number };
  verses: Verse[];
}

interface Props {
  chapter: ChapterData;
  userProgress: { status: string; readCount: number } | null;
  userFavoriteIds: string[];
  prevChapter: { bookId: string; number: number; bookName: string } | null;
  nextChapter: { bookId: string; number: number; bookName: string } | null;
}

export function BibleReader({
  chapter,
  userProgress,
  userFavoriteIds,
  prevChapter,
  nextChapter,
}: Props) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useState(18);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(userFavoriteIds));
  const [markingComplete, setMarkingComplete] = useState(false);
  const [completed, setCompleted] = useState(!!userProgress);
  const [showInfo, setShowInfo] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);

  const progressPercent = Math.round((chapter.number / chapter.book.totalChapters) * 100);

  const markComplete = useCallback(async () => {
    if (markingComplete) return;
    setMarkingComplete(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId: chapter.id }),
      });
      if (res.ok) {
        setCompleted(true);
        if (!showReflection) setShowReflection(true);
      }
    } finally {
      setMarkingComplete(false);
    }
  }, [chapter.id, markingComplete, showReflection]);

  const toggleFavorite = useCallback(async (verse: Verse) => {
    const isFav = favorites.has(verse.id);
    const newFavs = new Set(favorites);
    if (isFav) {
      newFavs.delete(verse.id);
      await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verseId: verse.id }),
      });
    } else {
      newFavs.add(verse.id);
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verseId: verse.id }),
      });
    }
    setFavorites(newFavs);
  }, [favorites]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <Link href="/read" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Livros</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Font size */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setFontSize(s => Math.max(14, s - 2))}>
              <Minus className="w-3 h-3" />
            </Button>
            <span className="text-xs w-8 text-center">{fontSize}px</span>
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setFontSize(s => Math.min(28, s + 2))}>
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {/* Theme toggle */}
          <Button variant="ghost" size="icon" className="w-9 h-9" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* Info */}
          {(chapter.summary || chapter.context) && (
            <Button variant="ghost" size="icon" className="w-9 h-9" onClick={() => setShowInfo(!showInfo)}>
              <Info className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Chapter header */}
      <div className="mb-2">
        <div className="flex items-center gap-3 mb-1">
          <Badge variant="secondary">{chapter.book.abbreviation}</Badge>
          {completed && <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1" />Lido</Badge>}
        </div>
        <h1 className="text-3xl font-bold">{chapter.book.name}</h1>
        <p className="text-xl text-muted-foreground">Capítulo {chapter.number}</p>
      </div>

      {/* Book progress */}
      <div className="mb-6">
        <Progress value={progressPercent} className="h-1.5" />
        <p className="text-xs text-muted-foreground mt-1">
          Cap. {chapter.number} de {chapter.book.totalChapters} ({progressPercent}% do livro)
        </p>
      </div>

      {/* Info panel */}
      {showInfo && (chapter.summary || chapter.context) && (
        <div className="mb-6 p-4 rounded-xl bg-accent border relative">
          <button className="absolute top-3 right-3 text-muted-foreground hover:text-foreground" onClick={() => setShowInfo(false)}>
            <X className="w-4 h-4" />
          </button>
          {chapter.mainTheme && (
            <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wide">
              Tema: {chapter.mainTheme}
            </p>
          )}
          {chapter.summary && (
            <div className="mb-3">
              <p className="text-xs font-semibold mb-1">Resumo</p>
              <p className="text-sm text-muted-foreground">{chapter.summary}</p>
            </div>
          )}
          {chapter.context && (
            <div>
              <p className="text-xs font-semibold mb-1">Contexto histórico</p>
              <p className="text-sm text-muted-foreground">{chapter.context}</p>
            </div>
          )}
        </div>
      )}

      {/* Bible text */}
      {chapter.verses.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            Texto bíblico não cadastrado ainda.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Adicione o texto via painel administrativo ou importe uma tradução de domínio público.
          </p>
        </div>
      ) : (
        <div className="bible-text mb-8" style={{ fontSize: `${fontSize}px` }}>
          {chapter.verses.map((verse) => (
            <span
              key={verse.id}
              className={cn(
                "relative group",
                favorites.has(verse.id) && "bg-amber-100/50 dark:bg-amber-900/20 rounded"
              )}
            >
              <sup className="verse-number">{verse.number}</sup>
              {verse.text}{" "}

              {/* Verse actions - shown on hover */}
              <span className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                <button
                  onClick={() => toggleFavorite(verse)}
                  className={cn(
                    "inline-flex w-5 h-5 items-center justify-center rounded",
                    favorites.has(verse.id) ? "text-amber-500" : "text-muted-foreground hover:text-amber-500"
                  )}
                >
                  <Heart className="w-3.5 h-3.5" fill={favorites.has(verse.id) ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={() => { setSelectedVerse(verse); setShowNote(true); }}
                  className="inline-flex w-5 h-5 items-center justify-center rounded text-muted-foreground hover:text-primary"
                >
                  <BookMarked className="w-3.5 h-3.5" />
                </button>
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <Button
          onClick={markComplete}
          disabled={markingComplete}
          variant={completed ? "outline" : "default"}
          className="flex-1 gap-2"
          size="lg"
        >
          {markingComplete ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          {completed ? "Marcar como relido" : "Marcar como concluído"}
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="gap-2"
          onClick={() => setShowNote(true)}
        >
          <BookMarked className="w-4 h-4" />
          Anotar
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {prevChapter ? (
          <Link href={`/read/${prevChapter.bookId}/${prevChapter.number}`}>
            <Button variant="outline" className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{prevChapter.bookName} {prevChapter.number}</span>
              <span className="sm:hidden">Anterior</span>
            </Button>
          </Link>
        ) : (
          <div />
        )}

        {nextChapter && (
          <Link href={`/read/${nextChapter.bookId}/${nextChapter.number}`}>
            <Button variant="outline" className="gap-2">
              <span className="hidden sm:inline">{nextChapter.bookName} {nextChapter.number}</span>
              <span className="sm:hidden">Próximo</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>

      {/* Modals */}
      {showNote && (
        <NoteModal
          chapterId={chapter.id}
          chapterName={`${chapter.book.name} ${chapter.number}`}
          verse={selectedVerse}
          onClose={() => { setShowNote(false); setSelectedVerse(null); }}
        />
      )}

      {showReflection && (
        <ReflectionModal
          chapterId={chapter.id}
          chapterName={`${chapter.book.name} ${chapter.number}`}
          onClose={() => setShowReflection(false)}
          onNext={() => {
            setShowReflection(false);
            if (nextChapter) router.push(`/read/${nextChapter.bookId}/${nextChapter.number}`);
          }}
        />
      )}
    </div>
  );
}
