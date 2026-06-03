"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Map } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  type: string;
  durationDays: number | null;
  isDefault: boolean;
  isActive: boolean;
  _count: { items: number };
}

const planTypes = [
  { value: "BIBLICAL_ORDER", label: "Ordem Bíblica" },
  { value: "CHRONOLOGICAL", label: "Cronológica" },
  { value: "BY_STORY", label: "Por Histórias" },
  { value: "BY_THEME", label: "Por Temas" },
  { value: "CUSTOM", label: "Personalizado" },
];

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", type: "BIBLICAL_ORDER", durationDays: 365,
  });

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data) => { setPlans(data); setLoading(false); });
  }, []);

  async function addPlan() {
    setSaving(true);
    const res = await fetch("/api/admin/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const plan = await res.json();
      setPlans((prev) => [plan, ...prev]);
      setShowForm(false);
      setForm({ name: "", description: "", type: "BIBLICAL_ORDER", durationDays: 365 });
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Planos de Leitura</h1>
          <p className="text-muted-foreground">{plans.length} planos</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" /> Novo plano
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Novo Plano</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Nome do plano</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Bíblia em 1 Ano" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Descrição</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Leia a Bíblia completa em um ano..." />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  {planTypes.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Duração (dias)</Label>
                <Input type="number" value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={addPlan} disabled={saving || !form.name}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {plans.length === 0 ? (
                <div className="p-8 text-center">
                  <Map className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhum plano criado ainda</p>
                </div>
              ) : (
                plans.map((plan) => (
                  <div key={plan.id} className="flex items-center gap-4 p-4">
                    <div className="flex-1">
                      <p className="font-medium">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {plan.type} · {plan.durationDays} dias · {plan._count.items} itens
                      </p>
                    </div>
                    <Badge variant={plan.isActive ? "success" : "secondary"}>
                      {plan.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
