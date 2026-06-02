"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, User, Bell, BookOpen, Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

interface Profile {
  fontSize: number;
  themePreference: string;
  dailyTimeMinutes: number;
  targetDays: number;
  notifyTime: string | null;
  spiritualGoal: string | null;
}

const themes = [
  { value: "LIGHT", label: "Claro", icon: Sun },
  { value: "DARK", label: "Escuro", icon: Moon },
  { value: "SYSTEM", label: "Sistema", icon: Monitor },
];

const timeOptions = [5, 10, 15, 20, 30, 60];
const durationOptions = [
  { value: 30, label: "30 dias" },
  { value: 90, label: "3 meses" },
  { value: 180, label: "6 meses" },
  { value: 365, label: "1 ano" },
  { value: 730, label: "2 anos" },
];

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => r.json()),
    ]).then(([profileData]) => {
      setProfile(profileData);
      setName(session?.user?.name ?? "");
      setLoading(false);
    });
  }, [session]);

  async function saveSettings() {
    if (!profile) return;
    setSaving(true);
    try {
      await Promise.all([
        fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile),
        }),
        fetch("/api/user", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        }).catch(() => {}),
      ]);
      await update({ name });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !profile) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold mb-1">Configurações</h1>
        <p className="text-muted-foreground">Personalize sua experiência</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="w-4 h-4" /> Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input value={session?.user?.email ?? ""} disabled className="opacity-60" />
          </div>
          <div className="space-y-2">
            <Label>Objetivo espiritual</Label>
            <Input
              value={profile.spiritualGoal ?? ""}
              onChange={(e) => setProfile({ ...profile, spiritualGoal: e.target.value })}
              placeholder="Ex: Ler a Bíblia inteira este ano"
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sun className="w-4 h-4" /> Aparência
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tema</Label>
            <div className="flex gap-3">
              {themes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setProfile({ ...profile, themePreference: value })}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                    profile.themePreference === value
                      ? "border-primary bg-accent"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tamanho da fonte ({profile.fontSize}px)</Label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={14}
                max={28}
                step={2}
                value={profile.fontSize}
                onChange={(e) => setProfile({ ...profile, fontSize: Number(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm w-12 text-right">{profile.fontSize}px</span>
            </div>
            <p style={{ fontSize: profile.fontSize }} className="text-muted-foreground italic">
              Prévia do texto bíblico
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Reading preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="w-4 h-4" /> Leitura
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tempo diário disponível</Label>
            <div className="flex flex-wrap gap-2">
              {timeOptions.map((t) => (
                <button
                  key={t}
                  onClick={() => setProfile({ ...profile, dailyTimeMinutes: t })}
                  className={cn(
                    "px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                    profile.dailyTimeMinutes === t
                      ? "border-primary bg-accent text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {t} min
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Meta de conclusão</Label>
            <div className="flex flex-wrap gap-2">
              {durationOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setProfile({ ...profile, targetDays: value })}
                  className={cn(
                    "px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                    profile.targetDays === value
                      ? "border-primary bg-accent text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="w-4 h-4" /> Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Horário do lembrete diário</Label>
            <Input
              type="time"
              value={profile.notifyTime ?? "08:00"}
              onChange={(e) => setProfile({ ...profile, notifyTime: e.target.value })}
              className="max-w-[160px]"
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={saveSettings} disabled={saving} size="lg" className="gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saved ? "Salvo!" : "Salvar configurações"}
      </Button>
    </div>
  );
}
