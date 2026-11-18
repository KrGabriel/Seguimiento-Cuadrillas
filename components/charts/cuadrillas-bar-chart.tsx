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

const tooltipStyle = {
  backgroundColor: "hsl(240 8% 7%)",
  border: "1px solid hsl(240 5% 18%)",
  borderRadius: "8px",
  fontSize: 12,
  color: "hsl(0 0% 98%)",
};

export function CuadrillasBarChart({
  data,
}: {
  data: { cuadrilla: string; finalizadas: number; pendientes: number; asignadas: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barSize={34}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 14%)" vertical={false} />
        <XAxis
          dataKey="cuadrilla"
          tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(240 5% 12% / 0.6)" }} />
        <Legend wrapperStyle={{ fontSize: 11, color: "hsl(240 5% 60%)" }} />
        <Bar dataKey="finalizadas" name="Finalizadas" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
        <Bar dataKey="pendientes" name="Pendientes" stackId="a" fill="#334155" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
