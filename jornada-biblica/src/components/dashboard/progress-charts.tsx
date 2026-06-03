"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface BookStat {
  id: string;
  name: string;
  abbreviation: string;
  percent: number;
  completedChapters: number;
  totalChapters: number;
}

export function ProgressCharts({ books }: { books: BookStat[] }) {
  // Top 10 most read books (by percent)
  const top10 = [...books]
    .filter((b) => b.percent > 0)
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 10);

  if (top10.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Comece a ler para ver seus gráficos de progresso aqui!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Livros com mais leituras</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={top10} layout="vertical" margin={{ left: 16, right: 24, top: 0, bottom: 0 }}>
            <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="abbreviation"
              tick={{ fontSize: 12 }}
              width={40}
            />
            <Tooltip
              formatter={(value: number | string | undefined, _name: string, props) => [
                `${value}% (${props.payload.completedChapters}/${props.payload.totalChapters} cap.)`,
                props.payload.name,
              ]}
              cursor={{ fill: "hsl(var(--accent))" }}
            />
            <Bar dataKey="percent" radius={[0, 6, 6, 0]} maxBarSize={20}>
              {top10.map((entry) => (
                <Cell
                  key={entry.id}
                  fill={entry.percent === 100 ? "hsl(142, 71%, 45%)" : "hsl(var(--primary))"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
