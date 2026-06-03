"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, BookOpen, Users, Bell, Loader2 } from "lucide-react";

const publisherTypes = [
  { id: "PUBLISHER", label: "Publicador", desc: "Participa do ministério sem meta de horas" },
  { id: "AUXILIARY_PIONEER", label: "Pioneiro Auxiliar", desc: "Serve como auxiliar em meses específicos" },
  { id: "INDEFINITE_AUXILIARY_PIONEER", label: "Pioneiro Auxiliar por Tempo Indeterminado", desc: "Meta mensal de 30h sem meta anual" },
  { id: "REGULAR_PIONEER", label: "Pioneiro Regular", desc: "Meta anual de 600h (set–ago)" },
];

export default function MinistryOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [answers, setAnswers] = useState({
    reportName: "",
    congregation: "",
    publisherType: "PUBLISHER",
    remindToRegister: true,
    useReturnVisits: true,
    useBibleStudies: true,
  });

  const steps = [
    {
      title: "Como te chamamos no relatório?",
      subtitle: "Esse nome aparecerá no seu relatório mensal",
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome para o relatório</Label>
            <Input
              value={answers.reportName}
              onChange={(e) => setAnswers((a) => ({ ...a, reportName: e.target.value }))}
              placeholder="Seu nome completo"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Congregação (opcional)</Label>
            <Input
              value={answers.congregation}
              onChange={(e) => setAnswers((a) => ({ ...a, congregation: e.target.value }))}
              placeholder="Nome da sua congregação"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Qual é sua modalidade atual?",
      subtitle: "Isso define como seu progresso é calculado",
      icon: Users,
      content: (
        <div className="space-y-3">
          {publisherTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setAnswers((a) => ({ ...a, publisherType: type.id }))}
              className={cn(
                "w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all",
                answers.publisherType === type.id
                  ? "border-primary bg-accent"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div>
                <p className="font-medium text-sm">{type.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{type.desc}</p>
              </div>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "O que deseja usar?",
      subtitle: "Você pode alterar isso depois nas configurações",
      icon: Bell,
      content: (
        <div className="space-y-4">
          {[
            { key: "remindToRegister", label: "Lembrete para registrar o ministério", desc: "Notificação no final do dia" },
            { key: "useReturnVisits", label: "Agenda de revisitas", desc: "Organizar e acompanhar suas revisitas" },
            { key: "useBibleStudies", label: "Agenda de estudos bíblicos", desc: "Acompanhar seus estudos e sessões" },
          ].map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() => setAnswers((a) => ({ ...a, [key]: !a[key as keyof typeof a] }))}
              className={cn(
                "w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all",
                answers[key as keyof typeof answers]
                  ? "border-primary bg-accent"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors",
                answers[key as keyof typeof answers] ? "bg-primary border-primary" : "border-border"
              )}>
                {answers[key as keyof typeof answers] && (
                  <span className="text-primary-foreground text-xs font-bold">✓</span>
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
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
      await fetch("/api/ministry/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...answers, onboardingCompleted: true }),
      });
      router.push("/ministry");
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex gap-2 mb-8">
        {steps.map((_, i) => (
          <div key={i} className={cn("h-1.5 rounded-full flex-1 transition-all", i <= step ? "bg-primary" : "bg-muted")} />
        ))}
      </div>

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
        <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Anterior
        </Button>
        {isLast ? (
          <Button onClick={handleFinish} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Começar <ChevronRight className="w-4 h-4" /></>}
          </Button>
        ) : (
          <Button onClick={() => setStep((s) => s + 1)} className="gap-2">
            Próximo <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
      <p className="text-center text-xs text-muted-foreground mt-4">Passo {step + 1} de {steps.length}</p>
    </div>
  );
}
