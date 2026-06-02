import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Users } from "lucide-react";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      profile: { select: { streak: true, onboardingCompleted: true } },
      _count: { select: { progress: true, notes: true } },
    },
    take: 100,
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Usuários</h1>
        <p className="text-muted-foreground">{users.length} usuários registrados</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {users.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum usuário ainda</p>
              </div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="flex items-center gap-4 p-4">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">
                      {user.name?.[0]?.toUpperCase() ?? "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{user.name ?? "Sem nome"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{user._count.progress} cap.</span>
                    <span>·</span>
                    <span>{user.profile?.streak ?? 0} dias</span>
                  </div>
                  <div className="flex gap-2">
                    {user.role === "ADMIN" && (
                      <Badge className="text-xs">Admin</Badge>
                    )}
                    <Badge variant={user.profile?.onboardingCompleted ? "success" : "secondary"} className="text-xs">
                      {user.profile?.onboardingCompleted ? "Ativo" : "Pendente"}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(user.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
