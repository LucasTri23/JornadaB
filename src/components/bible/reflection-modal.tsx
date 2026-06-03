"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, ChevronRight, Loader2, Sparkles } from "lucide-react";

interface Props {
  chapterId: string;
  chapterName: string;
  onClose: () => void;
  onNext: () => void;
}

const questions = [
  { key: "q1", label: "O que esse capítulo me ensina sobre Deus?" },
  { key: "q2", label: "Que qualidade posso imitar?" },
  { key: "q3", label: "Que alerta ou conselho encontrei?" },
  { key: "q4", label: "Como posso aplicar isso hoje?" },
  { key: "q5", label: "Qual versículo mais chamou minha atenção?" },
];

export function ReflectionModal({ chapterId, chapterName, onClose, onNext }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function saveReflection() {
    const hasAnswer = Object.values(answers).some((v) => v.trim());
    if (!hasAnswer) { onNext(); return; }

    setSaving(true);
    try {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId,
          title: `Reflexão — ${chapterName}`,
          content: Object.entries(answers)
            .filter(([, v]) => v.trim())
            .map(([k, v]) => {
              const q = questions.find((q) => q.key === k);
              return `${q?.label}\n${v}`;
            })
            .join("\n\n"),
          ...answers,
        }),
      });
      setSaved(true);
      setTimeout(onNext, 800);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10">
        <div className="sticky top-0 bg-card rounded-t-2xl border-b p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-semibold">Meditação</h3>
              <p className="text-xs text-muted-foreground">{chapterName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Reserve um momento para refletir. Responda o que quiser — é seu diário espiritual.
          </p>

          {questions.map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <p className="text-sm font-medium">{label}</p>
              <Textarea
                value={answers[key] ?? ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [key]: e.target.value }))}
                placeholder="Escreva aqui..."
                className="min-h-[80px]"
              />
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 bg-card rounded-b-2xl border-t p-4 flex gap-3">
          <Button variant="ghost" onClick={onNext} className="flex-1">
            Pular
          </Button>
          <Button onClick={saveReflection} disabled={saving} className="flex-1 gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saved ? "Salvo!" : "Salvar e continuar"}
            {!saving && !saved && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
