"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trophy } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  threshold: number;
  isActive: boolean;
}

const conditionTypes = [
  { value: "FIRST_READ", label: "Primeira leitura" },
  { value: "STREAK_DAYS", label: "Dias consecutivos" },
  { value: "CHAPTERS_READ", label: "Capítulos lidos" },
  { value: "BOOKS_COMPLETED", label: "Livros concluídos" },
  { value: "NOTES_CREATED", label: "Anotações criadas" },
  { value: "FAVORITES_SAVED", label: "Favoritos salvos" },
  { value: "PLAN_COMPLETED", label: "Plano concluído" },
  { value: "BIBLE_COMPLETED", label: "Bíblia completa" },
];

const defaultAchievements = [
  { name: "Primeira Leitura", description: "Concluiu seu primeiro capítulo", icon: "🌱", condition: "FIRST_READ", threshold: 1 },
  { name: "3 dias seguidos", description: "Leu por 3 dias consecutivos", icon: "🔥", condition: "STREAK_DAYS", threshold: 3 },
  { name: "7 dias seguidos", description: "Leu por 7 dias consecutivos", icon: "⚡", condition: "STREAK_DAYS", threshold: 7 },
  { name: "30 dias de leitura", description: "Leu por 30 dias consecutivos", icon: "🏆", condition: "STREAK_DAYS", threshold: 30 },
  { name: "Primeiro livro", description: "Concluiu seu primeiro livro", icon: "📗", condition: "BOOKS_COMPLETED", threshold: 1 },
  { name: "50 capítulos", description: "Leu 50 capítulos", icon: "📖", condition: "CHAPTERS_READ", threshold: 50 },
  { name: "100 capítulos", description: "Leu 100 capítulos", icon: "💯", condition: "CHAPTERS_READ", threshold: 100 },
  { name: "Primeira anotação", description: "Criou sua primeira anotação", icon: "✍️", condition: "NOTES_CREATED", threshold: 1 },
  { name: "10 favoritos", description: "Salvou 10 versículos favoritos", icon: "⭐", condition: "FAVORITES_SAVED", threshold: 10 },
  { name: "Evangelhos concluídos", description: "Leu Mateus, Marcos, Lucas e João", icon: "✝️", condition: "BOOKS_COMPLETED", threshold: 4 },
  { name: "Bíblia completa", description: "Leu toda a Bíblia", icon: "👑", condition: "BIBLE_COMPLETED", threshold: 1 },
];

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", icon: "🏅", condition: "STREAK_DAYS", threshold: 1 });

  useEffect(() => {
    fetch("/api/admin/achievements")
      .then((r) => r.json())
      .then((data) => { setAchievements(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function seedAchievements() {
    setSeeding(true);
    for (const achievement of defaultAchievements) {
      await fetch("/api/admin/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(achievement),
      });
    }
    const res = await fetch("/api/admin/achievements");
    setAchievements(await res.json());
    setSeeding(false);
  }

  async function addAchievement() {
    setSaving(true);
    const res = await fetch("/api/admin/achievements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const ach = await res.json();
      setAchievements((prev) => [ach, ...prev]);
      setShowForm(false);
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Conquistas</h1>
          <p className="text-muted-foreground">{achievements.length} conquistas</p>
        </div>
        <div className="flex gap-3">
          {achievements.length === 0 && (
            <Button variant="outline" onClick={seedAchievements} disabled={seeding} className="gap-2">
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : "✨"}
              Carregar padrões
            </Button>
          )}
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" /> Nova conquista
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Ícone (emoji)</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></div>
              <div className="col-span-2 space-y-2"><Label>Descrição</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Condição</Label>
                <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                  {conditionTypes.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              <div className="space-y-2"><Label>Quantidade mínima</Label><Input type="number" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })} /></div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={addAchievement} disabled={saving || !form.name}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {achievements.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <Trophy className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhuma conquista cadastrada</p>
              <p className="text-sm text-muted-foreground mt-1">Clique em &ldquo;Carregar padrões&rdquo; para adicionar automaticamente</p>
            </div>
          ) : achievements.map((ach) => (
            <div key={ach.id} className="flex items-center gap-3 p-3 rounded-xl border">
              <span className="text-2xl">{ach.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{ach.name}</p>
                <p className="text-xs text-muted-foreground">{ach.description}</p>
                <p className="text-xs text-primary mt-0.5">{ach.condition} ≥ {ach.threshold}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
