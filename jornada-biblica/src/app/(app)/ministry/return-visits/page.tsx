"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Users, ChevronRight, Phone, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReturnVisit {
  id: string;
  name: string;
  phone: string | null;
  addressReference: string | null;
  nextVisitDate: string | null;
  status: string;
  subjectDiscussed: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "success" | "destructive" | "outline" }> = {
  PENDING: { label: "Pendente", variant: "secondary" },
  VISITED: { label: "Visitado", variant: "success" },
  RESCHEDULE: { label: "Remarcar", variant: "outline" },
  BECAME_STUDY: { label: "Virou estudo", variant: "default" },
  CLOSED: { label: "Encerrado", variant: "destructive" },
};

const STATUS_ORDER = ["PENDING", "RESCHEDULE", "VISITED", "BECAME_STUDY", "CLOSED"];

export default function ReturnVisitsPage() {
  const [visits, setVisits] = useState<ReturnVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");

  useEffect(() => {
    const statusParam = filter === "active" ? "?status=PENDING" : filter === "all" ? "" : `?status=${filter}`;
    fetch(`/api/ministry/return-visits${statusParam}`)
      .then((r) => r.json())
      .then(setVisits)
      .finally(() => setLoading(false));
  }, [filter]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdue = visits.filter((v) => v.nextVisitDate && new Date(v.nextVisitDate) < today && v.status === "PENDING");
  const todayVisits = visits.filter((v) => {
    if (!v.nextVisitDate) return false;
    const d = new Date(v.nextVisitDate);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });
  const upcoming = visits.filter((v) => {
    if (!v.nextVisitDate || v.status !== "PENDING") return false;
    const d = new Date(v.nextVisitDate);
    d.setHours(0, 0, 0, 0);
    return d > today;
  });
  const others = visits.filter((v) => !overdue.includes(v) && !todayVisits.includes(v) && !upcoming.includes(v));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Revisitas</h1>
          <p className="text-muted-foreground text-sm">{visits.length} {visits.length === 1 ? "revisita" : "revisitas"}</p>
        </div>
        <Link href="/ministry/return-visits/new">
          <Button className="gap-2"><Plus className="w-4 h-4" /> Nova</Button>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: "active", label: "Ativas" },
          { id: "all", label: "Todas" },
          { id: "VISITED", label: "Visitadas" },
          { id: "CLOSED", label: "Encerradas" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              filter === f.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : visits.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-medium text-muted-foreground">Nenhuma revisita</p>
          <p className="text-sm text-muted-foreground mt-1">Registre suas revisitas para acompanhá-las</p>
          <Link href="/ministry/return-visits/new" className="mt-4 inline-block">
            <Button variant="outline" className="gap-2"><Plus className="w-4 h-4" /> Adicionar revisita</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {overdue.length > 0 && (
            <Section title="Atrasadas" icon="⚠️" visits={overdue} />
          )}
          {todayVisits.length > 0 && (
            <Section title="Hoje" icon="📅" visits={todayVisits} />
          )}
          {upcoming.length > 0 && (
            <Section title="Próximas" icon="🗓️" visits={upcoming} />
          )}
          {others.length > 0 && (
            <Section title="Outras" icon="📋" visits={others} />
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, icon, visits }: { title: string; icon: string; visits: ReturnVisit[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
        <span>{icon}</span> {title}
      </h3>
      <div className="space-y-2">
        {visits.map((visit) => {
          const status = STATUS_CONFIG[visit.status] ?? { label: visit.status, variant: "secondary" as const };
          return (
            <Link key={visit.id} href={`/ministry/return-visits/${visit.id}`}>
              <Card className="hover:border-primary/40 transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold truncate">{visit.name}</p>
                        <Badge variant={status.variant} className="text-xs shrink-0">{status.label}</Badge>
                      </div>
                      {visit.subjectDiscussed && (
                        <p className="text-sm text-muted-foreground truncate">{visit.subjectDiscussed}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {visit.phone && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {visit.phone}
                          </span>
                        )}
                        {visit.addressReference && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {visit.addressReference}
                          </span>
                        )}
                        {visit.nextVisitDate && (
                          <span className="text-xs text-muted-foreground">
                            📅 {new Date(visit.nextVisitDate).toLocaleDateString("pt-BR")}
                          </span>
                        )}
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
    </div>
  );
}
