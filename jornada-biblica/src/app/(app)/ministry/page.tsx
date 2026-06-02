"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Clock, BookOpen, Users, ChevronRight, Calendar,
  FileText, Flame, Target, Loader2,
} from "lucide-react";

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return h === 0 ? "0min" : `${h}h`;
  if (h === 0) return `${m}min`;
  return `${h}h${m}min`;
}

const PUBLISHER_TYPE_LABELS: Record<string, string> = {
  PUBLISHER: "Publicador",
  AUXILIARY_PIONEER: "Pioneiro Auxiliar",
  INDEFINITE_AUXILIARY_PIONEER: "Aux. Indeterminado",
  REGULAR_PIONEER: "Pioneiro Regular",
};

const MONTH_NAMES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

interface Summary {
  publisherType: string;
  ministryMinutes: number;
  creditMinutes: number;
  totalMinutes: number;
  goalMinutes: number | null;
  remainingMinutes: number | null;
  percent: number | null;
  bibleStudiesCount: number;
  activeBibleStudies: number;
  uniqueDays: number;
  participatedInMinistry: boolean;
  month: number;
  year: number;
}

interface ReturnVisit {
  id: string;
  name: string;
  nextVisitDate: string | null;
}

interface BibleStudy {
  id: string;
  name: string;
  nextStudyDate: string | null;
}

