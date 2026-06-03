"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, MessageSquare, Trash2 } from "lucide-react";

interface Message {
  id: string;
  text: string;
  category: string | null;
  isActive: boolean;
}

const defaultMessages = [
  "Cada capítulo lido é um passo mais próximo de Deus.",
  "A Palavra de Deus é viva e eficaz. Continue lendo!",
  "A fidelidade na leitura diária transforma o coração.",
  "Você está construindo algo eterno. Continue!",
  "A Bíblia é a carta de amor de Deus para você.",
  "Hoje é o melhor dia para ler a Palavra.",
  "Cada versículo é uma semente de fé no seu coração.",
  "Não desanime. A constância é mais valiosa que a velocidade.",
  "Sua jornada bíblica começa com um capítulo por vez.",
  "A leitura da Bíblia renova a mente e fortalece o espírito.",
];

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState({ text: "", category: "" });

  useEffect(() => {
    fetch("/api/admin/messages")
      .then((r) => r.json())
      .then((data) => { setMessages(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function seedMessages() {
    setSeeding(true);
    for (const text of defaultMessages) {
      await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
    }
    const res = await fetch("/api/admin/messages");
    setMessages(await res.json());
    setSeeding(false);
  }

  async function addMessage() {
    if (!form.text.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const msg = await res.json();
      setMessages((prev) => [msg, ...prev]);
      setShowForm(false);
      setForm({ text: "", category: "" });
    }
    setSaving(false);
  }

  async function toggleActive(msg: Message) {
    await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: msg.id, isActive: !msg.isActive }),
    });
    setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, isActive: !m.isActive } : m));
  }

  async function deleteMessage(id: string) {
    setDeleting(id);
    await fetch("/api/admin/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setDeleting(null);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Mensagens Motivacionais</h1>
          <p className="text-muted-foreground">
            {messages.filter((m) => m.isActive).length} ativas de {messages.length} mensagens
          </p>
        </div>
        <div className="flex gap-3">
          {messages.length === 0 && (
            <Button variant="outline" onClick={seedMessages} disabled={seeding} className="gap-2">
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : "✨"}
              Carregar padrões
            </Button>
          )}
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" /> Nova mensagem
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Input
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                placeholder="Escreva uma mensagem motivacional..."
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria (opcional)</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Ex: fé, perseverança, gratidão..."
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={addMessage} disabled={saving || !form.text.trim()}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhuma mensagem cadastrada</p>
          <p className="text-sm text-muted-foreground mt-1">
            Clique em &ldquo;Carregar padrões&rdquo; para adicionar automaticamente
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!msg.isActive ? "text-muted-foreground line-through" : ""}`}>
                      {msg.text}
                    </p>
                    {msg.category && (
                      <span className="text-xs text-muted-foreground mt-0.5 block">{msg.category}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleActive(msg)}
                      className="text-xs"
                    >
                      <Badge variant={msg.isActive ? "success" : "secondary"} className="cursor-pointer">
                        {msg.isActive ? "Ativa" : "Inativa"}
                      </Badge>
                    </button>
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      disabled={deleting === msg.id}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      {deleting === msg.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
