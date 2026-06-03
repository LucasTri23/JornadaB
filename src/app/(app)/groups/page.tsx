import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock } from "lucide-react";

export default function GroupsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Grupos de Leitura</h1>
        <p className="text-muted-foreground">Leia com família, amigos ou grupo de estudo</p>
      </div>

      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <h2 className="text-lg font-semibold">Em breve</h2>
            <Badge variant="secondary" className="gap-1">
              <Clock className="w-3 h-3" /> Próxima versão
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-sm mx-auto text-sm leading-relaxed">
            Em breve você poderá criar grupos de leitura com família, amigos e grupos de estudo,
            compartilhar progresso e se encorajar mutuamente na jornada bíblica.
          </p>

          <div className="grid grid-cols-2 gap-3 mt-8 max-w-xs mx-auto text-left">
            {[
              "Plano de leitura compartilhado",
              "Progresso do grupo",
              "Comentários privados",
              "Lembretes coletivos",
            ].map((feature) => (
              <div key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-0.5">✓</span>
                {feature}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
