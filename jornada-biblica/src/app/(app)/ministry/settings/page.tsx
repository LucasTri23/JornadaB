"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

const publisherTypes = [
  { id: "PUBLISHER", label: "Publicador" },
  { id: "AUXILIARY_PIONEER", label: "Pioneiro Auxiliar" },
  { id: "INDEFINITE_AUXILIARY_PIONEER", label: "Aux. Indeterminado" },
  { id: "REGULAR_PIONEER", label: "Pioneiro Regular" },
];

export default function MinistrySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    reportName: "",
    congregation: "",
    publisherType: "PUBLISHER",
    defaultReportContact: "",
    defaultReportMessage: "",
    includeObservation: false,
    remindToRegister: true,
    useReturnVisits: true,
    useBibleStudies: true,
  });

  useEffect(() => {
    fetch("/api/ministry/profile")
      .then((r) => r.json())
      .then((p) => {
        setForm({
          reportName: p.reportName ?? "",
          congregation: p.congregation ?? "",
          publisherType: p.publisherType ?? "PUBLISHER",
          defaultReportContact: p.defaultReportContact ?? "",
          defaultReportMessage: p.defaultReportMessage ?? "",
          includeObservation: p.includeObservation ?? false,
          remindToRegister: p.remindToRegister ?? true,
          useReturnVisits: p.useReturnVisits ?? true,
          useBibleStudies: p.useBibleStudies ?? true,
        });
        setLoading(false);
      });
  }, []);

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    await fetch("/api/ministry/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações do Ministério</h1>
        <p className="text-muted-foreground text-sm">Personalize seu módulo ministerial</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader><CardTitle className="text-base">Perfil ministerial</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome no relatório</Label>
            <Input value={form.reportName} onChange={(e) => set("reportName", e.target.value)} placeholder="Nome que aparece no relatório" />
          </div>
          <div className="space-y-2">
            <Label>Congregação (opcional)</Label>
            <Input value={form.congregation} onChange={(e) => set("congregation", e.target.value)} placeholder="Nome da sua congregação" />
          </div>
        </CardContent>
      </Card>

      {/* Publisher type */}
      <Card>
        <CardHeader><CardTitle className="text-base">Modalidade</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {publisherTypes.map((t) => (
              <button key={t.id} onClick={() => set("publisherType", t.id)}
                className={cn("p-3 rounded-xl border-2 text-sm font-medium text-left transition-all",
                  form.publisherType === t.id ? "border-primary bg-accent" : "border-border hover:border-primary/50"
                )}>
                {t.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report config */}
      <Card>
        <CardHeader><CardTitle className="text-base">Relatório</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Contato padrão (número do WhatsApp)</Label>
            <Input value={form.defaultReportContact} onChange={(e) => set("defaultReportContact", e.target.value)} placeholder="(11) 99999-9999" />
          </div>
          <Toggle label="Incluir observação no relatório" value={form.includeObservation} onChange={(v) => set("includeObservation", v)} />
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader><CardTitle className="text-base">Funcionalidades</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Toggle label="Agenda de revisitas" value={form.useReturnVisits} onChange={(v) => set("useReturnVisits", v)} />
          <Toggle label="Agenda de estudos bíblicos" value={form.useBibleStudies} onChange={(v) => set("useBibleStudies", v)} />
          <Toggle label="Lembrete para registrar ministério" value={form.remindToRegister} onChange={(v) => set("remindToRegister", v)} />
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving} size="lg" className="gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saved ? "Salvo!" : "Salvar configurações"}
      </Button>
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="flex items-center justify-between w-full py-1">
      <span className="text-sm">{label}</span>
      <div className={cn("w-10 h-6 rounded-full transition-colors relative", value ? "bg-primary" : "bg-muted")}>
        <div className={cn("w-4 h-4 bg-white rounded-full absolute top-1 transition-all", value ? "left-5" : "left-1")} />
      </div>
    </button>
  );
}
