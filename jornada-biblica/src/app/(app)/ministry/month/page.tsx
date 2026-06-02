"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, ChevronLeft, ChevronRight, Trash2, Pencil } from "lucide-react";

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return h === 0 ? "0min" : `${h}h`;
  if (h === 0) return `${m}min`;
  return `${h}h${m}min`;
}

const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const ACTIVITY_LABELS: Record<string, string> = {
  FIELD_SERVICE: "Campo",
  INFORMAL_WITNESSING: "Testemunho informal",
  CART_WITNESSING: "Carrinho",
  RETURN_VISIT: "Revisita",
  BIBLE_STUDY: "Estudo bíblico",
  LDC_CREDIT: "LDC / Crédito",
  COURSE_CREDIT: "Curso / Crédito",
  OTHER_CREDIT: "Outro crédito",
  OTHER: "Outro",
};

const ACTIVITY_ICONS: Record<string, string> = {
  FIELD_SERVICE: "🏠", INFORMAL_WITNESSING: "💬", CART_WITNESSING: "🛒",
  RETURN_VISIT: "🔄", BIBLE_STUDY: "📖", LDC_CREDIT: "🏗️",
  COURSE_CREDIT: "📚", OTHER_CREDIT: "⭐", OTHER: "📝",
};

interface Entry {
  id: string;
  date: string;
  activityType: string;
  minutes: number;
  isCredit: boolean;
  notes: string | null;
}

interface Summary {
  publisherType: string;
  ministryMinutes: number;
  creditMinutes: number;
  totalMinutes: number;
  goalMinutes: number | null;
  remainingMinutes: number | null;
  percent: number | null;
  bibleStudiesCount: number;
  uniqueDays: number;
  participatedInMinistry: boolean;
  isSpecialMonth: boolean;
}

export default function MonthSummaryPage() {
  const router = useRouter();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState<Summary | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = (m: number, y: number) => {
    setLoading(true);
    Promise.all([
      fetch(`/api/ministry/summary?month=${m}&year=${y}`).then((r) => r.json()),
      fetch(`/api/ministry/entries?month=${m}&year=${y}`).then((r) => r.json()),
    ]).then(([s, e]) => {
      setSummary(s);
      setEntries(e);
      setLoading(false);
    });
  };

  useEffect(() => { load(month, year); }, [month, year]);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  async function deleteEntry(id: string) {
    setDeleting(id);
    await fetch(`/api/ministry/entries/${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setDeleting(null);
    load(month, year);
  }

  const byDay = entries.reduce((acc, entry) => {
    const day = new Date(entry.date).toLocaleDateString("pt-BR");
    if (!acc[day]) acc[day] = [];
    acc[day].push(entry);
    return acc;
  }, {} as Record<string, Entry[]>);

  return (
    <div className="space-y-6">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-accent transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">{MONTH_NAMES[month - 1]} {year}</h1>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-accent transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : summary && (
        <>
          {/* Summary card */}
          {summary.publisherType === "PUBLISHER" ? (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-3xl ${summary.participatedInMinistry ? "text-emerald-500" : "text-muted-foreground"}`}>
                    {summary.participatedInMinistry ? "✅" : "⏳"}
                  </span>
                  <div>
                    <p className="font-semibold">{summary.participatedInMinistry ? "Participou no ministério" : "Ainda não registrou participação"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-accent">
                    <p className="text-2xl font-bold">{summary.bibleStudiesCount}</p>
                    <p className="text-xs text-muted-foreground">Estudos bíblicos</p>
                  </div>
                  <div className="p-3 rounded-xl bg-accent">
                    <p className="text-2xl font-bold">{summary.uniqueDays}</p>
                    <p className="text-xs text-muted-foreground">Dias no campo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">{formatMinutes(summary.totalMinutes)}</p>
                    <p className="text-sm text-muted-foreground">
                      {summary.goalMinutes ? `Meta: ${formatMinutes(summary.goalMinutes)}` : "Sem meta"}
                    </p>
                  </div>
                  {summary.percent !== null && (
                    <p className="text-3xl font-bold text-primary">{summary.percent}%</p>
                  )}
                </div>
                {summary.percent !== null && <Progress value={summary.percent} className="h-2" />}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-accent text-center">
                    <p className="text-xl font-bold">{formatMinutes(summary.ministryMinutes)}</p>
                    <p className="text-xs text-muted-foreground">Campo</p>
                  </div>
                  {summary.publisherType === "REGULAR_PIONEER" && (
                    <div className="p-3 rounded-xl bg-accent text-center">
                      <p className="text-xl font-bold">{formatMinutes(summary.creditMinutes)}</p>
                      <p className="text-xs text-muted-foreground">Crédito</p>
                    </div>
                  )}
                  <div className="p-3 rounded-xl bg-accent text-center">
                    <p className="text-xl font-bold">{summary.bibleStudiesCount}</p>
                    <p className="text-xs text-muted-foreground">Estudos</p>
                  </div>
                  <div className="p-3 rounded-xl bg-accent text-center">
                    <p className="text-xl font-bold">{summary.uniqueDays}</p>
                    <p className="text-xs text-muted-foreground">Dias</p>
                  </div>
                </div>
                {summary.remainingMinutes !== null && summary.remainingMinutes > 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Faltam <strong>{formatMinutes(summary.remainingMinutes)}</strong> para a meta
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <Link href="/ministry/add" className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <Plus className="w-4 h-4" /> Adicionar
              </Button>
            </Link>
            <Link href="/ministry/report" className="flex-1">
              <Button className="w-full">Gerar relatório</Button>
            </Link>
          </div>

          {/* Entries by day */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Registros do mês</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {Object.keys(byDay).length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  Nenhum registro neste mês
                </div>
              ) : (
                <div className="divide-y">
                  {Object.entries(byDay).map(([day, dayEntries]) => {
                    const dayTotal = dayEntries.reduce((s, e) => s + e.minutes, 0);
                    return (
                      <div key={day} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold">{day}</span>
                          <span className="text-xs text-muted-foreground font-medium">{formatMinutes(dayTotal)}</span>
                        </div>
                        <div className="space-y-2">
                          {dayEntries.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-base">{ACTIVITY_ICONS[entry.activityType] ?? "📝"}</span>
                                <div>
                                  <span className="text-sm">{ACTIVITY_LABELS[entry.activityType] ?? entry.activityType}</span>
                                  {entry.isCredit && (
                                    <Badge variant="secondary" className="ml-2 text-xs py-0">crédito</Badge>
                                  )}
                                  {entry.notes && (
                                    <p className="text-xs text-muted-foreground">{entry.notes}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{formatMinutes(entry.minutes)}</span>
                                <button
                                  onClick={() => router.push(`/ministry/add?edit=${entry.id}`)}
                                  className="text-muted-foreground hover:text-primary"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteEntry(entry.id)}
                                  disabled={deleting === entry.id}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  {deleting === entry.id
                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    : <Trash2 className="w-3.5 h-3.5" />
                                  }
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
