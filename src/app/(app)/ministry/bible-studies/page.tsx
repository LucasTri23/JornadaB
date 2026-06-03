"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, BookOpen, ChevronRight, Phone, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface BibleStudy {
  id: string;
  name: string;
  phone: string | null;
  publication: string | null;
  currentLesson: string | null;
  nextStudyDate: string | null;
  lastStudyDate: string | null;
  status: string;
  usualDayTime: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "success" | "destructive" | "outline" }> = {
  ACTIVE: { label: "Ativo", variant: "success" },
  PAUSED: { label: "Pausado", variant: "secondary" },
  CLOSED: { label: "Encerrado", variant: "destructive" },
};

export default function BibleStudiesPage() {
  const [studies, setStudies] = useState<BibleStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ACTIVE");

  useEffect(() => {
    const param = filter === "all" ? "" : `?status=${filter}`;
    fetch(`/api/ministry/bible-studies${param}`)
      .then((r) => r.json())
      .then(setStudies)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Estudos Bíblicos</h1>
          <p className="text-muted-foreground text-sm">{studies.length} {studies.length === 1 ? "estudo" : "estudos"}</p>
        </div>
        <Link href="/ministry/bible-studies/new">
          <Button className="gap-2"><Plus className="w-4 h-4" /> Novo</Button>
        </Link>
      </div>

      <div className="flex gap-2">
        {[
          { id: "ACTIVE", label: "Ativos" },
          { id: "PAUSED", label: "Pausados" },
          { id: "CLOSED", label: "Encerrados" },
          { id: "all", label: "Todos" },
        ].map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              filter === f.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            )}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : studies.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-medium text-muted-foreground">Nenhum estudo bíblico</p>
          <Link href="/ministry/bible-studies/new" className="mt-4 inline-block">
            <Button variant="outline" className="gap-2"><Plus className="w-4 h-4" /> Adicionar estudo</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {studies.map((study) => {
            const status = STATUS_CONFIG[study.status] ?? { label: study.status, variant: "secondary" as const };
            return (
              <Link key={study.id} href={`/ministry/bible-studies/${study.id}`}>
                <Card className="hover:border-primary/40 transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-semibold">{study.name}</p>
                          <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {study.publication && <span>📚 {study.publication}{study.currentLesson ? ` — Lição ${study.currentLesson}` : ""}</span>}
                          {study.nextStudyDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Próximo: {new Date(study.nextStudyDate).toLocaleDateString("pt-BR")}
                            </span>
                          )}
                          {study.usualDayTime && <span>🕐 {study.usualDayTime}</span>}
                          {study.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{study.phone}</span>}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
