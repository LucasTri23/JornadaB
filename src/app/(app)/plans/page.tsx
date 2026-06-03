"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  type: string;
  durationDays: number | null;
  isDefault: boolean;
  _count: { items: number };
}

interface ActivePlan {
  planId: string;
  plan: { name: string };
  currentDay: number;
  isActive: boolean;
}

const planTypeLabels: Record<string, { label: string; emoji: string; color: string }> = {
  BIBLICAL_ORDER: { label: "Ordem Bíblica", emoji: "📜", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  CHRONOLOGICAL: { label: "Cronológica", emoji: "⏳", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  BY_STORY: { label: "Por Histórias", emoji: "📖", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  BY_THEME: { label: "Por Temas", emoji: "🏷️", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  CUSTOM: { label: "Personalizado", emoji: "⚙️", color: "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400" },
};

export default function PlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/plans").then((r) => r.json()),
      fetch("/api/plans/active").then((r) => r.json()),
    ]).then(([plansData, activeData]) => {
      setPlans(plansData);
      setActivePlan(activeData);
      setLoading(false);
    });
  }, []);

  async function selectPlan(planId: string) {
    setSelecting(planId);
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      if (res.ok) {
        router.push("/dashboard");
      }
    } finally {
      setSelecting(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Planos de Leitura</h1>
        <p className="text-muted-foreground">Escolha como deseja percorrer a Bíblia</p>
      </div>

      {/* Active plan banner */}
      {activePlan && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-violet-500/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">{activePlan.plan.name}</p>
                <p className="text-sm text-muted-foreground">
                  Plano ativo · Dia {activePlan.currentDay}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
                Continuar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans grid */}
      {plans.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-medium text-muted-foreground">Nenhum plano disponível ainda</p>
          <p className="text-sm text-muted-foreground mt-1">
            O administrador precisa cadastrar os planos no painel.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {plans.map((plan) => {
            const typeInfo = planTypeLabels[plan.type] ?? planTypeLabels.CUSTOM;
            const isActive = activePlan?.planId === plan.id;

            return (
              <Card
                key={plan.id}
                className={cn(
                  "hover:border-primary/40 transition-all cursor-pointer",
                  isActive && "border-primary/50 bg-accent"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{typeInfo.emoji}</span>
                    <div className="flex gap-2">
                      <Badge className={cn("text-xs border-0", typeInfo.color)}>
                        {typeInfo.label}
                      </Badge>
                      {isActive && <Badge variant="outline" className="text-xs">Ativo</Badge>}
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-2">{plan.name}</CardTitle>
                  {plan.description && (
                    <CardDescription>{plan.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {plan.durationDays && <span>{plan.durationDays} dias · </span>}
                      <span>{plan._count.items} leituras</span>
                    </div>
                    <Button
                      size="sm"
                      variant={isActive ? "outline" : "default"}
                      disabled={selecting === plan.id}
                      onClick={() => selectPlan(plan.id)}
                      className="gap-1"
                    >
                      {selecting === plan.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : isActive ? (
                        "Reiniciar"
                      ) : (
                        <>Iniciar <ChevronRight className="w-3 h-3" /></>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
