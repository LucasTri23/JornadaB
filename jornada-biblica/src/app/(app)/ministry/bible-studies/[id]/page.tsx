"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Save, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

function formatMinutes(m: number) {
  const h = Math.floor(m / 60); const min = m % 60;
  return h > 0 ? (min > 0 ? `${h}h${min}min` : `${h}h`) : `${min}min`;
}

interface Session { id: string; date: string; minutes: number; lessonStudied: string | null; notes: string | null; }
interface Study {
  id: string; name: string; phone: string | null; addressReference: string | null;
  usualDayTime: string | null; publication: string | null; currentLesson: string | null;
  currentParagraph: string | null; doubts: string | null; nextPoints: string | null;
  lastStudyDate: string | null; nextStudyDate: string | null; status: string; notes: string | null;
  sessions: Session[];
}

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Ativo", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  { value: "PAUSED", label: "Pausado", color: "bg-secondary text-secondary-foreground" },
  { value: "CLOSED", label: "Encerrado", color: "bg-destructive/10 text-destructive" },
];

export default function BibleStudyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Study>>({});
  const [showAddSession, setShowAddSession] = useState(false);
  const [session, setSession] = useState({ date: new Date().toISOString().split("T")[0], hours: "1", minutes: "0", lessonStudied: "", notes: "" });
  const [savingSession, setSavingSession] = useState(false);

  useEffect(() => {
    fetch(`/api/ministry/bible-studies/${id}`)
      .then((r) => r.json())
      .then((d) => { setStudy(d); setForm(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/ministry/bible-studies/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const updated = await res.json();
    setStudy({ ...study!, ...updated, sessions: study!.sessions });
    setEditing(false); setSaving(false);
  }

  async function remove() {
    if (!confirm("Excluir este estudo?")) return;
    await fetch(`/api/ministry/bible-studies/${id}`, { method: "DELETE" });
    router.push("/ministry/bible-studies");
  }

  async function addSession() {
    setSavingSession(true);
    const mins = parseInt(session.hours || "0") * 60 + parseInt(session.minutes || "0");
    const res = await fetch(`/api/ministry/bible-studies/${id}/sessions`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: session.date, minutes: mins, lessonStudied: session.lessonStudied || null, notes: session.notes || null }),
    });
    const newSession = await res.json();
    setStudy((s) => s ? { ...s, sessions: [newSession, ...s.sessions], lastStudyDate: session.date } : s);
    setShowAddSession(false);
    setSession({ date: new Date().toISOString().split("T")[0], hours: "1", minutes: "0", lessonStudied: "", notes: "" });
    setSavingSession(false);
  }

  async function setStatus(status: string) {
    await fetch(`/api/ministry/bible-studies/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
    });
    setStudy((s) => s ? { ...s, status } : s);
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  if (!study) return <div className="text-center py-16 text-muted-foreground">Estudo não encontrado</div>;

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-xl font-bold truncate">{study.name}</h1>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEditing(!editing)}><span className="text-sm">{editing ? "✕" : "✏️"}</span></Button>
          <Button variant="ghost" size="icon" onClick={remove}><Trash2 className="w-4 h-4 text-destructive" /></Button>
        </div>
      </div>

      {/* Status */}
      <Card><CardContent className="p-4">
        <Label className="mb-3 block">Status</Label>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <button key={s.value} onClick={() => setStatus(s.value)}
              className={cn("px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all",
                study.status === s.value ? `${s.color} border-transparent` : "border-border hover:border-primary/50"
              )}>
              {s.label}
            </button>
          ))}
        </div>
      </CardContent></Card>

      {editing ? (
        <Card><CardContent className="p-4 space-y-4">
          <div className="space-y-2"><Label>Nome</Label><Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Telefone</Label><Input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} /></div>
            <div className="space-y-2"><Label>Dia e horário</Label><Input value={form.usualDayTime ?? ""} onChange={(e) => set("usualDayTime", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Publicação</Label><Input value={form.publication ?? ""} onChange={(e) => set("publication", e.target.value)} /></div>
            <div className="space-y-2"><Label>Lição atual</Label><Input value={form.currentLesson ?? ""} onChange={(e) => set("currentLesson", e.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>Próxima data</Label><Input type="date" value={form.nextStudyDate ? new Date(form.nextStudyDate).toISOString().split("T")[0] : ""} onChange={(e) => set("nextStudyDate", e.target.value)} /></div>
          <div className="space-y-2"><Label>Pontos para retomar</Label><Textarea value={form.nextPoints ?? ""} onChange={(e) => set("nextPoints", e.target.value)} className="min-h-[80px]" /></div>
          <div className="space-y-2"><Label>Dúvidas da pessoa</Label><Textarea value={form.doubts ?? ""} onChange={(e) => set("doubts", e.target.value)} className="min-h-[80px]" /></div>
          <div className="space-y-2"><Label>Observações</Label><Textarea value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} className="min-h-[80px]" /></div>
          <Button onClick={save} disabled={saving} className="w-full gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar
          </Button>
        </CardContent></Card>
      ) : (
        <Card><CardContent className="p-4 space-y-3">
          {study.phone && <Row label="Telefone" value={study.phone} />}
          {study.usualDayTime && <Row label="Dia e horário" value={study.usualDayTime} />}
          {study.publication && <Row label="Publicação" value={`${study.publication}${study.currentLesson ? ` — Lição ${study.currentLesson}` : ""}`} />}
          {study.nextStudyDate && <Row label="Próximo estudo" value={new Date(study.nextStudyDate).toLocaleDateString("pt-BR")} />}
          {study.lastStudyDate && <Row label="Último estudo" value={new Date(study.lastStudyDate).toLocaleDateString("pt-BR")} />}
          {study.nextPoints && <Row label="Pontos para retomar" value={study.nextPoints} />}
          {study.doubts && <Row label="Dúvidas" value={study.doubts} />}
          {study.notes && <Row label="Observações" value={study.notes} />}
        </CardContent></Card>
      )}

      {/* Sessions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Sessões ({study.sessions.length})</h3>
            <Button size="sm" variant="outline" onClick={() => setShowAddSession(!showAddSession)} className="gap-1">
              <Plus className="w-3 h-3" /> Registrar
            </Button>
          </div>

          {showAddSession && (
            <div className="mb-4 p-3 bg-accent rounded-xl space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">Data</Label><Input type="date" value={session.date} onChange={(e) => setSession({ ...session, date: e.target.value })} /></div>
                <div className="space-y-1"><Label className="text-xs">Lição</Label><Input value={session.lessonStudied} onChange={(e) => setSession({ ...session, lessonStudied: e.target.value })} placeholder="Lição X" /></div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 space-y-1"><Label className="text-xs">Horas</Label><Input type="number" min="0" value={session.hours} onChange={(e) => setSession({ ...session, hours: e.target.value })} /></div>
                <div className="flex-1 space-y-1"><Label className="text-xs">Minutos</Label><Input type="number" min="0" max="59" value={session.minutes} onChange={(e) => setSession({ ...session, minutes: e.target.value })} /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs">Notas</Label><Textarea value={session.notes} onChange={(e) => setSession({ ...session, notes: e.target.value })} className="min-h-[60px]" /></div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowAddSession(false)} className="flex-1">Cancelar</Button>
                <Button size="sm" onClick={addSession} disabled={savingSession} className="flex-1">
                  {savingSession ? <Loader2 className="w-3 h-3 animate-spin" /> : "Salvar"}
                </Button>
              </div>
            </div>
          )}

          {study.sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma sessão registrada</p>
          ) : (
            <div className="space-y-2">
              {study.sessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{new Date(s.date).toLocaleDateString("pt-BR")}</p>
                    {s.lessonStudied && <p className="text-xs text-muted-foreground">Lição {s.lessonStudied}</p>}
                    {s.notes && <p className="text-xs text-muted-foreground">{s.notes}</p>}
                  </div>
                  <span className="text-sm font-medium">{formatMinutes(s.minutes)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm whitespace-pre-line">{value}</p></div>;
}
