"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function ComparativoChart({
  data,
}: {
  data: { cuadrilla: string; cumplimiento: number; tasaReclamos: number; recupero: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barSize={18}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 14%)" vertical={false} />
        <XAxis dataKey="cuadrilla" tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          unit="%"
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
          formatter={(value: number) => `${value.toFixed(1)}%`}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: "hsl(240 5% 60%)" }} />
        <Bar dataKey="cumplimiento" name="Cumplimiento órdenes" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
        <Bar dataKey="tasaReclamos" name="Tasa de reclamos" fill="#f87171" radius={[3, 3, 0, 0]} />
        <Bar dataKey="recupero" name="Recupero materiales" fill="#34d399" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
