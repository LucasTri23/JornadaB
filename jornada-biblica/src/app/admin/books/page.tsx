"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, BookOpen } from "lucide-react";

interface Book {
  id: string;
  name: string;
  abbreviation: string;
  testament: string;
  position: number;
  totalChapters: number;
  _count: { chapters: number };
}

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", abbreviation: "", testament: "OLD", position: 1, totalChapters: 1,
  });

  useEffect(() => {
    fetch("/api/admin/books")
      .then((r) => r.json())
      .then((data) => { setBooks(data); setLoading(false); });
  }, []);

  async function addBook() {
    setSaving(true);
    const res = await fetch("/api/admin/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const book = await res.json();
    setBooks((prev) => [...prev, book].sort((a, b) => a.position - b.position));
    setShowForm(false);
    setForm({ name: "", abbreviation: "", testament: "OLD", position: books.length + 1, totalChapters: 1 });
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Livros Bíblicos</h1>
          <p className="text-muted-foreground">{books.length} livros cadastrados</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Adicionar livro
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Novo Livro</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Gênesis" />
              </div>
              <div className="space-y-2">
                <Label>Abreviação</Label>
                <Input value={form.abbreviation} onChange={(e) => setForm({ ...form, abbreviation: e.target.value })} placeholder="Gn" />
              </div>
              <div className="space-y-2">
                <Label>Testamento</Label>
                <select
                  value={form.testament}
                  onChange={(e) => setForm({ ...form, testament: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="OLD">Antigo Testamento</option>
                  <option value="NEW">Novo Testamento</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Posição</Label>
                <Input type="number" value={form.position} onChange={(e) => setForm({ ...form, position: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Total de capítulos</Label>
                <Input type="number" value={form.totalChapters} onChange={(e) => setForm({ ...form, totalChapters: Number(e.target.value) })} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={addBook} disabled={saving || !form.name}>
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
              {books.length === 0 ? (
                <div className="p-8 text-center">
                  <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhum livro cadastrado ainda</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Use o seed do banco de dados para importar os 66 livros automaticamente
                  </p>
                </div>
              ) : (
                books.map((book) => (
                  <div key={book.id} className="flex items-center gap-4 p-4">
                    <span className="text-xs text-muted-foreground w-6">{book.position}</span>
                    <div className="flex-1">
                      <p className="font-medium">{book.name}</p>
                      <p className="text-xs text-muted-foreground">{book.abbreviation} · {book.totalChapters} capítulos</p>
                    </div>
                    <Badge variant={book.testament === "OLD" ? "secondary" : "outline"}>
                      {book.testament === "OLD" ? "AT" : "NT"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{book._count.chapters} cap. cadastrados</span>
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
