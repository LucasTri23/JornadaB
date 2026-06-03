"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Suspense } from "react";

const ACTIVITY_TYPES = [
  { value: "FIELD_SERVICE", label: "Campo", icon: "🏠", isCredit: false },
  { value: "INFORMAL_WITNESSING", label: "Testemunho informal", icon: "💬", isCredit: false },
  { value: "CART_WITNESSING", label: "Carrinho", icon: "🛒", isCredit: false },
  { value: "RETURN_VISIT", label: "Revisita", icon: "🔄", isCredit: false },
  { value: "BIBLE_STUDY", label: "Estudo bíblico", icon: "📖", isCredit: false },
  { value: "LDC_CREDIT", label: "LDC / Crédito", icon: "🏗️", isCredit: true },
  { value: "COURSE_CREDIT", label: "Curso / Crédito", icon: "📚", isCredit: true },
  { value: "OTHER_CREDIT", label: "Outro crédito", icon: "⭐", isCredit: true },
  { value: "OTHER", label: "Outro", icon: "📝", isCredit: false },
];

function toDateInputValue(date: Date): string {
  return date.toISOString().split("T")[0];
}

function AddRecordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [saving, setSaving] = useState(false);
  const [publisherType, setPublisherType] = useState("PUBLISHER");
  const [form, setForm] = useState({
    date: toDateInputValue(new Date()),
    activityType: "FIELD_SERVICE",
    hours: "0",
    minutes: "0",
    isCredit: false,
    creditType: "",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/ministry/profile")
      .then((r) => r.json())
      .then((p) => setPublisherType(p.publisherType ?? "PUBLISHER"))
      .catch(() => {});

    if (editId) {
      fetch(`/api/ministry/entries/${editId}`)
        .then((r) => r.json())
        .then((entry) => {
          setForm({
            date: toDateInputValue(new Date(entry.date)),
            activityType: entry.activityType,
            hours: String(Math.floor(entry.minutes / 60)),
            minutes: String(entry.minutes % 60),
            isCredit: entry.isCredit,
            creditType: entry.creditType ?? "",
            notes: entry.notes ?? "",
          });
        })
        .catch(() => {});
    }
  }, [editId]);

  const selectedType = ACTIVITY_TYPES.find((t) => t.value === form.activityType);
  const isRegularPioneer = publisherType === "REGULAR_PIONEER";

  async function handleSave() {
    const totalMinutes = parseInt(form.hours || "0") * 60 + parseInt(form.minutes || "0");
    if (totalMinutes === 0) return;

    setSaving(true);
    try {
      const payload = {
        date: form.date,
        activityType: form.activityType,
        minutes: totalMinutes,
        isCredit: form.isCredit,
        creditType: form.isCredit ? (form.creditType || form.activityType) : null,
        notes: form.notes || null,
      };

      if (editId) {
        await fetch(`/api/ministry/entries/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/ministry/entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      router.push("/ministry/month");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">{editId ? "Editar registro" : "Adicionar registro"}</h1>
      </div>

      {/* Date */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <Label>Data</Label>
          <Input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </CardContent>
      </Card>

      {/* Activity type */}
      <Card>
        <CardContent className="p-4">
          <Label className="mb-3 block">Tipo de atividade</Label>
          <div className="grid grid-cols-2 gap-2">
            {ACTIVITY_TYPES.filter((t) => isRegularPioneer || !t.isCredit).map((type) => (
              <button
                key={type.value}
                onClick={() => setForm({ ...form, activityType: type.value, isCredit: type.isCredit })}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-xl border-2 text-left text-sm transition-all",
                  form.activityType === type.value
                    ? "border-primary bg-accent"
                    : "border-border hover:border-primary/50"
                )}
              >
                <span className="text-lg">{type.icon}</span>
                <span className="font-medium leading-tight">{type.label}</span>
              </button>
            ))}
          </div>
          {selectedType?.isCredit && (
            <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                ⭐ Este registro será contado como hora de crédito
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time */}
      <Card>
        <CardContent className="p-4">
          <Label className="mb-3 block">Tempo</Label>
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-1">
              <Label className="text-xs text-muted-foreground">Horas</Label>
              <Input
                type="number"
                min="0"
                max="24"
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
                className="text-center text-lg font-bold"
              />
            </div>
            <span className="text-2xl font-bold text-muted-foreground mt-5">:</span>
            <div className="flex-1 space-y-1">
              <Label className="text-xs text-muted-foreground">Minutos</Label>
              <Input
                type="number"
                min="0"
                max="59"
                value={form.minutes}
                onChange={(e) => setForm({ ...form, minutes: e.target.value })}
                className="text-center text-lg font-bold"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {[[0, 15], [0, 30], [0, 45], [1, 0], [1, 30], [2, 0]].map(([h, m]) => (
              <button
                key={`${h}h${m}m`}
                onClick={() => setForm({ ...form, hours: String(h), minutes: String(m) })}
                className="px-3 py-1.5 rounded-lg border text-xs font-medium hover:border-primary hover:bg-accent transition-colors"
              >
                {h > 0 ? `${h}h` : ""}{m > 0 ? `${m}min` : ""}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <Label>Observação (opcional)</Label>
          <Textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Alguma nota sobre este registro..."
            className="min-h-[80px]"
          />
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={saving || (parseInt(form.hours || "0") === 0 && parseInt(form.minutes || "0") === 0)}
        className="w-full gap-2"
        size="lg"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? "Salvando..." : "Salvar registro"}
      </Button>
    </div>
  );
}

export default function AddMinistryPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>}>
      <AddRecordForm />
    </Suspense>
  );
}
