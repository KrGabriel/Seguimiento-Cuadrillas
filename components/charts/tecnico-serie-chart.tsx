"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function TecnicoSerieChart({
  data,
}: {
  data: { fecha: string; instalaciones: number; reparaciones: number; evaluacion: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 14%)" vertical={false} />
        <XAxis dataKey="fecha" tick={{ fill: "hsl(240 5% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="left" tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, 5]}
          tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(240 8% 7%)",
            border: "1px solid hsl(240 5% 18%)",
            borderRadius: "8px",
            fontSize: 12,
            color: "hsl(0 0% 98%)",
          }}
          cursor={{ fill: "hsl(240 5% 12% / 0.6)" }}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: "hsl(240 5% 60%)" }} />
        <Bar yAxisId="left" dataKey="instalaciones" name="Instalaciones" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
        <Bar yAxisId="left" dataKey="reparaciones" name="Reparaciones" fill="#22d3ee" radius={[3, 3, 0, 0]} />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="evaluacion"
          name="Evaluación (1-5)"
          stroke="#fbbf24"
          strokeWidth={2}
          dot={{ r: 2 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
