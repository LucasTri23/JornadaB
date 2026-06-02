"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BookOpen, Clock, Target, Calendar, Bell, ChevronRight, ChevronLeft, Loader2,
} from "lucide-react";

const goals = [
  { id: "devotional", label: "Devocional diária", emoji: "🙏" },
  { id: "complete", label: "Ler a Bíblia completa", emoji: "📖" },
  { id: "knowledge", label: "Aprofundar conhecimento", emoji: "🎓" },
  { id: "family", label: "Leitura em família", emoji: "👨‍👩‍👧" },
  { id: "study", label: "Estudo bíblico", emoji: "📚" },
];

const timeOptions = [
  { value: 5, label: "5 min" },
  { value: 10, label: "10 min" },
  { value: 15, label: "15 min" },
  { value: 20, label: "20 min" },
  { value: 30, label: "30 min" },
  { value: 60, label: "1 hora" },
];

const durationOptions = [
  { value: 30, label: "30 dias" },
  { value: 90, label: "3 meses" },
  { value: 180, label: "6 meses" },
  { value: 365, label: "1 ano" },
  { value: 730, label: "2 anos" },
];

const planTypes = [
  { id: "BIBLICAL_ORDER", label: "Ordem bíblica", desc: "De Gênesis a Apocalipse", icon: "📜" },
  { id: "CHRONOLOGICAL", label: "Cronológica", desc: "Ordem histórica dos eventos", icon: "⏳" },
  { id: "BY_STORY", label: "Por histórias", desc: "Grandes narrativas bíblicas", icon: "📖" },
  { id: "BY_THEME", label: "Por temas", desc: "Fé, amor, esperança e mais", icon: "🏷️" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0") + ":00");

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [answers, setAnswers] = useState({
    goal: "",
    completedBefore: false,
    dailyTime: 15,
    duration: 365,
    planType: "BIBLICAL_ORDER",
    notifyTime: "08:00",
  });

  const steps = [
    {
      title: "Qual seu objetivo?",
      subtitle: "Isso nos ajuda a personalizar sua jornada",
      icon: Target,
      content: (
        <div className="grid gap-3">
          {goals.map((g) => (
            <button
              key={g.id}
              onClick={() => setAnswers((a) => ({ ...a, goal: g.id }))}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                answers.goal === g.id
                  ? "border-primary bg-accent"
                  : "border-border hover:border-primary/50"
              )}
            >
              <span className="text-2xl">{g.emoji}</span>
              <span className="font-medium">{g.label}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Já leu a Bíblia antes?",
      subtitle: "Sua experiência nos ajuda a sugerir o melhor caminho",
      icon: BookOpen,
      content: (
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: false, label: "Não, é minha primeira vez", emoji: "🌱" },
            { value: true, label: "Sim, já li antes", emoji: "📗" },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => setAnswers((a) => ({ ...a, completedBefore: opt.value }))}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all",
                answers.completedBefore === opt.value
                  ? "border-primary bg-accent"
                  : "border-border hover:border-primary/50"
              )}
            >
              <span className="text-3xl">{opt.emoji}</span>
              <span className="text-sm font-medium text-center">{opt.label}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Tempo disponível por dia",
      subtitle: "Seja honesto — a consistência é mais importante que a quantidade",
      icon: Clock,
      content: (
        <div className="grid grid-cols-3 gap-3">
          {timeOptions.map((t) => (
            <button
              key={t.value}
              onClick={() => setAnswers((a) => ({ ...a, dailyTime: t.value }))}
              className={cn(
                "p-4 rounded-xl border-2 font-semibold text-lg transition-all",
                answers.dailyTime === t.value
                  ? "border-primary bg-accent text-primary"
                  : "border-border hover:border-primary/50"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Em quanto tempo quer concluir?",
      subtitle: "Vamos calcular sua leitura diária automaticamente",
      icon: Calendar,
      content: (
        <div className="grid gap-3">
          {durationOptions.map((d) => (
            <button
              key={d.value}
              onClick={() => setAnswers((a) => ({ ...a, duration: d.value }))}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                answers.duration === d.value
                  ? "border-primary bg-accent"
                  : "border-border hover:border-primary/50"
              )}
            >
              <span className="font-medium">{d.label}</span>
              <span className="text-sm text-muted-foreground">
                ~{Math.round(1189 / d.value)} cap/dia
              </span>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Como prefere ler?",
      subtitle: "Você pode mudar isso a qualquer momento",
      icon: BookOpen,
      content: (
        <div className="grid gap-3">
          {planTypes.map((p) => (
            <button
              key={p.id}
              onClick={() => setAnswers((a) => ({ ...a, planType: p.id }))}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                answers.planType === p.id
                  ? "border-primary bg-accent"
                  : "border-border hover:border-primary/50"
              )}
            >
              <span className="text-2xl">{p.icon}</span>
              <div>
                <p className="font-medium">{p.label}</p>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </div>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Horário do lembrete diário",
      subtitle: "Receba uma notificação para não esquecer sua leitura",
      icon: Bell,
      content: (
        <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto">
          {HOURS.map((h) => (
            <button
              key={h}
              onClick={() => setAnswers((a) => ({ ...a, notifyTime: h }))}
              className={cn(
                "p-3 rounded-xl border-2 font-medium transition-all",
                answers.notifyTime === h
                  ? "border-primary bg-accent text-primary"
                  : "border-border hover:border-primary/50"
              )}
            >
              {h}
            </button>
          ))}
        </div>
      ),
    },
  ];

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  async function handleFinish() {
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spiritualGoal: answers.goal,
          hasCompletedBefore: answers.completedBefore,
          dailyTimeMinutes: answers.dailyTime,
          targetDays: answers.duration,
          readingPreference: answers.planType,
          notifyTime: answers.notifyTime,
          onboardingCompleted: true,
        }),
      });
      router.push("/plans");
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Progress dots */}
        <div className="flex gap-2 mb-8 justify-center">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i <= step ? "bg-primary w-8" : "bg-muted w-4"
              )}
            />
          ))}
        </div>

        {/* Step card */}
        <div className="bg-card rounded-2xl border shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{current.title}</h2>
              <p className="text-sm text-muted-foreground">{current.subtitle}</p>
            </div>
          </div>

          {current.content}

          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            {isLast ? (
              <Button onClick={handleFinish} disabled={saving} className="gap-2">
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                ) : (
                  <>Começar jornada <ChevronRight className="w-4 h-4" /></>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => setStep((s) => s + 1)}
                className="gap-2"
              >
                Próximo <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Passo {step + 1} de {steps.length}
        </p>
      </div>
    </div>
  );
}
