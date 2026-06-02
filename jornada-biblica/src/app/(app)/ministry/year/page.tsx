"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return h === 0 ? "0h" : `${h}h`;
  if (h === 0) return `${m}min`;
  return `${h}h${m}min`;
}

const MONTH_NAMES_SHORT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

interface MonthData {
  month: number;
  year: number;
  ministryMinutes: number;
  creditMinutes: number;
  totalMinutes: number;
  bibleStudies: number;
  goalMinutes: number;
  isSpecialMonth: boolean;
  participatedInMinistry: boolean;
}

interface YearData {
  serviceYear: string;
  months: MonthData[];
  totalMinutes: number;
  annualGoalMinutes: number;
  remainingMinutes: number;
  percent: number;
}

function getCurrentServiceYear(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  return m >= 9 ? `${y}/${y + 1}` : `${y - 1}/${y}`;
}

export default function ServiceYearPage() {
  const [serviceYear, setServiceYear] = useState(getCurrentServiceYear());
  const [data, setData] = useState<YearData | null>(null);
  const [loading, setLoading] = useState(true);
  const [publisherType, setPublisherType] = useState("PUBLISHER");

  useEffect(() => {
    fetch("/api/ministry/profile")
      .then((r) => r.json())
      .then((p) => setPublisherType(p.publisherType ?? "PUBLISHER"))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/ministry/year?serviceYear=${encodeURIComponent(serviceYear)}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, [serviceYear]);

  function prevYear() {
    const [start] = serviceYear.split("/");
    const y = parseInt(start) - 1;
    setServiceYear(`${y}/${y + 1}`);
  }
  function nextYear() {
    const [start] = serviceYear.split("/");
    const y = parseInt(start) + 1;
    setServiceYear(`${y}/${y + 1}`);
  }

  const isRegularPioneer = publisherType === "REGULAR_PIONEER";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={prevYear} className="p-2 rounded-lg hover:bg-accent"><ChevronLeft className="w-5 h-5" /></button>
        <div className="text-center">
          <h1 className="text-xl font-bold">Ano de Serviço</h1>
          <p className="text-sm text-muted-foreground">{serviceYear}</p>
        </div>
        <button onClick={nextYear} className="p-2 rounded-lg hover:bg-accent"><ChevronRight className="w-5 h-5" /></button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : data && (
        <>
          {/* Annual summary (only for regular pioneers) */}
          {isRegularPioneer && (
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-violet-500/5">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">{formatMinutes(data.totalMinutes)}</p>
                    <p className="text-sm text-muted-foreground">Meta anual: 600h</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">{data.percent}%</p>
                    <p className="text-xs text-muted-foreground">
                      Faltam {formatMinutes(data.remainingMinutes)}
                    </p>
                  </div>
                </div>
                <Progress value={data.percent} className="h-2" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-background/60">
                    <p className="text-xl font-bold">{data.months.filter((m) => m.totalMinutes > 0).length}/12</p>
                    <p className="text-xs text-muted-foreground">Meses com horas</p>
                  </div>
                  <div className="p-3 rounded-xl bg-background/60">
                    <p className="text-xl font-bold">
                      {data.months.filter((m) => m.totalMinutes > 0).length > 0
                        ? formatMinutes(Math.round(data.totalMinutes / Math.max(1, data.months.filter((m) => m.totalMinutes > 0).length)))
                        : "0h"}
                    </p>
                    <p className="text-xs text-muted-foreground">Média mensal</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Monthly table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Histórico mensal</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {data.months.map((m) => {
                  const hasData = m.totalMinutes > 0 || m.participatedInMinistry;
                  const metPercent = isRegularPioneer && m.goalMinutes > 0
                    ? Math.min(100, Math.round((m.totalMinutes / m.goalMinutes) * 100))
                    : null;

                  return (
                    <div key={`${m.month}-${m.year}`} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            hasData ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}>
                            {MONTH_NAMES_SHORT[m.month - 1]}
                          </div>
                          <div>
                            {isRegularPioneer ? (
                              <p className="text-sm font-medium">{formatMinutes(m.totalMinutes)}</p>
                            ) : (
                              <p className="text-sm font-medium">
                                {m.participatedInMinistry || m.totalMinutes > 0 ? "Participou" : "—"}
                              </p>
                            )}
                            {m.bibleStudies > 0 && (
                              <p className="text-xs text-muted-foreground">{m.bibleStudies} estudo{m.bibleStudies > 1 ? "s" : ""}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          {isRegularPioneer && m.creditMinutes > 0 && (
                            <div>
                              <p className="text-xs text-amber-600">{formatMinutes(m.creditMinutes)} créd.</p>
                            </div>
                          )}
                          {metPercent !== null && (
                            <Badge variant={metPercent >= 100 ? "success" : "secondary"} className="text-xs">
                              {metPercent}%
                            </Badge>
                          )}
                          {m.isSpecialMonth && (
                            <Badge variant="outline" className="text-xs">Especial</Badge>
                          )}
                        </div>
                      </div>
                      {isRegularPioneer && metPercent !== null && m.totalMinutes > 0 && (
                        <Progress value={metPercent} className="h-1 mt-2" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
