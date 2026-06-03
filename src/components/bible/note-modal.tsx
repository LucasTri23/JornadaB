"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Loader2, BookMarked } from "lucide-react";

interface Props {
  chapterId: string;
  chapterName: string;
  verse?: { id: string; number: number; text: string } | null;
  onClose: () => void;
}

export function NoteModal({ chapterId, chapterName, verse, onClose }: Props) {
  const [title, setTitle] = useState(verse ? `${chapterName}:${verse.number}` : chapterName);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    if (!content.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId,
          verseRef: verse ? `${chapterName}:${verse.number}` : null,
          title,
          content,
        }),
      });
      setSaved(true);
      setTimeout(onClose, 1000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-t-2xl sm:rounded-2xl border shadow-xl w-full max-w-lg p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Nova anotação</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {verse && (
          <div className="p-3 rounded-lg bg-accent mb-4">
            <p className="text-xs font-semibold text-primary mb-1">{chapterName}:{verse.number}</p>
            <p className="text-sm italic text-muted-foreground line-clamp-3">&ldquo;{verse.text}&rdquo;</p>
          </div>
        )}

        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Anotação</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva seus pensamentos sobre este trecho..."
              className="min-h-[120px]"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button onClick={save} disabled={saving || !content.trim()} className="flex-1 gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saved ? "Salvo!" : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
