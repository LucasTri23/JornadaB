"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<{ email: string }>();

  async function onSubmit({ email }: { email: string }) {
    await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">E-mail enviado!</h2>
        <p className="text-muted-foreground mb-6">
          Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.
        </p>
        <Link href="/login">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar ao login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-4 h-4" /> Voltar ao login
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Recuperar senha</h1>
        <p className="text-muted-foreground">
          Informe seu e-mail e enviaremos um link para redefinir sua senha.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="seu@email.com" {...register("email", { required: true })} />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
          {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : "Enviar link"}
        </Button>
      </form>
    </div>
  );
}
