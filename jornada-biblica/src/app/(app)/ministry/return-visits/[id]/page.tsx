"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendente", color: "bg-secondary text-secondary-foreground" },
  { value: "VISITED", label: "Visitado", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  { value: "RESCHEDULE", label: "Remarcar", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  { value: "BECAME_STUDY", label: "Virou estudo", color: "bg-primary/10 text-primary" },
  { value: "CLOSED", label: "Encerrado", color: "bg-destructive/10 text-destructive" },
];

interface ReturnVisit {
  id: string;
  name: string;
  phone: string | null;
  addressReference: string | null;
  firstConversationDate: string | null;
  subjectDiscussed: string | null;
  scriptureUsed: string | null;
  materialLeft: string | null;
  nextVisitDate: string | null;
  status: string;
  notes: string | null;
}

export default function ReturnVisitDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [visit, setVisit] = useState<ReturnVisit | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<ReturnVisit>>({});

  useEffect(() => {
    fetch(`/api/ministry/return-visits/${id}`)
      .then((r) => r.json())
      .then((data) => { setVisit(data); setForm(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    await fetch(`/api/ministry/return-visits/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setVisit({ ...visit!, ...form });
    setEditing(false);
    setSaving(false);
  }

  async function remove() {
    if (!confirm("Excluir esta revisita?")) return;
    setDeleting(true);
    await fetch(`/api/ministry/return-visits/${id}`, { method: "DELETE" });
    router.push("/ministry/return-visits");
  }

  async function setStatus(status: string) {
    await fetch(`/api/ministry/return-visits/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setVisit((v) => v ? { ...v, status } : v);
    setForm((f) => ({ ...f, status }));
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  if (!visit) return <div className="text-center py-16 text-muted-foreground">Revisita não encontrada</div>;

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold truncate">{visit.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => setEditing(!editing)}>
            <span className="text-sm">{editing ? "✕" : "✏️"}</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={remove} disabled={deleting}>
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-destructive" />}
          </Button>
        </div>
      </div>

      {/* Status */}
      <Card>
        <CardContent className="p-4">
          <Label className="mb-3 block">Status</Label>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all",
                  visit.status === s.value ? `${s.color} border-transparent` : "border-border hover:border-primary/50"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {editing ? (
        <Card><CardContent className="p-4 space-y-4">
          <div className="space-y-2"><Label>Nome</Label><Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Telefone</Label><Input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} /></div>
            <div className="space-y-2"><Label>Próxima visita</Label><Input type="date" value={form.nextVisitDate ? new Date(form.nextVisitDate).toISOString().split("T")[0] : ""} onChange={(e) => set("nextVisitDate", e.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>Endereço</Label><Input value={form.addressReference ?? ""} onChange={(e) => set("addressReference", e.target.value)} /></div>
          <div className="space-y-2"><Label>Assunto</Label><Textarea value={form.subjectDiscussed ?? ""} onChange={(e) => set("subjectDiscussed", e.target.value)} className="min-h-[80px]" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Texto bíblico</Label><Input value={form.scriptureUsed ?? ""} onChange={(e) => set("scriptureUsed", e.target.value)} /></div>
            <div className="space-y-2"><Label>Material</Label><Input value={form.materialLeft ?? ""} onChange={(e) => set("materialLeft", e.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>Observações</Label><Textarea value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} className="min-h-[80px]" /></div>
          <Button onClick={save} disabled={saving} className="w-full gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar
          </Button>
        </CardContent></Card>
      ) : (
        <Card><CardContent className="p-4 space-y-3">
          {visit.phone && <Row label="Telefone" value={visit.phone} />}
          {visit.addressReference && <Row label="Endereço" value={visit.addressReference} />}
          {visit.firstConversationDate && <Row label="Primeira conversa" value={new Date(visit.firstConversationDate).toLocaleDateString("pt-BR")} />}
          {visit.nextVisitDate && <Row label="Próxima visita" value={new Date(visit.nextVisitDate).toLocaleDateString("pt-BR")} />}
          {visit.subjectDiscussed && <Row label="Assunto" value={visit.subjectDiscussed} />}
          {visit.scriptureUsed && <Row label="Texto bíblico" value={visit.scriptureUsed} />}
          {visit.materialLeft && <Row label="Material" value={visit.materialLeft} />}
          {visit.notes && <Row label="Observações" value={visit.notes} />}
        </CardContent></Card>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}