export default function MinistryHomePage() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [nextVisit, setNextVisit] = useState<ReturnVisit | null>(null);
  const [nextStudy, setNextStudy] = useState<BibleStudy | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ onboardingCompleted: boolean; reportName: string } | null>(null);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  useEffect(() => {
    Promise.all([
      fetch("/api/ministry/profile").then((r) => r.json()),
      fetch(`/api/ministry/summary?month=${month}&year=${year}`).then((r) => r.json()),
      fetch("/api/ministry/return-visits?status=PENDING").then((r) => r.json()),
      fetch("/api/ministry/bible-studies?status=ACTIVE").then((r) => r.json()),
    ]).then(([profileData, summaryData, visitsData, studiesData]) => {
      setProfile(profileData);
      setSummary(summaryData);

      const upcoming = visitsData
        .filter((v: ReturnVisit) => v.nextVisitDate)
        .sort((a: ReturnVisit, b: ReturnVisit) =>
          new Date(a.nextVisitDate!).getTime() - new Date(b.nextVisitDate!).getTime()
        );
      setNextVisit(upcoming[0] ?? null);

      const upcomingStudies = studiesData
        .filter((s: BibleStudy) => s.nextStudyDate)
        .sort((a: BibleStudy, b: BibleStudy) =>
          new Date(a.nextStudyDate!).getTime() - new Date(b.nextStudyDate!).getTime()
        );
      setNextStudy(upcomingStudies[0] ?? null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [month, year]);

  useEffect(() => {
    if (profile && !profile.onboardingCompleted) {
      router.push("/ministry/onboarding");
    }
  }, [profile, router]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!summary) return null;

  const isPublisher = summary.publisherType === "PUBLISHER";
  const isPioneer = !isPublisher;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meu Ministério</h1>
          <p className="text-muted-foreground text-sm">
            {MONTH_NAMES[month - 1]} {year} ·{" "}
            <span className="font-medium">{PUBLISHER_TYPE_LABELS[summary.publisherType]}</span>
          </p>
        </div>
        <Link href="/ministry/add">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Registrar
          </Button>
        </Link>
      </div>

      {/* Main stats card */}
      {isPublisher ? (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-violet-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold ${
                summary.participatedInMinistry ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-muted"
              }`}>
                {summary.participatedInMinistry ? "✓" : "—"}
              </div>
              <div>
                <p className="font-semibold">Ministério este mês</p>
                <p className={`text-sm ${summary.participatedInMinistry ? "text-emerald-600" : "text-muted-foreground"}`}>
                  {summary.participatedInMinistry ? "Participou" : "Ainda não registrado"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background/60 rounded-xl p-3">
                <p className="text-2xl font-bold">{summary.bibleStudiesCount}</p>
                <p className="text-xs text-muted-foreground">Estudos no mês</p>
              </div>
              <div className="bg-background/60 rounded-xl p-3">
                <p className="text-2xl font-bold">{summary.uniqueDays}</p>
                <p className="text-xs text-muted-foreground">Dias no campo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-violet-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-3xl font-bold">{formatMinutes(summary.totalMinutes)}</p>
                <p className="text-sm text-muted-foreground">
                  {summary.goalMinutes ? `Meta: ${formatMinutes(summary.goalMinutes)}` : "Sem meta mensal"}
                </p>
              </div>
              {summary.percent !== null && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{summary.percent}%</p>
                  {summary.remainingMinutes !== null && summary.remainingMinutes > 0 && (
                    <p className="text-xs text-muted-foreground">Faltam {formatMinutes(summary.remainingMinutes)}</p>
                  )}
                </div>
              )}
            </div>
            {summary.percent !== null && (
              <Progress value={summary.percent} className="h-2 mb-4" />
            )}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-background/60 rounded-xl p-3 text-center">
                <p className="text-xl font-bold">{formatMinutes(summary.ministryMinutes)}</p>
                <p className="text-xs text-muted-foreground">Campo</p>
              </div>
              {summary.publisherType === "REGULAR_PIONEER" && (
                <div className="bg-background/60 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold">{formatMinutes(summary.creditMinutes)}</p>
                  <p className="text-xs text-muted-foreground">Crédito</p>
                </div>
              )}
              <div className="bg-background/60 rounded-xl p-3 text-center">
                <p className="text-xl font-bold">{summary.bibleStudiesCount}</p>
                <p className="text-xs text-muted-foreground">Estudos</p>
              </div>
              <div className="bg-background/60 rounded-xl p-3 text-center">
                <p className="text-xl font-bold">{summary.uniqueDays}</p>
                <p className="text-xs text-muted-foreground">Dias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/ministry/add">
          <Card className="hover:border-primary/40 transition-all cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium">Adicionar registro</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/ministry/report">
          <Card className="hover:border-primary/40 transition-all cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-sm font-medium">Gerar relatório</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/ministry/month">
          <Card className="hover:border-primary/40 transition-all cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium">Resumo do mês</p>
            </CardContent>
          </Card>
        </Link>
        {isPioneer && (
          <Link href="/ministry/year">
            <Card className="hover:border-primary/40 transition-all cursor-pointer h-full">
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-sm font-medium">Ano de serviço</p>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {/* Next return visit */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Próxima revisita</h3>
            </div>
            <Link href="/ministry/return-visits" className="text-xs text-primary hover:underline">Ver todas</Link>
          </div>
          {nextVisit ? (
            <Link href={`/ministry/return-visits/${nextVisit.id}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{nextVisit.name}</p>
                  {nextVisit.nextVisitDate && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(nextVisit.nextVisitDate).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Nenhuma revisita agendada</p>
              <Link href="/ministry/return-visits/new">
                <Button size="sm" variant="outline" className="gap-1">
                  <Plus className="w-3 h-3" /> Nova
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next bible study */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Próximo estudo bíblico</h3>
            </div>
            <Link href="/ministry/bible-studies" className="text-xs text-primary hover:underline">Ver todos</Link>
          </div>
          {nextStudy ? (
            <Link href={`/ministry/bible-studies/${nextStudy.id}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{nextStudy.name}</p>
                  {nextStudy.nextStudyDate && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(nextStudy.nextStudyDate).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Nenhum estudo agendado</p>
              <Link href="/ministry/bible-studies/new">
                <Button size="sm" variant="outline" className="gap-1">
                  <Plus className="w-3 h-3" /> Novo
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
