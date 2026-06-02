"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Save } from "lucide-react";

export default function NewBibleStudyPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", addressReference: "", usualDayTime: "",
    publication: "", currentLesson: "", nextStudyDate: "", notes: "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/ministry/bible-studies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          phone: form.phone || null,
          addressReference: form.addressReference || null,
          usualDayTime: form.usualDayTime || null,
          publication: form.publication || null,
          currentLesson: form.currentLesson || null,
          nextStudyDate: form.nextStudyDate || null,
          notes: form.notes || null,
        }),
      });
      const data = await res.json();
      router.push(`/ministry/bible-studies/${data.id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Novo estudo bíblico</h1>
      </div>

      <Card><CardContent className="p-4 space-y-4">
        <div className="space-y-2"><Label>Nome *</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Nome da pessoa" autoFocus /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label>Telefone</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
          <div className="space-y-2"><Label>Dia e horário habitual</Label><Input value={form.usualDayTime} onChange={(e) => set("usualDayTime", e.target.value)} placeholder="Ex: Sábado 10h" /></div>
        </div>
        <div className="space-y-2"><Label>Endereço / referência</Label><Input value={form.addressReference} onChange={(e) => set("addressReference", e.target.value)} /></div>
      </CardContent></Card>

      <Card><CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label>Publicação</Label><Input value={form.publication} onChange={(e) => set("publication", e.target.value)} placeholder="Ex: Lição para a vida" /></div>
          <div className="space-y-2"><Label>Lição atual</Label><Input value={form.currentLesson} onChange={(e) => set("currentLesson", e.target.value)} placeholder="Ex: Lição 3" /></div>
        </div>
        <div className="space-y-2"><Label>Próxima data</Label><Input type="date" value={form.nextStudyDate} onChange={(e) => set("nextStudyDate", e.target.value)} /></div>
        <div className="space-y-2"><Label>Observações</Label><Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} className="min-h-[80px]" /></div>
      </CardContent></Card>

      <Button onClick={save} disabled={saving || !form.name.trim()} className="w-full gap-2" size="lg">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? "Salvando..." : "Salvar estudo"}
      </Button>
    </div>
  );
}
