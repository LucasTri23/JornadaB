"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Copy, MessageCircle, FileText, CheckCircle2 } from "lucide-react";

const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

export default function ReportPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [contact, setContact] = useState("");
  const [reportText, setReportText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generateReport() {
    setLoading(true);
    try {
      const res = await fetch("/api/ministry/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year }),
      });
      const data = await res.json();
      setReportText(data.text);
    } finally {
      setLoading(false);
    }
  }

  async function copyReport() {
    await navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function sendWhatsApp() {
    const encoded = encodeURIComponent(reportText);
    const phone = contact.replace(/\D/g, "");
    const url = phone
      ? `https://wa.me/55${phone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, "_blank");
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gerar Relatório</h1>
        <p className="text-muted-foreground text-sm">Relatório mensal para envio</p>
      </div>

      {/* Month/year selector */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Mês</Label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={i} value={i + 1}>{name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Ano</Label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Número do destinatário (opcional)</Label>
            <Input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="(11) 99999-9999"
            />
            <p className="text-xs text-muted-foreground">Se preenchido, abre o WhatsApp direto com essa pessoa</p>
          </div>

          <Button onClick={generateReport} disabled={loading} className="w-full gap-2" size="lg">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {loading ? "Gerando..." : "Gerar relatório"}
          </Button>
        </CardContent>
      </Card>

      {/* Report preview */}
      {reportText && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Relatório gerado</h3>
              <span className="text-xs text-muted-foreground">{MONTH_NAMES[month - 1]}/{year}</span>
            </div>

            <div className="bg-muted rounded-xl p-4 font-mono text-sm whitespace-pre-line">
              {reportText}
            </div>

            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              className="w-full min-h-[120px] rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none"
              placeholder="Edite o texto se necessário..."
            />

            <div className="flex gap-3">
              <Button variant="outline" onClick={copyReport} className="flex-1 gap-2">
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copiado!" : "Copiar"}
              </Button>
              <Button onClick={sendWhatsApp} className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
