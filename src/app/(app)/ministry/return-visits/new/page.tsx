"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Save } from "lucide-react";

export default function NewReturnVisitPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    addressReference: "",
    firstConversationDate: new Date().toISOString().split("T")[0],
    subjectDiscussed: "",
    scriptureUsed: "",
    materialLeft: "",
    nextVisitDate: "",
    notes: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/ministry/return-visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          phone: form.phone || null,
          addressReference: form.addressReference || null,
          subjectDiscussed: form.subjectDiscussed || null,
          scriptureUsed: form.scriptureUsed || null,
          materialLeft: form.materialLeft || null,
          nextVisitDate: form.nextVisitDate || null,
          notes: form.notes || null,
        }),
      });
      const data = await res.json();
      router.push(`/ministry/return-visits/${data.id}`);
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
        <h1 className="text-xl font-bold">Nova revisita</h1>
      </div>

      <Card><CardContent className="p-4 space-y-4">
        <div className="space-y-2"><Label>Nome *</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Nome da pessoa" autoFocus /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label>Telefone</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(00) 00000-0000" /></div>
          <div className="space-y-2"><Label>Primeira conversa</Label><Input type="date" value={form.firstConversationDate} onChange={(e) => set("firstConversationDate", e.target.value)} /></div>
        </div>
        <div className="space-y-2"><Label>Endereço / referência</Label><Input value={form.addressReference} onChange={(e) => set("addressReference", e.target.value)} placeholder="Rua, número ou ponto de referência" /></div>
      </CardContent></Card>

      <Card><CardContent className="p-4 space-y-4">
        <div className="space-y-2"><Label>Assunto conversado</Label><Textarea value={form.subjectDiscussed} onChange={(e) => set("subjectDiscussed", e.target.value)} placeholder="O que foi discutido?" className="min-h-[80px]" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label>Texto bíblico</Label><Input value={form.scriptureUsed} onChange={(e) => set("scriptureUsed", e.target.value)} placeholder="Ex: João 17:3" /></div>
          <div className="space-y-2"><Label>Material deixado</Label><Input value={form.materialLeft} onChange={(e) => set("materialLeft", e.target.value)} placeholder="Publicação ou vídeo" /></div>
        </div>
        <div className="space-y-2"><Label>Próxima visita</Label><Input type="date" value={form.nextVisitDate} onChange={(e) => set("nextVisitDate", e.target.value)} /></div>
        <div className="space-y-2"><Label>Observações</Label><Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Notas adicionais..." className="min-h-[80px]" /></div>
      </CardContent></Card>

      <Button onClick={save} disabled={saving || !form.name.trim()} className="w-full gap-2" size="lg">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? "Salvando..." : "Salvar revisita"}
      </Button>
    </div>
  );
}
